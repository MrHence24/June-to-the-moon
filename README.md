# June to the Moon 🚀
A word-recognition space adventure. June flies from Earth to the Moon: 44 correct answers = 44 steps closer.
Plain HTML/CSS/JS, no build step, no external services.

## Run locally
`python3 -m http.server 8000` in this folder, then open http://localhost:8000
(A server is needed because the game loads `data/questions.json`; double-clicking index.html will not work.)

## Deploy to GitHub Pages
1. Create a **new, empty** repo named `june-to-the-moon` on github.com (separate from House of Umami).
2. In this folder: `git init && git add . && git commit -m "June to the Moon" && git branch -M main`
3. `git remote add origin https://github.com/<your-username>/june-to-the-moon.git && git push -u origin main`
4. Repo **Settings → Pages → Build from branch → main / (root) → Save**.
5. Game is live in ~1 minute at `https://<your-username>.github.io/june-to-the-moon/`

## Edit the words
Everything is in `data/questions.json`: `word`, `image` (correct picture), `others` (3 wrong pictures). A picture is an emoji
or a file path such as `assets/images/cat.png`. Order in the file = order of the journey. The journey length = number of questions.

## Files
`index.html` · `styles.css` · `game.js` (engine) · `data/questions.json` · `assets/characters/` (June, from the supplied illustration)
Controls: tap, or keys **1–4** to answer, **M** mute, **Enter** to launch. Tap the word to hear it read aloud.
