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

// User profile built from answers, matching career requirement dimensions
interface UserProfile {
  a1: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    eq_emotional_intelligence: number;
    adaptability: number;
    stress_tolerance: number;
  };
  a2: {
    analytical_thinking: number;
    creativity: number;
    technical_aptitude: number;
    communication_written: number;
    communication_verbal: number;
    attention_to_detail: number;
    time_management: number;
    digital_literacy: number;
    learning_agility: number;
    willingness_to_learn: number;
  };
  a3: {
    work_life_balance: number;
    creativity_vs_structure: number;
    autonomy_vs_guidance: number;
    impact_vs_money: number;
    stability_vs_growth: number;
    collaboration_vs_solo: number;
    variety_vs_routine: number;
  };
}

/**
 * Build a user profile from their answers, mapping to the same 0-100 dimensions
 * used in career requirements. This is called once per matching run.
 */
function buildUserProfile(answers: any): UserProfile {
  const profile: UserProfile = {
    a1: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
      eq_emotional_intelligence: 50,
      adaptability: 50,
      stress_tolerance: 50,
    },
    a2: {
      analytical_thinking: 50,
      creativity: 50,
      technical_aptitude: 50,
      communication_written: 50,
      communication_verbal: 50,
      attention_to_detail: 50,
      time_management: 50,
      digital_literacy: 50,
      learning_agility: 50,
      willingness_to_learn: 50,
    },
    a3: {
      work_life_balance: 50,
      creativity_vs_structure: 50,
      autonomy_vs_guidance: 50,
      impact_vs_money: 50,
      stability_vs_growth: 50,
      collaboration_vs_solo: 50,
      variety_vs_routine: 50,
    },
  };

  // Helper to get answer value (answers stored as { answer, questionId, ... })
  const getAnswer = (key: string) => answers[key]?.answer ?? answers[key];

  // === PERSONALITY & COGNITIVE (A1) from lite answers ===

  // Problem solving approach (select)
  const psa = getAnswer('a1_problem_solving_approach');
  if (psa === 'analyze') {
    profile.a2.analytical_thinking += 20;
    profile.a1.conscientiousness += 10;
  } else if (psa === 'brainstorm') {
    profile.a1.openness += 20;
    profile.a2.creativity += 20;
  } else if (psa === 'research') {
    profile.a2.analytical_thinking += 10;
    profile.a1.conscientiousness += 15;
  } else if (psa === 'collaborate') {
    profile.a1.extraversion += 15;
    profile.a1.agreeableness += 15;
    profile.a1.eq_emotional_intelligence += 10;
  } else if (psa === 'action') {
    profile.a1.adaptability += 15;
    profile.a1.stress_tolerance += 10;
  }

  // Ambiguity tolerance (slider 1-10)
  const ambiguity = getAnswer('a1_ambiguity_tolerance');
  if (typeof ambiguity === 'number') {
    profile.a1.openness += (ambiguity - 5) * 5;
    profile.a1.adaptability += (ambiguity - 5) * 4;
  }

  // Persistence level (slider 1-10)
  const persistence = getAnswer('a1_persistence_level');
  if (typeof persistence === 'number') {
    profile.a1.conscientiousness += (persistence - 5) * 5;
    profile.a1.stress_tolerance += (persistence - 5) * 4;
  }

  // Energizing activities (multiselect)
  const energizing = getAnswer('a1_energizing_activities');
  if (Array.isArray(energizing)) {
    if (energizing.includes('creating')) { profile.a2.creativity += 15; profile.a1.openness += 10; }
    if (energizing.includes('analyzing')) { profile.a2.analytical_thinking += 15; }
    if (energizing.includes('helping')) { profile.a1.agreeableness += 15; profile.a1.eq_emotional_intelligence += 10; }
    if (energizing.includes('organizing')) { profile.a1.conscientiousness += 15; profile.a2.time_management += 10; }
    if (energizing.includes('leading')) { profile.a1.extraversion += 15; }
    if (energizing.includes('learning')) { profile.a2.learning_agility += 15; profile.a2.willingness_to_learn += 10; }
    if (energizing.includes('communicating')) { profile.a2.communication_verbal += 10; profile.a2.communication_written += 10; }
    if (energizing.includes('building_relationships')) { profile.a1.extraversion += 10; profile.a1.eq_emotional_intelligence += 10; }
  }

  // Interest areas (multiselect)
  const interests = getAnswer('a1_interest_areas');
  if (Array.isArray(interests)) {
    if (interests.includes('data_patterns')) { profile.a2.analytical_thinking += 10; }
    if (interests.includes('creative_arts')) { profile.a2.creativity += 10; }
    if (interests.includes('people_society')) { profile.a1.eq_emotional_intelligence += 10; profile.a1.agreeableness += 5; }
    if (interests.includes('business_economics')) { profile.a2.analytical_thinking += 5; }
    if (interests.includes('innovation_trends')) { profile.a1.openness += 10; }
    if (interests.includes('science_research')) { profile.a2.analytical_thinking += 10; profile.a1.conscientiousness += 5; }
    if (interests.includes('social_issues')) { profile.a1.agreeableness += 10; }
    if (interests.includes('global_culture')) { profile.a1.openness += 10; }
  }

  // === SKILLS & APTITUDES (A2) from lite answers ===

  // Learning style (select)
  const learnStyle = getAnswer('a2_learning_style');
  if (learnStyle === 'hands_on') {
    profile.a2.learning_agility += 15;
    profile.a1.adaptability += 10;
  } else if (learnStyle === 'watching') {
    profile.a2.attention_to_detail += 10;
  } else if (learnStyle === 'reading') {
    profile.a2.analytical_thinking += 10;
    profile.a1.conscientiousness += 10;
  } else if (learnStyle === 'discussing') {
    profile.a1.extraversion += 10;
    profile.a2.communication_verbal += 10;
  } else if (learnStyle === 'structured') {
    profile.a1.conscientiousness += 15;
    profile.a2.time_management += 10;
  }

  // Detail vs big picture (slider 1-10, low=detail, high=big picture)
  const detailBigPic = getAnswer('a2_detail_vs_bigpicture');
  if (typeof detailBigPic === 'number') {
    profile.a2.attention_to_detail += (5 - detailBigPic) * 5;
    profile.a1.openness += (detailBigPic - 5) * 3;
  }

  // Quantitative comfort (select)
  const quantComfort = getAnswer('a2_quantitative_comfort');
  if (quantComfort === 'natural') {
    profile.a2.analytical_thinking += 20;
    profile.a2.technical_aptitude += 10;
  } else if (quantComfort === 'learnable') {
    profile.a2.analytical_thinking += 10;
  } else if (quantComfort === 'challenging') {
    profile.a2.analytical_thinking -= 5;
  } else if (quantComfort === 'prefer_avoid') {
    profile.a2.analytical_thinking -= 15;
  }

  // Communication preference (select)
  const commPref = getAnswer('a2_communication_preference');
  if (commPref === 'writing') {
    profile.a2.communication_written += 20;
  } else if (commPref === 'speaking') {
    profile.a2.communication_verbal += 20;
    profile.a1.extraversion += 10;
  } else if (commPref === 'visual') {
    profile.a2.creativity += 10;
  } else if (commPref === 'storytelling') {
    profile.a2.communication_verbal += 10;
    profile.a2.creativity += 10;
  } else if (commPref === 'mixed') {
    profile.a2.communication_written += 10;
    profile.a2.communication_verbal += 10;
  }

  // Language skills (multiselect)
  const langs = getAnswer('a2_language_skills');
  if (Array.isArray(langs)) {
    if (langs.length >= 2) profile.a2.communication_written += 10;
    if (langs.length >= 3) profile.a2.communication_written += 5;
    if (langs.includes('english')) profile.a2.digital_literacy += 10;
  }

  // === VALUES & PREFERENCES (A3) from lite answers ===

  // Work-life balance priority (slider 1-10)
  const wlb = getAnswer('a3_work_life_balance_priority');
  if (typeof wlb === 'number') {
    profile.a3.work_life_balance = wlb * 10;
  }

  // Environment preference (select)
  const envPref = getAnswer('a3_environment_preference');
  if (envPref === 'startup_dynamic') {
    profile.a3.autonomy_vs_guidance = 65;
    profile.a3.variety_vs_routine = 85;
    profile.a3.stability_vs_growth = 80;
  } else if (envPref === 'established_structured') {
    profile.a3.autonomy_vs_guidance = 35;
    profile.a3.variety_vs_routine = 35;
    profile.a3.stability_vs_growth = 30;
  } else if (envPref === 'ngo_mission') {
    profile.a3.impact_vs_money = 80;
    profile.a3.collaboration_vs_solo = 70;
  } else if (envPref === 'government_public') {
    profile.a3.stability_vs_growth = 20;
    profile.a3.work_life_balance = Math.max(profile.a3.work_life_balance, 70);
  } else if (envPref === 'creative_agency') {
    profile.a3.creativity_vs_structure = 75;
    profile.a3.variety_vs_routine = 80;
  } else if (envPref === 'entrepreneurial') {
    profile.a3.autonomy_vs_guidance = 90;
    profile.a3.stability_vs_growth = 85;
  }

  // Collaboration style (select)
  const collabStyle = getAnswer('a3_collaboration_style');
  if (collabStyle === 'independent') {
    profile.a3.collaboration_vs_solo = 20;
    profile.a3.autonomy_vs_guidance = 80;
  } else if (collabStyle === 'collaborative_equal') {
    profile.a3.collaboration_vs_solo = 80;
    profile.a3.autonomy_vs_guidance = 50;
  } else if (collabStyle === 'leading') {
    profile.a3.collaboration_vs_solo = 70;
    profile.a3.autonomy_vs_guidance = 70;
    profile.a1.extraversion += 10;
  } else if (collabStyle === 'being_guided') {
    profile.a3.autonomy_vs_guidance = 25;
    profile.a3.collaboration_vs_solo = 60;
  } else if (collabStyle === 'flexible_mixed') {
    profile.a3.collaboration_vs_solo = 55;
    profile.a3.autonomy_vs_guidance = 55;
  }

  // Primary motivators (multiselect)
  const motivators = getAnswer('a3_primary_motivators');
  if (Array.isArray(motivators)) {
    if (motivators.includes('solving_problems')) { profile.a2.analytical_thinking += 5; }
    if (motivators.includes('helping_others')) { profile.a3.impact_vs_money += 15; profile.a1.agreeableness += 5; }
    if (motivators.includes('creating_building')) { profile.a3.creativity_vs_structure += 15; profile.a2.creativity += 5; }
    if (motivators.includes('recognition_advancement')) { profile.a3.impact_vs_money -= 10; }
    if (motivators.includes('autonomy_independence')) { profile.a3.autonomy_vs_guidance += 15; }
    if (motivators.includes('teamwork_collaboration')) { profile.a3.collaboration_vs_solo += 10; }
    if (motivators.includes('innovation_change')) { profile.a1.openness += 10; profile.a3.creativity_vs_structure += 10; }
    if (motivators.includes('mastery_expertise')) { profile.a2.willingness_to_learn += 10; }
  }

  // Value priorities (ranking - ordered array, first = most important)
  const valuePriorities = getAnswer('a3_value_priorities');
  if (Array.isArray(valuePriorities)) {
    valuePriorities.forEach((val: string, idx: number) => {
      const weight = (6 - idx) * 5; // First item +30, last +5
      if (val === 'high_income') profile.a3.impact_vs_money -= weight / 2;
      if (val === 'learning_growth') profile.a3.stability_vs_growth += weight / 2;
      if (val === 'meaningful_impact') profile.a3.impact_vs_money += weight / 2;
      if (val === 'work_life_balance') profile.a3.work_life_balance += weight / 3;
      if (val === 'creative_freedom') profile.a3.creativity_vs_structure += weight / 2;
      if (val === 'job_security') profile.a3.stability_vs_growth -= weight / 2;
    });
  }

  // Challenge type preference (select)
  const challengePref = getAnswer('a3_challenge_type_preference');
  if (challengePref === 'analytical_complex') { profile.a2.analytical_thinking += 10; }
  else if (challengePref === 'creative_innovative') { profile.a2.creativity += 10; profile.a3.creativity_vs_structure += 5; }
  else if (challengePref === 'people_relationships') { profile.a1.eq_emotional_intelligence += 10; }
  else if (challengePref === 'strategic_planning') { profile.a2.analytical_thinking += 5; profile.a1.openness += 5; }
  else if (challengePref === 'hands_on_practical') { profile.a2.technical_aptitude += 10; }
  else if (challengePref === 'large_scale_impact') { profile.a3.impact_vs_money += 10; }

  // Impact visibility need (slider 1-10)
  const impactVis = getAnswer('a3_impact_visibility_need');
  if (typeof impactVis === 'number') {
    profile.a3.impact_vs_money += (impactVis - 5) * 3;
  }

  // Stress tolerance (select)
  const stressTol = getAnswer('a3_stress_tolerance');
  if (stressTol === 'thrive') {
    profile.a1.stress_tolerance += 25;
    profile.a1.neuroticism -= 15;
  } else if (stressTol === 'manageable') {
    profile.a1.stress_tolerance += 10;
  } else if (stressTol === 'occasional_ok') {
    profile.a1.stress_tolerance -= 5;
    profile.a1.neuroticism += 5;
  } else if (stressTol === 'prefer_avoid') {
    profile.a1.stress_tolerance -= 15;
    profile.a1.neuroticism += 15;
  }

  // Work characteristics (multiselect)
  const workChars = getAnswer('a3_work_characteristics');
  if (Array.isArray(workChars)) {
    if (workChars.includes('variety_diversity')) profile.a3.variety_vs_routine += 10;
    if (workChars.includes('innovation_cutting_edge')) profile.a1.openness += 5;
    if (workChars.includes('stability_predictability')) profile.a3.stability_vs_growth -= 10;
    if (workChars.includes('global_multicultural')) profile.a1.openness += 5;
    if (workChars.includes('social_impact')) profile.a3.impact_vs_money += 10;
    if (workChars.includes('flexibility_autonomy')) profile.a3.autonomy_vs_guidance += 10;
    if (workChars.includes('continuous_learning')) profile.a2.willingness_to_learn += 10;
  }

  // === DEEP MODULE ANSWERS (if available) ===

  // Module A: Personality (deep)
  const personalityTraits = getAnswer('a1_personality_traits');
  if (Array.isArray(personalityTraits)) {
    if (personalityTraits.includes('analytical')) profile.a2.analytical_thinking += 10;
    if (personalityTraits.includes('creative')) profile.a2.creativity += 10;
    if (personalityTraits.includes('social')) profile.a1.extraversion += 10;
    if (personalityTraits.includes('organized')) profile.a1.conscientiousness += 10;
    if (personalityTraits.includes('adventurous')) profile.a1.openness += 10;
  }

  const teamRole = getAnswer('a1_team_role');
  if (teamRole === 'leader') profile.a1.extraversion += 10;
  else if (teamRole === 'analyzer') profile.a2.analytical_thinking += 10;
  else if (teamRole === 'mediator') profile.a1.agreeableness += 10;
  else if (teamRole === 'creative') profile.a2.creativity += 10;

  const riskTolerance = getAnswer('a1_risk_tolerance');
  if (typeof riskTolerance === 'number') {
    profile.a1.stress_tolerance += (riskTolerance - 5) * 3;
    profile.a1.openness += (riskTolerance - 5) * 2;
  }

  const planningStyle = getAnswer('a1_planning_style');
  if (typeof planningStyle === 'number') {
    profile.a1.conscientiousness += (planningStyle - 5) * 4;
    profile.a2.time_management += (planningStyle - 5) * 3;
  }

  // Module F: Problem Solving (deep)
  const ambiguityComfort = getAnswer('a1_ambiguity_comfort');
  if (typeof ambiguityComfort === 'number') {
    profile.a1.openness += (ambiguityComfort - 5) * 3;
    profile.a1.adaptability += (ambiguityComfort - 5) * 3;
  }

  // Module J: Decision Making (deep)
  const decisionStyle = getAnswer('a1_decision_making_style');
  if (decisionStyle === 'analytical' || decisionStyle === 'data_driven') {
    profile.a2.analytical_thinking += 8;
  } else if (decisionStyle === 'intuitive') {
    profile.a1.openness += 8;
  } else if (decisionStyle === 'seek_advice') {
    profile.a1.agreeableness += 8;
  }

  // Clamp all values to 0-100
  for (const category of [profile.a1, profile.a2, profile.a3]) {
    for (const key of Object.keys(category)) {
      (category as any)[key] = Math.max(0, Math.min(100, (category as any)[key]));
    }
  }

  return profile;
}

