/*
====================================================
SMART HOME AI AGENT
====================================================

The agent follows:

OBSERVE → DECIDE → ACT

Inputs:
- Temperature
- Occupancy
- Light intensity
- Energy consumption

Outputs:
- Light
- Fan
- AC
- Energy alert

====================================================
*/


let lastDecision = "";


/*
----------------------------------------------------
MAIN AI FUNCTION
----------------------------------------------------
*/

function updateAgent() {

    const temperatureElement =
        document.getElementById("temperature");

    const occupancyElement =
        document.getElementById("occupancy");

    const lightElement =
        document.getElementById("light");

    const energyElement =
        document.getElementById("energy");


    // If this page does not contain the controls,
    // stop the function.

    if (
        !temperatureElement ||
        !occupancyElement ||
        !lightElement ||
        !energyElement
    ) {
        return;
    }


    /*
    ============================
    OBSERVE
    ============================
    */

    const temperature =
        Number(temperatureElement.value);

    const occupancy =
        occupancyElement.value;

    const light =
        Number(lightElement.value);

    const energy =
        Number(energyElement.value);


    /*
    ============================
    UPDATE SENSOR DISPLAY
    ============================
    */

    setText(
        "temperatureDisplay",
        temperature + "°C"
    );

    setText(
        "occupancyDisplay",
        occupancy === "present"
            ? "Detected"
            : "Empty"
    );

    setText(
        "lightDisplay",
        light + "%"
    );

    setText(
        "energySensorDisplay",
        energy.toFixed(1) + " kW"
    );


    /*
    ============================
    UPDATE SUMMARY
    ============================
    */

    setText(
        "summaryTemperature",
        temperature + "°C"
    );

    setText(
        "summaryEnergy",
        energy.toFixed(1) + " kW"
    );


    /*
    ============================
    AI DECISION
    ============================
    */

    let lightState = false;

    let fanState = false;

    let acState = false;

    let decision = "";

    let reason = "";


    /*
    CASE 1:
    Nobody is present
    */

    if (occupancy === "absent") {

        lightState = false;

        fanState = false;

        acState = false;

        decision =
            "Switching appliances OFF";

        reason =
            "No person is detected in the room, so the agent is reducing unnecessary energy consumption.";

    }


    /*
    CASE 2:
    Person is present
    */

    else {

        /*
        Lighting
        */

        if (light < 45) {

            lightState = true;

        }


        /*
        Fan
        */

        if (temperature >= 27) {

            fanState = true;

        }


        /*
        AC
        */

        if (temperature >= 30) {

            acState = true;

            fanState = true;

        }


        /*
        AI explanation
        */

        if (
            temperature >= 30 &&
            light < 45
        ) {

            decision =
                "Turn ON AC + Light";

            reason =
                "A person is present, the temperature is high and the room has low light.";

        }

        else if (temperature >= 30) {

            decision =
                "Turn ON AC";

            reason =
                "High temperature detected while a person is present.";

        }

        else if (temperature >= 27) {

            decision =
                "Turn ON Fan";

            reason =
                "Temperature is moderately high, so the AI activates cooling.";

        }

        else if (light < 45) {

            decision =
                "Turn ON Light";

            reason =
                "A person is present and the room has insufficient light.";

        }

        else {

            decision =
                "Maintain Current State";

            reason =
                "The environment is comfortable and no additional action is required.";

        }

    }


    /*
    HIGH ENERGY CONDITION
    */

    if (energy >= 7) {

        decision =
            "Reduce Energy Consumption";

        reason =
            "Energy usage is unusually high. The AI recommends reducing unnecessary appliance usage.";

    }


    /*
    ============================
    DECISION DISPLAY
    ============================
    */

    setText(
        "decision",
        decision
    );

    setText(
        "reason",
        reason
    );


    /*
    ============================
    ACT
    ============================
    */

    updateAppliance(
        "lightCard",
        "lightStatus",
        lightState
    );

    updateAppliance(
        "fanCard",
        "fanStatus",
        fanState
    );

    updateAppliance(
        "acCard",
        "acStatus",
        acState
    );


    /*
    ============================
    ENERGY CALCULATIONS
    ============================
    */

    calculateEnergy(
        energy,
        temperature
    );


    /*
    ============================
    ACTIVITY LOG
    ============================
    */

    if (
        decision !== lastDecision
    ) {

        addLog(decision);

        lastDecision = decision;

    }

}


