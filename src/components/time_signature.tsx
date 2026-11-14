import { BEAT_UNITS, MAX_BEATS, MIN_BEATS } from "../lib/settings"
import { DragNumber } from "./drag_number"
import "./time_signature.css"

interface Props {
  beatsPerBar: number
  beatUnit: number
  onChange: (beatsPerBar: number, beatUnit: number) => void
}

// the time signature, each half slid up and down like the tempo, or stepped with the
// little arrows over and under it
export function TimeSignature({ beatsPerBar, beatUnit, onChange }: Props): JSX.Element {
  const unitIndex = BEAT_UNITS.indexOf(beatUnit as typeof BEAT_UNITS[number])
  return (
    <div className="timeSignature">
      <Spinner
        label="Beats in a bar"
        value={beatsPerBar}
        min={MIN_BEATS}
        max={MAX_BEATS}
        display={String(beatsPerBar)}
        onChange={v => onChange(v, beatUnit)}
      />
      <span className="timeSlash" aria-hidden="true">/</span>
      <Spinner
        label="Beat note"
        value={unitIndex}
        min={0}
        max={BEAT_UNITS.length - 1}
        display={String(beatUnit)}
        onChange={i => onChange(beatsPerBar, BEAT_UNITS[i])}
      />
    </div>
  )
}

interface SpinnerProps {
  label: string
  value: number
  min: number
  max: number
  display: string
  onChange: (value: number) => void
}

function Spinner(p: SpinnerProps): JSX.Element {
  return (
    <div className="spinner">
      <button
        type="button"
        className="spinArrow"
        tabIndex={-1}
        aria-hidden="true"
        disabled={p.value >= p.max}
        onClick={() => p.onChange(p.value + 1)}
      >
        <svg viewBox="0 0 24 12"><path d="M6 9l6-6 6 6" /></svg>
      </button>
      <DragNumber
        className="spinValue"
        label={p.label}
        value={p.value}
        valueText={p.display}
        min={p.min}
        max={p.max}
        pxPerStep={18}
        onChange={p.onChange}
      >
        {p.display}
      </DragNumber>
      <button
        type="button"
        className="spinArrow"
        tabIndex={-1}
        aria-hidden="true"
        disabled={p.value <= p.min}
        onClick={() => p.onChange(p.value - 1)}
      >
        <svg viewBox="0 0 24 12"><path d="M6 3l6 6 6-6" /></svg>
      </button>
    </div>
  )
}
