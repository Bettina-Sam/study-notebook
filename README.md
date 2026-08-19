# Study Notebook

Interactive science learning platform for Physics, Chemistry and Biology.

## Learning model

See → Predict → Interact → Observe → Calculate / Explain → Apply → Connect.

## Project structure

```text
index.html
subjects/
  physics/modules/<concept>/index.html
  chemistry/modules/<concept>/index.html + simulation.js
  biology/modules/<concept>/index.html + simulation.js
css/
js/
assets/
manifest.webmanifest
sw.js
```

Every visible learning module has its own route and module folder. Shared files under `js/` contain reusable rendering/helpers only; module definitions are kept with their own lesson.

## Local preview

```bash
npm install
npm run dev
```

Or serve the folder with any static HTTP server. PWA installation requires localhost or HTTPS.

## Deployment

The project is static and can be hosted directly on Vercel.
