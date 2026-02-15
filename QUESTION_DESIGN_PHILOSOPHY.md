# Career Assessment Question Design Philosophy

## 📚 Overview

This document outlines the design philosophy, principles, and approach for creating career assessment questions that work across **all industries and career paths**.

**Last Updated:** 2026-02-16
**Status:** Lite Version Complete ✅ | Deep Version Pending ⏳

---

## 🎯 Core Philosophy

### Target Audience
**Primary Users:** Undergraduate students with **minimal to no professional experience**
- High school students planning for university
- University students (all years)
- Recent graduates (within 1 year)
- Early career professionals exploring options

### Key Principles

1. **Industry-Agnostic**
   - Questions must work for Marketing, International Relations, Tech, Finance, Creative, NGO, Government, Healthcare, Education, and ANY future career path
   - No bias toward any single industry or field
   - Avoid field-specific terminology or examples

2. **Reflection-Based**
   - Help students **understand themselves** through thoughtful reflection
   - Questions should prompt self-discovery and introspection
   - Focus on "who they are" rather than "what they know"

3. **Experience-Neutral**
   - Don't assume professional work experience
   - Accept examples from school, volunteering, hobbies, personal life
   - Value potential and personality over proven track record

4. **Narrative-Rich**
   - Prefer **open-ended text responses** over multiple choice where appropriate
   - Capture unique individual stories and perspectives
   - Generate rich qualitative data for GPT-4 analysis

5. **GPT-4 Optimized**
   - Responses designed to be processed by GPT-4 for personalized career matching
   - Provide context and nuance that AI can interpret deeply
   - Balance structured data (for scoring) with narrative data (for understanding)

---

## 🚫 What to Avoid

### ❌ Industry-Specific Bias

**DON'T:**
- "Which technical activities do you find easiest?" (Tech bias)
- "Rate your comfort with learning new technologies" (Tech bias)
- "Built a website or web app" (Tech bias)
- "Pair programming" (Tech bias)
- "Tech company vs startup vs enterprise" (Tech bias)
- "CS degree or bootcamp" (Tech/Education bias)
- "Land my first tech job" (Tech bias)

**DO:**
- "Which activities do you find easiest and most natural?"
- "Rate your comfort with learning new skills and concepts"
- "Led or coordinated a project or initiative"
- "How do you prefer to collaborate?"
- "Startup vs Established vs NGO vs Government"
- "University degree (any field)"
- "What's your primary career goal?"

### ❌ Experience Assumptions

**DON'T:**
- Assume they have work experience
- Require knowledge of professional terminology
- Focus only on career accomplishments
- Ask about specific job titles or roles they've held

**DO:**
- Accept examples from school, volunteering, hobbies, personal projects
- Use plain language anyone can understand
- Ask about any accomplishments they're proud of
- Focus on activities and situations, not job titles

### ❌ Leading Questions

**DON'T:**
- "How much do you love working with cutting-edge technology?"
- "What's your favorite programming language?"
- "How important is having the latest tech stack?"

**DO:**
- "What type of challenges energize you most?"
- "What activities give you energy?"
- "How important is working on innovative ideas?"

---

## ✅ Question Design Guidelines

### Text/Textarea Questions (Narrative)

**Purpose:** Capture personal stories, reflections, and unique perspectives

**Examples:**
```json
{
  "type": "textarea",
  "question": "Think about a time when you felt most capable or confident. What were you doing, and why did it feel natural to you?",
  "placeholder": "Describe the situation, what you were doing, and what made you feel successful...",
  "maxLength": 500
}
```

**Best Practices:**
- Ask about specific situations or experiences
- Encourage storytelling and detail
- Use "think about a time when..." or "describe..." prompts
- Provide helpful placeholder examples that span multiple industries
- Limit to 400-600 characters for deeper responses
- Use for: strengths, accomplishments, values, goals, concerns

### Select Questions (Structured)

**Purpose:** Capture clear preferences and tendencies for scoring

