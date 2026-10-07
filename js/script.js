/* =========================================================
   NISSY CHOPPALA - INTERACTIVE AUTOMATION QA PORTFOLIO
   ========================================================= */


/* ================= THEME ================= */

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme", "light");
    } else {
        themeToggle.textContent = "☀";
        localStorage.setItem("theme", "dark");
    }
});


if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌙";
}


/* ================= MOBILE MENU ================= */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");

    menuToggle.textContent =
        navMenu.classList.contains("open") ? "✕" : "☰";
});


document.querySelectorAll("nav a").forEach(link => {

    link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.textContent = "☰";
    });

});


/* ================= AUTOMATION LAB ================= */

const runTestButton = document.getElementById("runTest");
const failureButton = document.getElementById("failureTest");
const stopButton = document.getElementById("stopTest");
const rerunButton = document.getElementById("rerunTest");

const consoleElement = document.getElementById("console");

const statusBadge = document.getElementById("statusBadge");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const testSuite = document.getElementById("testSuite");
const browser = document.getElementById("browser");
const environment = document.getElementById("environment");

const reportStatus = document.getElementById("reportStatus");
const reportId = document.getElementById("reportId");
const reportBrowser = document.getElementById("reportBrowser");
const reportEnvironment = document.getElementById("reportEnvironment");
const reportDuration = document.getElementById("reportDuration");
const reportPassed = document.getElementById("reportPassed");
const reportFailed = document.getElementById("reportFailed");

let testRunning = false;
let stopRequested = false;
let currentTimer = null;


/* ================= TEST DATA ================= */

const tests = {

    login: {
        id: "TC_LOGIN_001",
        name: "Valid Login",
        steps: [
            "Launching browser",
            "Navigating to login page",
            "Locating username field",
            "Entering username",
            "Locating password field",
            "Entering password",
            "Clicking Login",
            "Validating dashboard"
        ]
    },

    "invalid-login": {
        id: "TC_LOGIN_002",
        name: "Invalid Password",
        steps: [
            "Launching browser",
            "Navigating to login page",
            "Locating username field",
            "Entering username",
            "Entering invalid password",
            "Clicking Login",
            "Validating error message"
        ]
    },

    search: {
        id: "TC_SEARCH_001",
        name: "Search Validation",
        steps: [
            "Launching browser",
            "Opening application",
            "Locating search field",
            "Entering search keyword",
            "Clicking Search",
            "Validating search results"
        ]
    },

    checkout: {
        id: "TC_CHECKOUT_001",
        name: "Checkout Regression",
        steps: [
            "Launching browser",
            "Opening product page",
            "Adding product to cart",
            "Opening cart",
            "Validating cart total",
            "Proceeding to checkout",
            "Validating checkout page"
        ]
    },

    aem: {
        id: "TC_AEM_001",
        name: "AEM Content Validation",
        steps: [
            "Opening AEM environment",
            "Loading author page",
            "Validating component",
            "Validating authored content",
            "Checking publish state",
            "Opening published page",
            "Validating EDS rendering"
        ]
    },

    api: {
        id: "TC_API_001",
        name: "API Health Check",
        steps: [
            "Preparing API request",
            "Sending GET request",
            "Validating HTTP status",
            "Validating response body",
            "Validating response time",
            "Generating API report"
        ]
    }

};


/* ================= LOGGING ================= */

function getTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}


function clearConsole() {
    consoleElement.innerHTML = "";
}


function addLog(message, type = "") {

    const line = document.createElement("div");

    line.className = "log-line";

    const time = document.createElement("span");

    time.className = "log-time";

    time.textContent = `[${getTime()}] `;

    const content = document.createElement("span");

    content.textContent = message;

    if (type) {
        content.classList.add(type);
    }

    line.appendChild(time);
    line.appendChild(content);

    consoleElement.appendChild(line);

    consoleElement.scrollTop = consoleElement.scrollHeight;
}


/* ================= STATUS ================= */

