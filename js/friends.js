/* ============================================================
   friends.js — Riddhi's Birthday Website
   Fetches friends-data.json + Google Sheets CSV, renders the
   polaroid grid, and handles the click-to-open detail overlay.
   ============================================================ */

'use strict';

/* ── ① Config ────────────────────────────────────────────── */

/**
 * Paste the published Google Sheets CSV URL here once the form is live.
 * File → Share → Publish to web → CSV → copy URL.
 * Leave empty to use dummy data only.
 */
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuiI7vyqklvCdjeabx1yj0s35XTUazLfIfl0Ee6TajyOpFRpD041fSVrofj11VE8yzT8vwTeiq_oci/pub?gid=786028458&single=true&output=csv';

/* ── ② Dummy responses (used until real CSV is wired up) ── */
const DUMMY_RESPONSES = {
  'Aarchi Jain': {
    oneWord:       'Sunshine',
    emoji:         '🌻',
    superpower:    'Instant Mood Lifter',
    weather:       'Golden Hour Sunshine',
    song:          'Sunflower – Post Malone',
    food:          'Gulab jamun',
    animal:        'Golden retriever',
    laugh:         'The way she wheezes uncontrollably before even finishing her own punchline.',
    insideJoke:    'The 3 AM umbrella heist in pouring rain.',
    admireQuality: 'Her boundless empathy — she genuinely feels for everyone around her.',
    story:         'We met on the very first day of school and she immediately stole my eraser — and somehow my whole heart too. Been inseparable ever since, through every wild plan and late-night crisis.',
    promise:       'I promise to always be your designated panic-call receiver and snack partner!',
    message:       'Happy 19th, Hawa! Here\'s to every adventure we haven\'t had yet. The world better be ready for us. ♥',
    extra:         'She owes me that eraser, by the way.'
  },
  'Prarthana Jha': {
    oneWord:       'Luminous',
    emoji:         '✨',
    superpower:    'Telepathic Comfort',
    weather:       'Cozy Rain on a Sunday',
    song:          'Yellow – Coldplay',
    food:          'Rasgulla',
    animal:        'Deer',
    laugh:         'Her dramatic reenactments of totally mundane grocery trips.',
    insideJoke:    '"Doremon gadget" solutions to our broken college dorm problems.',
    admireQuality: 'How grounded and fiercely loyal she is no matter what.',
    story:         'Our friendship started over a shared panic about an exam we were both definitely not prepared for. Somehow we both passed, and somehow she\'s been my calm ever since.',
    promise:       'To celebrate every little milestone with you this year and always cheer the loudest.',
    message:       'Doremon, you are one of a kind — literally. Wishing you the most magical 19th birthday. May this year be everything you deserve. 🦋',
    extra:         ''
  },
  'Ayush Agrawal': {
    oneWord:       'Magnetic',
    emoji:         '⚡',
    superpower:    'Main Character Energy',
    weather:       'Electric Summer Breeze',
    song:          'Blinding Lights – The Weeknd',
    food:          'Mango pickle',
    animal:        'Butterfly',
    laugh:         'When she tries to stay serious during a scolding and immediately breaks into giggles.',
    insideJoke:    'Generator ki hasi at 2 am in the group chat.',
    admireQuality: 'Her fearlessness in being unapologetically herself.',
    story:         'She has this way of walking into a room and making everyone instantly more comfortable. I\'ve been trying to figure out how she does it for years. Still no clue.',
    promise:       'To always back your wildest business ideas no matter how crazy they sound.',
    message:       'Happy birthday, Petrol! 19 looks good on you. May it bring you everything you\'ve been manifesting. Loudly. At 2 am. In the group chat.',
    extra:         ''
  },
  'Savya Agrawal': {
    oneWord:       'Radiant',
    emoji:         '🌟',
    superpower:    'Infectious Laughter',
    weather:       'Crisp Autumn Morning',
    song:          'Dynamite – BTS',
    food:          'Chocolate lava cake',
    animal:        'Firefly',
    laugh:         'Her silent snort-laugh whenever something is actually hilarious.',
    insideJoke:    'The legendary Rs 50 samosa debt that will never be paid.',
    admireQuality: 'Her unmatched kindness and the way she makes everyone feel heard.',
    story:         'The moment I knew we\'d be friends forever was when she laughed at my terrible joke so hard she cried. She has the best laugh in the world and she uses it generously.',
    promise:       'I promise another year of terrible jokes just to see that smile.',
    message:       'Gadha, you light up every single room you walk into without even trying. 19 is going to be incredible for you. I just know it. ✨',
    extra:         'Also you owe me Rs 50 from that samosa. Just saying.'
  },
  'Roochi Sulbhewar': {
    oneWord:       'Fierce',
    emoji:         '🔥',
    superpower:    'Truth Teller / Bullshit Detector',
    weather:       'Dramatic Thunderstorm',
    song:          'Shake It Off – Taylor Swift',
    food:          'Biryani',
    animal:        'Lioness',
    laugh:         'Her sarcastic commentary during serious presentations.',
    insideJoke:    'Our top-secret survival code words.',
    admireQuality: 'Her unwavering strength and protective nature towards her people.',
    story:         'She is the person I call when I need real advice — no sugarcoating, straight truth, endless patience. She has never once let me down.',
    promise:       'To always keep your secrets safe and stand right beside you.',
    message:       'Happy 19th, Roochi! You are so much stronger than you know, and so much kinder too. This year is yours to own. 🦁',
    extra:         ''
  },
  'Ayush Dodhpachare': {
    oneWord:       'Brilliant',
    emoji:         '🐬',
    superpower:    'Photographic Memory for Lore',
    weather:       'Starlit Clear Sky',
    song:          'Levitating – Dua Lipa',
    food:          'Pani puri',
    animal:        'Dolphin',
    laugh:         'Her dance moves when her favorite food arrives at the table.',
    insideJoke:    'Remembering random things people said in 2019 verbatim.',
    admireQuality: 'Her genuine curiosity and sharp wit.',
    story:         'We bonded over the most random shared interests and never looked back. She remembers every small thing you tell her — it\'s both adorable and slightly terrifying.',
    promise:       'To always split the last pani puri with you.',
    message:       'Happy birthday! 19 suits you perfectly. Here\'s to another year of you being the most interesting person in any room. 🎉',
    extra:         ''
  },
  'Rayan Taori': {
    oneWord:       'Electric',
    emoji:         '🎨',
    superpower:    'Vibe Alchemist',
    weather:       'Tropical Rainbow Sky',
    song:          'As It Was – Harry Styles',
    food:          'Strawberry ice cream',
    animal:        'Hummingbird',
    laugh:         'When she attempts a new trend and completely improvises halfway through.',
    insideJoke:    'The mysterious playlist lore that shall never be leaked.',
    admireQuality: 'Her artistic eye and genuine warmth.',
    story:         'I genuinely cannot remember a single boring moment with Riddhi. She has this energy that just makes everything more fun. Even studying somehow.',
    promise:       'To keep curating the best late-night playlists for our drives.',
    message:       'Happy 19th! You deserve every single good thing coming your way this year. And there are a lot of good things coming — I just know it. ♥',
    extra:         'Also your playlist recommendations are always immaculate. Never change.'
  },
  'Khushi Shiwase': {
    oneWord:       'Joyful',
    emoji:         '🌸',
    superpower:    'Endless Smile',
    weather:       'Spring Blossom Breeze',
    song:          'Good as Hell – Lizzo',
    food:          'Churros',
    animal:        'Bunny',
    laugh:         'Her contagious giggle whenever something unexpected happens.',
    insideJoke:    'Our secret eye contact moments during long meetings.',
    admireQuality: 'Her positivity and the warmth she brings to everyone around her.',
    story:         'From our very first conversation, it felt like we had known each other forever. She has the kindest soul.',
    promise:       'To always be there whenever you need a boost or a long chat.',
    message:       'Happy 19th Birthday Riddhi! Wishing you immense love, endless laughter, and all the success in the world! 💖',
    extra:         ''
  },
  'Om Adhau': {
    oneWord:       'Epic',
    emoji:         '🚀',
    superpower:    'Master of Good Vibes',
    weather:       'Sunny Afternoon',
    song:          'Starboy – The Weeknd',
    food:          'Pizza',
    animal:        'Cheetah',
    laugh:         'Her reaction whenever someone tells a cheesy dad joke.',
    insideJoke:    'The inside memes only the group chat understands.',
    admireQuality: 'Her dedication and how fiercely she stands by her friends.',
    story:         'Always a blast hanging out and planning wild adventures together. A truly great friend.',
    promise:       'To make this upcoming year filled with epic memories!',
    message:       'Wishing you the happiest 19th birthday Riddhi! Have an incredible year ahead full of happiness and big wins! 🎂✨',
    extra:         ''
  }
};

