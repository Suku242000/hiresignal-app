import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateOnboardingPlan(data: {
  name: string;
  role: string;
  dept: string;
  start: string;
  level: string;
  work: string;
  goals: string;
  email: string;
}) {
  const prompt = `You are an expert HR onboarding specialist. Create a detailed, practical 30-day onboarding plan.

Employee: ${data.name}
Email: ${data.email}
Role: ${data.role}
Department: ${data.dept || 'Not specified'}
Start Date: ${data.start || 'Upcoming'}
Experience Level: ${data.level || 'Not specified'}
Work Arrangement: ${data.work}
Key Goals: ${data.goals || 'Standard onboarding goals'}

Write a 30-day onboarding plan with 4 sections:

WEEK 1 — Orientation & Setup
5 specific tasks for admin, tools, culture, introductions. Ensure the employee's email (${data.email}) is incorporated into the introductions or as a contact point for administrative tasks.

WEEK 2 — Learning & Immersion
5 tasks for role-specific learning, meeting stakeholders, shadowing.

WEEK 3 — First Contributions
5 tasks for first real deliverables and early wins.

WEEK 4 — Review & Ramp-Up
5 tasks for 30-day check-in, feedback, setting 60/90-day goals.

SUCCESS SIGNALS
3 concrete signs ${data.name} is ramping well by day 30.

Be specific to the role, practical, and warm in tone. Use clear formatting.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
}

export async function generateExitReport(data: {
  name: string;
  role: string;
  years: string;
  reason: string;
  notes: string;
  projects: string;
}) {
  const prompt = `You are an expert HR strategist. Based on this exit interview, create a comprehensive Exit Intelligence Report.

Departing Employee: ${data.name}
Role: ${data.role}
Tenure: ${data.years || 'Not specified'}
Reason for Leaving: ${data.reason || 'Not specified'}
Exit Interview Notes: ${data.notes || 'None provided'}
Key Projects & Responsibilities: ${data.projects || 'Not specified'}

Generate a structured report with five sections:

1. KNOWLEDGE TRANSFER CHECKLIST
6 concrete, actionable handover items based on their specific projects and responsibilities.

2. INSTITUTIONAL KNOWLEDGE AT RISK
What unique knowledge, relationships, or context walks out the door. Be specific.

3. SIGNALS FROM THIS EXIT
What this departure reveals about the role, team, or company. Look for systemic patterns.

4. BACKFILL HIRING GUIDANCE
4 key qualities or skills to prioritize in the replacement, informed by what we learned.

5. IMMEDIATE ACTION ITEMS FOR MANAGEMENT
3 things the manager must do in the next 2 weeks to protect the team and prevent similar exits.

Be honest, practical, and direct. No fluff. This is a working document for leadership.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
}

export async function analyzeRetentionRisk(data: {
  name: string;
  role: string;
  tenure: string;
  perf: string;
  obs: string;
  changes: string;
}) {
  const prompt = `You are a people analytics expert. Analyze this employee profile and provide a retention risk assessment.

Employee: ${data.name}
Role: ${data.role}
Time in Current Role: ${data.tenure}
Last Performance Review: ${data.perf}
Recent Manager Observations: ${data.obs || 'None provided'}
Recent Company Changes: ${data.changes || 'None noted'}

Respond in EXACTLY this format:

RISK_SCORE: [integer 0-100]
RISK_LEVEL: [Low / Medium / High]
HEADLINE: [one sentence max 12 words summarizing the risk situation]
SUMMARY: [2 sentences on key risk factors or positive signals]

FULL ANALYSIS:
Paragraph 1: What the signals suggest about this employee's current state.
Paragraph 2: Root cause hypothesis — what's really going on beneath the surface.
Paragraph 3: What's at stake if this person leaves — impact on team, knowledge, clients.
Paragraph 4: Top 3 specific interventions ranked by impact — what the manager should do NOW.

Be candid, specific, and actionable. This is for a manager who wants to act today.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
}

export async function generatePerformanceFeedback(type: number, data: any) {
  let prompt = "";
  if (type === 1) {
    prompt = `You are a senior HR professional writing a performance review. Write a thorough, professional, and fair performance review.
Employee: ${data.name}
Role: ${data.role}
Review Period: ${data.period || 'Current period'}
Overall Performance: ${data.perf}
Key Accomplishments: ${data.wins || 'Not specified'}
Areas for Improvement: ${data.grow || 'Not specified'}
Tone: ${data.tone}
Review Type: ${data.type}

Write a complete performance review with these sections:
1. OVERALL ASSESSMENT — A strong opening paragraph summarizing this performance.
2. KEY ACHIEVEMENTS — Specific accomplishments with business impact.
3. CORE COMPETENCIES — Rate and comment on: Execution, Communication, Collaboration, Initiative, Growth mindset.
4. AREAS FOR DEVELOPMENT — Actionable, framed constructively.
5. GOALS FOR NEXT PERIOD — 3 specific, measurable goals.
6. CLOSING STATEMENT — A motivating, forward-looking close.`;
  } else if (type === 2) {
    prompt = `You are an expert manager preparing for a 1-on-1. Create a structured, thoughtful 1-on-1 meeting agenda.
Manager: ${data.mgr || 'Manager'}
Employee: ${data.emp || 'Employee'}
Frequency: ${data.freq}
Current Focus: ${data.focus}
Context: ${data.ctx || 'Regular check-in'}

Create a 45-minute 1-on-1 agenda with:
1. OPENING CHECK-IN (5 min)
2. THEIR UPDATE (10 min)
3. MAIN TOPIC (20 min)
4. MANAGER ITEMS (8 min)
5. WRAP-UP (2 min)
Include a "Things NOT to say" tip.`;
  } else if (type === 3) {
    prompt = `You are an HR and employment specialist. Create a professional Performance Improvement Plan (PIP).
Employee: ${data.name}
Role: ${data.role}
Performance Issues: ${data.issues}
Support Already Given: ${data.support}
PIP Duration: ${data.dur}
Desired Outcome: ${data.out}

Create a formal PIP document with sections: Purpose, Specific Concerns, Required Improvements, Support Provided, Milestone Check-ins, Success Criteria, Consequences, and Acknowledgment.`;
  } else {
    prompt = `You are a culture-focused HR leader. Write a recognition message that genuinely lands.
Employee: ${data.name}
What They Did: ${data.what}
Impact: ${data.impact}
Recognition Type: ${data.type}
Tone: ${data.tone}

Write a specific, impact-focused, personal, and memorable recognition message. Include a "Science behind this" coaching tip for the manager.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.text;
}

