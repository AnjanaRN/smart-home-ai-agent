// ============================================================
// SMART HOME AI - SIMULATION
// This file handles ONLY the Gemini AI simulation.
// Do NOT remove script.js.
// ============================================================

const AI_BACKEND_URL = "https://smart-home-ai-agent.onrender.com";


// ============================================================
// GET SIMULATION DATA
// ============================================================

function getSimulationData() {

    const temperature =
        document.getElementById("temperature").value;

    const lightLevel =
        document.getElementById("lightLevel").value;

    const energyUsage =
        document.getElementById("energyUsage").value;

    const motion =
        document.getElementById("motion").checked;

    return {

        temperature: temperature,

        motion: motion
            ? "Detected"
            : "Not detected",

        light: `${lightLevel}% light level`,

        energy: `${energyUsage} kW`,

        // The current page doesn't have actual
        // appliance input controls, so we provide
        // their initial simulated state.
        fan: "OFF",

        ac: "OFF",

        lights: "OFF"
    };
}


// ============================================================
// UPDATE AI STATUS
// ============================================================

function updateAIStatus(text, online = false) {

    const status =
        document.getElementById("simulationAIStatus");

    if (!status) return;

    status.textContent = text;

    if (online) {
        status.style.color = "#167a4a";
    } else {
        status.style.color = "#777";
    }
}


// ============================================================
// CHECK BACKEND CONNECTION
// ============================================================

async function checkAIBackend() {

    try {

        const response =
            await fetch(`${AI_BACKEND_URL}/`);

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const data =
            await response.json();

        if (data.status === "online") {

            updateAIStatus(
                "AI ONLINE",
                true
            );

            console.log(
                "Smart Home AI backend connected."
            );

            return true;
        }

        throw new Error(
            "Backend did not return online status."
        );

    } catch (error) {

        updateAIStatus(
            "AI OFFLINE",
            false
        );

        console.error(
            "AI backend connection failed:",
            error
        );

        return false;
    }
}


// ============================================================
// ASK GEMINI AI
// ============================================================

