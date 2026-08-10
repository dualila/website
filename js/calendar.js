
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

function showDay(ds){
  if(!dayPanel) return;
  const list = byDate[ds] || [];
  dayPanel.hidden = false;
  const n = new Date(ds + 'T00:00:00');
  let html = `<h2>${DOW[(n.getDay()+6)%7]} ${n.getDate()} ${MONTHS[n.getMonth()]}</h2>`;
  if(!list.length){
    html += `<p style="color:var(--cal-dim)">nothing on this day (yet !!!)</p>`;
  } else {
    html += list.map(e => `<div class="ev"><strong>${esc(e.title)}</strong>${e.time?` · ${esc(e.time)}`:''}` +
      `${e.desc?`<div class="ev-desc">${esc(e.desc)}</div>`:''}` +
      `${e.submittedBy?`<div class="ev-by">— ${esc(e.submittedBy)}</div>`:''}</div>`).join('');
  }
  dayPanel.innerHTML = html;
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
