import { useEffect, useRef, useState } from "react"
import { BeatDots } from "./components/beat_dots"
import { ClickPattern } from "./components/click_pattern"
import { PlayButton } from "./components/play_button"
import { TempoControl } from "./components/tempo_control"
import { ThemeToggle } from "./components/theme_toggle"
import { TimeSignature } from "./components/time_signature"
import { useSpaceToggle } from "./components/use_space_toggle"
import { useWakeLock } from "./components/use_wake_lock"
import { Metronome } from "./lib/metronome"
import { applyTheme, loadSettings, loadTheme, saveSettings, Settings, Theme } from "./lib/settings"
import "./App.css"

export default function App(): JSX.Element {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState<number | undefined>()
  const [error, setError] = useState<string>()

  const metronome = useRef<Metronome>()
  if (metronome.current == undefined) {
    metronome.current = new Metronome({ ...settings, onBeat: setBeat })
  }

  const change = (changes: Partial<Settings>) =>
    setSettings(s => ({ ...s, ...changes }))

  useEffect(() => {
    saveSettings(settings)
    metronome.current!.update(settings)
  }, [settings])

  useEffect(() => applyTheme(theme), [theme])

  // back from the background, where a phone may have interrupted the audio
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState == "visible") {
        metronome.current?.resume()
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      metronome.current?.dispose()
    }
  }, [])

  const toggle = () => {
    const m = metronome.current!
    if (m.isPlaying()) {
      m.stop()
      setPlaying(false)
      return
    }
    try {
      m.start()
      setPlaying(true)
      setError(undefined)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  useSpaceToggle(toggle)
  useWakeLock(playing)

  return (
    <div className="app">
      <header className="appHeader">
        <ThemeToggle theme={theme} onChange={setTheme} />
      </header>

      <main className="appMain">
        <TempoControl bpm={settings.bpm} onChange={bpm => change({ bpm })} />

        <TimeSignature
          beatsPerBar={settings.beatsPerBar}
          beatUnit={settings.beatUnit}
          onChange={(beatsPerBar, beatUnit) => change({ beatsPerBar, beatUnit })}
        />

        <ClickPattern
          pattern={settings.pattern}
          accent={settings.accent}
          onPattern={pattern => change({ pattern })}
          onAccent={accent => change({ accent })}
        />

        <BeatDots
          beatsPerBar={settings.beatsPerBar}
          pattern={settings.pattern}
          accent={settings.accent}
          beat={playing ? beat : undefined}
        />

        <PlayButton playing={playing} onToggle={toggle} />
        {error && <p className="error">{error}</p>}
      </main>
    </div>
  )
}