/* ── ③ DOM refs ───────────────────────────────────────────── */
const grid           = document.getElementById('friendsGrid');
const overlay        = document.getElementById('overlay');
const overlayClose   = document.getElementById('overlayClose');
const overlayBackdrop= document.getElementById('overlayBackdrop');
const dcName         = document.getElementById('dcName');
const dcNick         = document.getElementById('dcNick');
const dcPhoto        = document.getElementById('dcPhoto');
const dcQA           = document.getElementById('dcQA');

/* ── ④ State ─────────────────────────────────────────────── */
let templateFriends = [];   // all potential friends from friends-data.json
let friendsList     = [];   // ONLY friends who have responded
let responses       = {};   // responses keyed by friend name

/* ── ⑤ Bootstrap & Auto-Sync ─────────────────────────── */
async function init() {
  templateFriends = await loadFriends();
  startHearts();

  if (CSV_URL) {
    await syncGoogleFormResponses();
    // Periodically re-sync every 15s so newly submitted forms appear automatically
    setInterval(syncGoogleFormResponses, 15000);
  } else {
    // Fallback if no CSV URL configured
    friendsList = [...templateFriends];
    responses = { ...DUMMY_RESPONSES };
    renderGrid();
  }
}

async function syncGoogleFormResponses() {
  try {
    // Cache-busting timestamp so Google Form updates reflect immediately
    const bustUrl = CSV_URL + (CSV_URL.includes('?') ? '&' : '?') + '_t=' + Date.now();
    const csvResponses = await loadCSV(bustUrl);

    const respondedFriends = [];
    const newResponses = {};

    // ── Build list containing ONLY people who filled the Google Form ──
    for (const [csvName, data] of Object.entries(csvResponses)) {
      if (!csvName) continue;
      const cleanName = csvName.trim();
      const csvFirst = cleanName.split(/\s+/)[0].toLowerCase();

      // Check if this respondent exists in templateFriends
      let match = templateFriends.find(f => f.name.trim().toLowerCase() === cleanName.toLowerCase());
      if (!match) {
        match = templateFriends.find(f =>
          f.name.trim().split(/\s+/)[0].toLowerCase() === csvFirst
        );
      }

      if (match) {
        respondedFriends.push({
          name: match.name,
          nickname: match.nickname || (data.oneWord ? data.oneWord.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/gi, '').trim() : ''),
          photo: match.photo
        });
        newResponses[match.name] = data;
      } else {
        // Someone not in template filled the form — include them!
        respondedFriends.push({
          name: cleanName,
          nickname: data.oneWord ? data.oneWord.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/gi, '').trim() : '',
          photo: `photos/${csvFirst}.png`
        });
        newResponses[cleanName] = data;
      }
    }

    friendsList = respondedFriends;
    responses = newResponses;

    renderGrid();
  } catch (err) {
    console.warn('[friends.js] Auto-sync check failed — using fallback data.', err);
    if (friendsList.length === 0) {
      friendsList = [...templateFriends];
      responses = { ...DUMMY_RESPONSES };
      renderGrid();
    }
  }
}

