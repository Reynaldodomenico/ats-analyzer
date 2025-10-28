function prepareInstructions({ jobTitle, jobDescription }) {
  return `
You are an expert in ATS (Applicant Tracking System) and resume analysis.
Job Title: ${jobTitle}
Job Description: ${jobDescription}
Please analyze the resume and return feedback as JSON using this format:
interface Feedback {
  overallScore: number;
  ATS: { score: number; tips: { type: "good"|"improve"; tip: string }[] };
  toneAndStyle: { score: number; tips: { type: "good"|"improve"; tip: string; explanation: string }[] };
  content: { score: number; tips: { type: "good"|"improve"; tip: string; explanation: string }[] };
  structure: { score: number; tips: { type: "good"|"improve"; tip: string; explanation: string }[] };
  skills: { score: number; tips: { type: "good"|"improve"; tip: string; explanation: string }[] };
}`;
}

module.exports = { prepareInstructions };