**Examples:**
```json
{
  "type": "select",
  "question": "When facing a problem or challenge, what's your first instinct?",
  "options": [
    { "value": "analyze", "label": "Analyze the situation logically to understand the root cause" },
    { "value": "brainstorm", "label": "Brainstorm creative solutions and new approaches" },
    { "value": "research", "label": "Research what others have done in similar situations" },
    { "value": "collaborate", "label": "Bring people together to solve it as a team" },
    { "value": "action", "label": "Take immediate action and adjust as I go" }
  ]
}
```

**Best Practices:**
- Options should be mutually exclusive
- Cover broad categories that apply across industries
- Use descriptive labels that explain the choice
- Avoid jargon or field-specific terms
- Include 5-7 options for good coverage
- Use for: thinking styles, learning styles, work preferences, collaboration styles

### Slider Questions (Spectrum)

**Purpose:** Measure degree/intensity of traits on a continuum

**Examples:**
```json
{
  "type": "slider",
  "min": 1,
  "max": 10,
  "question": "How would you rate your attention to small details vs. big picture thinking?",
  "minLabel": "I focus on details - I notice small things others miss",
  "maxLabel": "I focus on big picture - I see overall patterns and themes"
}
```

**Best Practices:**
- Use 1-10 scale for consistency
- Both ends should be positive (not "bad" vs "good")
- Labels should describe the extremes clearly
- Use for: trait continuums, preference intensities, confidence levels

### Multiselect Questions (Multiple Strengths)

**Purpose:** Allow selection of multiple applicable options

**Examples:**
```json
{
  "type": "multiselect",
  "maxSelections": 4,
  "question": "What topics or subjects naturally interest you? (Select up to 4)",
  "options": [
    { "value": "people_society", "label": "People, society, and human behavior" },
    { "value": "business_economics", "label": "Business, economics, and how organizations work" },
    { "value": "creative_arts", "label": "Creative arts, design, and aesthetics" },
    { "value": "social_issues", "label": "Social issues, justice, and making a difference" },
    { "value": "science_research", "label": "Science, research, and discovery" },
    { "value": "global_culture", "label": "Global affairs, culture, and international topics" },
    { "value": "innovation_trends", "label": "Innovation, trends, and emerging ideas" },
    { "value": "data_patterns", "label": "Data, patterns, and analytical thinking" }
  ]
}
```

**Best Practices:**
- Limit selections (3-4 max) to force prioritization
- Options should span diverse domains
- Cover multiple industries/interests
- Use for: interests, motivators, resources, work characteristics

### Ranking Questions (Priorities)

**Purpose:** Force prioritization of competing values

**Examples:**
```json
{
  "type": "ranking",
  "question": "Rank these career aspects from most to least important to you",
  "options": [
    { "value": "high_income", "label": "High income and financial rewards" },
    { "value": "learning_growth", "label": "Continuous learning and personal growth" },
    { "value": "meaningful_impact", "label": "Making meaningful impact on society" },
    { "value": "work_life_balance", "label": "Work-life balance and personal time" },
    { "value": "creative_freedom", "label": "Creative freedom and self-expression" },
    { "value": "job_security", "label": "Job security and stability" }
  ]
}
```

**Best Practices:**
- 5-7 options ideal (not too few, not overwhelming)
- All options should be desirable (forces hard choices)
- Use for: value priorities, career goals, benefits preferences

---

## 📋 Lite Version Question Structure

### Current Implementation (37 Total Questions)

#### **1. Skills-Talents (14 questions)**

**Narrative Questions (5):**
- st_1: Time you felt most capable (textarea)
- st_3: What people compliment you on (textarea)
- st_7: Accomplishment you're proud of (textarea)
- st_11: What you wish you were better at (textarea - optional)

