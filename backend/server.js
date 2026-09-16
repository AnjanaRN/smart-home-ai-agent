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


// ==================================================
// HOME / HEALTH CHECK
// ==================================================

app.get("/", (req, res) => {

    res.json({
        status: "online",
        message: "Smart Home AI Agent backend is running."
    });

});


// ==================================================
// AI SMART HOME ANALYSIS
// ==================================================

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


        console.log("Received sensor data:", req.body);


        // ----------------------------------------------
        // AI PROMPT
        // ----------------------------------------------

        const prompt = `

You are an AI-based Smart Home Energy Management Agent.

Analyze the following smart home sensor information.

Your goal is to save electricity while keeping occupants comfortable.

SENSOR DATA:

Temperature: ${temperature} °C
Motion detected: ${motion}
Light level: ${light}%
Energy consumption: ${energy} kW

CURRENT APPLIANCE STATUS:

Fan: ${fan}
AC: ${ac}
Lights: ${lights}

Analyze:

1. Is someone present?
2. Is the room too hot?
3. Is lighting required?
4. Is energy consumption high?
5. Which appliances should be ON or OFF?

Return ONLY this format:

SITUATION: short description

ACTION: short recommendation

REASON: short explanation

ENERGY_SAVING: Low, Medium, or High

LIGHT: ON or OFF

FAN: ON or OFF

AC: ON or OFF

HIGH_POWER: REDUCE or NORMAL

CONFIDENCE: number between 0 and 100

Keep everything short and suitable for a college project demonstration.

`;


        // ----------------------------------------------
        // GEMINI
        // ----------------------------------------------

        const response = await ai.models.generateContent({

            model: "gemini-3.6-flash",

            contents: prompt

        });


        const text = response.text || "";


        console.log("Gemini response:");
        console.log(text);


        // ----------------------------------------------
        // PARSE AI RESPONSE
        // ----------------------------------------------

        function extract(label, fallback) {

            const regex = new RegExp(
                label + "\\s*:\\s*(.*)",
                "i"
            );

            const match = text.match(regex);

            return match
                ? match[1].trim()
                : fallback;

        }


        const situation = extract(
            "SITUATION",
            "The AI analyzed the current home environment."
        );


        const action = extract(
            "ACTION",
            "Maintain the current appliance settings."
        );


        const reason = extract(
            "REASON",
            "The decision is based on the current sensor readings."
        );


        const energySaving = extract(
            "ENERGY_SAVING",
            "Medium"
        );


        const lightDecision = extract(
            "LIGHT",
            "OFF"
        );


        const fanDecision = extract(
            "FAN",
            "OFF"
        );


        const acDecision = extract(
            "AC",
            "OFF"
        );


        const highPowerDecision = extract(
            "HIGH_POWER",
            "NORMAL"
        );


        let confidence = parseInt(
            extract("CONFIDENCE", "85")
        );


        if (isNaN(confidence)) {
            confidence = 85;
        }


        confidence = Math.max(
            0,
            Math.min(100, confidence)
        );


        // ----------------------------------------------
        // SEND STRUCTURED RESULT
        // ----------------------------------------------

        res.json({

            success: true,

            situation: situation,

            decision: action,

            reasoning: reason,

            energyAdvice:
                `Energy saving level: ${energySaving}.`,

            confidence: confidence,

            actions: {

                light: lightDecision,

                fan: fanDecision,

                ac: acDecision,

                highPowerAppliances:
                    highPowerDecision

            },

            rawAnalysis: text

        });


    } catch (error) {

        console.error(
            "AI ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            error:
                error.message ||
                "AI request failed"

        });

    }

});


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {

    console.log(
        `Smart Home AI backend running on http://localhost:${PORT}`
    );

});