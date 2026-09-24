# Async Task Runner

A small vanilla HTML/CSS/JS project practicing closures, the call stack,
promises, async/await, and the event loop.

Open `index.html` in a browser — no build step, no dependencies.

## How the closure keeps the task counter private

`createTask(name)` declares `let count = 0` **inside** the function. The
returned object only exposes `run`, `getCount`, and `reset` — there is no way
to reach `count` from outside except by calling `getCount()`. Every call to
`createTask()` creates a fresh `count` variable in its own scope, so
"Load Users" and "Load Posts" each keep an independent counter even though
they were built from the same factory function.

## How the call stack works here

When you click **Run**, the click handler calls `task.run()`. That pushes a
new frame onto the call stack, which sets `status = "loading"`, calls
`notify()` to update the UI, then registers a `setTimeout` and returns a
`Promise` — at that point `run()`'s frame is popped off the stack. The stack
is empty again while the timer counts down in the background (in the Web
API environment, not on the JS thread). Only when the timer fires does its
callback get pushed onto the stack, which increments the counter, decides
completed/failed, and resolves or rejects the promise.

## How JavaScript keeps running while `setTimeout` waits

`setTimeout` isn't part of the JS engine itself — it's a Web API. Handing a
callback to `setTimeout` registers it with the browser and immediately
returns control to the script, so the call stack is never blocked. The
browser's timer thread waits in the background and, once the delay is up,
places the callback in the **task (macrotask) queue**. The event loop only
moves it onto the call stack once the stack is empty.

## Predicted vs. actual Event Loop output

Predicted (written before running the demo, see `script.js`):

```
1. script start
2. async fn start (runs synchronously, before its first await)
3. script end (rest of the synchronous code finishes)
4. promise .then #1  (microtask)
5. promise .then #2  (microtask)
6. async fn after await (also a microtask, queued after the two .then's above)
7. setTimeout #1  (macrotask, runs only after ALL microtasks are drained)
8. setTimeout #2  (macrotask)
```

This matched the actual output when running the demo in the browser. The
reasoning: the synchronous code (including the async function's body up to
its first `await`) all runs first and empties the call stack. Then the
event loop drains the **entire microtask queue** before touching the task
queue — so both `.then()` callbacks and the resumed async function run
before either `setTimeout` callback, even though both timers were scheduled
with a 0ms delay.

## Tasks vs. microtasks

- **Microtasks** — promise `.then`/`.catch`/`.finally` callbacks, the code
  after an `await`, `queueMicrotask`. The whole microtask queue is drained
  after every task, before the next task or a render.
- **Tasks (macrotasks)** — `setTimeout`, `setInterval`, I/O, UI events. Only
  **one** task runs per pass of the event loop, then the loop checks
  microtasks again before the next task.

This is why `Promise.resolve().then(...)` always logs before
`setTimeout(fn, 0)`, no matter how the code is ordered.

## Handling multiple promises and errors

- `task.run()` returns a promise that **rejects** on simulated failure
  instead of resolving — the failure is still shown through the `status`
  field, and the click handler attaches an empty `.catch()` so a failed task
  never produces an unhandled rejection in the console.
- **Run All Tasks** uses `Promise.allSettled()` rather than `Promise.all()`
  on purpose: `Promise.all` would short-circuit and reject as soon as the
  first task fails, so the remaining tasks' results would be lost.
  `allSettled` always waits for every promise and reports success/failure
  per task, which is what "All tasks finished" needs to mean here.

## Sequential vs. concurrent execution

Both comparisons use the same three fixed durations (700ms, 900ms, 600ms)
so the only variable is the execution strategy:

- **Sequential** (`await` one after another) — each task's timer only
  *starts* once the previous one has finished, so the total time is close
  to the **sum**: ~2200ms.
- **Concurrent** (`Promise.all`) — all three `setTimeout` timers are started
  in the same synchronous pass, so they count down in parallel. Total time
  is close to the **longest single duration**: ~900ms.

The takeaway: `await` only blocks the async function it's inside of, not the
timers themselves — so starting independent work before awaiting it lets it
run in parallel instead of one-at-a-time.