**Structured Questions (9):**
- st_2: How you learn fastest (select)
- st_4: Problem-solving approach (select)
- st_5: Detail vs big picture (slider)
- st_6: Energizing activities (multiselect)
- st_8: Communication preference (select)
- st_9: Interest areas (multiselect - max 4)
- st_10: Comfort with uncertainty (slider)
- st_12: Quantitative comfort (select)
- st_13: Language skills (multiselect)
- st_14: Persistence level (slider)

**Key Themes:**
- Natural strengths and talents
- Learning and problem-solving styles
- Communication preferences
- Interest areas across disciplines
- Persistence and adaptability

#### **2. Values-Preferences (13 questions)**

**Narrative Questions (4):**
- vp_2: Ideal workday vision 5 years from now (textarea)
- vp_5: What drains your energy (textarea)
- vp_10: Personal definition of success (textarea)
- vp_13: Additional context (textarea - optional)

**Structured Questions (9):**
- vp_1: Value priorities (ranking)
- vp_3: Work environment preference (select)
- vp_4: Primary motivators (multiselect - max 3)
- vp_6: Work-life balance priority (slider)
- vp_7: Collaboration style (select)
- vp_8: Challenge type preference (select)
- vp_9: Impact visibility need (slider)
- vp_11: Work characteristics (multiselect - max 4)
- vp_12: Stress tolerance (select)

**Key Themes:**
- Core values and priorities
- Work environment and culture fit
- Motivation drivers
- Collaboration and autonomy preferences
- Success definition and life goals

#### **3. Current Situation (10 questions)**

**Narrative Questions (4):**
- cs_2: Current field (text - optional)
- cs_4: Primary goal narrative (textarea)
- cs_7: Career ideas (textarea - optional)
- cs_9: Career concerns and worries (textarea)

**Structured Questions (6):**
- cs_1: Current status (select)
- cs_3: Professional experience level (select)
- cs_5: Current resources (multiselect - optional)
- cs_6: Decision urgency (select)
- cs_8: Time availability (select)
- cs_10: Career confidence (slider)

**Key Themes:**
- Where they are in their journey
- Experience and resources available
- Goals and timeline
- Concerns and confidence level

---

## 🎨 Writing Question Copy

### Tone and Voice

**DO:**
- Use conversational, friendly tone
- Be encouraging and non-judgmental
- Use "you" to address the user directly
- Keep language simple and accessible
- Be specific and concrete

**DON'T:**
- Use corporate jargon or buzzwords
- Be condescending or overly casual
- Assume knowledge or experience
- Use complex academic language

### Placeholder Text

**Purpose:** Guide users with helpful examples that span industries

**Good Examples:**
```json
"placeholder": "e.g., Led a community project, created successful content, organized major event, completed research..."
```
- Shows diversity of acceptable answers
- Spans multiple industries
- Specific enough to be helpful
- Short enough to be readable

**Bad Examples:**
```json
"placeholder": "Enter your answer here"
```
- Not helpful or inspiring
- Doesn't guide thinking

### Question Stem Writing

**Good Question Stems:**
- "Think about a time when..."
- "Describe a situation where..."
- "What activities..."
- "How do you prefer..."
- "Which best describes..."
- "What's your relationship with..."

**Avoid:**
- "Do you like..." (Yes/no is too simplistic)
- "Are you good at..." (Judgmental, assumes expertise)
- "How many..." (Too quantitative for personality assessment)

---

## 🔄 Question Revision Process

### When to Revise Questions

1. **Industry Expansion**
   - New career paths added (e.g., Healthcare, Education)
   - Questions don't apply to new domains
   - Need to remove bias toward existing career paths

2. **User Feedback**
   - Users confused by question wording
   - Options don't cover user's situation
   - Questions feel irrelevant or biased

3. **Data Quality Issues**
   - Too many users skip optional questions
   - Text responses are too short/generic
   - Select options not being used evenly

4. **Matching Algorithm Updates**
   - New scoring dimensions needed
   - Different data format required
   - More granular data needed

### Revision Checklist

Before changing a question, verify:

