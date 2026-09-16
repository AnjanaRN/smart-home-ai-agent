/* ==========================================
   SMART HOME AI
   MAIN JAVASCRIPT
========================================== */


/* ==========================================
   SIMULATION STATE
========================================== */

let simulationState = {

    temperature: 30,

    motion: true,

    lightLevel: 30,

    energyUsage: 3.2

};


/* ==========================================
   INITIALIZATION
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateClock();

        setInterval(
            updateClock,
            1000
        );

        updateSimulation();

        loadDashboardData();

    }
);


/* ==========================================
   CLOCK
========================================== */

function updateClock() {

    const timeElement =
        document.getElementById(
            "currentTime"
        );

    if (!timeElement) {
        return;
    }


    const now = new Date();


    timeElement.textContent =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

}


/* ==========================================
   SIMULATION
========================================== */

function updateSimulation() {

    const temperature =
        document.getElementById(
            "temperature"
        );

    const light =
        document.getElementById(
            "lightLevel"
        );

    const energy =
        document.getElementById(
            "energyUsage"
        );

    const motion =
        document.getElementById(
            "motion"
        );


    if (!temperature) {
        return;
    }


    simulationState.temperature =
        parseFloat(
            temperature.value
        );


    simulationState.lightLevel =
        parseFloat(
            light.value
        );


    simulationState.energyUsage =
        parseFloat(
            energy.value
        );


    simulationState.motion =
        motion.checked;


    /* DISPLAY VALUES */

    setText(
        "temperatureValue",
        simulationState.temperature
    );

    setText(
        "lightValue",
        simulationState.lightLevel
    );

    setText(
        "energyValue",
        simulationState.energyUsage.toFixed(1)
    );


    setText(
        "previewTemperature",
        simulationState.temperature + "°C"
    );


    setText(
        "previewLightText",
        simulationState.lightLevel + "%"
    );


    setText(
        "previewEnergy",
        simulationState.energyUsage.toFixed(1) + " kW"
    );


    setText(
        "previewMotion",
        simulationState.motion
            ? "Occupied"
            : "Empty"
    );


    /* PERSON */

    const person =
        document.getElementById(
            "previewPerson"
        );


    if (person) {

        person.classList.toggle(
            "hidden",
            !simulationState.motion
        );

    }


    /* LIGHT */

    const roomLight =
        document.getElementById(
            "previewLight"
        );


    if (roomLight) {

        roomLight.classList.toggle(
            "on",
            simulationState.lightLevel < 50 &&
            simulationState.motion
        );

    }


    /* AUTOMATIC PREVIEW */

    const fan =
        document.getElementById(
            "previewFan"
        );

    const ac =
        document.getElementById(
            "previewAC"
        );


    if (fan) {

        fan.classList.toggle(
            "active",
            simulationState.temperature >= 28 &&
            simulationState.motion
        );

    }


    if (ac) {

        ac.classList.toggle(
            "active",
            simulationState.temperature >= 32 &&
            simulationState.motion
        );

    }

}


/* ==========================================
   RESET
========================================== */

function resetSimulation() {

    const temperature =
        document.getElementById(
            "temperature"
        );

    const light =
        document.getElementById(
            "lightLevel"
        );

    const energy =
        document.getElementById(
            "energyUsage"
        );

    const motion =
        document.getElementById(
            "motion"
        );


    if (!temperature) {
        return;
    }


    temperature.value = 30;

    light.value = 30;

    energy.value = 3.2;

    motion.checked = true;


    updateSimulation();


    setText(
        "simulationSituation",
        "No analysis yet"
    );

    setText(
        "simulationDecision",
        "Change the sensors and ask the AI agent to analyze the environment."
    );

    setText(
        "simulationReasoning",
        "Gemini's reasoning will appear here."
    );

    setText(
        "simulationConfidence",
        "--%"
    );

}


/* ==========================================
   DASHBOARD DATA
========================================== */

