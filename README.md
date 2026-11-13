# SENYAS

SENYAS: a live sign language translator, braille reader and sign language course in English, Filipino and Bikol. The camera reads fingerspelling, numbers and everyday signs and can say the words aloud (Read aloud on or off); an avatar signs typed or spoken words back; braille is read from a photo or the live camera; one photo names a plant or an animal (over 4,000 species) and says it, signs it and writes it in braille; and lessons, quizzes and camera practice teach signing. This repository holds the SENYAS website and the SENYAS app (version 1.2.0). Visitors install the app from the website on Android, iPhone, iPad and computers, and it opens without a signal once installed.

## Files

- `index.html` – the website: features, signing-avatar demo, downloads for every device, FAQ and cookie notice
- `privacy.html` – privacy policy and cookies
- `app/index.html` – the SENYAS app; the website's Install button installs this, and it can also be downloaded as one file
- `app/vendor/` – the hand-tracking engine and model (MediaPipe, Apache-2.0), kept so the app works offline
- `app/vendor/species/` – the four models of the plant and animal scan (plants, birds, insects and a general one) and their name lists; see its `README.txt`
- `manifest.webmanifest` – app name, colours, icons and start page (`app/`) used when installing
- `sw.js` – service worker that keeps an offline copy of the app and the website
- `icons/`, `favicon.ico` – icons made from the SENYAS logo
- `assets/senyas-logo.svg`, `assets/senyas-logo.png` – the SENYAS logo: a speech bubble (translation) holding the "I love you" hand (sign language) with braille dots (touch) and sound waves (voice)
- `assets/senyas-icon.svg` – the app-icon version of the logo
- `native/android/` – the Android app: the same `app/` in a WebView with the camera, microphone, phone voice and photo picker
- `native/ios/` – the iPhone and iPad app (XcodeGen `project.yml`): the same `app/` in a WKWebView, with the bundled copy for first start offline
- `SECURITY.md` – the security report (27-point pre-launch checklist)
- `.github/workflows/pages.yml` – publishes the website and app to GitHub Pages
- `.github/workflows/store-apps.yml` – builds the Android app and publishes `SENYAS.apk` for the website's download button
- `src/` – the sources of the app and website; `python3 build.py` rebuilds `app/index.html`, `index.html` and `privacy.html`
  - `hand.js` 3D hand model, renderer and features · `avatar.js` signing avatar · `recog.js` sign recogniser · `braille.js` braille reader and writer · `species.js` plant and animal scan · `data.js` words and phrases in three languages · `app.js`, `app.html`, `app.css` the app · `site.html` the website · `policy.html` the privacy policy
- `tests/app.test.js` – the functional test: opens the website and app in a browser engine and tries every feature (`node tests/app.test.js`; needs Playwright). Photos for the species checks go in `tests/photos/`
- `research/` – the NSTF research (Robotics and Intelligent Machines, Team) and the FIRST LEGO League paper
  - `paper/SENYAS_NSTF_RIM_Research_Paper_2nd_Edition.docx`, `.pdf` – the full NSTF paper for version 1.2 (52 pages), with the nature-scan and device-adaptation experiments; `python3 make_paper.py v2` rebuilds it
  - `paper/SENYAS_NSTF_RIM_Research_Paper.docx`, `.pdf` – the first edition (version 1.0.0); `python3 make_paper.py` rebuilds it
  - `fll/SENYAS_FLL_BIOGLOW_Innovation_Project_Paper.docx`, `.pdf` – the short BIOGLOW Innovation Project paper (3 pages); `python3 make_fll_paper.py` rebuilds it
  - `deck/SENYAS_RIM_PR2_Presentation.pptx`, `.pdf` – the PR2 deck in the LegaSci template; `python3 make_deck.py` rebuilds it
  - `script/SENYAS_Rationale_Narration_Script_v1.docx`, `.pdf` – the 1:45 rationale narration script (NSTF)
  - `script/SENYAS_Rationale_Video_Script_v3_BIOGLOW_2min.docx`, `.pdf` – the 2:00 BIOGLOW rationale video script, focused on the plant and animal scan
  - `script/SENYAS_Rationale_Video_Script_v2_BIOGLOW.docx`, `.pdf` – the 1:45 rationale video script for FIRST LEGO League BIOGLOW, with the six Core Values
  - `code/` – the benchmarks, their results and `analyze.py` (statistics and figures); `bench_species.js` tests the nature scan on flower photographs
  - `figures/` – charts and screenshots used in the paper and deck

## Publish

Installing needs HTTPS. With GitHub Pages: Settings → Pages → Build and deployment → Deploy from a branch → `main` and `/ (root)` → Save.

- Website: https://pogi6969.github.io/SENYAS/
- App: https://pogi6969.github.io/SENYAS/app/
- Android app: https://github.com/pogi6969/SENYAS/releases/latest/download/SENYAS.apk (built on every push to `main`; release downloads need the repository to be public)

For Play Store builds add the secrets `SENYAS_KEYSTORE_B64`, `SENYAS_KEYSTORE_PASSWORD`, `SENYAS_KEY_ALIAS` and `SENYAS_KEY_PASSWORD`. For the iPhone app, run `xcodegen` in `native/ios` on a Mac and open `SENYAS.xcodeproj` in Xcode.

Test locally with `python3 -m http.server 8000`, then open http://localhost:8000.

After changing the app, the icons or the manifest, run `python3 build.py` and `node tests/app.test.js`, and bump `VERSION` in `sw.js` so installed copies refresh.

## Version 1.2.0

- Nature scan from any part: choose Plant, Bird, Insect or Other animal so that a leaf, flower, fruit, bark or whole tree is named even when it does not look like a "plant"; add photos of other parts and the answers are combined; tap another candidate if it fits better
- Optional online plant identification through Pl@ntNet (35,000+ plants from a leaf, flower, fruit or bark). It is off by default, needs your own free key from my.plantnet.org (add `pogi6969.github.io` as an authorised domain there), and sends the plant photo to Pl@ntNet only while it is on
- The interface adapts to what it runs on: Android app, iPhone/iPad app, installed app or browser; phone, tablet, computer or TV. It shows keyboard hints with a mouse, offers to install only in a browser, enlarges focus on a TV, and follows the device's dark mode, text size, contrast and motion settings. Settings → About shows what was detected
- `tests/app.test.js` now runs 171 checks
- Limits, stated plainly: no phone model knows every species. Offline, SENYAS names 2,101 plants, 964 birds, 1,021 insects and about 400 other kinds of animals; online mode widens plants only. Roots alone can rarely be named

## Version 1.1.0

- Plant and animal scan: one photo or camera frame is named on the device (2,101 plants, 964 birds, 1,021 insects and about 400 other kinds of animals), then spoken, signed by the avatar and shown in braille, in English, Filipino or Bikol; *More info* fetches a short description when online
- Read aloud works without a Filipino voice: Bikol and Filipino fall back to the closest installed voice, the voice can be chosen and tested in Settings, and sentences keep their order
- Bikol words reviewed (for example *paha* thirsty, *luway-luway* slowly, *pundo* stop, *omboy* baby, *Namomotan ta ka*)
- Show big: any message fills the screen in giant letters, with speech and an attention flash
- 22 animal and plant signs with a new lesson unit, sign of the day, and the meaning of typed text in all three languages
- Fixes: the quiz stopped after its first question; the caption no longer clears by itself; the camera no longer keeps running behind a closed practice sheet; the back button closes one sheet at a time