function setStatus(status) {

    statusBadge.textContent = status;

    statusBadge.className = "status";

    if (status === "RUNNING") {
        statusBadge.classList.add("running");
    }

    if (status === "PASSED") {
        statusBadge.classList.add("passed");
    }

    if (status === "FAILED") {
        statusBadge.classList.add("failed");
    }

    if (status === "READY") {
        statusBadge.classList.add("ready");
    }
}


/* ================= CODE HIGHLIGHT ================= */

function highlightCode(stepIndex) {

    document.querySelectorAll(".code-editor .line")
        .forEach(line => line.classList.remove("active"));

    const lineMap = [
        [1, 2],
        [3, 4],
        [5, 6],
        [7],
        [8, 9],
        [10],
        [11, 12],
        [13, 14]
    ];

    const lines = lineMap[stepIndex];

    if (!lines) return;

    lines.forEach(number => {

        const element =
            document.querySelector(
                `.code-editor .line[data-line="${number}"]`
            );

        if (element) {
            element.classList.add("active");
        }

    });
}


/* ================= PROGRESS ================= */

function setProgress(value) {

    progressFill.style.width = `${value}%`;
    progressText.textContent = `${value}%`;

}


/* ================= REPORT ================= */

function resetReport() {

    reportStatus.textContent = "NOT RUN";

    reportStatus.className = "report-status";

    reportId.textContent = "—";
    reportBrowser.textContent = "—";
    reportEnvironment.textContent = "—";
    reportDuration.textContent = "—";

    reportPassed.textContent = "0";
    reportFailed.textContent = "0";
}


function updateReport(test, passed, failed, duration, success) {

    reportId.textContent = test.id;
    reportBrowser.textContent = browser.value;
    reportEnvironment.textContent = environment.value;

    reportDuration.textContent =
        `${duration.toFixed(2)}s`;

    reportPassed.textContent = passed;
    reportFailed.textContent = failed;

    reportStatus.textContent =
        success ? "PASSED" : "FAILED";

    reportStatus.className =
        `report-status ${success ? "passed" : "failed"}`;
}


/* ================= RUN AUTOMATION ================= */

async function runAutomation(forceFailure = false) {

    if (testRunning) return;

    testRunning = true;
    stopRequested = false;

    runTestButton.disabled = true;
    failureButton.disabled = true;
    stopButton.disabled = false;

    clearConsole();
    resetReport();

    setStatus("RUNNING");
    setProgress(0);

    const selectedTest =
        tests[testSuite.value];

    const startTime = performance.now();

    addLog(
        `Starting ${selectedTest.id} - ${selectedTest.name}`,
        "log-running"
    );

    addLog(
        `Browser: ${browser.value}`
    );

    addLog(
        `Environment: ${environment.value}`
    );

    await wait(600);

    if (stopRequested) {
        finishStopped();
        return;
    }

    let passed = 0;
    let failed = 0;

    for (
        let i = 0;
        i < selectedTest.steps.length;
        i++
    ) {

        if (stopRequested) {
            finishStopped();
            return;
        }

        highlightCode(
            Math.min(i, 7)
        );

        addLog(
            `${String(i + 1).padStart(2, "0")}. ${selectedTest.steps[i]} ... RUNNING`,
            "log-running"
        );

        await wait(550);

        if (stopRequested) {
            finishStopped();
            return;
        }

        /*
           Failure simulation:
           fail at step 5.
        */

        const shouldFail =
            forceFailure &&
            i === Math.min(
                4,
                selectedTest.steps.length - 1
            );

        if (shouldFail) {

            failed++;

            addLog(
                `✗ ${selectedTest.steps[i]} ... FAIL`,
                "log-fail"
            );

            setProgress(
                Math.round(
                    ((i + 1) /
                    selectedTest.steps.length) * 100
                )
            );

            await wait(500);

            addLog(
                "AssertionError: Expected element was not displayed.",
                "log-fail"
            );

            const duration =
                (performance.now() - startTime) / 1000;

            updateReport(
                selectedTest,
                passed,
                failed,
                duration,
                false
            );

            setStatus("FAILED");

            setProgress(100);

            testRunning = false;
            runTestButton.disabled = false;
            failureButton.disabled = false;
            stopButton.disabled = true;

            return;
        }

        passed++;

        addLog(
            `✓ ${selectedTest.steps[i]} ... PASS`,
            "log-pass"
        );

        const progress =
            Math.round(
                ((i + 1) /
                selectedTest.steps.length) * 100
            );

        setProgress(progress);

    }


    /* Final result */

    const duration =
        (performance.now() - startTime) / 1000;

    addLog(
        "--------------------------------"
    );

    addLog(
        `TEST PASSED — ${passed}/${selectedTest.steps.length} steps`,
        "log-pass"
    );

    addLog(
        `Execution completed in ${duration.toFixed(2)} seconds`,
        "log-pass"
    );

    updateReport(
        selectedTest,
        passed,
        failed,
        duration,
        true
    );

    setStatus("PASSED");

    setProgress(100);

    testRunning = false;

    runTestButton.disabled = false;
    failureButton.disabled = false;
    stopButton.disabled = true;

}