- [ ] Works for ALL current industry tracks (Marketing, International Relations, Tech, etc.)
- [ ] Works for users with zero professional experience
- [ ] Language is clear and accessible to undergrads
- [ ] No jargon or field-specific terminology
- [ ] Placeholder text provides helpful, diverse examples
- [ ] Option labels are mutually exclusive (for select)
- [ ] Both ends of slider are positive/neutral (not good vs bad)
- [ ] Multiselect has reasonable max selections (3-4)
- [ ] Question serves clear scoring/matching purpose

---

## 🧪 Testing Guidelines

### Before Launching New Questions

**Test with Diverse Personas:**
1. **Undergrad Marketing Major** (no experience)
2. **Undergrad International Relations Major** (internship experience)
3. **Career Changer** (5 years in different field)
4. **Tech Student** (some coding projects)
5. **Creative Student** (design/arts focus)

**Validation Checks:**
- ✅ All personas can answer all questions meaningfully
- ✅ No persona feels questions are biased against their field
- ✅ Text questions generate thoughtful 300+ character responses
- ✅ Select options cover the distribution of real responses
- ✅ Questions take 10-15 minutes for Lite (not too long)

### A/B Testing Ideas

If you want to optimize questions:
- Test narrative vs structured versions of same question
- Test different placeholder examples
- Test question order (personality first vs values first)
- Test optional vs required for sensitive questions

---

## 📊 Scoring and Matching

### How Questions Map to Careers

**A1 Factors (Personality):** 30% weight
- Mapped from: Thinking style, problem-solving approach, persistence, ambiguity tolerance, energizing activities
- Questions: st_4, st_6, st_10, st_14, vp_4

**A2 Factors (Skills):** 40% weight
- Mapped from: Learning style, communication preference, detail orientation, analytical comfort, accomplishments, languages
- Questions: st_2, st_5, st_8, st_12, st_13, st_1, st_3, st_7

**A3 Factors (Values):** 30% weight
- Mapped from: Value priorities, environment preference, motivators, work-life balance, collaboration style, success definition
- Questions: vp_1, vp_3, vp_4, vp_6, vp_7, vp_10

**Session Context:**
- Not used for scoring, but for personalization and roadmap creation
- Questions: All cs_* questions

### GPT-4 Processing

**Narrative responses are sent to GPT-4 for:**
1. Sentiment and tone analysis
2. Theme extraction and categorization
3. Personality trait inference
4. Value alignment scoring
5. Career match explanation generation
6. Personalized roadmap creation

**Example Narrative Processing:**
```
User Response (st_1): "I felt most capable when I organized a charity fundraiser for my school. I coordinated 20 volunteers, managed the budget, and created all the promotional materials. It felt natural because I love bringing people together for a good cause and seeing the impact we can make together."

GPT-4 Inference:
- Leadership: High (coordinated volunteers)
- Collaboration: High (bringing people together)
- Social Impact: Very High (charity, good cause)
- Creativity: Medium (promotional materials)
- Organization: High (managed budget, coordinated event)
- Values: Impact > Money

Matching Signal:
→ Strong fit for NGO/Non-profit roles
→ Good fit for Event Planning, Community Management
→ Moderate fit for Marketing (Creative)
→ Lower fit for individual contributor/technical roles
```

---

## 🚀 Future Enhancements

### Adaptive Questioning (V2)

**Concept:** Ask different follow-up questions based on initial responses

**Example Flow:**
1. User indicates "I want to work with people and social issues"
2. System asks follow-up: "What type of social impact work interests you most?" (Options: Education, Healthcare, Human Rights, Environment, Community Development)
3. User chooses "Human Rights"
4. System asks: "What aspect of human rights work?" (Research/Policy, Advocacy/Campaigns, Field Work/Direct Service)

**Benefits:**
- More personalized question path
- Deeper insights into specific interests
- Avoid asking irrelevant questions

**Challenges:**
- More complex question flow logic
- Harder to compare users who took different paths
- May increase completion time

