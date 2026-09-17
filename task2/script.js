/* ============================================================
   1. TASKS — createTask() is a closure factory.
   `count` lives only inside this function's scope, so the only
   way to read it from the outside is through getCount(). Each
   call to createTask() creates a brand-new `count` variable, so
   every task has its own private counter.
   ============================================================ */

function createTask(name, onChange) {
  let count = 0;
  let status = "idle"; // idle | loading | completed | failed
  let lastDuration = null;

  function notify() {
    if (onChange) onChange({ name, status, count, lastDuration });
  }

  function run() {
    status = "loading";
    notify();

    const duration = Math.floor(Math.random() * 1500) + 500; // 500–2000ms
    lastDuration = duration;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        count++;
        const willFail = Math.random() < 0.25; // ~25% chance of failure
        if (willFail) {
          status = "failed";
          notify();
          reject(new Error(`${name} failed`));
        } else {
          status = "completed";
          notify();
          resolve(`${name} completed`);
        }
      }, duration);
    });
  }

  function getCount() {
    return count;
  }

  function reset() {
    count = 0;
    status = "idle";
    lastDuration = null;
    notify();
  }

  notify(); // initial render
  return { name, run, getCount, reset };
}

/* ---- wire up the three tasks to the DOM ---- */

const taskNames = ["Load Users", "Load Posts", "Load Comments"];
const tasksGrid = document.getElementById("tasksGrid");
const tasks = [];

taskNames.forEach((name) => {
  const card = document.createElement("div");
  card.className = "task-card";
  card.innerHTML = `
    <h3>${name}</h3>
    <p class="status" data-status="idle">Status: <span class="status-text">idle</span></p>
    <p>Runs: <span class="count-text">0</span></p>
    <p>Last time: <span class="duration-text">–</span></p>
    <div class="card-actions">
      <button class="run-btn secondary">Run</button>
      <button class="reset-btn ghost">Reset</button>
    </div>
  `;
  tasksGrid.appendChild(card);

  const statusEl = card.querySelector(".status");
  const statusText = card.querySelector(".status-text");
  const countText = card.querySelector(".count-text");
  const durationText = card.querySelector(".duration-text");

  const task = createTask(name, ({ status, count, lastDuration }) => {
    statusEl.dataset.status = status;
    statusText.textContent = status;
    countText.textContent = count;
    durationText.textContent = lastDuration ? `${lastDuration} ms` : "–";
  });

  card.querySelector(".run-btn").addEventListener("click", () => {
    task.run().catch(() => {}); // failure is already shown via status; avoid unhandled rejection
  });
  card.querySelector(".reset-btn").addEventListener("click", () => task.reset());

  tasks.push(task);
});

document.getElementById("runAllBtn").addEventListener("click", async () => {
  const allStatus = document.getElementById("allStatus");
  allStatus.textContent = "Running all tasks…";

  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  const failed = results.filter((r) => r.status === "rejected").length;
  const okCount = results.length - failed;

  allStatus.textContent = `All tasks finished (${okCount} completed, ${failed} failed).`;
});

document.getElementById("resetAllBtn").addEventListener("click", () => {
  tasks.forEach((t) => t.reset());
  document.getElementById("allStatus").textContent = "";
});

/* ============================================================
   2. SEQUENTIAL vs CONCURRENT
   Same three fixed durations both times, so the timing
   difference isn't due to randomness — it's purely the
   difference between awaiting one-by-one and starting all
   three timers at once.
   ============================================================ */

function simulateLoad(label, duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${label} done (${duration}ms)`), duration);
  });
}

const compareResults = document.getElementById("compareResults");
const DEMO_DURATIONS = [700, 900, 600];

document.getElementById("runSeqBtn").addEventListener("click", async () => {
  const start = performance.now();
  for (let i = 0; i < DEMO_DURATIONS.length; i++) {
    await simulateLoad(`Task ${i + 1}`, DEMO_DURATIONS[i]);
  }
  const elapsed = Math.round(performance.now() - start);
  const p = document.createElement("p");
  p.textContent = `Sequential (await, await, await): ${elapsed} ms — roughly the sum of all three durations, because each task waits for the previous one to finish before it even starts.`;
  compareResults.appendChild(p);
});

document.getElementById("runConcBtn").addEventListener("click", async () => {
  const start = performance.now();
  await Promise.all(DEMO_DURATIONS.map((d, i) => simulateLoad(`Task ${i + 1}`, d)));
  const elapsed = Math.round(performance.now() - start);
  const p = document.createElement("p");
  p.textContent = `Concurrent (Promise.all): ${elapsed} ms — roughly the longest single duration, because all three timers start at the same moment and run in parallel.`;
  compareResults.appendChild(p);
});

document.getElementById("clearCompareBtn").addEventListener("click", () => {
  compareResults.innerHTML = "";
});

/* ============================================================
   3. EVENT LOOP DEMO
   2 timers (setTimeout), 2 promise callbacks (.then), 1 async
   function with an await. Predicted order is written out BEFORE
   the demo runs, matching the Call Stack -> Microtask Queue ->
   Task Queue order described in README.md.
   ============================================================ */

const PREDICTED = [
  "1. script start",
  "2. async fn start (runs synchronously, before its first await)",
  "3. script end (rest of the synchronous code finishes)",
  "4. promise .then #1  (microtask)",
  "5. promise .then #2  (microtask)",
  "6. async fn after await (also a microtask, queued after the two .then's above)",
  "7. setTimeout #1  (macrotask, runs only after ALL microtasks are drained)",
  "8. setTimeout #2  (macrotask)",
];
document.getElementById("predictedOutput").textContent = PREDICTED.join("\n");

function runEventLoopDemo() {
  const outputEl = document.getElementById("actualOutput");
  const lines = [];

  function log(msg) {
    lines.push(msg);
    console.log(msg);
    outputEl.textContent = lines.join("\n");
  }

  log("script start");

  setTimeout(() => log("setTimeout #1 (macrotask)"), 0);
  setTimeout(() => log("setTimeout #2 (macrotask)"), 0);

  Promise.resolve().then(() => log("promise .then #1 (microtask)"));
  Promise.resolve().then(() => log("promise .then #2 (microtask)"));

  async function asyncDemo() {
    log("async fn start (before await)");
    await null; // suspends here, continuation is scheduled as a microtask
    log("async fn after await (microtask)");
  }
  asyncDemo();

  log("script end (sync code finished)");
}

document.getElementById("runEventLoopBtn").addEventListener("click", () => {
  document.getElementById("actualOutput").textContent = "";
  runEventLoopDemo();
});

document.getElementById("clearLoopBtn").addEventListener("click", () => {
  document.getElementById("actualOutput").textContent = "";
});