/* ================= STOP ================= */

function stopAutomation() {

    if (!testRunning) return;

    stopRequested = true;
}


function finishStopped() {

    clearTimeout(currentTimer);

    addLog(
        "■ Test execution stopped by user.",
        "log-fail"
    );

    setStatus("READY");

    testRunning = false;

    runTestButton.disabled = false;
    failureButton.disabled = false;
    stopButton.disabled = true;
}


/* ================= WAIT ================= */

function wait(ms) {

    return new Promise(resolve => {

        currentTimer = setTimeout(
            resolve,
            ms
        );

    });

}


/* ================= BUTTON EVENTS ================= */

runTestButton.addEventListener(
    "click",
    () => runAutomation(false)
);


failureButton.addEventListener(
    "click",
    () => runAutomation(true)
);


stopButton.addEventListener(
    "click",
    stopAutomation
);


rerunButton.addEventListener(
    "click",
    () => runAutomation(false)
);


/* ================= TEST SELECTION ================= */

testSuite.addEventListener("change", () => {

    resetReport();

    clearConsole();

    setStatus("READY");

    setProgress(0);

    addLog(
        `Selected test: ${tests[testSuite.value].name}`
    );

});


/* ================= AEM / EDS FLOW ================= */

const flowDetails = document.getElementById("flowDetails");

const flowData = {

    author: {
        title: "AEM Author Validation",
        checks: [
            "Component authoring",
            "Dialog field validation",
            "Content structure",
            "Required field validation"
        ]
    },

    editor: {
        title: "Universal Editor Validation",
        checks: [
            "Editing experience",
            "Component selection",
            "Field updates",
            "Authoring behaviour"
        ]
    },

    publish: {
        title: "Publish Validation",
        checks: [
            "Published content",
            "Links",
            "Assets",
            "Content availability"
        ]
    },

    eds: {
        title: "Edge Delivery Services Validation",
        checks: [
            "Block rendering",
            "Responsive layout",
            "Performance",
            "Browser compatibility"
        ]
    },

    customer: {
        title: "Customer Experience Validation",
        checks: [
            "Page rendering",
            "Navigation",
            "Responsive behaviour",
            "Functional user journey"
        ]
    }

};


document.querySelectorAll(".flow-node")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".flow-node")
                    .forEach(node =>
                        node.classList.remove("active")
                    );

                button.classList.add("active");

                const data =
                    flowData[button.dataset.flow];

                flowDetails.innerHTML = `
                    <h3>${data.title}</h3>

                    <ul>
                        ${data.checks.map(
                            check =>
                                `<li>✓ ${check}</li>`
                        ).join("")}
                    </ul>
                `;

            }
        );

    });


/* ================= INITIAL STATE ================= */

resetReport();

setStatus("READY");

setProgress(0);