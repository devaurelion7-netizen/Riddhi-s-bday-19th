# Riddhi's birthday website — build spec

## Context

An animated birthday wishing page already exists (purple/lavender palette, heart-shaped photo tree, polaroid-style photos with tape, cursive script headline "Happy Birthday", falling hearts/petals animation). This spec covers **two new pages** built on top of it: a scroll-driven 3D "memories" gallery, and a "friends" page showing what each friend thinks of her. The friends page has already been built; the memories page is what's being added now.

Match the existing visual language exactly across all pages: same purple/lavender colors, same cursive/script font for headings, same polaroid photo styling (white border, slight rotation, washi-tape corner), same floating hearts/petals background animation.

## 1. Navigation across all three pages

Flow: **wishing page → memories page → friends page**

- The wishing page (`index.html`) gets a button linking to the memories page. Label something like "her memories" or "a little journey".
- The memories page gets a small "back" link to the wishing page, and a "next"/forward button into the friends page.
- The friends page's "back" button goes to the memories page (not straight to the wishing page), keeping the chain linear.
- Style all nav buttons consistently — soft purple, rounded, matching the wishing page's existing button style.

## 2. Memories page (new) — scroll-driven 3D depth gallery (Three.js)

This follows the pattern from the Codrops tutorial "Building a Scroll-Reactive 3D Gallery with Three.js, Velocity, and Mood-Based Backgrounds" (Houmahani Kane) — read that article's structure directly before building, and reuse its approach rather than reinventing it.

- **Purpose:** ~30-40 photos experienced as a walk through depth — not a grid, not a wall. Each photo sits along a Z-axis; scrolling drives a camera dolly through that depth.
- **Core mechanic:**
  - Photos are textured planes in a Three.js scene, positioned sequentially along depth (Z), with a slight X offset per photo so the path doesn't feel perfectly straight/mechanical.
  - Each plane's size follows its image's aspect ratio, so nothing looks stretched.
  - Scroll input drives camera movement through the depth, smoothed with velocity/inertia (not a 1:1 scroll-to-position mapping) so the motion has weight rather than snapping instantly. Clamp movement at both ends so scrolling can't push past the first or last photo.
- **Mood-based background:** each photo carries a small color palette (a background color + one or two accent "blob" colors). As the camera passes each photo, the page background smoothly cross-fades from the current photo's palette to the next one's — no hard cuts. Keep every palette within the site's purple/lavender family (lighter, darker, warmer, cooler purples) rather than unrelated hues, so the page still reads as the same site throughout, just shifting mood subtly photo to photo.
- **Data:** one data file listing every photo with its image path, its position along the depth axis, and its mood palette — e.g. `memories-data.js`:
  ```js
  export const memoriesData = [
    {
      image: "photos/memories/memory-01.jpg",
      position: { x: -1.2 },
      mood: { background: "#f3e8fb", blob1: "#c9a6e8", blob2: "#8b6fb3" }
    },
    // ...one entry per photo, 30-40 total
  ];
  ```
  Filling this in (assigning a position and a palette per photo) is manual prep work you'll do once all photos are ready.
- **Note on the interaction:** this is scroll-driven, not mouse-move-driven — different from the parallax/pan demos discussed earlier. Scrolling through the gallery is the whole experience here.
- **Styling around the 3D canvas:** keep the site's cursive/script font for any page title/heading on top of the canvas, and consider letting the floating hearts/petals animation continue as a subtle layer above the WebGL canvas, so the page still feels connected to the rest of the site.
- **Performance note:** this is real WebGL, heavier than plain CSS/JS — fine on your own machine, but worth keeping images reasonably compressed since this is what friends will actually open on their own phones/laptops.

## 3. Friends grid (default view)

- **Layout: polaroid grid.** One polaroid-style card per friend — small rotation per card (alternating +/- a few degrees), straightens on hover.
- Each card shows: friend's photo + friend's name as the caption. If that friend has a nickname, show it in smaller, muted text directly below the name.
- Click a card → opens the detail view (Section 5) as an in-page overlay, not a full navigation.
- A friend who hasn't submitted the form yet still renders normally — just photo + name, no broken/blank card.

## 4. Data sources (friends page)

**A — Friend list (pre-loaded by site owner).** A local data file listing every friend with their name, photo, and an optional nickname. See `friends-data-template.json` for the exact schema — fill it in with the real names and photo filenames before building.

**B — Answers (synced from a Google Form).**
- One Google Form, same questions for everyone (exact question list in Section 6).
- Form responses land in a linked Google Sheet.
- Sheet is published to the web as CSV (File → Share → Publish to web).
- Site fetches that published CSV client-side on page load (a small CSV parser, or the PapaParse CDN library) and matches each response row to a friend in the friend list **by exact name**.
- Match keys must line up exactly — the Form's name field must be a **dropdown** populated with the same names used in the friend list, never free text, so there's no typo mismatch.
- Response editing is enabled on the Form, so a friend can revisit and update their answer; the edited row simply overwrites in place and the site picks up the change on next load — no manual work needed.
- If the CSV fetch fails for any reason, fail gracefully — the grid should still render from the local friend list.

