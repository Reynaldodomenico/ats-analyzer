// backend/src/lib/prompt.ts
export const AIResponseFormat = `
interface Feedback {
  overallScore: number;
  ATS: { score: number; tips: { type: "good" | "improve"; tip: string; }[]; };
  toneAndStyle: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string; }[]; };
  content: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string; }[]; };
  structure: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string; }[]; };
  skills: { score: number; tips: { type: "good" | "improve"; tip: string; explanation: string; }[]; };
}`;

export const prepareInstructions = ({ jobTitle, jobDescription }: { jobTitle: string; jobDescription: string }) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis.
Please analyze and rate this resume and suggest how to improve it.
The job title is: ${jobTitle}
The job description is: ${jobDescription}
Provide the feedback using the following format:
${AIResponseFormat}
Return only the JSON object, with no commentary or text.`;