/*
----------------------------------------------------
ENERGY CALCULATIONS
----------------------------------------------------
*/

function calculateEnergy(
    energy,
    temperature
) {

    /*
    We assume the current energy
    consumption continues for 7.2 hours.

    Energy = Power × Time
    */

    const dailyHours = 7.2;

    const dailyEnergy =
        energy * dailyHours;


    /*
    Assumed electricity tariff
    */

    const tariff = 2.33;


    /*
    Cost = Energy × Tariff
    */

    const dailyCost =
        dailyEnergy * tariff;


    /*
    Monthly estimate
    */

    const monthlyCost =
        dailyCost * 30;


    /*
    AI efficiency

    Higher temperature and unnecessary
    usage reduce efficiency.
    */

    let efficiency = 90;

    if (temperature >= 30) {

        efficiency -= 8;

    }

    if (energy >= 5) {

        efficiency -= 7;

    }

    if (energy >= 7) {

        efficiency -= 10;

    }

    efficiency =
        Math.max(50, efficiency);


    /*
    Update page
    */

    setText(
        "summaryCost",
        "₹" + dailyCost.toFixed(2)
    );

    setText(
        "efficiency",
        efficiency + "%"
    );


    /*
    Energy status
    */

    const statusElement =
        document.getElementById(
            "summaryEnergyStatus"
        );


    if (statusElement) {

        if (energy >= 7) {

            statusElement.textContent =
                "High consumption";

        }

        else if (energy >= 4) {

            statusElement.textContent =
                "Moderate consumption";

        }

        else {

            statusElement.textContent =
                "Normal consumption";

        }

    }


    /*
    Analytics page values
    */

    setText(
        "analyticsUsage",
        dailyEnergy.toFixed(1) + " kWh"
    );

    setText(
        "analyticsCost",
        "₹" + dailyCost.toFixed(2)
    );

    setText(
        "monthlyCost",
        "₹" + monthlyCost.toFixed(2)
    );


    /*
    Energy saved

    Baseline assumes 25% higher usage.
    */

    const baseline =
        dailyEnergy * 1.25;

    const saved =
        baseline - dailyEnergy;

    const savedPercentage =
        (saved / baseline) * 100;


    setText(
        "energySaved",
        savedPercentage.toFixed(1) + "%"
    );

}


/*
----------------------------------------------------
APPLIANCE STATE
----------------------------------------------------
*/

function updateAppliance(
    cardId,
    statusId,
    state
) {

    const card =
        document.getElementById(cardId);

    const status =
        document.getElementById(statusId);


    if (!card || !status) {
        return;
    }


    if (state) {

        status.textContent =
            "ON";

        status.className =
            "state-on";

        card.classList.add(
            "appliance-active"
        );

    }

    else {

        status.textContent =
            "OFF";

        status.className =
            "state-off";

        card.classList.remove(
            "appliance-active"
        );

    }

}


/*
----------------------------------------------------
ACTIVITY LOG
----------------------------------------------------
*/

function addLog(message) {

    const log =
        document.getElementById(
            "activityLog"
        );


    if (!log) {
        return;
    }


    const item =
        document.createElement("div");


    item.className =
        "log-item";


    item.innerHTML = `

        <span>Now</span>

        <p>
            AI decision: ${message}
        </p>

    `;


    log.prepend(item);


    /*
    Keep only the latest 6 logs
    */

    while (
        log.children.length > 6
    ) {

        log.removeChild(
            log.lastChild
        );

    }

}


/*
----------------------------------------------------
HELPER
----------------------------------------------------
*/

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


/*
----------------------------------------------------
START AGENT
----------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateAgent();

    }
);