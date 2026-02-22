import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Question interfaces
interface Question {
  id: string;
  type: string;
  required: boolean;
  question: string;
  scoringKey: string;
  [key: string]: any;
}

interface QuestionSet {
  category?: string;
  moduleId?: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: Question[];
  isRecommended?: boolean;
}

// API request/response types
interface StartInterviewRequest {
  userId: string;
  interviewType: 'lite' | 'deep';
  selectedModules?: string[]; // For deep interviews
}

interface SaveAnswerRequest {
  questionId: string;
  answer: any;
  moduleId?: string;
  category?: string;
  scoringKey?: string;
}

// Cache for question scoringKey lookup (questionId -> scoringKey)
let scoringKeyCache: Record<string, string> | null = null;

function buildScoringKeyCache(): Record<string, string> {
  if (scoringKeyCache) return scoringKeyCache;

  const cache: Record<string, string> = {};

  // Load lite questions
  const liteDir = path.join(__dirname, '../../..', 'questions', 'lite');
  if (fs.existsSync(liteDir)) {
    const liteFiles = fs.readdirSync(liteDir).filter(f => f.endsWith('.json'));
    for (const file of liteFiles) {
      const content = fs.readFileSync(path.join(liteDir, file), 'utf8');
      const data = JSON.parse(content);
      for (const q of data.questions || []) {
        if (q.id && q.scoringKey) {
          cache[q.id] = q.scoringKey;
        }
      }
    }
  }

  // Load deep questions
  const deepDir = path.join(__dirname, '../../..', 'questions', 'deep');
  if (fs.existsSync(deepDir)) {
    const deepFiles = fs.readdirSync(deepDir).filter(f => f.endsWith('.json'));
    for (const file of deepFiles) {
      const content = fs.readFileSync(path.join(deepDir, file), 'utf8');
      const data = JSON.parse(content);
      for (const q of data.questions || []) {
        if (q.id && q.scoringKey) {
          cache[q.id] = q.scoringKey;
        }
      }
    }
  }

  scoringKeyCache = cache;
  return cache;
}

interface InterviewStatus {
  id: string;
  userId: string;
  interviewType: string;
  status: string;
  currentModule?: string | null;
  currentQuestion?: number | null;
  completedModules?: string[];
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    percentComplete: number;
  };
  answers: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Load Lite questions from JSON files
 */
export async function getLiteQuestions(): Promise<QuestionSet[]> {
  const questionsDir = path.join(__dirname, '../../..', 'questions', 'lite');
  const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));

  const questionSets: QuestionSet[] = [];

  for (const file of files) {
    const filePath = path.join(questionsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    questionSets.push(data);
  }

  // Sort by a logical order: skills-talents, values-preferences, current-situation
  const order = ['skills-talents', 'values-preferences', 'current-situation'];
  questionSets.sort((a, b) => {
    const aIndex = order.indexOf(a.category || '');
    const bIndex = order.indexOf(b.category || '');
    return aIndex - bIndex;
  });

  return questionSets;
}

/**
 * Load a specific Deep module
 */
