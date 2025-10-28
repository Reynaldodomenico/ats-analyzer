// backend/src/routes/analyze.ts
import { Router } from "express";
import formidable from "formidable";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import OpenAI from "openai";
import { prepareInstructions } from "../lib/prompt.js";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/analyze", async (req, res) => {
  try {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ Form parsing failed:", err);
        return res.status(400).json({ error: "File parsing failed" });
      }

      const jobTitle = fields.jobTitle?.[0] || "";
      const jobDescription = fields.jobDescription?.[0] || "";
      const file = files.resume?.[0];

      if (!file) {
        console.error("❌ No resume file uploaded");
        return res.status(400).json({ error: "Missing resume file" });
      }

      // Read file
      const buffer = fs.readFileSync(file.filepath);

      // Parse PDF
      let parsed;
      try {
        parsed = await pdfParse(buffer);
      } catch (e) {
        console.error("❌ PDF parsing error:", e);
        return res.status(500).json({ error: "Failed to read PDF" });
      }

      const resumeText = parsed.text;
      const prompt =
        prepareInstructions({ jobTitle, jobDescription }) +
        "\n\nResume text:\n" +
        resumeText;

      // Call OpenAI
      let completion;
      try {
        completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [
            {
              role: "system",
              content: "You are a JSON-only response generator.",
            },
            { role: "user", content: prompt },
          ],
        });
      } catch (e) {
        console.error("❌ OpenAI API error:", e);
        return res.status(500).json({ error: "AI request failed" });
      }

      const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";

      try {
        const feedback = JSON.parse(raw);
        return res.json({ feedback });
      } catch (e) {
        console.error("❌ JSON parse error:", raw);
        return res.status(500).json({ error: "Invalid AI response", raw });
      }
    });
  } catch (e) {
    console.error("❌ Unexpected server error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