async function requestAIAnalysis(data) {

    console.log(
        "Sending simulation data to Gemini:"
    );

    console.table(data);

    const response =
        await fetch(
            `${AI_BACKEND_URL}/api/analyze`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

    if (!response.ok) {

        let message =
            `Backend returned ${response.status}`;

        try {

            const errorData =
                await response.json();

            if (errorData.error) {
                message =
                    errorData.error;
            }

        } catch (error) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    const result =
        await response.json();

    console.log(
        "Gemini response:",
        result
    );

    if (!result.success) {

        throw new Error(
            result.error ||
            "AI analysis failed."
        );
    }

    return result.rawAnalysis;
}


// ============================================================
// PARSE GEMINI RESPONSE
// ============================================================

function parseAIResponse(text) {

    const result = {

        situation:
            "Analysis generated.",

        action:
            "See AI recommendation.",

        reason:
            "See AI reasoning.",

        energySaving:
            "Medium",

        confidence:
            "--"
    };


    // SITUATION

    const situationMatch =
        text.match(
            /SITUATION\s*:\s*(.*?)(?=\s*ACTION\s*:|\s*REASON\s*:|\s*ENERGY_SAVING\s*:|\s*CONFIDENCE\s*:|$)/is
        );

    if (situationMatch) {

        result.situation =
            situationMatch[1].trim();
    }


    // ACTION

    const actionMatch =
        text.match(
            /ACTION\s*:\s*(.*?)(?=\s*REASON\s*:|\s*ENERGY_SAVING\s*:|\s*CONFIDENCE\s*:|$)/is
        );

    if (actionMatch) {

        result.action =
            actionMatch[1].trim();
    }


    // REASON

    const reasonMatch =
        text.match(
            /REASON\s*:\s*(.*?)(?=\s*ENERGY_SAVING\s*:|\s*CONFIDENCE\s*:|$)/is
        );

    if (reasonMatch) {

        result.reason =
            reasonMatch[1].trim();
    }


    // ENERGY SAVING

    const savingMatch =
        text.match(
            /ENERGY_SAVING\s*:\s*(.*?)(?=\s*CONFIDENCE\s*:|$)/is
        );

    if (savingMatch) {

        result.energySaving =
            savingMatch[1].trim();
    }


    // CONFIDENCE

    const confidenceMatch =
        text.match(
            /CONFIDENCE\s*:\s*(\d+)/i
        );

    if (confidenceMatch) {

        result.confidence =
            confidenceMatch[1];
    }


    return result;
}


// ============================================================
// DISPLAY AI RESULT
// ============================================================

function displayAIResult(rawText) {

    const result =
        parseAIResponse(rawText);


    // Situation

    const situation =
        document.getElementById(
            "simulationSituation"
        );

    if (situation) {

        situation.textContent =
            result.situation;
    }


    // Recommended action

    const decision =
        document.getElementById(
            "simulationDecision"
        );

    if (decision) {

        decision.textContent =
            result.action;
    }


    // AI reasoning

    const reasoning =
        document.getElementById(
            "simulationReasoning"
        );

    if (reasoning) {

        reasoning.textContent =
            result.reason;
    }


    // Confidence

    const confidence =
        document.getElementById(
            "simulationConfidence"
        );

    if (confidence) {

        confidence.textContent =
            result.confidence === "--"
                ? "--%"
                : `${result.confidence}%`;
    }


    // Status

    updateAIStatus(
        "AI ONLINE",
        true
    );
}


// ============================================================
// SHOW LOADING STATE
// ============================================================

function showAILoading() {

    const situation =
        document.getElementById(
            "simulationSituation"
        );

    const decision =
        document.getElementById(
            "simulationDecision"
        );

    const reasoning =
        document.getElementById(
            "simulationReasoning"
        );

    const confidence =
        document.getElementById(
            "simulationConfidence"
        );


    if (situation) {

        situation.textContent =
            "AI is analyzing the environment...";
    }


    if (decision) {

        decision.textContent =
            "Generating smart home recommendation...";
    }


    if (reasoning) {

        reasoning.textContent =
            "Gemini AI is evaluating the sensor data.";
    }


    if (confidence) {

        confidence.textContent =
            "--%";
    }
}


// ============================================================
// SHOW ERROR
// ============================================================

function showAIError(error) {

    console.error(
        "Smart Home AI Error:",
        error
    );


    const situation =
        document.getElementById(
            "simulationSituation"
        );

    const decision =
        document.getElementById(
            "simulationDecision"
        );

    const reasoning =
        document.getElementById(
            "simulationReasoning"
        );

    const confidence =
        document.getElementById(
            "simulationConfidence"
        );


    updateAIStatus(
        "AI OFFLINE",
        false
    );


    if (situation) {

        situation.textContent =
            "AI analysis could not be completed.";
    }


    if (decision) {

        decision.textContent =
            "Please make sure the backend server is running.";
    }


    if (reasoning) {

        reasoning.textContent =
            error.message ||
            "Unable to connect to the AI backend.";
    }


    if (confidence) {

        confidence.textContent =
            "--%";
    }
}


// ============================================================
// MAIN AI FUNCTION
// ============================================================

async function runSimulationAI() {

    console.log(
        "================================"
    );

    console.log(
        "SMART HOME AI ANALYSIS STARTED"
    );

    console.log(
        "================================"
    );


    showAILoading();

    updateAIStatus(
        "AI ANALYZING...",
        true
    );


    try {

        // Collect current sensor values

        const data =
            getSimulationData();


        console.log(
            "Current simulation:"
        );

        console.table(data);


        // Send to Gemini

        const analysis =
            await requestAIAnalysis(data);


        console.log(
            "AI generated analysis:"
        );

        console.log(analysis);


        // Display result

        displayAIResult(
            analysis
        );


    } catch (error) {

        showAIError(
            error
        );
    }
}


// ============================================================
// INITIALIZE SIMULATION AI
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Simulation AI loaded."
        );

        await checkAIBackend();

    }
);


// ============================================================
// MAKE FUNCTION AVAILABLE TO HTML
// ============================================================

window.runSimulationAI =
    runSimulationAI;