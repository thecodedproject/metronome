import { Pattern } from "./settings"

export type BeatSound = "accent" | "click" | "silent"

// beatSound is what is heard on a beat of the bar, counting the first beat as 0
export function beatSound(beat: number, pattern: Pattern, accent: boolean): BeatSound {
  const counted = beat + 1
  const sounds = pattern == "every"
    || (pattern == "odd" && counted % 2 == 1)
    || (pattern == "even" && counted % 2 == 0)
  if (!sounds) {
    return "silent"
  }
  return accent && beat == 0 ? "accent" : "click"
}

// beatLength is how long a beat lasts in seconds. The tempo counts the beats the time
// signature is written in, whatever note those are
export function beatLength(bpm: number): number {
  return 60 / bpm
}