/* ── ⑥ Load friends list (local JSON) ───────────────────── */
async function loadFriends() {
  try {
    const res = await fetch('data/friends-data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[friends.js] Could not load friends-data.json', err);
    return [];
  }
}

/* ── ⑦ Load + parse published Google Sheets CSV ─────────── */
async function loadCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download:       true,
      header:         false, // Parse raw rows so duplicate column headers in Google Sheet don't overwrite
      skipEmptyLines: true,
      complete(results) {
        if (!results.data || results.data.length < 2) {
          return resolve({});
        }

        const headers = results.data[0].map(h => (h || '').trim());
        const map = {};

        // Parse each respondent's row
        for (let r = 1; r < results.data.length; r++) {
          const row = results.data[r];
          if (!row || row.length === 0) continue;

          let name = '';
          const entry = {
            oneWord:       '',
            emoji:         '',
            superpower:    '',
            weather:       '',
            song:          '',
            food:          '',
            animal:        '',
            laugh:         '',
            insideJoke:    '',
            admireQuality: '',
            story:         '',
            promise:       '',
            message:       '',
            extra:         ''
          };

          for (let c = 0; c < headers.length; c++) {
            const h = (headers[c] || '').toLowerCase();
            const val = (row[c] || '').trim();
            if (!val) continue;

            if (h.includes('your name') && !name) {
              name = val;
            } else if (h.includes('one word')) {
              entry.oneWord = val;
            } else if (h.includes('emoji')) {
              entry.emoji = val;
            } else if (h.includes('superpower')) {
              entry.superpower = val;
            } else if (h.includes('weather')) {
              entry.weather = val;
            } else if (h.includes('song')) {
              entry.song = val;
            } else if (h.includes('dessert') || h.includes('food')) {
              entry.food = val;
            } else if (h.includes('animal') || h.includes('character')) {
              entry.animal = val;
            } else if (h.includes('laugh')) {
              entry.laugh = val;
            } else if (h.includes('inside joke') || h.includes('joke')) {
              entry.insideJoke = val;
            } else if (h.includes('quality') || h.includes('admire')) {
              entry.admireQuality = val;
            } else if (h.includes('became friends') || h.includes('first memory') || h.includes('only you know')) {
              entry.story = val;
            } else if (h.includes('promise') || h.includes('year ahead')) {
              entry.promise = val;
            } else if (h.includes('birthday message') || h.includes('wish for her')) {
              entry.message = val;
            } else if (h.includes('anything else')) {
              entry.extra = val;
            }
          }

          if (name) {
            map[name] = entry;
          }
        }

        resolve(map);
      },
      error: reject
    });
  });
}

