# KAMAY · SENYAS

SENYAS is a live sign language translator, braille reader and sign language course in English, Filipino and Bikol. This repository holds the SENYAS website, the SENYAS app (version 1.0.0), the Android app and the NSTF research. Visitors install the app from the website on Android, iPhone, iPad and computers, and it works without a signal once installed.

## What the app does

- **Sign → words (live):** the camera tracks 21 points on each hand (MediaPipe Hand Landmarker, on the device) and reads fingerspelling A–Z with Ñ, numbers 0–10, and 21 everyday signs, including moving and two-handed ones (hello, thank you, please, sorry, yes, no, where, water, eat, bathroom, love, help, more, house, friend, name, finished, I love you, good, bad, okay). Fingerspelled words that are in the dictionary are translated.
- **Read aloud, on or off:** each recognised word is spoken in the chosen language; one switch turns it on or off, and a second option also speaks each letter.
- **Words / voice → sign:** typed or spoken English, Filipino or Bikol is signed by a 3D avatar; unknown words and names are fingerspelled. The sentence is also shown in braille.
- **Braille reader:** upload a photo or scan live with the camera; Grade 1 braille (with Ñ, capitals, numbers and punctuation) is read, shown, translated where possible and spoken.
- **Learn:** 11 units (alphabet, numbers, greetings, people, needs, feelings, questions, emergencies, time) with lessons, quizzes, camera practice, flashcards, a fingerspelling-reading game and a spell-with-your-hand game; XP, levels, streaks and badges.
- **Teach a sign:** record any sign three times (still or moving) and SENYAS reads it from then on; personal examples improve letters.
- **Dictionary and phrasebook:** 103 signs (92 words and the numbers 0–10) and 32 phrases in three languages.
- **Fits every device:** phone (bottom tabs), tablet (side rail), desktop and TV (both directions side by side), landscape phones, large text, high contrast, dark mode, reduced motion.
- **Privacy:** video and photos never leave the device. A consent sheet (app) and cookie banner (website) let people choose what is stored; the policy is in `privacy.html`.

## Files

- `index.html` – the website: features, demo avatar, downloads, FAQ, cookie banner
- `privacy.html` – privacy policy and cookies
- `app/index.html` – the app, one file; `app/vendor/` – the hand-tracking engine and model (Apache-2.0) so it runs offline
- `src/` – the sources; run `python3 build.py` to rebuild `app/index.html`, `index.html` and `privacy.html`
  - `hand.js` 3D hand model, renderer and features · `avatar.js` signing avatar · `recog.js` recogniser · `braille.js` braille reader/writer · `data.js` words and phrases · `app.js`, `app.html`, `app.css` the app · `site.html` the website · `policy.html` the policy
- `manifest.webmanifest`, `sw.js` – install and offline support
- `assets/senyas-logo.svg` – the logo: a speech bubble (translation) holding the "I love you" hand (sign language) with braille dots (touch) and sound waves (voice)
- `icons/`, `favicon.ico` – icons made from the logo
- `native/android/` – the Android app (a WebView around `app/` with camera, microphone, phone voice and photo picking)
- `research/` – the NSTF research (Robotics and Intelligent Machines, Team):
  - `paper/SENYAS_NSTF_RIM_Research_Paper.docx` / `.pdf` – the full paper (42 pages); rebuild with `python3 make_paper.py`
  - `deck/SENYAS_RIM_PR2_Presentation.pptx` / `.pdf` – the PR2 (LegaSci template) deck; rebuild with `python3 make_deck.py`
  - `script/SENYAS_Rationale_Narration_Script_v1.docx` / `.pdf` – the 1:45 rationale narration
  - `code/` – the nine benchmarks (`bench_recognizer.js`, `bench_browser.js` + `bench_page.html`, `bench_ui.js`), their results and `analyze.py` (statistics and figures)
  - `figures/` – charts and screenshots used in the paper and deck

## Publish

Installing needs HTTPS. With GitHub Pages: Settings → Pages → Deploy from a branch → `main` and `/ (root)`. The website is then at `https://pogi6969.github.io/KAMAY/` and the app at `https://pogi6969.github.io/KAMAY/app/`.

The Android APK is built by `.github/workflows/android.yml` on every push to `main` and published as the release `senyas-android`; the website's **Download APK** button points to it. For Play Store builds add the secrets `SENYAS_KEYSTORE_B64`, `SENYAS_KEYSTORE_PASSWORD`, `SENYAS_KEY_ALIAS` and `SENYAS_KEY_PASSWORD`. (Release downloads need the repository to be public.)

Test locally with `python3 -m http.server 8000` in the repository root, then open http://localhost:8000/.

After changing the app, the icons or the manifest, bump `VERSION` in `sw.js` so installed copies refresh.
