const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { prepareInstructions } = require("../lib/prompt");
const OpenAI = require("openai");
require("dotenv").config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/analyze", (req, res) => {
  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "File parsing failed" });

    const jobTitle = fields.jobTitle || "";
    const jobDescription = fields.jobDescription || "";

    // ✅ Safely get the file, handle array or single object
    let file = files.resume;
    if (Array.isArray(file)) file = file[0];

    if (!file || !file.filepath) {
      return res.status(400).json({ error: "Missing resume file" });
    }

    try {
      const buffer = fs.readFileSync(file.filepath);
      const parsed = await pdfParse(buffer);
      const resumeText = parsed.text;

      const prompt = prepareInstructions({ jobTitle, jobDescription }) + "\n\nResume text:\n" + resumeText;

      // ✅ Call OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an ATS resume analyzer. Return JSON only." },
          { role: "user", content: prompt },
        ],
      });

      const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";
      let feedback;
      try {
        feedback = JSON.parse(raw);
      } catch (e) {
        return res.status(500).json({ error: "Failed to parse AI response", raw });
      }

      return res.json({ feedback });
    } catch (error) {
      console.error("❌ Error analyzing resume:", error);
      return res.status(500).json({ error: "Failed to analyze resume" });
    }
  });
});

module.exports = router;
