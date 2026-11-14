import { useEffect, useRef } from "react"

// useSpaceToggle has the space bar start and stop the metronome, unless the focus is in
// a text field, where it types as usual
export function useSpaceToggle(toggle: () => void) {
  const latest = useRef(toggle)
  latest.current = toggle

  useEffect(() => {
    const toggles = (e: KeyboardEvent) =>
      e.code == "Space"
      && !e.defaultPrevented
      && !(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)
      && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)

    const onKeyDown = (e: KeyboardEvent) => {
      if (toggles(e)) {
        // keeps a focused button from being pressed by the space as well
        e.preventDefault()
        if (!e.repeat) {
          latest.current()
        }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (toggles(e)) {
        e.preventDefault()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])
}
