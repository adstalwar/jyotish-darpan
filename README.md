# Jyotish Darpan

Vedic astrology in plain language. Kundali (North and South Indian styles), Navamsa and Dasamsa, planet positions, Vimshottari dasha to three levels, live transits with an animated zodiac wheel, Sade Sati and Dhaiya for a whole life, yogas and doshas, house-by-house life readings, and a Bhrigu Nandi Nadi reading.

Everything runs in the browser. No server, no API keys, no data leaves the device.

## Host on GitHub Pages

1. Create a repository and put the contents of this folder at its root.
2. In the repository, open Settings, then Pages, choose "Deploy from a branch", pick `main` and `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`.

## Install for offline use

The site is a Progressive Web App. Open it once online, then use "Install app" (desktop Chrome or Edge) or "Add to Home Screen" (Android, iOS). After that it opens and calculates without a connection. Only the optional online place search needs the network.

## Run locally

Any static server works:

    npx serve .

## How it calculates

- Positions: [Astronomy Engine](https://github.com/cosinekitty/astronomy) (MIT), checked against Swiss Ephemeris to within about 10 arc-seconds for 1900 to 2100.
- Sidereal zodiac, Lahiri ayanamsa by default (Raman and KP selectable).
- Whole-sign houses, mean lunar node, Vimshottari dasha on a 365.25-day year.
- Planets within 3 arc-minutes of a sign border are flagged, with a switch to read the chart either way.

## Files

| File | Purpose |
| --- | --- |
| `engine.js` | Astronomy and Vedic calculations |
| `content.js` | Reference data, interpretation texts, glossary, city list |
| `interpret.js` | Yoga, dosha, life-area, dasha and Nadi rules |
| `ui.js`, `app.css`, `index.html` | Interface |
| `sw.js`, `manifest.webmanifest` | Offline install |

Interpretations follow classical Vedic astrology texts and are offered for reflection, not as medical, legal or financial advice.