/* ── ⑧ Render the polaroid grid ─────────────────────────── */
function renderGrid() {
  grid.innerHTML = '';
  friendsList.forEach((friend, i) => {
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Open ${friend.name}'s card`);

    /* photo or initials avatar */
    const imgWrap = document.createElement('div');
    imgWrap.className = 'friend-card__img-wrap';

    const img = document.createElement('img');
    img.className = 'friend-card__img';
    img.alt = friend.name;
    img.src = friend.photo;
    img.onerror = () => {
      imgWrap.innerHTML = initialsAvatar(friend.name);
    };

    imgWrap.appendChild(img);

    /* text info */
    const info = document.createElement('div');
    info.className = 'friend-card__info';

    const nameEl = document.createElement('p');
    nameEl.className = 'friend-card__name';
    nameEl.textContent = friend.name.split(' ')[0];   // first name only on card

    info.appendChild(nameEl);

    if (friend.nickname) {
      const nick = document.createElement('p');
      nick.className = 'friend-card__nick';
      nick.textContent = friend.nickname;
      info.appendChild(nick);
    }

    card.appendChild(imgWrap);
    card.appendChild(info);

    /* click / keyboard → open overlay */
    card.addEventListener('click', () => openOverlay(friend));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOverlay(friend); }
    });

    grid.appendChild(card);
  });
}

