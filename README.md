# Study Notebook — Interactive Science

A responsive, installable learning platform for Physics, Chemistry and Biology.

## Run locally
Use any static web server from this folder, for example:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

> PWA installation requires localhost or HTTPS.

## Structure
- `index.html` — subject journeys and unit roadmaps
- `Concepts/` — Physics learning modules
- `Chemistry/` — Chemistry interactive lessons
- `Biology/` — Biology interactive lessons
- `js/science-module.js` — shared Chemistry/Biology simulation engine
- `css/` — responsive styling
- `manifest.webmanifest` + `sw.js` — PWA support
