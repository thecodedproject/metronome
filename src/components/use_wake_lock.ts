import { useEffect } from "react"

// useWakeLock keeps a phone's screen from going to sleep (and so the metronome from
// stopping) while `on`, where the browser allows it
export function useWakeLock(on: boolean) {
  useEffect(() => {
    const wakeLock = (navigator as any).wakeLock
    if (!on || wakeLock == undefined) {
      return
    }
    let lock: any
    let released = false
    const request = async () => {
      try {
        lock = await wakeLock.request("screen")
        if (released) {
          lock.release()
        }
      } catch {
        // refused - the screen sleeps as usual
      }
    }
    // the lock is let go whenever the page is hidden, so it is asked for again on return
    const onVisible = () => {
      if (document.visibilityState == "visible") {
        request()
      }
    }
    request()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      released = true
      document.removeEventListener("visibilitychange", onVisible)
      lock?.release().catch(() => undefined)
    }
  }, [on])
}
