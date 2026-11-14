import { useRef, useState } from "react"
import { flushSync } from "react-dom"
import { clampBpm, MAX_BPM, MIN_BPM, parseBpm } from "../lib/settings"
import { DragNumber } from "./drag_number"
import { HoldButton } from "./hold_button"
import "./tempo_control.css"

interface Props {
  bpm: number
  onChange: (bpm: number) => void
}

// the tempo in large figures, slid up and down to change it, with buttons either side
// to nudge it a beat a minute at a time, and a little pencil for typing one in
export function TempoControl({ bpm, onChange }: Props): JSX.Element {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState("")
  const input = useRef<HTMLInputElement>(null)

  const startEditing = () => {
    // drawn and focused straight away, while still handling the tap: iOS only brings
    // the keyboard up for a field focused during one
    flushSync(() => {
      setText(String(bpm))
      setEditing(true)
    })
    input.current?.focus()
    input.current?.select()
  }

  const finishEditing = (keep: boolean) => {
    if (keep) {
      const typed = parseBpm(text)
      if (typed != undefined) {
        onChange(typed)
      }
    }
    setEditing(false)
  }

  return (
    <div className="tempoControl">
      <HoldButton
        className="tempoStep"
        label="Slower"
        onStep={() => onChange(clampBpm(bpm - 1))}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
      </HoldButton>

      <div className="tempoCentre">
        {editing
          ? (
            <form
              className="tempoForm"
              onSubmit={e => {
                e.preventDefault()
                finishEditing(true)
              }}
            >
              <input
                ref={input}
                className="tempoInput"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                enterKeyHint="done"
                maxLength={3}
                aria-label="Tempo in beats per minute"
                value={text}
                onChange={e => setText(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={() => finishEditing(true)}
                onKeyDown={e => {
                  if (e.key == "Escape") {
                    finishEditing(false)
                  }
                }}
              />
            </form>
          )
          : (
            <DragNumber
              className="tempoNumber"
              value={bpm}
              min={MIN_BPM}
              max={MAX_BPM}
              pxPerStep={4}
              label="Tempo, beats per minute"
              onChange={onChange}
            >
              {bpm}
            </DragNumber>
          )}
        <div className="tempoUnit">
          <span>BPM</span>
          <button
            type="button"
            className="editButton"
            aria-label="Type in a tempo"
            title="Type in a tempo"
            onClick={() => editing ? finishEditing(true) : startEditing()}
            // keeps the field's blur from finishing before this click toggles it
            onPointerDown={e => editing && e.preventDefault()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4" />
            </svg>
          </button>
        </div>
      </div>

      <HoldButton
        className="tempoStep"
        label="Faster"
        onStep={() => onChange(clampBpm(bpm + 1))}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14 M12 5v14" /></svg>
      </HoldButton>
    </div>
  )
}
