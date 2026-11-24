import type { healthFns } from '@start9labs/start-sdk'
import { i18n } from './i18n'

type Result = healthFns.HealthCheckResult

/**
 * How long one run of a health check may take before it is treated as
 * unanswered. The pools, api and webui checks read /proc/net with the SDK's
 * own one-second limit, and the mariadb check runs the image's
 * `healthcheck.sh` through `SubContainer.exec`, whose 30 s timeout is the
 * longest a slow but healthy run can take. The api check may add one `rm` of
 * the boot sentinel, also bounded at 30 s, but only after a port read that
 * takes milliseconds. So a minute only ever runs out on a call that is not
 * coming back. It is not a limit on Mempool: nothing is killed.
 */
export const CHECK_TIMEOUT_MS = 60_000

/**
 * How many runs in a row may go unanswered while the check keeps showing its
 * last real result. Anything but `success` pauses every daemon that
 * `requires` the check, so one slow answer must not stop them; a check
 * that stays unanswered must still say so.
 */
export const STALE_REPEATS = 2

/**
 * Wrap a health check's `fn` so a run that never returns cannot wedge it.
 *
 * Why this exists: start-sdk's `HealthDaemon.runHealthCheckLoop` awaits `fn()`
 * with no limit and only looks at its abort signal once `fn()` returns. When a
 * service stops, `Daemons` terms entries in reverse dependency order (`_term`,
 * and `stopEntries` when it reconciles), every check before the daemon it
 * requires, and each term waits for that loop to end. So one `fn()` that
 * never returns freezes its check at "Starting" for the life of the service,
 * and later blocks every stop, update and restart. In Bitcoin Knots (BLAKE2b)
 * Companion that left the node running while an update sat at "Installing
 * 80%" and the OS Restart hung (knots-blake2b-startos#4). Here each daemon's
 * check must end before that daemon is signalled, and `webui` is stopped
 * before `api`, `api` before `mariadb` and `pools`, so a check stuck in `webui`
 * keeps all four running. The mariadb check, and the api check's removal of
 * the boot sentinel, run a command in a subcontainer, and
 * `SubContainer.exec`'s 30 s timeout is armed only after it has waited,
 * without a limit, for its file mounts to sync.
 *
 * At most one run is outstanding. If the previous one is still pending when
 * the check fires again, this waits on that run again rather than starting
 * another, so a call that never returns costs one pending promise, not one a
 * minute. A run that finishes after it was given up on keeps its result for
 * the next call, which returns it rather than starting over, so a check that
 * always takes a little longer than the bound still reports.
 */
export function bounded(
  fn: () => Result | Promise<Result>,
  onTimeout: () => Result,
  ms: number = CHECK_TIMEOUT_MS,
): () => Promise<Result> {
  let inFlight: Promise<Result> | null = null
  let abandoned: Promise<Result> | null = null
  let late: Result | null = null
  let last: Result | null = null
  let misses = 0

  return async () => {
    if (!inFlight && late) {
      const res = late
      late = null
      misses = 0
      last = res
      return res
    }
    if (!inFlight) {
      const run = Promise.resolve()
        .then(fn)
        .finally(() => {
          if (inFlight === run) inFlight = null
        })
      inFlight = run
      run.then(
        (res) => {
          if (abandoned === run) late = res
        },
        () => {},
      )
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    const timedOut = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), ms)
    })
    const current = inFlight
    try {
      // The race also handles the run, so if it is abandoned here and rejects
      // later there is no unhandled rejection to take down the runtime.
      const res = await Promise.race([current, timedOut])
      if (res !== null) {
        // Answered here, so it is not kept for the next call as well.
        if (abandoned === current) abandoned = late = null
        misses = 0
        last = res
        return res
      }
    } catch (e) {
      // A thrown fn is the SDK's to report, exactly as before.
      misses = 0
      last = null
      throw e
    } finally {
      clearTimeout(timer)
    }

    abandoned = current
    misses += 1
    console.warn(
      `health check run unanswered after ${ms / 1000}s (${misses} in a row)`,
    )
    if (last && misses <= STALE_REPEATS) return last
    return onTimeout()
  }
}

// What a health check shows when a run of it has not finished in time:
// starting, never failure, so a slow answer does not read as a fault. The
// check shows its result again once that run finishes.
export const unanswered = () => ({
  result: 'starting' as const,
  message: i18n('This check has not finished after a minute'),
})
