import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CareerMatch {
  careerId: string;
  careerTitle: string;
  careerCategory: string;
  fitScore: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  strengths: string[];
  growthAreas: string[];
  roadmap: string;
  // Enhanced details
  detailedAnalysis: string; // 6-10 paragraphs in-depth analysis
  careerPattern: {
    progression: string; // Career progression path
    dailyResponsibilities: string; // Day-to-day work by level
    industryOutlook: string; // Trends and future in Vietnam
  };
  salaryInfo: {
    entryLevel: { range: string; experience: string };
    midLevel: { range: string; experience: string };
    seniorLevel: { range: string; experience: string };
  };
  skillStack: string[]; // Required skills to acquire
  learningPlan: {
    month1: string;
    month2: string;
    month3: string;
    month4: string;
    month5: string;
    month6: string;
  };
}

interface MatchingResult {
  interviewId: string;
  interviewType: string;
  matches: CareerMatch[];
  analysisDate: Date;
  dataCompleteness: number;
}

/**
 * Main function to generate career matches for a completed interview
 */
export async function generateMatches(interviewId: string): Promise<MatchingResult> {
  console.log('🔍 Starting generateMatches for interview:', interviewId);

  // Get interview data
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    console.error('❌ Interview not found:', interviewId);
    throw new Error('Interview not found');
  }

  if (interview.status !== 'completed') {
    console.error('❌ Interview not completed. Status:', interview.status);
    throw new Error('Interview is not completed yet');
  }

  console.log('✅ Interview found. Type:', interview.interviewType, 'Status:', interview.status);

  // Extract all answers
  const personalityData = (interview.personalityData as any) || {};
  const talentsData = (interview.talentsData as any) || {};
  const valuesData = (interview.valuesData as any) || {};
  const sessionData = (interview.sessionData as any) || {};

  const allAnswers = {
    ...personalityData,
    ...talentsData,
    ...valuesData,
    ...sessionData,
  };

  // Calculate data completeness
  const totalAnswers = Object.keys(allAnswers).length;
  let expectedAnswers = 150; // Deep default
  if (interview.interviewType === 'lite') {
    expectedAnswers = 37;
  } else if (interview.interviewType === 'lite_upgraded') {
    // Lite (37) + Deep modules (12 modules * 12 questions = 144)
    expectedAnswers = 37 + 144;
  }
  const dataCompleteness = Math.min(100, Math.round((totalAnswers / expectedAnswers) * 100));

  // Get all careers from database
  const careers = await prisma.career.findMany();
  console.log(`📊 Found ${careers.length} careers in database`);

  // Calculate fit scores for each career
  console.log('🧮 Calculating fit scores...');
  const careerScores = await Promise.all(
    careers.map(async (career) => {
      const fitScore = calculateFitScore(allAnswers, career, interview.interviewType);
      return {
        career,
        fitScore,
      };
    })
  );

  // Sort by fit score and take top matches
  careerScores.sort((a, b) => b.fitScore - a.fitScore);
  const topCount = interview.interviewType === 'lite' ? 2 : 5; // Deep and lite_upgraded both get 5
  const topMatches = careerScores.slice(0, topCount);

  // Determine confidence level
  const confidence = getConfidenceLevel(interview.interviewType, dataCompleteness);

  // Generate detailed explanations with GPT-4
  console.log(`🤖 Generating explanations for ${topMatches.length} top matches using GPT-4o...`);
  const matches = await Promise.all(
    topMatches.map(async ({ career, fitScore }, index) => {
      console.log(`  ${index + 1}/${topMatches.length} - Generating for: ${career.name}`);
      const explanation = await generateCareerExplanation(
        career,
        allAnswers,
        fitScore,
        interview.interviewType
      );
      console.log(`  ✅ ${index + 1}/${topMatches.length} - Done: ${career.name}`);

      return {
        careerId: career.id,
        careerTitle: career.name,
        careerCategory: 'Technology', // Default category since it's not in schema
        fitScore: Math.round(fitScore),
        confidence,
        explanation: explanation.explanation,
        strengths: explanation.strengths,
        growthAreas: explanation.growthAreas,
        roadmap: explanation.roadmap,
        // Enhanced detailed information
        detailedAnalysis: explanation.detailedAnalysis,
        careerPattern: explanation.careerPattern,
        salaryInfo: explanation.salaryInfo,
        skillStack: explanation.skillStack,
        learningPlan: explanation.learningPlan,
      };
    })
  );

  const result = {
    interviewId,
    interviewType: interview.interviewType,
    matches,
    analysisDate: new Date(),
    dataCompleteness,
  };

  console.log('✨ Successfully generated', matches.length, 'matches! Returning results.');
  return result;
}