### Video/Audio Responses (V3)

**Concept:** Allow users to record video/audio responses for narrative questions

**Benefits:**
- Richer data (tone, emotion, body language)
- More natural for some users than writing
- Can assess communication skills directly

**Challenges:**
- Requires video processing and transcription
- Privacy concerns
- Accessibility issues
- Longer review time

### Peer Feedback Module (V2)

**Concept:** Ask users to have friends/colleagues answer questions about them

**Example:** "How would your friends describe your strengths?"
- User sends link to 3 friends
- Friends answer 5-minute questionnaire about user
- System compares self-perception vs external perception

**Benefits:**
- Validates self-reported data
- Reveals blind spots
- More accurate personality assessment

**Challenges:**
- User friction (need to recruit friends)
- Privacy concerns
- Time investment

---

## 📖 Version History

### v2.0 - Industry-Agnostic Redesign (2026-02-16)

**Lite Version Questions:** ✅ Complete
- Removed all tech bias
- Increased narrative questions from 2 to 11
- Made questions work for all industries
- Redesigned for undergrad students
- Optimized for GPT-4 processing

**Deep Version Questions:** ⏳ Pending
- 12 modules (A-L) need similar redesign
- Same principles apply
- More in-depth questions per module

### v1.0 - Original Tech-Focused (2026-01-15)

**Lite Version Questions:**
- Tech-biased (coding, debugging, tech stack)
- Assumed technical experience
- Multiple choice heavy
- Designed for tech job seekers

**Deep Version Questions:**
- 12 modules covering technical deep dives
- Module A: Programming fundamentals
- Module B: System design
- Module C: Data structures
- etc.

---

## 💡 Best Practices Summary

### DO ✅

1. **Ask open-ended reflection questions** for rich qualitative data
2. **Use industry-agnostic language** that works across all fields
3. **Accept examples from any life domain** (work, school, volunteer, hobbies)
4. **Provide diverse placeholder examples** spanning multiple industries
5. **Focus on self-discovery** and helping students understand themselves
6. **Design for GPT-4 processing** with narrative depth
7. **Test with diverse personas** before launching
8. **Keep tone encouraging** and non-judgmental

### DON'T ❌

1. **Don't assume technical knowledge** or professional experience
2. **Don't use industry jargon** or field-specific terminology
3. **Don't bias toward any career path** (tech, marketing, finance, etc.)
4. **Don't make questions leading** or prescriptive
5. **Don't require specific accomplishments** - potential matters more
6. **Don't use negative framing** (e.g., "Are you bad at...")
7. **Don't make questions too long** or complex
8. **Don't forget the target audience** - undergrads with little experience

---

## 🎯 Success Metrics

### Question Quality Indicators

**Good Questions Should:**
- ✅ 90%+ completion rate (not skipped)
- ✅ Average 300+ characters for text responses
- ✅ Even distribution across select options (no one option >60%)
- ✅ Low correlation between questions (each measures something unique)
- ✅ High user satisfaction in feedback ("Questions helped me understand myself")

**Red Flags:**
- ❌ >20% skip rate (question too personal or unclear)
- ❌ <100 characters average for text responses (not prompting reflection)
- ❌ One option selected >80% of time (poor option design)
- ❌ Users comment question is confusing or irrelevant

### Matching Accuracy

**Validate Questions By:**
- Manual review of 100 sample matches (do they make sense?)
- User feedback post-results ("Did matches feel accurate?")
- Longitudinal tracking (did users pursue recommended careers?)

---

**Document Maintained By:** Career Fit Product Team
**Contact:** Update this document when adding new career paths or revising question philosophy

**Related Docs:**
- `MARKETING_CAREERS_SUMMARY.md` - Marketing career database
- `INTERNATIONAL_RELATIONS_SUMMARY.md` - International relations career database
- `/questions/lite/` - Lite version question JSON files
- `/questions/deep/` - Deep version question JSON files (pending redesign)
