require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// --------------------------------------------------
// HOME / HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Smart Home AI Agent backend is running."
    });
});

// --------------------------------------------------
// AI SMART HOME ANALYSIS
// --------------------------------------------------

app.post("/api/analyze", async (req, res) => {

    try {

        const {
            temperature,
            motion,
            light,
            energy,
            fan,
            ac,
            lights
        } = req.body;

        const prompt = `
You are an AI-based Smart Home Energy Management Agent.

Your job is to analyze smart home sensor data and decide how
the appliances should be controlled to save electricity while
keeping people comfortable.

CURRENT SENSOR DATA:

Temperature: ${temperature} °C
Motion detected: ${motion}
Light level: ${light}
Energy consumption: ${energy}

CURRENT APPLIANCE STATUS:

Fan: ${fan}
AC: ${ac}
Lights: ${lights}

Analyze the situation and provide a clear recommendation.

Consider:
1. Whether someone is present.
2. Whether the room is too hot.
3. Whether lighting is required.
4. Whether electricity consumption is unusually high.
5. Which appliances should be ON or OFF.

Return your answer in exactly this format:

SITUATION: <short description>

ACTION: <what the AI recommends>

REASON: <why the AI made this decision>

ENERGY_SAVING: <Low / Medium / High>

CONFIDENCE: <number between 0 and 100>

Keep the response short and easy to understand for a
college project demonstration.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        const text = response.text;

        res.json({
            success: true,
            analysis: text
        });

    } catch (error) {

        console.error("AI ERROR:", error);

        res.status(500).json({
            success: false,
            error: error.message || "AI request failed"
        });
    }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
    console.log(`Smart Home AI backend running on http://localhost:${PORT}`);
});