/**
 * Calculate fit score using rule-based algorithm
 */
function calculateFitScore(
  answers: any,
  career: any,
  interviewType: string
): number {
  let score = 0;
  const requirements = career.requirements || {};

  // A1 Factor: Core Skills & Abilities (40% weight)
  const skillsScore = calculateSkillsMatch(answers, requirements);
  score += skillsScore * 0.4;

  // A2 Factor: Work Style & Preferences (30% weight)
  const workStyleScore = calculateWorkStyleMatch(answers, requirements);
  score += workStyleScore * 0.3;

  // A3 Factor: Values & Motivations (30% weight)
  const valuesScore = calculateValuesMatch(answers, requirements);
  score += valuesScore * 0.3;

  // For Deep interviews, apply bonus for comprehensive data
  if (interviewType === 'deep') {
    score = Math.min(100, score * 1.05); // 5% bonus for deep analysis
  }

  return score;
}

/**
 * Calculate skills match (A1 factor)
 */
function calculateSkillsMatch(answers: any, requirements: any): number {
  let score = 50; // Base score

  // Analytical skills
  if (answers.a1_personality_traits?.answer?.includes('analytical')) {
    score += 15;
  }

  // Technical comfort (from various questions)
  if (answers.a1_routine_handling?.answer === 'automate') {
    score += 10;
  }

  // Learning approach
  if (answers.a1_learning_approach?.answer === 'hands_on') {
    score += 10;
  }

  // Problem-solving orientation
  if (answers.a1_team_role?.answer === 'analyzer') {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * Calculate work style match (A2 factor)
 */
function calculateWorkStyleMatch(answers: any, requirements: any): number {
  let score = 50; // Base score

  // Planning style
  if (answers.a1_planning_style?.answer > 5) {
    score += 10; // Prefers structured approach
  }

  // Focus vs multitasking
  if (answers.a1_focus_vs_multitask?.answer > 5) {
    score += 10; // Can multitask
  }

  // Risk tolerance
  if (answers.a1_risk_tolerance?.answer > 6) {
    score += 10; // Higher risk tolerance
  }

  // Deadline approach
  if (answers.a1_deadline_approach?.answer === 'steady_progress') {
    score += 10;
  }

  // Autonomy preference
  if (answers.a1_optimal_conditions?.answer?.includes('autonomy')) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Calculate values match (A3 factor)
 */
function calculateValuesMatch(answers: any, requirements: any): number {
  let score = 50; // Base score

  // Internal vs external validation
  if (answers.a1_validation_source?.answer < 5) {
    score += 15; // Internally motivated
  }

  // Comfort being expert
  if (answers.a1_expert_comfort?.answer > 6) {
    score += 15;
  }

  // Feedback response
  if (answers.a1_feedback_response?.answer === 'grateful' || answers.a1_feedback_response?.answer === 'motivated') {
    score += 10;
  }

  // Big picture vs detail
  if (answers.a1_personality_traits?.answer?.includes('big_picture')) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Determine confidence level
 */
function getConfidenceLevel(
  interviewType: string,
  dataCompleteness: number
): 'low' | 'medium' | 'high' {
  if (interviewType === 'lite') {
    return dataCompleteness > 80 ? 'medium' : 'low';
  } else {
    return dataCompleteness > 80 ? 'high' : 'medium';
  }
}

/**
 * Generate comprehensive career analysis with caching (Job Card system)
 */
async function generateCareerExplanation(
  career: any,
  answers: any,
  fitScore: number,
  interviewType: string
): Promise<{
  explanation: string;
  strengths: string[];
  growthAreas: string[];
  roadmap: string;
  detailedAnalysis: string;
  careerPattern: {
    progression: string;
    dailyResponsibilities: string;
    industryOutlook: string;
  };
  salaryInfo: {
    entryLevel: { range: string; experience: string };
    midLevel: { range: string; experience: string };
    seniorLevel: { range: string; experience: string };
  };
  skillStack: string[];
  learningPlan: {
    month1: string;
    month2: string;
    month3: string;
    month4: string;
    month5: string;
    month6: string;
  };
}> {
  try {
    // Check cache first (Job Card system - saves API tokens!)
    if (career.cachedAnalysis) {
      console.log(`    💾 Using cached analysis for: ${career.name} (saved API tokens!)`);
      const cached = career.cachedAnalysis as any;
      return {
        explanation: cached.explanation,
        strengths: cached.strengths,
        growthAreas: cached.growthAreas,
        roadmap: cached.roadmap,
        detailedAnalysis: cached.detailedAnalysis,
        careerPattern: cached.careerPattern,
        salaryInfo: cached.salaryInfo,
        skillStack: cached.skillStack,
        learningPlan: cached.learningPlan,
      };
    }

    console.log(`    🔄 Generating NEW Job Card for: ${career.name} (calling GPT-4o...)`);

    const prompt = `You are a senior career counselor with deep expertise in the Vietnam tech job market. Analyze the career: "${career.name}" (${career.vietnameseName}).

Career Description: ${career.description}

Provide an EXTREMELY DETAILED analysis in JSON format with the following structure:

{
  "explanation": "2-3 sentence summary of why this career is a good match",
  "detailedAnalysis": "6-10 comprehensive paragraphs covering: (1) Why this career path, (2) Personality and work style fit, (3) Skills alignment, (4) Day-to-day realities, (5) Long-term prospects, (6) Challenges to expect, (7) Cultural fit in Vietnam market, (8) Work-life balance considerations, (9) Growth trajectory, (10) Who thrives in this role",
  "strengths": ["3-4 key strengths needed"],
  "growthAreas": ["2-3 development areas"],
  "roadmap": "Brief 6-month transition roadmap",
  "careerPattern": {
    "progression": "Detailed career progression path from Junior (0-2 years) → Mid (2-5 years) → Senior (5-8 years) → Lead (8-12 years) → Principal/Manager (12+ years). Include typical timeline and requirements for each level.",
    "dailyResponsibilities": "Describe a typical day for Junior, Mid-level, and Senior professionals. Be specific about tasks, meetings, collaboration, and focus areas at each level.",
    "industryOutlook": "Analyze Vietnam market demand, growth projections for next 3-5 years, emerging opportunities, salary trends, and which companies/sectors are hiring."
  },
  "salaryInfo": {
    "entryLevel": {
      "range": "X - Y triệu VND/tháng (net)",
      "experience": "0-2 years"
    },
    "midLevel": {
      "range": "X - Y triệu VND/tháng (net)",
      "experience": "2-5 years"
    },
    "seniorLevel": {
      "range": "X - Y triệu VND/tháng (net)",
      "experience": "5+ years"
    }
  },
  "skillStack": ["10-15 specific technical and soft skills to master, ordered by priority"],
  "learningPlan": {
    "month1": "Week-by-week breakdown of what to learn, practice, and build. Include specific resources and milestones.",
    "month2": "Continue with...",
    "month3": "Focus on...",
    "month4": "Master...",
    "month5": "Build portfolio...",
    "month6": "Job ready: final polish, interview prep, networking..."
  }
}

IMPORTANT:
- Use realistic Vietnam salary data for 2026
- Be extremely detailed and practical
- Include specific tools, technologies, frameworks where relevant
- Provide actionable, concrete guidance`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career counselor specializing in Vietnam tech market with deep knowledge of salaries, career paths, and industry trends.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 4000, // Allow longer responses for detailed analysis
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    console.log(`    ✅ Generated comprehensive Job Card for: ${career.name}`);

    const analysisData = {
      explanation: result.explanation || 'This career aligns well with your profile.',
      detailedAnalysis: result.detailedAnalysis || 'Detailed analysis not available.',
      strengths: result.strengths || ['Strong analytical skills', 'Good problem solver', 'Fast learner'],
      growthAreas: result.growthAreas || ['Build domain expertise', 'Expand network'],
      roadmap: result.roadmap || 'Focus on building relevant skills and gaining experience.',
      careerPattern: result.careerPattern || {
        progression: 'Standard career progression path.',
        dailyResponsibilities: 'Day-to-day responsibilities vary by level.',
        industryOutlook: 'Growing demand in Vietnam market.',
      },
      salaryInfo: result.salaryInfo || {
        entryLevel: { range: '10 - 20 triệu VND/tháng', experience: '0-2 years' },
        midLevel: { range: '20 - 40 triệu VND/tháng', experience: '2-5 years' },
        seniorLevel: { range: '40 - 80 triệu VND/tháng', experience: '5+ years' },
      },
      skillStack: result.skillStack || ['Core competencies', 'Technical skills', 'Soft skills'],
      learningPlan: result.learningPlan || {
        month1: 'Foundation building',
        month2: 'Skill development',
        month3: 'Practice and projects',
        month4: 'Advanced topics',
        month5: 'Portfolio building',
        month6: 'Job preparation',
      },
    };

    // Save to cache (Job Card) for future use - saves API tokens!
    await prisma.career.update({
      where: { id: career.id },
      data: { cachedAnalysis: analysisData as any },
    });
    console.log(`    💾 Saved Job Card to cache for: ${career.name}`);

    return analysisData;
  } catch (error: any) {
    console.error(`    ❌ Error generating analysis for ${career.name}:`, error.message || error);
    // Fallback to basic data
    return {
      explanation: `Based on your profile, ${career.name} is a strong match with a ${Math.round(fitScore)}% fit score.`,
      detailedAnalysis: 'Unable to generate detailed analysis at this time.',
      strengths: [
        'Strong alignment with core competencies',
        'Compatible work style preferences',
        'Values match the career path',
      ],
      growthAreas: [
        'Continue developing technical skills',
        'Build industry-specific knowledge',
      ],
      roadmap: '6-month learning plan to be developed.',
      careerPattern: {
        progression: 'Standard progression path',
        dailyResponsibilities: 'Varies by level',
        industryOutlook: 'Contact career counselor for details',
      },
      salaryInfo: {
        entryLevel: { range: 'Contact HR for details', experience: '0-2 years' },
        midLevel: { range: 'Contact HR for details', experience: '2-5 years' },
        seniorLevel: { range: 'Contact HR for details', experience: '5+ years' },
      },
      skillStack: ['Core skills required for this role'],
      learningPlan: {
        month1: 'Research and foundation',
        month2: 'Skill building',
        month3: 'Practice',
        month4: 'Advanced learning',
        month5: 'Portfolio',
        month6: 'Job prep',
      },
    };
  }
}

/**
 * Build user context from answers for GPT-4
 */
function buildUserContext(answers: any): string {
  const context: string[] = [];

  // Personality traits
  if (answers.a1_personality_traits?.answer) {
    const traits = Array.isArray(answers.a1_personality_traits.answer)
      ? answers.a1_personality_traits.answer.join(', ')
      : answers.a1_personality_traits.answer;
    context.push(`Personality Traits: ${traits}`);
  }

  // Work style
  if (answers.a1_planning_style?.answer) {
    const style = answers.a1_planning_style.answer > 5 ? 'Structured planner' : 'Flexible improviser';
    context.push(`Work Style: ${style}`);
  }

  // Team role
  if (answers.a1_team_role?.answer) {
    context.push(`Team Role: ${answers.a1_team_role.answer}`);
  }

  // Learning approach
  if (answers.a1_learning_approach?.answer) {
    context.push(`Learning Style: ${answers.a1_learning_approach.answer}`);
  }

  // Risk tolerance
  if (answers.a1_risk_tolerance?.answer) {
    const risk = answers.a1_risk_tolerance.answer > 6 ? 'High' : answers.a1_risk_tolerance.answer > 4 ? 'Moderate' : 'Low';
    context.push(`Risk Tolerance: ${risk}`);
  }

  return context.join('\n') || 'User has completed a career assessment.';
}
