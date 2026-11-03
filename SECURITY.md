# SENYAS security report

SENYAS is a static app: the website and app are plain files on GitHub Pages, and everything (camera, hand tracking, braille, speech) runs on the user's device. There are no accounts, passwords, databases, payments or servers of our own. The checklist below follows the 27-point pre-launch security list; points that need a server are marked *not applicable* with the reason.

| # | Check | Status in SENYAS |
|---|---|---|
| 1 | Hide secrets | No API keys or passwords anywhere. The Android signing key lives only in GitHub Actions secrets. |
| 2 | Secure the database | Not applicable: no database. Data stays in the user's own browser storage, only with consent. |
| 3 | Enforce HTTPS | GitHub Pages serves HTTPS; every page sends `upgrade-insecure-requests`; all links are `https://`. |
| 4 | Hash passwords | Not applicable: no accounts or passwords. |
| 5 | Validate forms | Inputs have length limits; saved and imported data are checked field by field (types, ranges, allowed values) before use. |
| 6 | Protect against XSS | All user text is escaped before display; a Content Security Policy lets only the page's own scripts run (by hash). Tested: injected `<img onerror>` and `<script>` in imported data show as text and never run. |
| 7 | Log and monitor suspicious activity | Not applicable: no server or logins. GitHub keeps the repository's audit log. |
| 8 | Lock down admin | Not applicable: no admin panel. |
| 9 | Parameterized queries | Not applicable: no database queries. |
| 10 | Check the environment | No debug switches or environment files; builds use fixed tool versions. |
| 11 | Rate limiting | Not applicable: no server endpoints. |
| 12 | Restrict CORS | Not applicable: no API. The policy limits network requests to the site itself and the two hand-tracking download hosts. |
| 13 | Security headers | Content-Security-Policy and Referrer-Policy are set in every page (GitHub Pages does not allow custom headers). Plugins, other sites' forms and changing the base URL are blocked. |
| 14 | CSRF protection | Not applicable: no forms that change anything on a server. |
| 15 | Expiring reset links | Not applicable: no passwords. |
| 16 | Restrict file uploads | Braille photos: image types only, at most 25 MB, read on the device and never uploaded. Data import: SENYAS JSON only, at most 5 MB. |
| 17 | Verify prices | Not applicable: SENYAS is free, with no payments. |
| 18 | Disable debug output | No debug mode; source maps removed from the hand-tracking engine. |
| 19 | Update dependencies | No package manager dependencies. The hand-tracking engine is pinned to MediaPipe 0.10.14 (Apache-2.0); Android libraries are pinned in Gradle. |
| 20 | Remove unused packages | None installed. |
| 21 | Check exposed files | The Pages workflow publishes only the website, app, icons and assets, not sources or research files. No `.env`, keys or backups are in the repository. |
| 22 | Scan Git history for leaked secrets | Scanned every file and the full history for cloud, GitHub, Stripe and Google keys and private keys: none found. |
| 23 | Revoke compromised keys | None found, so none to revoke. |
| 24 | Thorough security review | Done (this report). |
| 25–27 | Test the protections and report | Automated browser tests: 40 functional checks pass with the security policy on; bad file types are refused; script injection through imported data is blocked; the app still works offline. |

**Privacy:** video, photos and audio never leave the device. See `privacy.html`.

**Reporting a problem:** open an issue on this repository.
