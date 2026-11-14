import { Theme } from "../lib/settings"

interface Props {
  theme: Theme
  onChange: (theme: Theme) => void
}

// switches between the light and dark themes, showing the one it switches to
export function ThemeToggle({ theme, onChange }: Props): JSX.Element {
  const next = theme == "dark" ? "light" : "dark"
  return (
    <button
      type="button"
      className="themeToggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => onChange(next)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {theme == "dark"
          ? (
            <>
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
            </>
          )
          : <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />}
      </svg>
    </button>
  )
}
