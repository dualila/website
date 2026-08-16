
//   <script type="module" src="js/calendar.js"></script>

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, query, where,
         doc, updateDoc, deleteDoc, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA25PaWUE39RuX-huMHoziQVUPy_pNFXUE",
      authDomain: "dot-com-44502.firebaseapp.com",
      projectId: "dot-com-44502",
      storageBucket: "dot-com-44502.firebasestorage.app",
      messagingSenderId: "124684406308",
      appId: "1:124684406308:web:146706a03bb4bd451552b1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventsCol = collection(db, 'events');

const $ = id => document.getElementById(id);

// ── state ───────────────────────────────────────────────────
let view = new Date(); view.setDate(1);
let selected = null;
let byDate = {};

const grid       = $('grid');
const monthLabel = $('month-label');
const dayPanel   = $('day-panel');

const MONTHS = ['January','February','March','April','May','June','July',
                'August','September','October','November','December'];
const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const pad = n => String(n).padStart(2,'0');
const fmt = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;
const todayStr = () => { const t=new Date(); return fmt(t.getFullYear(),t.getMonth(),t.getDate()); };
const esc = s => (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// open on today by default
selected = todayStr();

function render(){
  if(!grid) return;
  const y = view.getFullYear(), m = view.getMonth();
  if(monthLabel) monthLabel.textContent = `${MONTHS[m]} ${y}`;
  grid.innerHTML = '';
  DOW.forEach(d => { const h=document.createElement('div'); h.className='dow'; h.textContent=d; grid.appendChild(h); });

  const lead = (new Date(y,m,1).getDay() + 6) % 7;   // monday-start
  const days = new Date(y, m+1, 0).getDate();
  for(let i=0;i<lead;i++){ const b=document.createElement('div'); b.className='cell blank'; grid.appendChild(b); }

  const tstr = todayStr();
  for(let d=1; d<=days; d++){
    const ds = fmt(y,m,d);
    const cell = document.createElement('div');
    cell.className = 'cell';
    if(ds === tstr) cell.classList.add('today');
    if(byDate[ds]?.length) cell.classList.add('has-events');
    if(ds === selected) cell.classList.add('sel');
    cell.innerHTML = `<span class="num">${d}</span>`;
    if(byDate[ds]?.length){
      const dot = document.createElement('span'); dot.className='dot'; dot.textContent='●'; cell.appendChild(dot);
    }
    cell.addEventListener('click', () => { selected = ds; render(); showDay(ds); });
    grid.appendChild(cell);
  }
}

async function showDay(ds){
  if(!dayPanel) return;

  dayPanel.hidden = false;

  const n = new Date(ds + 'T00:00:00');
  const day = n.getDate();
  const month = n.getMonth();
  const year = n.getFullYear();

  const dateTitle =
    `${DOW[(n.getDay()+6)%7]} ${day} ${MONTHS[month]} ${year}`;

  dayPanel.innerHTML = `
    <h2>${dateTitle}</h2>

    <div class="day-facts">
      <div>
        <span>sunrise</span>
        <strong id="sunrise">loading...</strong>
      </div>

      <div>
        <span>sunset</span>
        <strong id="sunset">loading...</strong>
      </div>

      <div>
        <span>moon</span>
        <strong id="moon">loading...</strong>
      </div>
    </div>

    <div class="history-section">
      <h3>on this day</h3>
      <div id="history">loading...</div>
    </div>

    <div class="calendar-events">
      <h3>what's happening</h3>
      <div id="events"></div>
    </div>

    <div class="day-nav">
      <button id="prev-day">◄ ${previousDateLabel(ds)}</button>
      <button id="next-day">${nextDateLabel(ds)} ►</button>
    </div>
  `;

  // Your submitted calendar events
  const list = byDate[ds] || [];
  const eventsEl = $('events');

  if(!list.length){
    eventsEl.innerHTML =
      `<p style="color:var(--cal-dim)">nothing on this day (yet !!!)</p>`;
  } else {
    eventsEl.innerHTML = list.map(e =>
      `<div class="ev">
        <strong>${esc(e.title)}</strong>
        ${e.time ? ` · ${esc(e.time)}` : ''}
        ${e.desc ? `<div class="ev-desc">${esc(e.desc)}</div>` : ''}
        ${e.submittedBy ? `<div class="ev-by">— ${esc(e.submittedBy)}</div>` : ''}
      </div>`
    ).join('');
  }

  // Astronomy
  loadSunTimes(ds);
  showMoonPhase(ds);

  // Historical information
  loadHistory(month + 1, day);

  // Previous / next day
  $('prev-day').onclick = () => {
    const d = new Date(ds + 'T00:00:00');
    d.setDate(d.getDate() - 1);

    const newDate = fmt(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    );

    selected = newDate;

    // Change month automatically when crossing month boundaries
    view = new Date(d.getFullYear(), d.getMonth(), 1);

    render();
    showDay(newDate);
  };

  $('next-day').onclick = () => {
    const d = new Date(ds + 'T00:00:00');
    d.setDate(d.getDate() + 1);

    const newDate = fmt(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    );

    selected = newDate;
    view = new Date(d.getFullYear(), d.getMonth(), 1);

    render();
    showDay(newDate);
  };
}
function previousDateLabel(ds){
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() - 1);

  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function nextDateLabel(ds){
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() + 1);

  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// sunrise / sunset

const MELBOURNE_LAT = -37.8136;
const MELBOURNE_LON = 144.9631;
async function loadSunTimes(ds){
  const sunriseEl = $('sunrise');
  const sunsetEl = $('sunset');

  try {
    const url =
      `https://api.sunrise-sunset.org/json` +
      `?lat=${MELBOURNE_LAT}` +
      `&lng=${MELBOURNE_LON}` +
      `&date=${ds}` +
      `&formatted=0`;

    const response = await fetch(url);
    const data = await response.json();

    if(data.status !== 'OK') throw new Error('sun API failed');

    const sunrise = new Date(data.results.sunrise);
    const sunset = new Date(data.results.sunset);

    sunriseEl.textContent = sunrise.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Melbourne'
    });

    sunsetEl.textContent = sunset.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Melbourne'
    });

  } catch(err) {
    console.error(err);
    sunriseEl.textContent = 'unavailable';
    sunsetEl.textContent = 'unavailable';
  }
}
// moon phase
function showMoonPhase(ds){
  const el = $('moon');
  if(!el) return;

  const date = new Date(ds + 'T00:00:00');

  // Known new moon: 2000-01-06
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');

  const days =
    (date.getTime() - knownNewMoon.getTime()) /
    (1000 * 60 * 60 * 24);

  const cycle = 29.53058867;
  const age = ((days % cycle) + cycle) % cycle;

  let phase;

  if(age < 1.85){
    phase = 'new moon';
  } else if(age < 7.38){
    phase = 'waxing crescent';
  } else if(age < 9.23){
    phase = 'first quarter';
  } else if(age < 14.77){
    phase = 'waxing gibbous';
  } else if(age < 16.61){
    phase = 'full moon';
  } else if(age < 22.15){
    phase = 'waning gibbous';
  } else if(age < 23.99){
    phase = 'last quarter';
  } else {
    phase = 'waning crescent';
  }

  el.textContent = phase;
}
//wikipedia
async function loadHistory(month, day){
  const historyEl = $('history');

  if(!historyEl) return;

  historyEl.innerHTML = 'loading history...';

  const mm = pad(month);
  const dd = pad(day);

  try {
    const url =
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${mm}/${dd}.json`;

    const response = await fetch(url);

    if(!response.ok){
      throw new Error(`Wikipedia request failed: ${response.status}`);
    }

    const data = await response.json();

    const events = data.events || [];

    if(!events.length){
      historyEl.innerHTML =
        `<p style="color:var(--cal-dim)">nothing particularly happened. apparently.</p>`;
      return;
    }

    // Pick a manageable number rather than dumping 100 events
    const interesting = events
      .filter(e => e.text)
      .slice(0, 8);

    historyEl.innerHTML = interesting.map(e => {
      const year = e.year || '';

      return `
        <div class="history-event">
          <span class="history-year">${esc(String(year))}</span>
          <span class="history-text">${esc(e.text)}</span>
        </div>
      `;
    }).join('');

  } catch(err) {
    console.error(err);

    historyEl.innerHTML =
      `<p style="color:var(--cal-dim)">
        couldn't retrieve the history right now !!!
      </p>`;
  }
}

// live  events
onSnapshot(query(eventsCol, where('status','==','approved')), snap => {
  byDate = {};
  snap.forEach(s => { const e = {id:s.id, ...s.data()}; (byDate[e.date] ||= []).push(e); });
  Object.values(byDate).forEach(a => a.sort((x,y) => (x.time||'').localeCompare(y.time||'')));
  render();
  if(selected) showDay(selected);
});

if($('prev')) $('prev').onclick = () => { view.setMonth(view.getMonth()-1); render(); };
if($('next')) $('next').onclick = () => { view.setMonth(view.getMonth()+1); render(); };

if($('today')) {
  $('today').onclick = () => {
    const now = new Date();

    view = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    selected = todayStr();

    render();
    showDay(selected);
  };
}

// ── suggest form ────────────────────────────────────────────
if($('s-send')){
  $('s-send').onclick = async () => {
    const title = $('s-title').value.trim();
    const date  = $('s-date').value;
    const msg   = $('s-msg');
    if(!title || !date){ if(msg) msg.textContent = 'need more info !!!'; return; }
    try{
      await addDoc(eventsCol, {
        title, date,
        time: $('s-time').value.trim(),
        desc: $('s-desc').value.trim(),
        submittedBy: $('s-by').value.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      if(msg) msg.textContent = "sent! i'll take a look thankq ♥";
      ['s-title','s-time','s-desc','s-by'].forEach(id => { if($(id)) $(id).value = ''; });
      $('s-date').value = '';
    }catch(err){ console.error(err); if(msg) msg.textContent = "hmm, that didn't send. try again?"; }
  };
}
