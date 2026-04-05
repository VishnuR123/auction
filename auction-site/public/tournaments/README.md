# Tournament assets (auction-site)

Each tournament has a folder named with its **id** (e.g. `2026-ipl`, same as Mongo `_id`).

Suggested layout:

```text
tournaments/
  2026-ipl/
    branding/
      logo.png          ← shown in the tournament switcher
    owners/
      {ownerId}.png     ← e.g. vishnu_ipl26.png
    flags/
      CSK.svg
```

In React, build URLs with `tournamentAssetUrl(tournamentId, "owners", `${ownerId}.png`)` from `src/utils/tournamentAssets.js`, or use the path pattern:

`/tournaments/{tournamentId}/...`