/* ── ⑨ Initials avatar (SVG, purple palette) ─────────────── */
function initialsAvatar(name) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);

  /* cycle through a few lavender tones */
  const bgs = ['#e9d5ff', '#ddd6fe', '#f3e8ff', '#ede9fe'];
  const idx  = name.length % bgs.length;

  return `<svg class="avatar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="100" height="100" fill="${bgs[idx]}"/>
    <text x="50" y="62" text-anchor="middle"
      font-family="'Caveat', cursive" font-size="36" font-weight="700"
      fill="#7e22ce">${initials.toUpperCase()}</text>
  </svg>`;
}

/* ── ⑩ Open the detail overlay ──────────────────────────── */
function openOverlay(friend) {
  const resp = responses[friend.name];

  /* — name / nick — */
  dcName.textContent = friend.name;
  dcNick.textContent = friend.nickname || '';
  dcNick.style.display = friend.nickname ? '' : 'none';

  /* — photo — */
  dcPhoto.src = friend.photo;
  dcPhoto.alt = friend.name;
  dcPhoto.onerror = () => {
    const wrap = dcPhoto.parentElement;
    wrap.innerHTML = initialsAvatar(friend.name);
  };

  /* — Q&A — */
  dcQA.innerHTML = '';

  if (!resp) {
    /* empty state */
    dcQA.innerHTML = `
      <div class="empty-state">
        <span class="empty-state__icon">🕊️</span>
        <p class="empty-state__text">answers coming soon…</p>
      </div>`;
  } else {
    /* one-word */
    if (resp.oneWord) {
      dcQA.appendChild(makeQARow(
        'one word for her ✨',
        `<em class="qa-highlight">${esc(resp.oneWord)}</em>`
      ));
    }

    /* Vibe trio: emoji / superpower / weather */
    if (resp.emoji || resp.superpower || resp.weather) {
      const trioSection = document.createElement('div');
      trioSection.className = 'qa-row';

      const label = document.createElement('span');
      label.className = 'qa-label';
      label.textContent = 'her vibe 🌦️';

      const trio = document.createElement('div');
      trio.className = 'qa-trio';

      if (resp.emoji)      trio.appendChild(makeTrioItem('an emoji',      resp.emoji));
      if (resp.superpower) trio.appendChild(makeTrioItem('a superpower',  resp.superpower));
      if (resp.weather)    trio.appendChild(makeTrioItem('a weather',     resp.weather));

      trioSection.appendChild(label);
      trioSection.appendChild(trio);
      dcQA.appendChild(trioSection);
    }

    /* Match trio: song / food / animal */
    if (resp.song || resp.food || resp.animal) {
      const trioSection = document.createElement('div');
      trioSection.className = 'qa-row';

      const label = document.createElement('span');
      label.className = 'qa-label';
      label.textContent = 'if she were… 🎵';

      const trio = document.createElement('div');
      trio.className = 'qa-trio';

      if (resp.song)   trio.appendChild(makeTrioItem('a song',        resp.song));
      if (resp.food)   trio.appendChild(makeTrioItem('a food',        resp.food));
      if (resp.animal) trio.appendChild(makeTrioItem('an animal',     resp.animal));

      trioSection.appendChild(label);
      trioSection.appendChild(trio);
      dcQA.appendChild(trioSection);
    }

    /* story / how we became friends / first memory */
    if (resp.story) {
      dcQA.appendChild(makeQARow('how they became friends 🤍', esc(resp.story)));
    }

    /* laughter / hilarious moment */
    if (resp.laugh) {
      dcQA.appendChild(makeQARow('what always makes them laugh 😂', esc(resp.laugh)));
    }

    /* inside joke */
    if (resp.insideJoke) {
      dcQA.appendChild(makeQARow('best inside joke 🤭', esc(resp.insideJoke)));
    }

    /* quality admired */
    if (resp.admireQuality) {
      dcQA.appendChild(makeQARow('one quality admired most 🤍', esc(resp.admireQuality)));
    }

    /* promise / wish for year ahead */
    if (resp.promise) {
      dcQA.appendChild(makeQARow('a promise for the year ahead 🌟', esc(resp.promise)));
    }

    /* birthday message */
    if (resp.message) {
      const row = makeQARow('birthday message 🎂', esc(resp.message));
      row.classList.add('qa-row--message');
      dcQA.appendChild(row);
    }

    /* extra (optional — only show if filled) */
    if (resp.extra) {
      dcQA.appendChild(makeQARow('anything else 💭', esc(resp.extra)));
    }
  }

  /* — show overlay — */
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  /* refocus to close button */
  requestAnimationFrame(() => overlayClose.focus());

  /* heart-burst confetti */
  spawnHeartBurst();
}

