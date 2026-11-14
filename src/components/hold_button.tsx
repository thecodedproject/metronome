import { ReactNode, useEffect, useRef } from "react"

interface Props {
  onStep: () => void
  label: string
  className?: string
  children: ReactNode
}

// a button that steps once when pressed, and keeps on stepping while held down
export function HoldButton(props: Props): JSX.Element {
  const latest = useRef(props.onStep)
  latest.current = props.onStep
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const release = () => {
    clearTimeout(timer.current)
    timer.current = undefined
  }
  useEffect(() => release, [])

  const repeat = (delay: number) => {
    timer.current = setTimeout(() => {
      latest.current()
      repeat(Math.max(40, delay * 0.85))
    }, delay)
  }

  return (
    <button
      type="button"
      className={props.className}
      aria-label={props.label}
      onPointerDown={e => {
        if (e.button != 0) {
          return
        }
        e.preventDefault()
        release()
        latest.current()
        timer.current = setTimeout(() => repeat(90), 400)
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onContextMenu={e => e.preventDefault()}
      // a click from the keyboard; those from the pointer are stepped on pressing it
      onClick={e => {
        if (e.detail == 0) {
          latest.current()
        }
      }}
    >
      {props.children}
    </button>
  )
}