function loadDashboardData() {

    const temperature =
        localStorage.getItem(
            "temperature"
        );


    const motion =
        localStorage.getItem(
            "motion"
        );


    const light =
        localStorage.getItem(
            "lightLevel"
        );


    const energy =
        localStorage.getItem(
            "energyUsage"
        );


    if (temperature) {

        setText(
            "dashboardTemperature",
            temperature
        );

    }


    if (light) {

        setText(
            "dashboardLight",
            light
        );

    }


    if (energy) {

        setText(
            "dashboardEnergy",
            energy
        );

    }


    if (motion !== null) {

        setText(
            "dashboardMotion",
            motion === "true"
                ? "Detected"
                : "No Person"
        );

    }

}


/* ==========================================
   RUN AI FROM SIMULATION
========================================== */

async function runSimulationAI() {

    const status =
        document.getElementById(
            "simulationAIStatus"
        );


    if (status) {

        status.textContent =
            "🤖 Gemini is thinking...";

    }


    setText(
        "simulationSituation",
        "Analyzing your smart home..."
    );


    try {

        const decision =
            await getAIDecision(
                simulationState
            );


        displaySimulationResult(
            decision
        );


        saveSimulationData();


    } catch (error) {

        console.error(
            "AI ERROR:",
            error
        );


        setText(
            "simulationSituation",
            "AI connection failed"
        );


        setText(
            "simulationDecision",
            "Make sure your backend server is running."
        );


        setText(
            "simulationReasoning",
            error.message
        );


        if (status) {

            status.textContent =
                "● AI OFFLINE";

        }

    }

}


/* ==========================================
   RUN AI FROM DASHBOARD
========================================== */

async function runAIAgent() {

    const button =
        document.getElementById(
            "runAIButton"
        );


    const status =
        document.getElementById(
            "aiStatus"
        );


    button.disabled = true;

    button.textContent =
        "🤖 AI is analyzing...";


    if (status) {

        status.textContent =
            "● THINKING";

    }


    try {

        const dashboardState =
            getDashboardSensorData();


        const decision =
            await getAIDecision(
                dashboardState
            );


        displayDashboardResult(
            decision
        );


        if (status) {

            status.textContent =
                "● AI ACTIVE";

        }

    } catch (error) {

        console.error(
            error
        );


        setText(
            "aiSituation",
            "Unable to connect to the AI agent."
        );


        setText(
            "aiDecision",
            "Please make sure the backend server is running."
        );


        if (status) {

            status.textContent =
                "● OFFLINE";

        }

    }


    button.disabled = false;

    button.textContent =
        "🤖 Ask AI Agent";

}


/* ==========================================
   GET AI DECISION
========================================== */

/* ==========================================
   GET AI DECISION
========================================== */

async function getAIDecision(sensorData) {

    const response = await fetch(
        "http://localhost:3000/api/analyze",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                temperature:
                    sensorData.temperature,

                motion:
                    sensorData.motion
                        ? "Detected"
                        : "Not Detected",

                light:
                    sensorData.lightLevel + "%",

                energy:
                    sensorData.energyUsage + " kW",

                fan: "ON",

                ac: "OFF",

                lights: "ON"

            })
        }
    );

    if (!response.ok) {

        const error =
            await response.json()
                .catch(() => ({}));

        throw new Error(
            error.error ||
            "Backend request failed."
        );
    }

    const result =
        await response.json();

    if (!result.success) {
        throw new Error(
            result.error ||
            "AI analysis failed."
        );
    }

    /*
       Backend currently returns Gemini's
       response as one text string.

       Convert that text into the format
       used by your dashboard.
    */

    const text = result.analysis || "";

    const situation =
        text.match(/SITUATION:\s*(.*)/i)?.[1]
        || "AI analyzed the current environment.";

    const decision =
        text.match(/ACTION:\s*(.*)/i)?.[1]
        || "No specific action generated.";

    const reasoning =
        text.match(/REASON:\s*(.*)/i)?.[1]
        || "AI reasoning generated successfully.";

    const energySaving =
        text.match(/ENERGY_SAVING:\s*(.*)/i)?.[1]
        || "Medium";

    const confidenceMatch =
        text.match(/CONFIDENCE:\s*(\d+)/i);

    const confidence =
        confidenceMatch
            ? Number(confidenceMatch[1])
            : 85;

    return {

        situation: situation,

        decision: decision,

        reasoning:
            reasoning +
            " Energy saving level: " +
            energySaving,

        confidence: confidence,

        energyAdvice:
            "AI recommends optimizing appliance usage based on the current sensor conditions.",

        actions: {

            light:
                sensorData.motion &&
                sensorData.lightLevel < 50
                    ? "ON"
                    : "OFF",

            fan:
                sensorData.motion &&
                sensorData.temperature >= 28
                    ? "ON"
                    : "OFF",

            ac:
                sensorData.motion &&
                sensorData.temperature >= 32
                    ? "ON"
                    : "OFF",

            highPowerAppliances:
                sensorData.energyUsage >= 3
                    ? "REDUCE"
                    : "NORMAL"
        }
    };
}


