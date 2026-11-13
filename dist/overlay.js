import { showsSlateTime } from './slate-time.js';
import { ROWS, towerWindow, rowKeys, status } from './order.js';
const $ = id => document.getElementById(id);
let state, partnerKey, scheduleKey, tickerKey, sceneKey, orderKey;
const orderRows = new Map(), ROW = 46;
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const params = new URLSearchParams(location.search);
const only = params.get('layer');
if(params.has('capture')) document.documentElement.classList.add('capture');
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (id,v) => { if($(id).textContent !== v) $(id).textContent = v; };
function visibility(id,on) { $(id).classList.toggle('hidden',!on); }
function time() {
  if(!state)return;
  const seconds = Math.max(0,Math.ceil(state.timer.endAt ? (state.timer.endAt-Date.now())/1000 : state.timer.remaining));
  const output = (seconds>=3600 ? `${Math.floor(seconds/3600).toString().padStart(2,'0')}:` : '') + `${Math.floor(seconds/60)%60}`.padStart(2,'0')+':'+`${seconds%60}`.padStart(2,'0');
  text('timer-value',output); text('slate-time',showsSlateTime(state) ? output : '');
  $('timer').classList.toggle('expired',seconds===0);
  if(state.lowerHideAt && Date.now()>=state.lowerHideAt)visibility('lower',false);
}
// The presentation order. Rows are keyed by team, so a moved team slides to its new place.
function renderOrder(s) {
  const teams = s.teams, current = s.currentTeam ?? null, key = JSON.stringify([teams, current]);
  if (key === orderKey) return;
  orderKey = key;
  const { start } = towerWindow(teams.length, current), box = $('order-rows'), keys = rowKeys(teams);
  text('order-count', current === null ? `${teams.length} TEAMS` : `${current + 1} OF ${teams.length}`);
  box.style.height = `${Math.min(ROWS, teams.length) * ROW}px`;
  keys.forEach((rowKey, i) => {
    let row = orderRows.get(rowKey);
    if (!row) {
      row = document.createElement('div');
      row.className = 'order-row fresh';
      row.innerHTML = '<span class="pos"></span><span class="name"></span><span class="mark"></span>';
      box.appendChild(row); orderRows.set(rowKey, row);
    }
    const st = status(i, current);
    row.classList.remove('done', 'now', 'next', 'waiting'); row.classList.add(st);
    row.querySelector('.pos').textContent = String(i + 1).padStart(2, '0');
    row.querySelector('.name').textContent = teams[i];
    row.querySelector('.mark').innerHTML = st === 'done' ? CHECK : st === 'now' ? 'ON STAGE' : st === 'next' ? 'NEXT' : '';
    row.style.transform = `translateY(${(i - start) * ROW}px)`;
  });
  for (const [rowKey, row] of orderRows) if (!keys.includes(rowKey)) { row.remove(); orderRows.delete(rowKey); }
  // New rows appear in place; only rows that already existed slide.
  requestAnimationFrame(() => requestAnimationFrame(() => box.querySelectorAll('.fresh').forEach((row) => row.classList.remove('fresh'))));
}
function render(s) {
  state = s;
  const canvas = $('canvas');
  if(sceneKey !== s.scene){
    sceneKey = s.scene;
    canvas.dataset.scene = s.scene;
    canvas.classList.remove('scene-enter');
    // Restart the entrance sequence on every scene change, including live.
    void canvas.offsetWidth;
    canvas.classList.add('scene-enter');
  }
  canvas.style.setProperty('--accent',s.settings.accent);canvas.style.setProperty('--safe',s.settings.safe+'px');canvas.style.setProperty('--speed',s.settings.speed+'s');
  const on = key => s.layers[key] && (!only || only===key);
  $('lower').classList.toggle('team-lower',s.lowerPosition==='center');
  text('lower-eyebrow',s.lowerPosition==='center'?'TEAM ON STAGE':'ON STAGE');
  const partner = on('partners'), ticker = on('ticker');
  canvas.classList.toggle('bottom-bars',partner||ticker);
  canvas.style.setProperty('--bottom-offset',((partner?116:0)+(ticker?60:0))+'px');canvas.style.setProperty('--ticker-bottom',(partner?116:0)+'px');
  for(const key of Object.keys(s.layers))visibility(key,on(key));
  visibility('slate',s.scene !== 'live' && (!only || only==='slate'));
  if(s.scene !== 'live')for(const key of ['bug','lower','agenda','order'])visibility(key,false);
  if(s.scene !== 'live')visibility('timer',false);
  visibility('guides',s.settings.guides && new URLSearchParams(location.search).has('preview'));
  text('bug-title',s.event.title);text('bug-sub',s.event.subtitle);
  text('guest-name',s.guest.name);text('guest-meta',[s.guest.role,s.guest.organization].filter(Boolean).join(' / '));
  text('timer-label',s.timer.label);text('slate-event',s.event.title+' / '+s.event.subtitle);
  text('slate-title',({starting:'Starting soon',break:'Short break',ending:'Thanks for watching'})[s.scene] || '');
  text('slate-venue',s.event.venue);text('slate-dates',s.event.dates);text('ticker-label',s.announcement.label);
  const t = s.announcement.text;
  if(tickerKey!==t){
    const repetitions=Math.max(2,Math.ceil(1920/(Math.max(1,t.length)*11+190)));
    $('ticker-track').innerHTML=`<span>${esc(t)}　↗　</span>`.repeat(repetitions*2);tickerKey=t;
  }
  const p = JSON.stringify(s.partners);
  if(partnerKey!==p){
    const group=s.partners.map(p=>`<div class="partner"><div><small>${esc(p.label)}</small>${p.logo?`<img src="${esc(p.logo)}" alt="${esc(p.name)}">`:`<b>${esc(p.name)}</b>`}</div></div>`).join('');
    // Each equal-width half fills the viewport even with a single partner.
    const content = group.repeat(Math.max(1,Math.ceil(1920/Math.max(1,s.partners.length*400))));
    $('partner-track').innerHTML=`<div class="partner-group">${content}</div>`.repeat(2);partnerKey=p;
  }
  const a=JSON.stringify([s.schedule,s.activeSchedule]);
  if(scheduleKey!==a){$('agenda-items').innerHTML=s.schedule.slice(s.activeSchedule,s.activeSchedule+3).map(p=>`<div class="agenda-item"><time>${esc(p.time)}</time><div><b>${esc(p.title)}</b><span>${esc(p.day)}${p.detail?' ∙ '+esc(p.detail):''}</span></div></div>`).join('');scheduleKey=a;}
  renderOrder(s);
  time();
}
function resize(){const scale=Math.min(innerWidth/1920,innerHeight/1080);$('canvas').style.transform=`scale(${scale})`;}
addEventListener('resize',resize);resize();
const stream = new EventSource('/api/events');stream.onmessage=e=>render(JSON.parse(e.data));
// OBS and the operator preview use the same server state, including after reload.
setInterval(time,200);
