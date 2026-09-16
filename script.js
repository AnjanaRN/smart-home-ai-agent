let lastDecision = "";

function updateAgent() {

    // Read sensor values
    const temperature = Number(
        document.getElementById("temperature").value
    );

    const occupancy =
        document.getElementById("occupancy").value;

    const light = Number(
        document.getElementById("light").value
    );

    const energy = Number(
        document.getElementById("energy").value
    );


    // Update sensor display
    document.getElementById("temperatureValue").textContent =
        temperature + "°C";

    document.getElementById("lightValue").textContent =
        light + "%";

    document.getElementById("energyValue").textContent =
        energy.toFixed(1) + " kW";

    document.getElementById("occupancyValue").textContent =
        occupancy === "present" ? "Detected" : "Empty";


    // Appliance states
    let lightState = false;
    let fanState = false;
    let acState = false;

    let decision = "";
    let reason = "";


    /*
        AI AGENT DECISION LOGIC

        The agent observes:
        - temperature
        - occupancy
        - light intensity
        - energy consumption

        It then decides what action should be taken.
    */


    // Nobody is home
    if (occupancy === "absent") {

        lightState = false;
        fanState = false;
        acState = false;

        decision = "Switching appliances OFF";
        reason =
            "No person is detected in the room, so the AI is reducing unnecessary energy consumption.";

    }


    // Someone is present
    else {

        // Lighting decision
        if (light < 45) {
            lightState = true;
        }

        // Fan decision
        if (temperature >= 27) {
            fanState = true;
        }

        // AC decision
        if (temperature >= 30) {
            acState = true;
            fanState = true;
        }


        // Generate explanation
        if (temperature >= 30 && light < 45) {

            decision = "Turn ON AC + Light";

            reason =
                "A person is present, the temperature is high and the room has low light.";

        }

        else if (temperature >= 30) {

            decision = "Turn ON AC";

            reason =
                "High temperature detected while a person is present.";

        }

        else if (temperature >= 27) {

            decision = "Turn ON Fan";

            reason =
                "The temperature is moderately high, so the AI activates cooling.";

        }

        else if (light < 45) {

            decision = "Turn ON Light";

            reason =
                "A person is present and the room has insufficient light.";

        }

        else {

            decision = "Maintain Current State";

            reason =
                "Environmental conditions are comfortable and no unnecessary action is required.";

        }

    }


    // Energy warning
    if (energy >= 7) {

        decision = "Reduce Energy Consumption";

        reason =
            "Energy usage is unusually high. The AI recommends reducing unnecessary appliance usage.";

    }


    // Update decision panel
    document.getElementById("decision").textContent =
        decision;

    document.getElementById("reason").textContent =
        reason;


    // Update appliances
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


    // Energy display
    document.getElementById("energyDisplay").textContent =
        energy.toFixed(1);

    document.getElementById("energyBar").style.width =
        Math.min(energy * 10, 100) + "%";


    // Energy status
    const energyStatus =
        document.getElementById("energyStatus");

    if (energy >= 7) {

        energyStatus.textContent = "High";
        energyStatus.style.color = "#d9534f";

    }

    else if (energy >= 4) {

        energyStatus.textContent = "Moderate";
        energyStatus.style.color = "#d99a38";

    }

    else {

        energyStatus.textContent = "Normal";
        energyStatus.style.color = "#237a4b";

    }


    // Daily usage estimate
    const dailyUsage = energy * 7.2;

    document.getElementById("dailyUsage").textContent =
        dailyUsage.toFixed(1) + " kWh";


    // Activity log
    if (decision !== lastDecision) {

        addLog(decision);

        lastDecision = decision;

    }

}


/*
    Changes the appearance and status
    of each appliance.
*/

function updateAppliance(cardId, statusId, state) {

    const card = document.getElementById(cardId);
    const status = document.getElementById(statusId);

    if (state) {

        status.textContent = "ON";

        status.style.background = "#e3f2e8";
        status.style.color = "#237a4b";

        card.style.borderColor = "#b7d8c2";

    }

    else {

        status.textContent = "OFF";

        status.style.background = "#f0f2f0";
        status.style.color = "#78817b";

        card.style.borderColor = "#e3e8e4";

    }

}


/*
    Adds a new entry to the AI activity log.
*/

function addLog(message) {

    const log =
        document.getElementById("activityLog");

    const item =
        document.createElement("div");

    item.className = "log-item";

    item.innerHTML = `
        <span class="log-time">Now</span>
        <span>AI decision: ${message}</span>
    `;

    log.prepend(item);

}


/*
    Scroll to dashboard.
*/

function scrollToDashboard() {

    document
        .getElementById("dashboard")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// Run the agent when the website opens
updateAgent();