export async function generateJobDescription(data: any) {
  const prompt = `You are a world-class recruiter and employer branding expert. Write a compelling job description.
Job Title: ${data.title}
Department: ${data.dept}
Employment Type: ${data.type}
Work Arrangement: ${data.work}
Experience Required: ${data.exp}
Salary Range: ${data.salary || 'Competitive'}
Key Responsibilities: ${data.resp}
Required Skills: ${data.skills}
Company Culture: ${data.culture}
Tone: ${data.tone}
Sections to Include: ${data.sections}

Write a complete, compelling job description with a hook, impact-framed responsibilities, and concise requirements.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.text;
}

export async function generatePulseSurvey(type: number, data: any) {
  let prompt = "";
  if (type === 1) {
    prompt = `You are an organizational psychologist. Design a targeted pulse survey.
Team: ${data.team}
Frequency: ${data.freq}
Focus Areas: ${data.chips}
Company Context: ${data.ctx}
Question Style: ${data.style}
Anonymity: ${data.anon}

Create a short, specific pulse survey with a title, estimated time, and numbered questions. Include a "How to follow up" section.`;
  } else {
    prompt = `You are a people analytics expert. Analyze these employee survey results.
Team: ${data.team}
Survey Period: ${data.period}
Survey Results: ${data.results}
Previous Survey: ${data.prev || 'No previous data'}

Produce a Survey Intelligence Report with: Headline Finding, Score Summary, Red Flags, Positive Signals, Trend Analysis, Root Cause Hypotheses, and a 30-day Action Plan.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.text;
}

export async function generateCareerPlan(type: number, data: any) {
  let prompt = "";
  if (type === 1) {
    prompt = `You are a world-class career development coach. Build a personalized career growth plan.
Employee: ${data.name}
Current Role: ${data.curr}
Target Role: ${data.target}
Timeline: ${data.time}
Strengths: ${data.str}
Gaps: ${data.gaps}
Motivations: ${data.mot}

Create a plan with: Assessment, The Bridge (3 critical things), Phased Roadmap, Resources, Success Metrics, Manager's Role, and a Conversation Script.`;
  } else if (type === 2) {
    prompt = `You are a talent management expert conducting a promotion readiness assessment.
Employee: ${data.name}
Current Role: ${data.curr}
Target Promotion: ${data.target}
Time in Current Role: ${data.tenure}
Evidence of Readiness: ${data.ev}
What's Missing: ${data.miss}

Produce an assessment with: Readiness Score (X/10), Verdict, Strengths, Gaps, Deciding Factors, Timeline Recommendation, and Risk Analysis.`;
  } else {
    prompt = `You are a learning & development strategist. Build a practical upskilling roadmap.
Employee: ${data.name}
Role: ${data.role}
Skills They Want: ${data.skills}
Skills Business Needs: ${data.biz}
Learning Style: ${data.style}
Time Available: ${data.time}

Build a roadmap with: Skills Priority Matrix, 90-Day Sprint Plan, Curated Resources, Apply-as-you-learn projects, and 6-Month Milestones.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: prompt }] }],
  });
  return response.text;
}