/* helpers */
function makeQARow(labelText, answerHTML) {
  const row = document.createElement('div');
  row.className = 'qa-row';
  row.innerHTML = `
    <span class="qa-label">${labelText}</span>
    <p class="qa-answer">${answerHTML}</p>`;
  return row;
}

function makeTrioItem(labelText, value) {
  const item = document.createElement('div');
  item.className = 'qa-trio-item';
  item.innerHTML = `
    <span class="qa-label">${esc(labelText)}</span>
    <p class="qa-answer">${esc(value)}</p>`;
  return item;
}

/* safe text escaping */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

/* ── ⑪ Close overlay ─────────────────────────────────────── */
function closeOverlay() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

overlayClose.addEventListener('click', closeOverlay);
overlayBackdrop.addEventListener('click', closeOverlay);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
});

/* ── ⑫ Heart-burst confetti ──────────────────────────────── */
function spawnHeartBurst() {
  const HEARTS   = ['♥', '♡', '✦', '✿', '❀'];
  const COLORS   = ['#c084fc', '#e879f9', '#a855f7', '#f5d0fe', '#9333ea', '#ffcf6a'];
  const COUNT    = 18;
  const cx       = window.innerWidth  / 2;
  const cy       = window.innerHeight / 2;

  for (let i = 0; i < COUNT; i++) {
    const el    = document.createElement('span');
    el.className = 'confetti-heart';
    el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    el.style.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.left   = cx + 'px';
    el.style.top    = cy + 'px';

    const angle = (360 / COUNT) * i + (Math.random() - .5) * 30;
    const dist  = 80 + Math.random() * 120;
    const rad   = (angle * Math.PI) / 180;
    const tx    = Math.cos(rad) * dist;
    const ty    = Math.sin(rad) * dist - 30;
    const r     = (Math.random() - .5) * 50 + 'deg';
    const r2    = (Math.random() - .5) * 120 + 'deg';

    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.setProperty('--r',  r);
    el.style.setProperty('--r2', r2);
    el.style.animationDelay = Math.random() * 0.15 + 's';
    el.style.fontSize = (0.9 + Math.random() * 0.8) + 'rem';

    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ── ⑬ Floating hearts canvas (background animation) ─────── */
function startHearts() {
  const canvas = document.getElementById('heartsCanvas');
  const ctx    = canvas.getContext('2d');

  const PALETTE = ['#c084fc', '#e879f9', '#a855f7', '#f5d0fe', '#9333ea', '#ddd6fe', '#ede9fe'];
  const MAX     = 28;
  let   particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* draw a heart shape centered at (x,y) with half-size s */
  function drawHeart(x, y, s, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x,       y - s,   x + s*1.4, y - s,   x + s*1.4, y + s*.4);
    ctx.bezierCurveTo(x + s*1.4, y + s*1.3, x,   y + s*2,   x, y + s*2);
    ctx.bezierCurveTo(x,   y + s*2,   x - s*1.4, y + s*1.3, x - s*1.4, y + s*.4);
    ctx.bezierCurveTo(x - s*1.4, y - s,   x, y - s,         x, y);
    ctx.fill();
    ctx.restore();
  }

  function spawnParticle() {
    return {
      x:     Math.random() * canvas.width,
      y:     canvas.height + 20,
      s:     3 + Math.random() * 7,
      speed: 0.5 + Math.random() * 0.8,
      drift: (Math.random() - .5) * 0.4,
      alpha: 0.15 + Math.random() * 0.35,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      life:  0
    };
  }

  /* seed initial particles spread across the screen */
  for (let i = 0; i < MAX; i++) {
    const p = spawnParticle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* top up to MAX */
    while (particles.length < MAX) particles.push(spawnParticle());

    particles = particles.filter(p => {
      p.y    -= p.speed;
      p.x    += p.drift;
      p.life += 1;

      /* fade in first 60 frames, fade out last 60 */
      const fade = Math.min(p.life / 60, 1) * Math.min((canvas.height - p.y < 0 ? 1 : (canvas.height - p.y) / 60), 1);
      drawHeart(p.x, p.y, p.s, p.alpha * fade, p.color);

      return p.y > -30;
    });

    requestAnimationFrame(tick);
  }

  tick();
}

/* ── ⑭ Go! ───────────────────────────────────────────────── */
init();

/* ── ⑮ Back-link exit transition ─────────────────────────
   Clicking "← back" plays the same purple bloom ripple in
   reverse (expanding from the button), then navigates back.
─────────────────────────────────────────────────────────── */
document.addEventListener('click', function(e) {
  const link = e.target.closest('a.nav-btn');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href) return;

  e.preventDefault();

  const rect = link.getBoundingClientRect();
  const ox = ((rect.left + rect.width  / 2) / window.innerWidth  * 100).toFixed(1) + '%';
  const oy = ((rect.top  + rect.height / 2) / window.innerHeight * 100).toFixed(1) + '%';

  /* hearts burst */
  const HEARTS  = ['♥','♡','✦','✿','❀'];
  const COLOURS = ['#f5d0fe','#e9d5ff','#c084fc','#ffe1a0','#faf5ff'];
  for (let i = 0; i < 12; i++) {
    const h     = document.createElement('span');
    h.textContent = HEARTS[i % HEARTS.length];
    const angle = (360 / 12) * i;
    const dist  = 50 + Math.random() * 70;
    const rad   = angle * Math.PI / 180;
    h.style.cssText = `
      position:fixed;
      left:${rect.left + rect.width/2}px;
      top:${rect.top   + rect.height/2}px;
      font-size:${0.8 + Math.random()}rem;
      color:${COLOURS[Math.floor(Math.random() * COLOURS.length)]};
      pointer-events:none; z-index:10000;
      transform:translate(0,0) scale(0.3); opacity:1;
      transition: transform 0.5s cubic-bezier(0.2,0.7,0.2,1),
                  opacity   0.5s ease;
    `;
    document.body.appendChild(h);
    requestAnimationFrame(() => {
      h.style.transform = `translate(${Math.cos(rad)*dist}px, ${Math.sin(rad)*dist}px) scale(1)`;
      h.style.opacity   = '0';
    });
    setTimeout(() => h.remove(), 550);
  }

  /* bloom overlay */
  const veil = document.createElement('div');
  veil.style.cssText = `
    position:fixed; inset:0; z-index:9999; pointer-events:none;
    background: radial-gradient(circle at ${ox} ${oy},
      #c084fc 0%, #9333ea 30%, #581c87 60%, #2e1065 100%);
    clip-path: circle(0% at ${ox} ${oy});
    transition: clip-path 0.65s cubic-bezier(0.4,0,0.2,1);
  `;
  document.body.appendChild(veil);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      veil.style.clipPath = `circle(150% at ${ox} ${oy})`;
    });
  });

  setTimeout(() => { window.location.href = href; }, 680);
});
