# SENYAS

SENYAS: a live sign language translator, braille reader and sign language course in English, Filipino and Bikol. The camera reads fingerspelling, numbers and everyday signs and can say the words aloud (Read aloud on or off); an avatar signs typed or spoken words back; braille is read from a photo or the live camera; and lessons, quizzes and camera practice teach signing. This repository holds the SENYAS website and the SENYAS app (version 1.0.0). Visitors install the app from the website on Android, iPhone, iPad and computers, and it opens without a signal once installed.

## Files

- `index.html` – the website: features, signing-avatar demo, downloads for every device, FAQ and cookie notice
- `privacy.html` – privacy policy and cookies
- `app/index.html` – the SENYAS app; the website's Install button installs this, and it can also be downloaded as one file
- `app/vendor/` – the hand-tracking engine and model (MediaPipe, Apache-2.0), kept so the app works offline
- `manifest.webmanifest` – app name, colours, icons and start page (`app/`) used when installing
- `sw.js` – service worker that keeps an offline copy of the app and the website
- `icons/`, `favicon.ico` – icons made from the SENYAS logo
- `assets/senyas-logo.svg`, `assets/senyas-logo.png` – the SENYAS logo: a speech bubble (translation) holding the "I love you" hand (sign language) with braille dots (touch) and sound waves (voice)
- `assets/senyas-icon.svg` – the app-icon version of the logo
- `native/android/` – the Android app: the same `app/` in a WebView with the camera, microphone, phone voice and photo picker
- `native/ios/` – the iPhone and iPad app (XcodeGen `project.yml`): the same `app/` in a WKWebView, with the bundled copy for first start offline
- `.github/workflows/store-apps.yml` – builds the Android app and publishes `SENYAS.apk` for the website's download button
- `src/` – the sources of the app and website; `python3 build.py` rebuilds `app/index.html`, `index.html` and `privacy.html`
  - `hand.js` 3D hand model, renderer and features · `avatar.js` signing avatar · `recog.js` sign recogniser · `braille.js` braille reader and writer · `data.js` words and phrases in three languages · `app.js`, `app.html`, `app.css` the app · `site.html` the website · `policy.html` the privacy policy
- `research/` – the NSTF research (Robotics and Intelligent Machines, Team)
  - `paper/SENYAS_NSTF_RIM_Research_Paper.docx`, `.pdf` – the full research paper; `python3 make_paper.py` rebuilds it
  - `deck/SENYAS_RIM_PR2_Presentation.pptx`, `.pdf` – the PR2 deck in the LegaSci template; `python3 make_deck.py` rebuilds it
  - `script/SENYAS_Rationale_Narration_Script_v1.docx`, `.pdf` – the 1:45 rationale narration script
  - `code/` – the nine benchmarks, their results and `analyze.py` (statistics and figures)
  - `figures/` – charts and screenshots used in the paper and deck

## Publish

Installing needs HTTPS. With GitHub Pages: Settings → Pages → Build and deployment → Deploy from a branch → `main` and `/ (root)` → Save.

- Website: https://pogi6969.github.io/SENYAS/
- App: https://pogi6969.github.io/SENYAS/app/
- Android app: https://github.com/pogi6969/SENYAS/releases/latest/download/SENYAS.apk (built on every push to `main`; release downloads need the repository to be public)

For Play Store builds add the secrets `SENYAS_KEYSTORE_B64`, `SENYAS_KEYSTORE_PASSWORD`, `SENYAS_KEY_ALIAS` and `SENYAS_KEY_PASSWORD`. For the iPhone app, run `xcodegen` in `native/ios` on a Mac and open `SENYAS.xcodeproj` in Xcode.

Test locally with `python3 -m http.server 8000`, then open http://localhost:8000.

After changing the app, the icons or the manifest, run `python3 build.py` and bump `VERSION` in `sw.js` so installed copies refresh.