export async function getDeepModule(moduleId: string): Promise<QuestionSet> {
  const questionsDir = path.join(__dirname, '../../..', 'questions', 'deep');
  const filePath = path.join(questionsDir, `module-${moduleId.toLowerCase()}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Module ${moduleId} not found`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Get all Deep modules metadata (without full questions)
 */
export async function getDeepModulesMetadata(): Promise<Array<{
  moduleId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  isRecommended: boolean;
  questionCount: number;
}>> {
  const questionsDir = path.join(__dirname, '../../..', 'questions', 'deep');
  const files = fs.readdirSync(questionsDir)
    .filter(f => f.startsWith('module-') && f.endsWith('.json'))
    .sort();

  const modules = [];

  for (const file of files) {
    const filePath = path.join(questionsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    modules.push({
      moduleId: data.moduleId,
      title: data.title,
      description: data.description,
      estimatedMinutes: data.estimatedMinutes,
      isRecommended: data.isRecommended || false,
      questionCount: data.questions.length,
    });
  }

  return modules;
}

/**
 * Start a new interview
 */
export async function startInterview(data: StartInterviewRequest) {
  const { userId, interviewType, selectedModules } = data;

  // Validate user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Note: Removed restriction - users can now have multiple in-progress interviews
  // This allows for better UX where users can explore different paths

  // Create new interview
  const interview = await prisma.interview.create({
    data: {
      userId,
      interviewType,
      status: 'in_progress',
      currentModule: interviewType === 'lite' ? 'skills-talents' : (selectedModules?.[0] || 'A'),
      currentQuestion: 0,
      personalityData: {},
      talentsData: {},
      valuesData: {},
      sessionData: interviewType === 'deep' && selectedModules
        ? { selectedModules }
        : {},
    },
  });

  return interview;
}

/**
 * Save an answer and update interview progress
 */
export async function saveAnswer(
  interviewId: string,
  data: SaveAnswerRequest
) {
  const { questionId, answer, moduleId, category } = data;

  // Get interview
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  if (interview.status !== 'in_progress') {
    throw new Error('Interview is not in progress');
  }

  // Look up the scoringKey for this question
  const cache = buildScoringKeyCache();
  const resolvedScoringKey = cache[questionId] || questionId;

  // Determine which data field to update based on scoringKey prefix
  const scoringPrefix = resolvedScoringKey.split('_')[0]; // e.g., "a1", "a2", "a3", "session"

  let dataField: 'personalityData' | 'talentsData' | 'valuesData' | 'sessionData';

  if (scoringPrefix === 'a1') {
    dataField = 'personalityData';
  } else if (scoringPrefix === 'a2') {
    dataField = 'talentsData';
  } else if (scoringPrefix === 'a3') {
    dataField = 'valuesData';
  } else {
    dataField = 'sessionData';
  }

  // Get current data
  const currentData = (interview[dataField] as any) || {};

  // Store answer keyed by scoringKey (so scoring functions can find it)
  const updatedData = {
    ...currentData,
    [resolvedScoringKey]: {
      answer,
      questionId,
      moduleId,
      category,
      answeredAt: new Date().toISOString(),
    },
  };

  // Update interview (lastActivityAt is auto-updated by Prisma @updatedAt)
  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      [dataField]: updatedData,
      currentQuestion: (interview.currentQuestion || 0) + 1,
    },
  });

  return updated;
}

/**
 * Update current position in interview (for navigation)
 */
export async function updateInterviewPosition(
  interviewId: string,
  currentModule: string,
  currentQuestion: number
) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      currentModule,
      currentQuestion,
    },
  });

  return updated;
}

/**
 * Get interview status and progress
 */
export async function getInterviewStatus(interviewId: string): Promise<InterviewStatus> {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  // Calculate progress
  const personalityAnswers = Object.keys((interview.personalityData as any) || {}).length;
  const talentsAnswers = Object.keys((interview.talentsData as any) || {}).length;
  const valuesAnswers = Object.keys((interview.valuesData as any) || {}).length;
  const sessionAnswers = Object.keys((interview.sessionData as any) || {}).length;

  const totalAnswered = personalityAnswers + talentsAnswers + valuesAnswers + sessionAnswers;

  // Estimate total questions based on interview type
  let totalQuestions = 0;
  if (interview.interviewType === 'lite') {
    totalQuestions = 37; // Lite has ~37 questions
  } else if (interview.interviewType === 'deep' || interview.interviewType === 'lite_upgraded') {
    const sessionData = (interview.sessionData as any) || {};
    const selectedModules = sessionData.selectedModules || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    // Average 12 questions per module
    totalQuestions = selectedModules.length * 12;

    // For lite_upgraded, add the Lite questions that were already answered
    if (interview.interviewType === 'lite_upgraded') {
      totalQuestions += 37;
    }
  }

  const percentComplete = totalQuestions > 0
    ? Math.round((totalAnswered / totalQuestions) * 100)
    : 0;

  // Determine completed modules (for deep interviews)
  const completedModules: string[] = [];
  if (interview.interviewType === 'deep' || interview.interviewType === 'lite_upgraded') {
    const sessionData = (interview.sessionData as any) || {};
    completedModules.push(...(sessionData.completedModules || []));
  }

  return {
    id: interview.id,
    userId: interview.userId,
    interviewType: interview.interviewType,
    status: interview.status,
    currentModule: interview.currentModule,
    currentQuestion: interview.currentQuestion,
    completedModules,
    progress: {
      totalQuestions,
      answeredQuestions: totalAnswered,
      percentComplete,
    },
    answers: {
      personality: interview.personalityData,
      talents: interview.talentsData,
      values: interview.valuesData,
      session: interview.sessionData,
    },
    createdAt: interview.startedAt,
    updatedAt: interview.lastActivityAt,
  };
}