/* ==========================================
   DISPLAY SIMULATION RESULT
========================================== */

function displaySimulationResult(
    data
) {

    setText(
        "simulationSituation",
        data.situation
    );


    setText(
        "simulationDecision",
        data.decision
    );


    setText(
        "simulationReasoning",
        data.reasoning
    );


    setText(
        "simulationConfidence",
        data.confidence + "%"
    );


    setText(
        "simulationAIStatus",
        "● AI ANALYSIS COMPLETE"
    );

}


/* ==========================================
   DISPLAY DASHBOARD RESULT
========================================== */

function displayDashboardResult(
    data
) {

    setText(
        "aiSituation",
        data.situation
    );


    setText(
        "aiDecision",
        data.decision
    );


    setText(
        "aiReasoning",
        data.reasoning
    );


    setText(
        "energyAdvice",
        data.energyAdvice
    );


    setText(
        "aiLight",
        data.actions.light
    );


    setText(
        "aiFan",
        data.actions.fan
    );


    setText(
        "aiAC",
        data.actions.ac
    );


    setText(
        "aiPower",
        data.actions.highPowerAppliances
    );


    const confidence =
        Math.max(
            0,
            Math.min(
                100,
                Number(data.confidence)
            )
        );


    setText(
        "confidenceText",
        confidence + "%"
    );


    const bar =
        document.getElementById(
            "confidenceBar"
        );


    if (bar) {

        bar.style.width =
            confidence + "%";

    }


    /* Update appliance status */

    setText(
        "lightStatus",
        data.actions.light
    );


    setText(
        "fanStatus",
        data.actions.fan
    );


    setText(
        "acStatus",
        data.actions.ac
    );


    setText(
        "powerStatus",
        data.actions.highPowerAppliances
    );

}


/* ==========================================
   DASHBOARD SENSOR DATA
========================================== */

function getDashboardSensorData() {

    const temperature =
        parseFloat(
            document.getElementById(
                "dashboardTemperature"
            )?.textContent || "30"
        );


    const lightLevel =
        parseFloat(
            document.getElementById(
                "dashboardLight"
            )?.textContent || "30"
        );


    const energyUsage =
        parseFloat(
            document.getElementById(
                "dashboardEnergy"
            )?.textContent || "3.2"
        );


    const motionText =
        document.getElementById(
            "dashboardMotion"
        )?.textContent || "Detected";


    const motion =
        motionText
            .toLowerCase()
            .includes(
                "detected"
            );


    return {

        temperature,

        motion,

        lightLevel,

        energyUsage

    };

}


/* ==========================================
   SAVE SIMULATION DATA
========================================== */

function saveSimulationData() {

    localStorage.setItem(
        "temperature",
        simulationState.temperature
    );


    localStorage.setItem(
        "motion",
        simulationState.motion
    );


    localStorage.setItem(
        "lightLevel",
        simulationState.lightLevel
    );


    localStorage.setItem(
        "energyUsage",
        simulationState.energyUsage
    );

}


/* ==========================================
   HELPER
========================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}