/**
 * Calculate how well a user's profile dimension matches a career requirement dimension.
 * Returns 0-100 where 100 = perfect match.
 */
function calculateDimensionMatch(
  userDimension: Record<string, number>,
  careerDimension: Record<string, number> | undefined
): number {
  if (!careerDimension || Object.keys(careerDimension).length === 0) return 50;

  let totalScore = 0;
  let count = 0;

  for (const key of Object.keys(careerDimension)) {
    const required = careerDimension[key];
    const actual = (userDimension as any)[key];
    if (actual === undefined || required === undefined) continue;

    // Calculate match: closer = better, being above requirement is slightly rewarded
    const diff = actual - required;
    let matchScore: number;

    if (diff >= 0) {
      // At or above requirement: good match, slight diminishing returns above +20
      matchScore = 100 - Math.min(20, diff * 0.5);
    } else {
      // Below requirement: penalize proportionally
      matchScore = Math.max(0, 100 + diff * 1.5);
    }

    totalScore += matchScore;
    count++;
  }

  return count > 0 ? totalScore / count : 50;
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

  console.log('📋 Answer keys found:', Object.keys(allAnswers).join(', '));

  // Calculate data completeness
  const totalAnswers = Object.keys(allAnswers).length;
  let expectedAnswers = 150;
  if (interview.interviewType === 'lite') {
    expectedAnswers = 37;
  } else if (interview.interviewType === 'lite_upgraded') {
    expectedAnswers = 37 + 144;
  }
  const dataCompleteness = Math.min(100, Math.round((totalAnswers / expectedAnswers) * 100));

  // Build user profile once (used for all career comparisons)
  const userProfile = buildUserProfile(allAnswers);
  console.log('👤 User profile built:', JSON.stringify(userProfile, null, 2));

  // Build user context for GPT (human-readable summary)
  const userContext = buildUserContext(allAnswers, userProfile);

  // Get all careers from database
  const careers = await prisma.career.findMany();
  console.log(`📊 Found ${careers.length} careers in database`);

  // Calculate fit scores for each career
  console.log('🧮 Calculating fit scores...');
  const careerScores = careers.map((career) => {
    const fitScore = calculateFitScore(userProfile, career, interview.interviewType);
    return { career, fitScore };
  });

  // Sort by fit score and take top matches
  careerScores.sort((a, b) => b.fitScore - a.fitScore);
  const topCount = interview.interviewType === 'lite' ? 2 : 5;
  const topMatches = careerScores.slice(0, topCount);

  console.log('🏆 Top matches:', topMatches.map(m => `${m.career.name}: ${Math.round(m.fitScore)}`).join(', '));

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
        userContext,
        fitScore,
        interview.interviewType
      );
      console.log(`  ✅ ${index + 1}/${topMatches.length} - Done: ${career.name}`);

      return {
        careerId: career.id,
        careerTitle: career.name,
        careerCategory: career.category || 'general',
        fitScore: Math.round(fitScore),
        confidence,
        explanation: explanation.explanation,
        strengths: explanation.strengths,
        growthAreas: explanation.growthAreas,
        roadmap: explanation.roadmap,
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
 * Calculate fit score comparing user profile to career requirements
 */
function calculateFitScore(
  userProfile: UserProfile,
  career: any,
  interviewType: string
): number {
  const requirements = career.requirements || {};

  // A1: Personality & Cognitive traits (40% weight)
  const a1Score = calculateDimensionMatch(userProfile.a1, requirements.a1);

  // A2: Skills & Aptitudes (30% weight)
  const a2Score = calculateDimensionMatch(userProfile.a2, requirements.a2);

  // A3: Values & Preferences (30% weight)
  const a3Score = calculateDimensionMatch(userProfile.a3, requirements.a3);

  let score = a1Score * 0.4 + a2Score * 0.3 + a3Score * 0.3;

  // Deep interviews get a small bonus for comprehensive data
  if (interviewType === 'deep' || interviewType === 'lite_upgraded') {
    score = Math.min(100, score * 1.05);
  }

  return score;
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
 * Generate comprehensive career analysis using cached Job Card + personalized GPT explanation
 */
async function generateCareerExplanation(
  career: any,
  answers: any,
  userContext: string,
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
  // ═══════════════════════════════════════════════════════════════════
  // TIERED MODEL STRATEGY (3 tiers, all configurable via .env):
  //   • Premium model (o1)        → Static career data (generated ONCE, shared forever)
  //   • Analysis model (gpt-4o)   → Deep personalized analysis (per-user, cached after first gen)
  //   • Fast model (gpt-4o-mini)  → Quick fields: explanation, strengths, growth areas
  //
  // For deep interviews: analysis model used for detailedAnalysis
  // For lite interviews: fast model used for everything (simpler output)
  // ═══════════════════════════════════════════════════════════════════
  const PREMIUM_MODEL  = process.env.GPT_PREMIUM_MODEL  || 'o1';           // For career static info (rare, high-quality)
  const ANALYSIS_MODEL = process.env.GPT_ANALYSIS_MODEL || 'gpt-4o';      // For deep personalized analysis (per-user)
  const FAST_MODEL     = process.env.GPT_FAST_MODEL     || 'gpt-4o-mini'; // For quick personalized fields

  // Choose which model to use for personalized analysis based on interview depth
  const personalizedModel = (interviewType === 'deep' || interviewType === 'lite_upgraded')
    ? ANALYSIS_MODEL   // Deep interviews get the higher-quality analysis model
    : FAST_MODEL;      // Lite interviews use the fast/cheap model

  try {
    // Check if static career data already cached (shared across all users)
    const cached = career.cachedAnalysis as any;
    const hasStaticCache = cached?.careerPattern && cached?.salaryInfo && cached?.skillStack;

    // ─── LAYER 1: Generate static career data with PREMIUM model (if not cached) ───
    if (!hasStaticCache) {
      console.log(`    🧠 [${PREMIUM_MODEL}] Generating HIGH-QUALITY static career data for: ${career.name} (first time — will be reused for ALL future users)`);

      const staticPrompt = `You are a world-class career research analyst with deep expertise in the Vietnam job market (Hanoi, Ho Chi Minh City), Southeast Asian market, and global trends.

## Career: "${career.name}" (${career.vietnameseName})
Category: ${career.category || 'general'}
Description: ${career.description}

## Your Task
Generate comprehensive, authoritative career reference data for this role. This data will be used as a permanent reference card shared across many users — make it thorough, accurate, and detailed.

Respond in JSON format:
{
  "careerPattern": {
    "progression": "Detailed career progression from Intern/Junior → Mid-level → Senior → Lead/Manager → Director/VP with realistic timelines (years) for each stage. Include typical job titles at each level in Vietnam.",
    "dailyResponsibilities": "Detailed breakdown of a typical workday at Junior, Mid, and Senior levels. Include specific tasks, tools used, meetings, and deliverables for each level.",
    "industryOutlook": "Comprehensive analysis covering: (1) Current demand in Hanoi and Ho Chi Minh City markets specifically, (2) Key hiring companies and industries in Vietnam, (3) Southeast Asia regional trends, (4) Global market outlook, (5) Impact of AI/technology on this role, (6) Growth projections for 2025-2030"
  },
  "salaryInfo": {
    "entryLevel": { "range": "X - Y triệu VND/tháng (net)", "experience": "0-2 years" },
    "midLevel": { "range": "X - Y triệu VND/tháng (net)", "experience": "2-5 years" },
    "seniorLevel": { "range": "X - Y triệu VND/tháng (net)", "experience": "5+ years" }
  },
  "skillStack": ["15-20 specific technical and soft skills to master, ordered by priority. Include both foundational and advanced skills."],
  "learningPlan": {
    "month1": "Detailed week-by-week breakdown with specific courses, certifications, resources (include Vietnamese resources where relevant)",
    "month2": "Continue with intermediate skills...",
    "month3": "Focus on practical application...",
    "month4": "Master advanced topics...",
    "month5": "Build portfolio and real projects...",
    "month6": "Job ready: interview prep, networking strategy, portfolio review..."
  }
}

IMPORTANT:
- Use realistic, up-to-date Vietnam salary data for 2025-2026
- Include specific company names hiring in Vietnam for this role
- Reference Hanoi and Ho Chi Minh City markets specifically
- Include Asia-wide and global context
- Be thorough — this will be the permanent reference for this career`;

      const staticCompletion = await openai.chat.completions.create({
        model: PREMIUM_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an elite career research analyst. You produce authoritative, detailed career reference data used by career counseling platforms. Your data must be accurate, comprehensive, and specific to the Vietnam/Asia market.',
          },
          {
            role: 'user',
            content: staticPrompt,
          },
        ],
        temperature: 0.5, // Lower temperature for factual accuracy
        response_format: { type: 'json_object' },
        max_tokens: 4000,
      });

      const staticResult = JSON.parse(staticCompletion.choices[0].message.content || '{}');
      console.log(`    ✅ [${PREMIUM_MODEL}] Generated premium static data for: ${career.name}`);

      // Save to Career.cachedAnalysis — shared across ALL users forever
      const staticData = {
        careerPattern: staticResult.careerPattern || {
          progression: 'Standard career progression path.',
          dailyResponsibilities: 'Day-to-day responsibilities vary by level.',
          industryOutlook: 'Growing demand in Vietnam market.',
        },
        salaryInfo: staticResult.salaryInfo || {
          entryLevel: { range: '10 - 20 triệu VND/tháng', experience: '0-2 years' },
          midLevel: { range: '20 - 40 triệu VND/tháng', experience: '2-5 years' },
          seniorLevel: { range: '40 - 80 triệu VND/tháng', experience: '5+ years' },
        },
        skillStack: staticResult.skillStack || ['Core competencies', 'Technical skills', 'Soft skills'],
        learningPlan: staticResult.learningPlan || {
          month1: 'Foundation building',
          month2: 'Skill development',
          month3: 'Practice and projects',
          month4: 'Advanced topics',
          month5: 'Portfolio building',
          month6: 'Job preparation',
        },
        generatedBy: PREMIUM_MODEL,
        generatedAt: new Date().toISOString(),
      };

      await prisma.career.update({
        where: { id: career.id },
        data: { cachedAnalysis: staticData as any },
      });
      console.log(`    💾 [${PREMIUM_MODEL}] Saved permanent Job Card for: ${career.name}`);

      // Update local reference so personalized step below can use it
      career.cachedAnalysis = staticData;
    }

    // At this point, static cache is guaranteed to exist
    const staticCache = career.cachedAnalysis as any;

    // ─── LAYER 2: Generate personalized analysis with FAST model ───
    console.log(`    ⚡ [${personalizedModel}] Generating personalized analysis for: ${career.name} (interview: ${interviewType})`);

    const personalizedPrompt = `Play the role of an expert career advisor with deep knowledge of the Vietnam job market, Southeast Asian employment trends, and global career development.

## Here is the complete information from this person's career assessment:
${userContext}

## We have matched this person with the following career: "${career.name}" (${career.vietnameseName})
- Category: ${career.category || 'general'}
- Description: ${career.description}
- Fit Score: ${Math.round(fitScore)}%

## Your Task
Now, we need you to synthesize and analyse ALL of the information above. Write a deep analysis demonstrating why this person matches this job, and what are the pros and cons of chasing this career path. The analysis should be around 400 words, written with firm analytics based on every answer that they provided. Do NOT write generic career descriptions — every sentence must reference this specific person's data.

Respond in JSON format:
{
  "explanation": "2-3 sentences summarizing why THIS SPECIFIC PERSON is a good/moderate/developing fit for this career. Reference their specific traits, motivators, and preferences from the assessment.",
  "detailedAnalysis": "A comprehensive ~400-word analysis covering: (1) Why this career matches THIS person's profile — cite their specific answers, (2) How their personality traits (Big Five, EQ, stress tolerance) align with this career's demands, (3) How their skills and aptitudes support or challenge success in this role, (4) The day-to-day realities of this job and whether this person would enjoy them based on their stated preferences, (5) Long-term career prospects given their goals and values, (6) PROS of pursuing this path — specific advantages based on their profile, (7) CONS and challenges they would face — be honest about gaps, (8) Cultural and market fit in Vietnam (Hanoi/HCMC), (9) Work-life balance alignment with their stated priorities, (10) A clear recommendation on whether to pursue this path and why. Write with firm, evidence-based analysis grounded in every answer they provided.",
  "strengths": ["3-4 specific strengths THIS PERSON has that are directly relevant to succeeding in this career — cite their assessment data"],
  "growthAreas": ["2-3 specific areas THIS PERSON would need to develop to succeed — be honest and specific"],
  "roadmap": "A personalized 6-month transition roadmap considering their current situation, skills, and gaps. Include specific actions for each phase."
}

IMPORTANT:
- Every claim must be backed by this person's actual assessment answers
- Be encouraging but brutally honest about gaps and challenges
- Include specific pros AND cons of this career path for this person
- Write in a professional, analytical tone — like a real career advisor giving a consultation`;

    const personalizedCompletion = await openai.chat.completions.create({
      model: personalizedModel,
      messages: [
        {
          role: 'system',
          content: 'You are an expert career advisor. You synthesize assessment data to produce firm, evidence-based career analyses. You always cite specific data points from the user\'s answers. You are honest about both strengths and gaps — like a real career consultant giving a professional consultation.',
        },
        {
          role: 'user',
          content: personalizedPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    });

    const personalizedResult = JSON.parse(personalizedCompletion.choices[0].message.content || '{}');
    console.log(`    ✅ [${personalizedModel}] Generated personalized analysis for: ${career.name}`);

    // Merge: personalized parts from fast model + static parts from premium cache
    const analysisData = {
      explanation: personalizedResult.explanation || `Based on your profile, ${career.name} is a match with a ${Math.round(fitScore)}% fit score.`,
      detailedAnalysis: personalizedResult.detailedAnalysis || 'Detailed analysis not available.',
      strengths: personalizedResult.strengths || ['Alignment with core competencies', 'Compatible work style', 'Values match'],
      growthAreas: personalizedResult.growthAreas || ['Build domain expertise', 'Expand professional network'],
      roadmap: personalizedResult.roadmap || 'Focus on building relevant skills and gaining experience.',
      careerPattern: staticCache.careerPattern,
      salaryInfo: staticCache.salaryInfo,
      skillStack: staticCache.skillStack,
      learningPlan: staticCache.learningPlan,
    };

    return analysisData;
  } catch (error: any) {
    console.error(`    ❌ Error generating analysis for ${career.name}:`, error.message || error);
    return {
      explanation: `Based on your profile, ${career.name} is a match with a ${Math.round(fitScore)}% fit score.`,
      detailedAnalysis: 'Unable to generate detailed analysis at this time.',
      strengths: ['Strong alignment with core competencies', 'Compatible work style preferences', 'Values match the career path'],
      growthAreas: ['Continue developing relevant skills', 'Build industry-specific knowledge'],
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
 * Build human-readable user context from answers for GPT prompt
 */
function buildUserContext(answers: any, profile: UserProfile): string {
  const context: string[] = [];
  const getAnswer = (key: string) => answers[key]?.answer ?? answers[key];

  // Current situation
  const status = getAnswer('session_current_status');
  if (status) context.push(`Current Situation: ${status.replace(/_/g, ' ')}`);

  const field = getAnswer('session_current_field');
  if (field) context.push(`Current Field: ${field}`);

  const experience = getAnswer('session_experience_level');
  if (experience) context.push(`Experience: ${experience.replace(/_/g, ' ')}`);

  // Problem-solving approach
  const psa = getAnswer('a1_problem_solving_approach');
  if (psa) context.push(`Problem-Solving Approach: ${psa.replace(/_/g, ' ')}`);

  // Energizing activities
  const energizing = getAnswer('a1_energizing_activities');
  if (Array.isArray(energizing)) {
    context.push(`Activities That Energize Them: ${energizing.map((e: string) => e.replace(/_/g, ' ')).join(', ')}`);
  }

  // Interest areas
  const interests = getAnswer('a1_interest_areas');
  if (Array.isArray(interests)) {
    context.push(`Interest Areas: ${interests.map((i: string) => i.replace(/_/g, ' ')).join(', ')}`);
  }

  // Learning style
  const learnStyle = getAnswer('a2_learning_style');
  if (learnStyle) context.push(`Learning Style: ${learnStyle.replace(/_/g, ' ')}`);

  // Communication preference
  const commPref = getAnswer('a2_communication_preference');
  if (commPref) context.push(`Communication Preference: ${commPref.replace(/_/g, ' ')}`);

  // Quantitative comfort
  const quantComfort = getAnswer('a2_quantitative_comfort');
  if (quantComfort) context.push(`Comfort with Numbers/Data: ${quantComfort.replace(/_/g, ' ')}`);

  // Ambiguity tolerance
  const ambiguity = getAnswer('a1_ambiguity_tolerance');
  if (typeof ambiguity === 'number') {
    context.push(`Ambiguity Tolerance: ${ambiguity}/10 (${ambiguity >= 7 ? 'comfortable with uncertainty' : ambiguity >= 4 ? 'moderate' : 'prefers clear guidelines'})`);
  }

  // Persistence
  const persistence = getAnswer('a1_persistence_level');
  if (typeof persistence === 'number') {
    context.push(`Persistence Level: ${persistence}/10 (${persistence >= 7 ? 'very persistent' : persistence >= 4 ? 'moderate' : 'moves on quickly'})`);
  }

  // Detail vs big picture
  const detailBigPic = getAnswer('a2_detail_vs_bigpicture');
  if (typeof detailBigPic === 'number') {
    context.push(`Thinking Style: ${detailBigPic}/10 (${detailBigPic >= 7 ? 'big-picture thinker' : detailBigPic <= 3 ? 'detail-oriented' : 'balanced'})`);
  }

  // Values
  const valuePriorities = getAnswer('a3_value_priorities');
  if (Array.isArray(valuePriorities)) {
    context.push(`Value Priorities (ranked): ${valuePriorities.map((v: string) => v.replace(/_/g, ' ')).join(' > ')}`);
  }

  // Environment preference
  const envPref = getAnswer('a3_environment_preference');
  if (envPref) context.push(`Preferred Work Environment: ${envPref.replace(/_/g, ' ')}`);

  // Primary motivators
  const motivators = getAnswer('a3_primary_motivators');
  if (Array.isArray(motivators)) {
    context.push(`Primary Motivators: ${motivators.map((m: string) => m.replace(/_/g, ' ')).join(', ')}`);
  }

  // Collaboration style
  const collabStyle = getAnswer('a3_collaboration_style');
  if (collabStyle) context.push(`Collaboration Style: ${collabStyle.replace(/_/g, ' ')}`);

  // Challenge type
  const challengePref = getAnswer('a3_challenge_type_preference');
  if (challengePref) context.push(`Preferred Challenge Type: ${challengePref.replace(/_/g, ' ')}`);

  // Work-life balance
  const wlb = getAnswer('a3_work_life_balance_priority');
  if (typeof wlb === 'number') {
    context.push(`Work-Life Balance Priority: ${wlb}/10`);
  }

  // Stress tolerance
  const stressTol = getAnswer('a3_stress_tolerance');
  if (stressTol) context.push(`Stress Tolerance: ${stressTol.replace(/_/g, ' ')}`);

  // Narrative answers (rich qualitative data for GPT)
  const narratives: string[] = [];

  const strengthsNarrative = getAnswer('a2_natural_strengths_narrative');
  if (strengthsNarrative) narratives.push(`Natural Strengths: "${strengthsNarrative}"`);

  const recognizedStrengths = getAnswer('a2_recognized_strengths');
  if (recognizedStrengths) narratives.push(`What Others Recognize: "${recognizedStrengths}"`);

  const accomplishment = getAnswer('a2_accomplishment_reflection');
  if (accomplishment) narratives.push(`Proud Accomplishment: "${accomplishment}"`);

  const idealWorkday = getAnswer('a3_ideal_workday_vision');
  if (idealWorkday) narratives.push(`Ideal Workday Vision: "${idealWorkday}"`);

  const workDislikes = getAnswer('a3_work_dislikes_narrative');
  if (workDislikes) narratives.push(`What Drains Energy: "${workDislikes}"`);

  const successDef = getAnswer('a3_success_definition');
  if (successDef) narratives.push(`Definition of Success: "${successDef}"`);

  const primaryGoal = getAnswer('session_primary_goal_narrative');
  if (primaryGoal) narratives.push(`Primary Goal for Assessment: "${primaryGoal}"`);

  const careerIdeas = getAnswer('session_career_ideas');
  if (careerIdeas) narratives.push(`Career Ideas in Mind: "${careerIdeas}"`);

  const careerConcerns = getAnswer('session_career_concerns');
  if (careerConcerns) narratives.push(`Career Concerns: "${careerConcerns}"`);

  const growthAsp = getAnswer('a2_growth_aspirations');
  if (growthAsp) narratives.push(`Growth Aspirations: "${growthAsp}"`);

  if (narratives.length > 0) {
    context.push('\n## User\'s Own Words (Narrative Responses)');
    context.push(...narratives);
  }

  // Profile summary
  context.push('\n## Computed Profile Scores (0-100)');
  context.push(`Personality: openness=${profile.a1.openness}, conscientiousness=${profile.a1.conscientiousness}, extraversion=${profile.a1.extraversion}, agreeableness=${profile.a1.agreeableness}, stress_tolerance=${profile.a1.stress_tolerance}, adaptability=${profile.a1.adaptability}, EQ=${profile.a1.eq_emotional_intelligence}`);
  context.push(`Skills: analytical=${profile.a2.analytical_thinking}, creativity=${profile.a2.creativity}, written_comm=${profile.a2.communication_written}, verbal_comm=${profile.a2.communication_verbal}, attention_detail=${profile.a2.attention_to_detail}, learning_agility=${profile.a2.learning_agility}`);
  context.push(`Values: work_life_balance=${profile.a3.work_life_balance}, creativity_vs_structure=${profile.a3.creativity_vs_structure}, autonomy=${profile.a3.autonomy_vs_guidance}, impact_vs_money=${profile.a3.impact_vs_money}, stability_vs_growth=${profile.a3.stability_vs_growth}, collaboration=${profile.a3.collaboration_vs_solo}`);

  return context.join('\n') || 'User has completed a career assessment.';
}