/**
 * Complete a module (for deep interviews)
 */
export async function completeModule(interviewId: string, moduleId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  const sessionData = (interview.sessionData as any) || {};
  const completedModules = sessionData.completedModules || [];

  if (!completedModules.includes(moduleId)) {
    completedModules.push(moduleId);
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      sessionData: {
        ...sessionData,
        completedModules,
      },
    },
  });

  return updated;
}

/**
 * Complete interview
 */
export async function completeInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  return updated;
}

/**
 * Get user's interviews
 */
export async function getUserInterviews(userId: string) {
  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });

  return interviews;
}

/**
 * Get Deep interview modules with status for a specific interview
 */
export async function getInterviewModules(interviewId: string) {
  // Get interview
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  if (interview.interviewType !== 'deep' && interview.interviewType !== 'lite_upgraded') {
    throw new Error('This is not a Deep interview');
  }

  // Load all modules with full question data to build scoringKey -> moduleId mapping
  const questionsDir = path.join(__dirname, '../../..', 'questions', 'deep');
  const files = fs.readdirSync(questionsDir)
    .filter(f => f.startsWith('module-') && f.endsWith('.json'))
    .sort();

  const modulesData: Array<{ moduleId: string; title: string; description: string; estimatedMinutes: number; isRecommended: boolean; questions: any[] }> = [];
  const scoringKeyToModule: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(questionsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    modulesData.push(data);
    for (const q of data.questions || []) {
      if (q.scoringKey) {
        scoringKeyToModule[q.scoringKey] = data.moduleId;
      }
    }
  }

  // Get completed modules from session data
  const sessionData = (interview.sessionData as any) || {};
  const completedModules = sessionData.completedModules || [];

  // Get all answers to count how many questions per module have been answered
  const allAnswers = {
    ...(interview.personalityData as any || {}),
    ...(interview.talentsData as any || {}),
    ...(interview.valuesData as any || {}),
    ...(interview.sessionData as any || {}),
  };

  // Count answers per module using the scoringKey -> moduleId mapping
  const answerCountByModule: Record<string, number> = {};
  for (const key of Object.keys(allAnswers)) {
    const moduleId = scoringKeyToModule[key];
    if (moduleId) {
      answerCountByModule[moduleId] = (answerCountByModule[moduleId] || 0) + 1;
    }
  }

  // Build module status array
  const modules = modulesData.map((meta) => {
    const moduleId = meta.moduleId;
    const answeredCount = answerCountByModule[moduleId] || 0;

    // Determine status
    let status: 'not_started' | 'in_progress' | 'completed';
    if (completedModules.includes(moduleId)) {
      status = 'completed';
    } else if (answeredCount > 0) {
      status = 'in_progress';
    } else {
      status = 'not_started';
    }

    return {
      moduleId: meta.moduleId,
      title: meta.title,
      description: meta.description,
      estimatedMinutes: meta.estimatedMinutes,
      isRecommended: meta.isRecommended || false,
      questionsCount: meta.questions.length,
      answeredCount,
      status,
    };
  });

  return modules;
}

/**
 * Upgrade a Lite interview to Deep (lite_upgraded)
 */
export async function upgradeInterview(interviewId: string) {
  // Get interview
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  if (interview.interviewType !== 'lite') {
    throw new Error('Only Lite interviews can be upgraded');
  }

  if (interview.status !== 'completed') {
    throw new Error('Interview must be completed before upgrading');
  }

  // Update interview to lite_upgraded and set status back to in_progress
  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      interviewType: 'lite_upgraded',
      status: 'in_progress',
      currentModule: 'A', // Start with Module A
      currentQuestion: 0,
      sessionData: {
        completedModules: [], // No Deep modules completed yet
        upgradedFrom: 'lite',
        upgradedAt: new Date().toISOString(),
      },
    },
  });

  return updated;
}

/**
 * Abandon/delete an interview
 */
export async function abandonInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error('Interview not found');
  }

  // Mark as abandoned instead of deleting (preserves data)
  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      status: 'abandoned',
    },
  });

  return updated;
}
