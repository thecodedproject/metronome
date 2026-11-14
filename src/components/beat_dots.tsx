import { beatSound } from "../lib/beats"
import { Pattern } from "../lib/settings"
import "./beat_dots.css"

interface Props {
  beatsPerBar: number
  pattern: Pattern
  accent: boolean
  // the beat being heard, from 0, or undefined while stopped
  beat: number | undefined
}

// a circle for each beat of the bar, filled in on the beat being played. Beats with no
// click are drawn fainter, and an accented first beat a little larger
export function BeatDots(p: Props): JSX.Element {
  return (
    <div className="beatDots" aria-hidden="true">
      {Array.from({ length: p.beatsPerBar }, (_, i) => {
        const sound = beatSound(i, p.pattern, p.accent)
        const classes = ["beatDot", sound, i == p.beat ? "on" : ""].join(" ")
        return <span key={i} className={classes} />
      })}
    </div>
  )
}
