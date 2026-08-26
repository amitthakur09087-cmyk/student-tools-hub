require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY is missing in .env");
    process.exit(1);
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

app.post("/api/ai", async (req, res) => {
    try {
        const {
            message,
            subject = "General",
            chapter = "General"
        } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        const instructions = `
You are StudyVerse AI, an educational assistant for Class 11 CBSE students.

Student subject: ${subject}
Student chapter/topic: ${chapter}

Rules:
- Explain concepts clearly and accurately.
- Keep the language student-friendly.
- Use simple English unless the student asks for Hindi/Hinglish.
- For numerical questions, show steps.
- For theory questions, use headings and bullet points.
- Do not invent textbook facts.
- If the question is unclear, ask a short clarification.
- Help the student learn rather than simply giving unexplained answers.
- For exam answers, mention important keywords.
- Keep answers reasonably structured.
`;

        const response = await client.responses.create({
            model: "gpt-5.6-luna",
            instructions,
            input: message
        });

        res.json({
            answer: response.output_text || "Sorry, I couldn't generate an answer."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "AI service error. Check your API key, internet connection and API account."
        });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`StudyVerse running at http://localhost:${PORT}`);
});
