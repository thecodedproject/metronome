import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css"
import App from "./App"
import { applyTheme, loadTheme } from "./lib/settings"

// set before the first render so a dark theme doesn't flash up light first
applyTheme(loadTheme())

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// lets the app open with no connection once it has been saved to the home screen
if ("serviceWorker" in navigator && (location.protocol == "https:" || location.hostname == "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => undefined)
  })
}
