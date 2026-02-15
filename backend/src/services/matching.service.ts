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
 * Generate personalized explanation using GPT-4
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
}> {
  try {
    console.log(`    🔄 Calling OpenAI for: ${career.name}`);
    // Prepare context about the user
    const userContext = buildUserContext(answers);

    const prompt = `You are a career counselor analyzing a user's fit for the career: "${career.name}".

Career Description: ${career.description || 'A role in ' + career.category}

User Profile:
${userContext}

Fit Score: ${Math.round(fitScore)}%

Please provide:
1. A 2-3 sentence explanation of why this career is a good match
2. 3-4 key strengths that make them suited for this role
3. 2-3 areas for growth or development
4. A brief 6-month roadmap (3-4 concrete steps) to transition into this career

Format your response as JSON:
{
  "explanation": "...",
  "strengths": ["...", "...", "..."],
  "growthAreas": ["...", "..."],
  "roadmap": "Step-by-step roadmap..."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career counselor providing personalized career guidance.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    console.log(`    ✅ OpenAI responded for: ${career.name}`);

    return {
      explanation: result.explanation || 'This career aligns well with your profile.',
      strengths: result.strengths || ['Strong analytical skills', 'Good problem solver', 'Fast learner'],
      growthAreas: result.growthAreas || ['Build domain expertise', 'Expand network'],
      roadmap: result.roadmap || 'Focus on building relevant skills and gaining experience.',
    };
  } catch (error: any) {
    console.error(`    ❌ OpenAI error for ${career.name}:`, error.message || error);
    // Fallback to basic explanation
    return {
      explanation: `Based on your profile, ${career.name} is a strong match with a ${Math.round(fitScore)}% fit score. Your skills and preferences align well with the demands of this role.`,
      strengths: [
        'Strong alignment with core competencies',
        'Compatible work style preferences',
        'Values match the career path',
      ],
      growthAreas: [
        'Continue developing technical skills',
        'Build industry-specific knowledge',
      ],
      roadmap: '1. Research the field (Month 1)\n2. Build foundational skills (Months 2-3)\n3. Start networking (Month 4)\n4. Pursue entry opportunities (Months 5-6)',
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
