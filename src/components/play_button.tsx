interface Props {
  playing: boolean
  onToggle: () => void
}

export function PlayButton({ playing, onToggle }: Props): JSX.Element {
  return (
    <button
      type="button"
      className={`playButton${playing ? " playing" : ""}`}
      aria-label={playing ? "Stop" : "Start"}
      aria-pressed={playing}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {playing
          ? <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
          : <path d="M8.5 5.5v13l10.5-6.5z" />}
      </svg>
    </button>
  )
}
