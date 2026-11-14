import { Pattern } from "../lib/settings"
import "./click_pattern.css"

interface Props {
  pattern: Pattern
  accent: boolean
  onPattern: (pattern: Pattern) => void
  onAccent: (accent: boolean) => void
}

const OPTIONS: { pattern: Pattern, label: string, notes: boolean[] }[] = [
  { pattern: "every", label: "Every beat", notes: [true, true, true, true] },
  { pattern: "odd", label: "Beats 1 and 3", notes: [true, false, true, false] },
  { pattern: "even", label: "Beats 2 and 4", notes: [false, true, false, true] },
]

// which beats are clicked, each choice drawn as a bar of 4/4 in crotchets and crotchet
// rests; and whether the first beat is accented
export function ClickPattern(p: Props): JSX.Element {
  return (
    <div className="clickPattern">
      <div className="patternChoices" role="radiogroup" aria-label="Click on">
        {OPTIONS.map(o =>
          <button
            key={o.pattern}
            type="button"
            role="radio"
            aria-checked={p.pattern == o.pattern}
            aria-label={o.label}
            title={o.label}
            className={`patternChoice${p.pattern == o.pattern ? " selected" : ""}`}
            onClick={() => p.onPattern(o.pattern)}
          >
            <BarIcon notes={o.notes} />
          </button>
        )}
      </div>
      <button
        type="button"
        className={`accentToggle${p.accent ? " selected" : ""}`}
        aria-pressed={p.accent}
        title="Accent the first beat"
        onClick={() => p.onAccent(!p.accent)}
      >
        <svg viewBox="0 0 20 14" aria-hidden="true"><path d="M3 2l14 5-14 5" /></svg>
        <span>Accent</span>
      </button>
    </div>
  )
}

// a bar drawn as crotchets (true) and crotchet rests (false)
function BarIcon({ notes }: { notes: boolean[] }): JSX.Element {
  const slot = 14
  return (
    <svg
      className="barIcon"
      viewBox={`0 0 ${slot * notes.length} 32`}
      aria-hidden="true"
    >
      {notes.map((note, i) =>
        <g key={i} transform={`translate(${i * slot + 2} 0)`}>
          {note ? <Crotchet /> : <CrotchetRest />}
        </g>
      )}
    </svg>
  )
}

function Crotchet(): JSX.Element {
  return (
    <g>
      <ellipse cx="4.6" cy="25.5" rx="4.3" ry="3" transform="rotate(-22 4.6 25.5)" />
      <rect x="7.6" y="4" width="1.4" height="21.5" />
    </g>
  )
}

function CrotchetRest(): JSX.Element {
  return (
    <path
      transform="translate(1 3)"
      d="M2.6 0 L8.4 6.9 C6.4 8.6 5.6 10.6 7.6 13.2 L9.2 15.2 C6.4 14.2 3.9 15.1 5.6 18.9
         C6.1 20.1 6.8 21.2 7.4 22 C3.6 20.6 1.4 17.9 2.4 15.6 C3.1 13.9 5 13.6 6.3 13.9
         L1.6 8.3 C3.6 6.6 4.6 4.6 2.8 2.4 C2.3 1.7 2.2 0.6 2.6 0 Z"
    />
  )
}
