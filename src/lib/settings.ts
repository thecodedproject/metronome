// The metronome's settings, and remembering them from one visit to the next.

// which beats of the bar are clicked: every one, the odd ones (1 and 3 in 4/4), or the
// even ones (2 and 4)
export const PATTERNS = ["every", "odd", "even"] as const
export type Pattern = typeof PATTERNS[number]

export const THEMES = ["light", "dark"] as const
export type Theme = typeof THEMES[number]

export const MIN_BPM = 20
export const MAX_BPM = 300
export const MIN_BEATS = 1
export const MAX_BEATS = 16
export const BEAT_UNITS = [1, 2, 4, 8, 16] as const

export interface Settings {
  bpm: number
  beatsPerBar: number
  beatUnit: number
  pattern: Pattern
  accent: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  bpm: 120,
  beatsPerBar: 4,
  beatUnit: 4,
  pattern: "every",
  accent: false,
}

const SETTINGS_KEY = "metronome.settings"
const THEME_KEY = "metronome.theme"

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// clampBpm keeps a tempo to a whole number of beats a minute within the range allowed
export function clampBpm(bpm: number): number {
  return clamp(Math.round(bpm), MIN_BPM, MAX_BPM)
}

// parseBpm reads a tempo typed in, or undefined if it isn't a number
export function parseBpm(text: string): number | undefined {
  const value = Number(text.trim())
  if (text.trim() == "" || !isFinite(value)) {
    return undefined
  }
  return clampBpm(value)
}

// parseSettings reads settings saved earlier, keeping whatever of them is still good and
// taking the default for the rest, so a missing or damaged save never breaks the page
export function parseSettings(saved: string | null): Settings {
  let raw: any
  try {
    raw = saved == null ? {} : JSON.parse(saved)
  } catch {
    raw = {}
  }
  if (raw == null || typeof raw != "object") {
    raw = {}
  }
  const d = DEFAULT_SETTINGS
  const isNum = (v: unknown): v is number => typeof v == "number" && isFinite(v)
  return {
    bpm: isNum(raw.bpm) ? clampBpm(raw.bpm) : d.bpm,
    beatsPerBar: isNum(raw.beatsPerBar)
      ? clamp(Math.round(raw.beatsPerBar), MIN_BEATS, MAX_BEATS) : d.beatsPerBar,
    beatUnit: (BEAT_UNITS as readonly number[]).includes(raw.beatUnit) ? raw.beatUnit : d.beatUnit,
    pattern: (PATTERNS as readonly unknown[]).includes(raw.pattern) ? raw.pattern : d.pattern,
    accent: typeof raw.accent == "boolean" ? raw.accent : d.accent,
  }
}

// storage can be missing or blocked (a private window, say), in which case settings just
// aren't remembered
export function loadSettings(): Settings {
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // not remembered
  }
}

// the theme chosen on an earlier visit, or else whichever the device is set to
export function loadTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if ((THEMES as readonly (string | null)[]).includes(stored)) {
      return stored as Theme
    }
  } catch {
    // fall through
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme == "dark" ? "#121212" : "#fafafa")
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // not remembered
  }
}
