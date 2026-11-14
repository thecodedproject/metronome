import { ReactNode, useEffect, useRef, useState } from "react"
import { DragState, dragValue, moveDrag, startDrag } from "../lib/drag"

interface Props {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  // how far the pointer moves for each step
  pxPerStep: number
  label: string
  // what the value is read out as, where it isn't simply the number
  valueText?: string
  className?: string
  children: ReactNode
}

// a number changed by pressing on it and sliding up or down (with a finger or the
// mouse), by the mouse wheel, or by the arrow keys once it has the focus
export function DragNumber(props: Props): JSX.Element {
  const { value, min, max, pxPerStep } = props
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState & { pointer: number }>()
  const [dragging, setDragging] = useState(false)

  // the listeners stay the same throughout, so read what they need from here
  const latest = useRef(props)
  latest.current = props

  const change = (next: number) => {
    const p = latest.current
    next = Math.min(p.max, Math.max(p.min, next))
    if (next != p.value) {
      p.onChange(next)
    }
  }

  // the wheel turns a step a notch, and a trackpad a step for so far scrolled
  useEffect(() => {
    const el = ref.current!
    let scrolled = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaMode == 0 ? e.deltaY : e.deltaY * 40
      scrolled += Math.max(-40, Math.min(40, delta))
      const steps = Math.trunc(scrolled / 40)
      if (steps != 0) {
        scrolled -= steps * 40
        change(latest.current.value - steps)
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  return (
    <div
      ref={ref}
      className={`dragNumber${dragging ? " dragging" : ""} ${props.className ?? ""}`}
      role="spinbutton"
      tabIndex={0}
      aria-label={props.label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={props.valueText}
      onPointerDown={e => {
        if (e.button != 0 || drag.current != undefined) {
          return
        }
        e.preventDefault()
        e.currentTarget.focus({ preventScroll: true })
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { ...startDrag(value, e.clientY), pointer: e.pointerId }
        setDragging(true)
      }}
      onPointerMove={e => {
        const d = drag.current
        if (d == undefined || d.pointer != e.pointerId) {
          return
        }
        const moved = moveDrag(d, e.clientY, pxPerStep, min, max)
        drag.current = { ...moved, pointer: d.pointer }
        change(dragValue(moved, min, max))
      }}
      onPointerUp={e => {
        if (drag.current?.pointer == e.pointerId) {
          drag.current = undefined
          setDragging(false)
        }
      }}
      onPointerCancel={() => {
        drag.current = undefined
        setDragging(false)
      }}
      onKeyDown={e => {
        const steps: Record<string, number> = {
          ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10,
        }
        if (e.key in steps) {
          e.preventDefault()
          change(value + steps[e.key])
        } else if (e.key == "Home") {
          e.preventDefault()
          change(min)
        } else if (e.key == "End") {
          e.preventDefault()
          change(max)
        }
      }}
    >
      {props.children}
    </div>
  )
}
