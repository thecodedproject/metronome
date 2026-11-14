# Metronome

A simple metronome that works in the browser and as an app saved to a phone's home screen.

- **Tempo**: press on the number and slide up or down (finger or mouse) - it moves a beat
  a minute for every 4px moved, however fast you go. The − / + buttons nudge it by one
  (hold to keep going), the pencil lets you type one in, and the mouse wheel and arrow
  keys work too. 20-300 BPM.
- **Time signature**: slide either number up or down, or use the little arrows.
- **Click on**: every beat, the odd beats (1 & 3 in 4/4) or the even beats (2 & 4).
  **Accent** gives beat 1 a higher click.
- **Space** starts and stops it.
- Settings and the light/dark choice are kept in `localStorage` between visits.

## Building

    yarn install
    yarn test
    yarn start        # builds into dist/ and serves it on http://127.0.0.1:8080
    yarn build:prod   # a minified build

`public/` is copied into `dist/` as it is: the web app manifest, the icons, and `sw.js`,
a service worker that lets the saved app open offline. To put it on the home screen of
an iPhone, open it in Safari, then Share → Add to Home Screen. Service workers (and so
offline use) need the site served over https, or from localhost.

## Phones

- iOS mutes web audio when the ringer switch is off; the app asks Safari to treat its
  sound as playback (`navigator.audioSession`, iOS 17+) so it still clicks.
- While playing it holds a screen wake lock so the phone doesn't go to sleep and stop it.
