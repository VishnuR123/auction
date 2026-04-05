# IPL Season Long Fantasy — gameday points export

This folder contains a **small manual script** you run on your machine **after logging in** to [fantasy.iplt20.com/classic/stats](https://fantasy.iplt20.com/classic/stats) (OTP is fine). It does not automate login and does not ship any credentials.

## What it does

The stats page loads JSON from:

`GET /classic/api/feed/gamedayplayers?lang=en&tourgamedayId={G}&teamgamedayId={G}&announcedVersion={V}`

For a given **gameday ID** `G`, the response includes **all players** with **`GamedayPoints`** for **that match only** (see `FetchXHRfile.json`).

The script calls that URL for each ID in `GAMEDAY_IDS`, then merges into:

- **Wide CSV / JSON**: one row per player, columns `gameday_1`, `gameday_9`, … with points for that day.

So you get **each player × each requested gameday** without opening 250 player detail calls.

**Match number:** In your saved `sample.json`, `GamedayId` and `MatchName` (e.g. `"Match 9"`) line up with `tourgamedayId` / `teamgamedayId` in the URL (both set to the same number in the examples). Use the same ID you see in DevTools.

## One match only

Set e.g. `GAMEDAY_IDS=9` in `.env` to pull **only** that gameday (all ~250 players for that day).

## Setup

1. Copy `.env.example` to `.env` (`.env` is gitignored).

2. **Cookie (required)**  
   While logged in, open DevTools → **Network** → trigger any successful `gamedayplayers` (or reload stats). Click the request → **Headers** → copy the full **`cookie`** request header value into `IPL_COOKIE` in `.env`.

   **Format:** Use the whole string exactly as shown under Request Headers — semicolon-separated pairs such as `my11c-uid=…; my11c-authToken=…; my11_classic_game=…; …`. Put it on **one line** after `IPL_COOKIE=`:

   ```env
   IPL_COOKIE=my11c-uid=...; my11c-authToken=...; my11_classic_game=...; ...
   ```

   Only the **first** `=` on the line separates the variable name from the value, so `=` signs inside the JWT or other cookies stay inside the value. You usually **do not** need a separate `IPL_AUTHORIZATION` line; the `my11c-authToken` cookie is what the site expects for session calls.

3. **`announcedVersion`**  
   Copy from the same URL’s query string (e.g. `announcedVersion=04052026093708`). The site bumps this when squads/announcements refresh; if requests start failing or return empty, grab a fresh value from Network.

4. **`GAMEDAY_IDS`**  
   Comma list or range, e.g. `1-70` or `9,13,21`.

5. Run:

```bash
cd data-extraction
npm run fetch
```

Outputs go to `out/player-points-<timestamp>.json` and `.csv`. Failed gamedays are listed in `out/errors-<timestamp>.json` if any.

Optional:

- `REQUEST_DELAY_MS` — delay between requests (default `400`).
- `IPL_AUTHORIZATION` — only if your session needs a `Bearer` token in addition to cookies (rare; don’t commit real tokens).

## Per-player schedule (`sample.json`)

The file you saved when clicking a player is a **different** endpoint (returns `Data.Value.Upcoming[]` with `GameDaypoints` per row). The script above does **not** call that API; you don’t need it if you use **`gamedayplayers` in a loop**. If you later want a second script for the per-player URL, copy the **full request URL** from Network for one player and we can wire the same cookie to it.

## Security

- **Never commit** `.env`, HAR files, or JWTs. **Never paste** cookie lines or tokens into chat, email, or screenshots — treat them like passwords. If they were exposed, **log out** of the fantasy site (or clear site data) so old cookies stop working, then log in again and refresh `IPL_COOKIE`.
- Use this only for **personal** tracking; respect the site’s terms of use.
