# Riddhi's birthday website — friends page build spec

## Context

An animated birthday wishing page already exists (purple/lavender palette, heart-shaped photo tree, polaroid-style photos with tape, cursive script headline "Happy Birthday", falling hearts/petals animation). This spec is for a **second page** that lists her friends and, on click, shows what each friend thinks of her.

Match the existing visual language exactly: same purple/lavender colors, same cursive/script font for headings, same polaroid photo styling (white border, slight rotation, washi-tape corner), same floating hearts/petals background animation.

## 1. Navigation between the two pages

- Add a button on the existing wishing page, styled to match (soft purple, rounded), linking to the new page. Label something like "meet her people" or "see what her friends think".
- The new page needs a small "back" link/button to return to the wishing page.

## 2. Friends grid (default view)

- **Layout: polaroid grid.** One polaroid-style card per friend — small rotation per card (alternating +/- a few degrees), straightens on hover.
- Each card shows: friend's photo + friend's name as the caption. If that friend has a nickname, show it in smaller, muted text directly below the name.
- Click a card → opens the detail view (Section 4) as an in-page overlay, not a full navigation.
- A friend who hasn't submitted the form yet still renders normally — just photo + name, no broken/blank card.

## 3. Data sources

**A — Friend list (pre-loaded by site owner).** A local data file listing every friend with their name, photo, and an optional nickname. See `friends-data-template.json` for the exact schema — fill it in with the real names and photo filenames before building.

**B — Answers (synced from a Google Form).**
- One Google Form, same questions for everyone (exact question list in Section 5).
- Form responses land in a linked Google Sheet.
- Sheet is published to the web as CSV (File → Share → Publish to web).
- Site fetches that published CSV client-side on page load (a small CSV parser, or the PapaParse CDN library) and matches each response row to a friend in the friend list **by exact name**.
- Match keys must line up exactly — the Form's name field must be a **dropdown** populated with the same names used in the friend list, never free text, so there's no typo mismatch.
- Response editing is enabled on the Form, so a friend can revisit and update their answer; the edited row simply overwrites in place and the site picks up the change on next load — no manual work needed.
- If the CSV fetch fails for any reason, fail gracefully — the grid should still render from the local friend list.

## 4. Detail view (opens on click)

Layout, top to bottom / left to right:

- **Top center:** friend's name, in the site's cursive/script font. If a nickname is set, show it in small, muted plain text directly below the name.
- **Left column:** friend's photo — background removed (PNG cutout), anchored to the *bottom* of its frame so it reads like a paper cutout standing there, not a floating head.
- **Right column:** the Q&A, one row per question — small muted label above, answer text below (see Section 5 for the exact question set and how the song/food/animal question renders).
- A small heart-burst / confetti animation plays when the detail view opens, echoing the falling hearts from the wishing page.
- Closes via an X button or clicking outside the card.
- If a friend hasn't submitted a response yet, clicking their card shows a friendly empty state (e.g. "answers coming soon") instead of an empty Q&A block.
- The optional free-text question (see Section 5, #6) is hidden entirely from the card if that friend left it blank.

## 5. Google Form — exact question list

Column headers on the published CSV must match these labels exactly, since the site's matching logic keys off them.

1. **Your name** — Dropdown. Options = the exact name list from the friend data file.
2. **One word to describe her** — Short answer.
3. **How you became friends / first memory / something only you know about her** — Paragraph (friend picks whichever angle fits).
4. **If she were a song, dessert/food, or character/animal, what would she be?** — rendered on the card as **three separate single-word boxes stacked in one column** (song / food / animal), so this needs to be **three separate short-answer Form questions**, not one combined field:
   - If she were a song, what would it be?
   - If she were a dessert/food, what would she be?
   - If she were an animal/character, what would she be?
5. **A birthday message or wish for her** — Paragraph.
6. **Anything else you want to say** *(optional, not required)* — Paragraph. Only shows on the card if filled in.

Form settings: enable **"Collect email addresses"** and **"Allow response editing"** so each friend gets a link to revisit and edit their own answer.

## 6. Edge cases to handle

- Friend with no response yet → card renders, click shows "answers coming soon" empty state.
- CSV fetch fails → grid still renders from local friend data; answers just don't populate.
- Missing photo → fall back to an initials avatar (matches the accent color used elsewhere on the site).
- Someone submits the form under a name not in the dropdown → not possible by construction, since it's a dropdown, not free text.

## 7. Tech stack

Plain HTML/CSS/JS, no framework, no backend, no build step. Client-side fetch of the published CSV is the only "live" piece — everything else is static files.

## 8. File structure

```
/web-design
├── index.html            (existing wishing page — add the nav button here)
├── friends.html           (new — polaroid grid + detail view)
├── css/
│   └── styles.css         (shared: palette, fonts, hearts animation, polaroid style)
├── js/
│   └── friends.js         (fetch + parse CSV, match by name, render grid + detail view)
├── data/
│   └── friends-data.json  (the pre-loaded name + photo list — see friends-data-template.json)
└── photos/
    ├── ananya.png          (background-removed cutouts, one per friend)
    ├── samarth.png
    └── ...
```

Keep `styles.css` shared between both pages so the palette, fonts, and heart animation only need to be defined once.
