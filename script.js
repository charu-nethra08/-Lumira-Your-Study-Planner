// ════════════════════════════════════════════════════════════
//  LUMIRA STUDY PLANNER — script.js
// ════════════════════════════════════════════════════════════

let tasks     = JSON.parse(localStorage.getItem('lum_tasks')     || '[]');
let subjects  = JSON.parse(localStorage.getItem('lum_subjects')  || '[]');
let timetable = JSON.parse(localStorage.getItem('lum_timetable') || '{}');
let pomoCount = parseInt(localStorage.getItem('lum_pomo')        || '0');

function save() {
  localStorage.setItem('lum_tasks',     JSON.stringify(tasks));
  localStorage.setItem('lum_subjects',  JSON.stringify(subjects));
  localStorage.setItem('lum_timetable', JSON.stringify(timetable));
  localStorage.setItem('lum_pomo',      pomoCount);
}

// ── Notification Banner ───────────────────────────────────────
function showNotif(msg, type = 'success') {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// ── Format date dd/mm/yyyy ────────────────────────────────────
function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ── Live date display ─────────────────────────────────────────
(function initDate() {
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const now = new Date();
  document.getElementById('date-display').textContent =
    `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
})();

// ── Daily motivational quote ──────────────────────────────────
const QUOTES = [
  "We may encounter many defeats but we must not be defeated. — Maya Angelou",
  "You must do the thing you think you cannot do. — Eleanor Roosevelt",
  "She remembered who she was and the game changed. — Lalah Delia",
  "I am not afraid of storms, for I'm learning how to sail my ship. — Louisa May Alcott",
  "If you don't like something, change it. If you can't change it, change your attitude. — Maya Angelou",
  "Don't sit down and wait for opportunities to come. Get up and make them. — Madam C.J. Walker",
  "The most courageous act is still to think for yourself. Aloud. — Coco Chanel",
  "I raise up my voice – not so I can shout but so that those without a voice can be heard. — Malala Yousafzai",
];

const QUOTE_VERSION = '2';

(function showQuote() {
  const today         = new Date().toDateString();
  const storedDate    = localStorage.getItem('lum_quote_date');
  const storedVersion = localStorage.getItem('lum_quote_version');
  let q;
  if (storedDate === today && storedVersion === QUOTE_VERSION) {
    q = localStorage.getItem('lum_quote_text');
  } else {
    q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    localStorage.setItem('lum_quote_date',    today);
    localStorage.setItem('lum_quote_text',    q);
    localStorage.setItem('lum_quote_version', QUOTE_VERSION);
  }
  document.getElementById('quote-text').textContent = '✨  ' + q;
})();

// ════════════════════════════════════════════════════════════
//  TABS
// ════════════════════════════════════════════════════════════
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'progress')  renderProgress();
  if (name === 'timetable') renderTimetable();
}

// ════════════════════════════════════════════════════════════
//  TASKS
// ════════════════════════════════════════════════════════════

const SUBJ_EMOJI = {
  Maths:'📐', Physics:'⚗️', Chemistry:'🧪', Biology:'🌿',
  English:'📖', History:'🏛️', CS:'💻', Other:'📌'
};

function addTask() {
  const desc = document.getElementById('task-desc').value.trim();
  if (!desc) { showNotif('Please enter a task description! 📝', 'error'); return; }

  tasks.unshift({
    id:       Date.now(),
    subject:  document.getElementById('task-subject').value,
    desc,
    date:     document.getElementById('task-date').value,
    priority: document.getElementById('task-priority').value,
    done:     false,
    created:  new Date().toISOString()
  });

  save();
  renderTasks();
  updateStats();
  renderOverallProgress();
  document.getElementById('task-desc').value = '';
  showNotif('Task added! 🎉');
}

function toggleTask(id) {
  const t = tasks.find(x => Number(x.id) === Number(id));
  if (t) { t.done = !t.done; save(); renderTasks(); updateStats(); renderOverallProgress(); }
}

function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  tasks = tasks.filter(x => Number(x.id) !== Number(id));
  save(); renderTasks(); updateStats(); renderOverallProgress();
  showNotif('Task deleted 🗑️', 'info');
}

function renderTasks() {
  const ul = document.getElementById('task-list');
  if (!tasks.length) {
    ul.innerHTML = '<li class="empty-state"><span class="big-emoji">🌙</span>No tasks yet! Add one on the left.</li>';
    return;
  }

  const PRIORITY_LABEL = { high:'🔴 High', medium:'🟡 Medium', low:'🟢 Low' };

  ul.innerHTML = tasks.map(t => `
    <li class="task-item ${t.done ? 'done' : ''} priority-${t.priority}">
      <div class="task-check" onclick="toggleTask(${t.id})">${t.done ? '✓' : ''}</div>
      <div class="task-body">
        <div class="task-desc-text">${t.desc}</div>
        <div class="task-meta">
          <span class="tag">${SUBJ_EMOJI[t.subject] || '📌'} ${t.subject}</span>
          ${t.date ? `<span class="tag">📅 ${formatDate(t.date)}</span>` : ''}
          <span class="tag priority-tag ${t.priority}">${PRIORITY_LABEL[t.priority]}</span>
        </div>
      </div>
      <button class="task-del-btn" onclick="deleteTask(${t.id})" title="Delete">🗑</button>
    </li>
  `).join('');
}

function updateStats() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-done').textContent    = done;
  document.getElementById('stat-pending').textContent = total - done;
}

// ════════════════════════════════════════════════════════════
//  TIMETABLE
// ════════════════════════════════════════════════════════════

const TIME_SLOTS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM',
  '4:00 PM','5:00 PM','6:00 PM','7:00 PM'
];
const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];

let activeSlot = null;

function addSubject() {
  const name  = document.getElementById('sub-name').value.trim();
  const color = document.getElementById('sub-color').value;
  if (!name) { showNotif('Enter a subject name!', 'error'); return; }
  if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
    showNotif('Subject already exists!', 'error'); return;
  }
  subjects.push({ name, color });
  save();
  renderSubjectChips();
  renderTimetable();
  document.getElementById('sub-name').value = '';
  showNotif(`"${name}" added! 🎨`);
}

function removeSubject(name) {
  subjects = subjects.filter(s => s.name !== name);
  for (const key in timetable) {
    if (timetable[key] === name) delete timetable[key];
  }
  save();
  renderSubjectChips();
  renderTimetable();
  showNotif(`"${name}" removed.`, 'info');
}

function renderSubjectChips() {
  const container = document.getElementById('subject-chips');
  if (!subjects.length) {
    container.innerHTML = '<span style="color:var(--text-muted);font-size:.82rem">No subjects yet. Add one above!</span>';
    return;
  }
  container.innerHTML = subjects.map(s => `
    <span class="chip" style="background:${s.color}22;border:1.5px solid ${s.color};color:${s.color}">
      ${s.name}
      <span class="chip-del" onclick="removeSubject('${s.name}')" title="Remove">×</span>
    </span>
  `).join('');
}

function renderTimetable() {
  const tbody = document.getElementById('timetable-body');
  tbody.innerHTML = TIME_SLOTS.map(time => `
    <tr>
      <td class="time-cell">${time}</td>
      ${WEEK_DAYS.map(day => {
        const key  = `${time}__${day}`;
        const subj = timetable[key] || '';
        const sObj = subjects.find(s => s.name === subj);
        const style = sObj
          ? `background:${sObj.color}22;border-left:3px solid ${sObj.color};color:${sObj.color};font-weight:700`
          : '';
        return `
          <td class="slot-cell ${subj ? 'filled' : ''}"
              onclick="openModal('${time}','${day}')"
              style="${style}">
            ${subj || '<span class="slot-empty">+</span>'}
          </td>`;
      }).join('')}
    </tr>
  `).join('');
}

function openModal(time, day) {
  activeSlot = { time, day };
  const sel = document.getElementById('modal-subject');
  sel.innerHTML = '<option value="">-- empty --</option>' +
    subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  sel.value = timetable[`${time}__${day}`] || '';
  document.getElementById('slot-modal').style.display = 'flex';
}

function saveSlot() {
  if (!activeSlot) return;
  const key   = `${activeSlot.time}__${activeSlot.day}`;
  const value = document.getElementById('modal-subject').value;
  if (value) timetable[key] = value;
  else delete timetable[key];
  save();
  renderTimetable();
  closeModal();
  showNotif('Schedule updated! 📅');
}

function closeModal() {
  document.getElementById('slot-modal').style.display = 'none';
  activeSlot = null;
}

document.getElementById('slot-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ════════════════════════════════════════════════════════════
//  PROGRESS
// ════════════════════════════════════════════════════════════

const FALLBACK_COLORS = ['#7c6af7','#f78166','#56d364','#e3b341','#58a6ff','#bc8cff','#ff7b72','#3fb950'];

function renderProgress() {
  const container = document.getElementById('progress-container');

  const allSubjects = [...new Set([
    ...tasks.map(t => t.subject),
    ...subjects.map(s => s.name)
  ])];

  if (!allSubjects.length) {
    container.innerHTML = '<div class="empty-state"><span class="big-emoji">📭</span>Add subjects &amp; tasks to see progress!</div>';
    return;
  }

  container.innerHTML = allSubjects.map((subj, i) => {
    const subjTasks = tasks.filter(t => t.subject.toLowerCase() === subj.toLowerCase());
    const total     = subjTasks.length;
    const done      = subjTasks.filter(t => t.done).length;
    const pct       = total ? Math.round((done / total) * 100) : 0;
    const sObj      = subjects.find(s => s.name.toLowerCase() === subj.toLowerCase());
    const color     = sObj ? sObj.color : FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    const emoji     = SUBJ_EMOJI[subj] || '📌';

    let badgeClass, badgeText;
    if (total === 0)      { badgeClass = 'badge-none';     badgeText = 'No Tasks'; }
    else if (pct === 100) { badgeClass = 'badge-done';     badgeText = '✓ Complete'; }
    else if (done === 0)  { badgeClass = 'badge-none';     badgeText = 'Not Started'; }
    else                  { badgeClass = 'badge-progress'; badgeText = 'In Progress'; }

    const maxDots = Math.min(total, 20);
    const dots = total
      ? Array.from({ length: maxDots }, (_, di) =>
          `<span class="dot ${di < done ? 'dot-done' : 'dot-pending'}" style="background:${color}"></span>`
        ).join('')
      : '';

    return `
      <div class="progress-row">
        <div class="progress-header">
          <span class="progress-label">${emoji} ${subj}</span>
          <div class="progress-meta">
            <span class="progress-task-pill" style="background:${color}22;color:${color};border:1px solid ${color}55">
              ${done} / ${total} tasks
            </span>
            <span class="progress-status-badge ${badgeClass}">${badgeText}</span>
          </div>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill-new"
               id="pbar-${i}"
               style="width:0%;background:linear-gradient(90deg,${color}cc,${color});">
          </div>
          ${pct > 0
            ? `<span class="progress-bar-pct-label" id="plabel-${i}" style="right:100%">${pct}%</span>`
            : `<span class="progress-bar-zero-label">0%</span>`
          }
        </div>
        ${total > 0 ? `<div class="progress-pending-dots">${dots}</div>` : ''}
      </div>
    `;
  }).join('');

  // Double rAF: lets browser paint width:0% first, then animates to real width
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      allSubjects.forEach((subj, i) => {
        const subjTasks = tasks.filter(t => t.subject.toLowerCase() === subj.toLowerCase());
        const total     = subjTasks.length;
        const done      = subjTasks.filter(t => t.done).length;
        const pct       = total ? Math.round((done / total) * 100) : 0;
        const bar       = document.getElementById(`pbar-${i}`);
        const label     = document.getElementById(`plabel-${i}`);
        if (bar)   bar.style.width = pct + '%';
        if (label) label.style.right = (100 - pct) + '%';
      });
    });
  });
}

function renderOverallProgress() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const pctText  = document.getElementById('overall-pct-text');
  const barFill  = document.getElementById('overall-bar-fill');
  const barLabel = document.getElementById('overall-bar-label');
  const subLabel = document.getElementById('overall-sub-label');

  if (pctText)  pctText.textContent  = pct + '%';
  if (barFill)  barFill.style.width  = pct + '%';
  if (barLabel) barLabel.textContent = pct + '%';
  if (subLabel) subLabel.textContent = `${done} of ${total} tasks completed`;
}

// ════════════════════════════════════════════════════════════
//  POMODORO TIMER
// ════════════════════════════════════════════════════════════

let pomoDuration = 25 * 60;
let pomoTimeLeft  = pomoDuration;
let pomoRunning   = false;
let pomoInterval  = null;
let pomoMode      = 'focus';

const POMO_COLORS = { focus: '#7c6af7', short: '#56d364', long: '#e3b341' };
const POMO_LABELS = { focus: 'Focus Session', short: 'Short Break ☕', long: 'Long Break 🌴' };

function setMode(mode, mins, btn) {
  clearInterval(pomoInterval);
  pomoRunning  = false;
  pomoMode     = mode;
  pomoDuration = mins * 60;
  pomoTimeLeft = pomoDuration;
  document.getElementById('pomo-start-btn').textContent = '▶ Start';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('pomo-mode-label').textContent = POMO_LABELS[mode];
  updatePomoDisplay();
}

function togglePomo() {
  if (pomoRunning) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    document.getElementById('pomo-start-btn').textContent = '▶ Resume';
  } else {
    pomoRunning = true;
    document.getElementById('pomo-start-btn').textContent = '⏸ Pause';
    pomoInterval = setInterval(() => {
      pomoTimeLeft--;
      updatePomoDisplay();
      if (pomoTimeLeft <= 0) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        document.getElementById('pomo-start-btn').textContent = '▶ Start';
        if (pomoMode === 'focus') {
          pomoCount++;
          document.getElementById('pomo-count').textContent = pomoCount;
          save();
        }
        const msg = pomoMode === 'focus'
          ? '🎉 Focus session complete! Take a well-earned break!'
          : '🍅 Break over — back to it!';
        showNotif(msg);
        alert(msg);
        pomoTimeLeft = pomoDuration;
        updatePomoDisplay();
      }
    }, 1000);
  }
}

function resetPomo() {
  clearInterval(pomoInterval);
  pomoRunning  = false;
  pomoTimeLeft = pomoDuration;
  document.getElementById('pomo-start-btn').textContent = '▶ Start';
  updatePomoDisplay();
}

function updatePomoDisplay() {
  const m = String(Math.floor(pomoTimeLeft / 60)).padStart(2, '0');
  const s = String(pomoTimeLeft % 60).padStart(2, '0');
  document.getElementById('pomo-display').textContent = `${m}:${s}`;
  const pct    = pomoTimeLeft / pomoDuration;
  const color  = POMO_COLORS[pomoMode] || '#7c6af7';
  const circle = document.getElementById('pomo-circle');
  circle.style.background =
    `conic-gradient(${color} 0% ${pct * 100}%, #2a2d3a ${pct * 100}% 100%)`;
}

// ── Study Tips ────────────────────────────────────────────────
const TIPS = [
  "🧠 Use active recall — test yourself instead of re-reading notes.",
  "⏱️ Study in focused 25-min blocks, then take a 5-min break (Pomodoro!).",
  "✍️ Handwriting notes boosts retention vs typing on a laptop.",
  "🌙 Sleep is when your brain consolidates memories — don't skip it!",
  "🎯 Set one clear goal before every study session.",
  "🥤 Stay hydrated — even mild dehydration hurts concentration.",
  "📵 Put your phone face-down or in another room while studying.",
  "🔁 Spaced repetition: review material after 1 day, 3 days, then 1 week.",
];

function renderTips() {
  document.getElementById('tips-list').innerHTML =
    TIPS.map(tip => `<div class="tip-item">${tip}</div>`).join('');
}

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
(function init() {
  document.getElementById('task-date').valueAsDate = new Date();
  renderTasks();
  updateStats();
  renderOverallProgress();
  renderSubjectChips();
  renderTimetable();
  renderTips();
  updatePomoDisplay();
  document.getElementById('pomo-count').textContent = pomoCount;
})();