## 5. Detail view (opens on click)

Layout, top to bottom / left to right:

- **Top center:** friend's name, in the site's cursive/script font. If a nickname is set, show it in small, muted plain text directly below the name.
- **Left column:** friend's photo — background removed (PNG cutout), anchored to the *bottom* of its frame so it reads like a paper cutout standing there, not a floating head.
- **Right column:** the Q&A, one row per question — small muted label above, answer text below (see Section 6 for the exact question set). The two "if she were a..." questions each render as **three small single-word boxes stacked together** in that spot, not full sentence rows. Given the longer question list, this column should scroll independently if it runs taller than the portrait on the left.
- A small heart-burst / confetti animation plays when the detail view opens, echoing the falling hearts from the wishing page.
- Closes via an X button or clicking outside the card.
- If a friend hasn't submitted a response yet, clicking their card shows a friendly empty state (e.g. "answers coming soon") instead of an empty Q&A block.
- The optional free-text question (Section 6, #11) is hidden entirely from the card if that friend left it blank.

## 6. Google Form — exact question list and order

Column headers on the published CSV must match these labels exactly, since the site's matching logic keys off them.

1. **Your name** — Dropdown. Options = the exact name list from the friend data file.
2. **One word to describe her** — Short answer.
3. **If she were an emoji, a superpower, or a weather, what would she be?** — three separate short-answer questions, rendered as three stacked single-word boxes:
   - If she were an emoji, what would she be?
   - If she were a superpower, what would she be?
   - If she were a weather, what would she be?
4. **If she were a song, a dessert/food, or a character/animal, what would she be?** — three separate short-answer questions, rendered as three stacked single-word boxes:
   - If she were a song, what would it be?
   - If she were a dessert/food, what would she be?
   - If she were an animal/character, what would she be?
5. **Something she does that always makes you laugh** — Short answer.
6. **Best inside joke between you two** — Short answer.
7. **One quality you admire most about her** — Short answer.
8. **How you two became friends / your first memory of her / something only you know about her** — Paragraph (friend picks whichever angle fits).
9. **A promise or wish for her for the year ahead** — Paragraph.
10. **A birthday message or wish for her** — Paragraph.
11. **Anything else you want to say** *(optional, not required)* — Paragraph. Only shows on the card if filled in.

Form settings: enable **"Collect email addresses"** and **"Allow response editing"** so each friend gets a link to revisit and edit their own answer.

## 7. Edge cases to handle

- Friend with no response yet → card renders, click shows "answers coming soon" empty state.
- CSV fetch fails → grid still renders from local friend data; answers just don't populate.
- Missing photo → fall back to an initials avatar (matches the accent color used elsewhere on the site).
- Someone submits the form under a name not in the dropdown → not possible by construction, since it's a dropdown, not free text.
- Memories page: a texture/photo fails to load → skip that plane gracefully rather than breaking the scene.
- Memories page: if WebGL isn't supported on a visitor's browser/device, show a simple fallback message rather than a blank screen.

## 8. Tech stack

Plain HTML/CSS/JS, no backend, no build step, for the wishing page and friends page. The memories page is the one exception — it uses **Three.js** (via CDN, e.g. unpkg or a script tag) for the WebGL scene, since the depth/scroll/mood effect needs real 3D rendering that CSS can't do. Client-side fetch of the published CSV (friends page) is the other "dynamic" piece — everything else is static files.

## 9. File structure

```
riddhi-birthday-site/
├── index.html               (existing wishing page — nav button links to memories.html)
├── memories.html             (new — Three.js scroll-driven depth gallery)
├── friends.html               (existing — polaroid grid + detail view)
├── css/
│   └── styles.css             (shared: palette, fonts, hearts animation, polaroid style)
├── js/
│   ├── memories.js            (Three.js scene: planes, scroll-driven camera, mood color lerping)
│   └── friends.js              (fetch + parse CSV, match by name, render grid + detail view)
├── data/
│   ├── memories-data.js        (photo path + depth position + mood palette, one entry per photo)
│   └── friends-data.json       (the pre-loaded name + photo list — see friends-data-template.json)
└── photos/
    ├── memories/                (the 30-40 photos for the memories wall)
    │   ├── memory-01.jpg
    │   └── ...
    └── friends/                  (background-removed cutouts, one per friend)
        ├── ananya.png
        └── ...
```

Keep `styles.css` shared across all three pages so the palette, fonts, and heart animation only need to be defined once.
