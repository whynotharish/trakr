// =====================================================
// TRAKR — app.js
// Replace the firebaseConfig below with your own.
// =====================================================

const firebaseConfig = {
apiKey: "AIzaSyDdkJ0rnj8SMiup_JHL7YLuRNe8R0kIWkY",
  authDomain: "trakr-ed77b.firebaseapp.com",
  projectId: "trakr-ed77b",
  storageBucket: "trakr-ed77b.firebasestorage.app",
  messagingSenderId: "777624663491",
  appId: "1:777624663491:web:4a83ab8da906e2116ab976"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── CONSTANTS ──
const tagKeys = ['wondermart','merch','whatsapp','comms','sql','personal','qc'];
const tagLabelsMap = { wondermart:'Wondermart', merch:'Merch', whatsapp:'Whatsapp', comms:'Comms', sql:'Sql/Dashboard', personal:'Personal', qc:'QC/Aashish' };
const tagColors = { wondermart:'#7C3AED', merch:'#E8553D', whatsapp:'#25D366', comms:'#3D7CE8', sql:'#6366F1', personal:'#F59E0B', qc:'#0D9488' };
const tagOptions = [['','Tag'], ...tagKeys.map(k => [k, tagLabelsMap[k]])];
const priorityOptions = [['','Priority'], ['p0','P0'], ['p1','P1']];
const accentColors = [
  { name:'Coral', value:'#E8553D', hover:'#D44A34' },
  { name:'Blue', value:'#3B82F6', hover:'#2563EB' },
  { name:'Violet', value:'#7C3AED', hover:'#6D28D9' },
  { name:'Emerald', value:'#10B981', hover:'#059669' },
  { name:'Amber', value:'#F59E0B', hover:'#D97706' },
  { name:'Teal', value:'#0D9488', hover:'#0F766E' }
];
const bgThemes = [
  { name:'Cream', swatch:'#FAF7F2', light:{bg:'#FAF7F2',card:'#FFFFFF',border:'#E8E4DE',doneBg:'#F0EDE8',doneTxt:'#B0AAA2',inputBg:'#FAF7F2',txtMuted:'#8A8580',txt:'#2C2C2C'}, dark:{bg:'#18181B',card:'#27272A',border:'#3F3F46',doneBg:'#1F1F23',doneTxt:'#52525B',inputBg:'#1F1F23',txtMuted:'#71717A',txt:'#E4E4E7'} },
  { name:'White', swatch:'#FFFFFF', light:{bg:'#F8F9FA',card:'#FFFFFF',border:'#E2E5E9',doneBg:'#F0F1F3',doneTxt:'#A0A5AD',inputBg:'#F8F9FA',txtMuted:'#6B7280',txt:'#1F2937'}, dark:{bg:'#111113',card:'#1E1E21',border:'#333338',doneBg:'#19191C',doneTxt:'#4B4B55',inputBg:'#19191C',txtMuted:'#6B6B78',txt:'#E5E5EA'} },
  { name:'Sky', swatch:'#EFF6FF', light:{bg:'#EFF6FF',card:'#FFFFFF',border:'#DBEAFE',doneBg:'#E8F0FE',doneTxt:'#93B4DC',inputBg:'#EFF6FF',txtMuted:'#6B85A5',txt:'#1E3A5F'}, dark:{bg:'#0C1524',card:'#152238',border:'#1E3050',doneBg:'#0F1A2E',doneTxt:'#3A5070',inputBg:'#0F1A2E',txtMuted:'#6882A5',txt:'#D0DFEF'} },
  { name:'Sage', swatch:'#F0F5F0', light:{bg:'#F0F5F0',card:'#FFFFFF',border:'#D4E4D4',doneBg:'#E6EFE6',doneTxt:'#8AAD8A',inputBg:'#F0F5F0',txtMuted:'#6B8A6B',txt:'#1A3A1A'}, dark:{bg:'#0F1A12',card:'#1A2E1E',border:'#254030',doneBg:'#121E15',doneTxt:'#3A5540',inputBg:'#121E15',txtMuted:'#5A7A60',txt:'#D0E5D5'} },
  { name:'Rose', swatch:'#FFF1F2', light:{bg:'#FFF1F2',card:'#FFFFFF',border:'#FFE4E6',doneBg:'#FEECED',doneTxt:'#D4A0A5',inputBg:'#FFF1F2',txtMuted:'#9B6B70',txt:'#4A1520'}, dark:{bg:'#1A0F10',card:'#2E1A1C',border:'#4A2830',doneBg:'#1E1215',doneTxt:'#5A3540',inputBg:'#1E1215',txtMuted:'#8A5A60',txt:'#F0D5D8'} },
  { name:'Sand', swatch:'#F5F0E8', light:{bg:'#F5F0E8',card:'#FFFFFF',border:'#E5DDD0',doneBg:'#EDE6DB',doneTxt:'#B5A890',inputBg:'#F5F0E8',txtMuted:'#8A7E6A',txt:'#3A3020'}, dark:{bg:'#1A1710',card:'#2E2A20',border:'#453E30',doneBg:'#1E1B15',doneTxt:'#554E3E',inputBg:'#1E1B15',txtMuted:'#7A7260',txt:'#E8DFD0'} }
];
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const recurDayKeys = ['sun','mon','tue','wed','thu','fri','sat'];
const recurDayLabels = ['S','M','T','W','T','F','S'];
const recurDayNames = {sun:'Sun',mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat'};

// ── STATE ──
let currentUser = null;
let currentTeam = null;
let teamMembers = {};
let tasks = [];
let currentFilter = 'all';
let currentView = localStorage.getItem('trakr_view') || 'list';
let currentAccent = JSON.parse(localStorage.getItem('trakr_theme') || 'null') || accentColors[0];
let currentBg = JSON.parse(localStorage.getItem('trakr_bg') || 'null') || bgThemes[0];
let storedDark = localStorage.getItem('trakr_dark');
let themeMode = (storedDark === 'dark' || storedDark === 'light' || storedDark === 'auto') ? storedDark : (storedDark === 'true' ? 'dark' : 'light');
let isDark = false;
let dragSrcId = null;
let unsubTasks = null;
let unsubTeam = null;
let recurDaysInput = [];
let currentEditRecurDays = [];
const systemDarkMQ = window.matchMedia('(prefers-color-scheme: dark)');

function resolveIsDark() {
  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;
  return systemDarkMQ.matches;
}

// ── DOM ──
const $ = id => document.getElementById(id);
const loadingView = $('loadingView');
const authView = $('authView');
const teamView = $('teamView');
const teamCard = $('teamCard');
const appView = $('appView');
const taskInput = $('taskInput');
const dueInput = $('dueInput');
const prioritySelect = $('prioritySelect');
const tagSelect = $('tagSelect');
const assigneeSelect = $('assigneeSelect');
const addBtn = $('addBtn');
const taskList = $('taskList');
const emptyState = $('emptyState');
const activeCount = $('activeCount');
const doneCount = $('doneCount');
const overdueCount = $('overdueCount');
const overduePill = $('overduePill');
const clearDoneBtn = $('clearDoneBtn');
const listLabel = $('listLabel');
const dateDisplay = $('dateDisplay');
const notifToggle = $('notifToggle');
const notifLabel = $('notifLabel');
const viewToggle = $('viewToggle');
const viewLabel = $('viewLabel');
const kanbanBoard = $('kanbanBoard');
const toast = $('toast');
const themePanel = $('themePanel');
const themeToggleBtn = $('themeToggleBtn');
const panelOverlay = $('panelOverlay');
const swatchesEl = $('swatches');
const bgSwatchesEl = $('bgSwatches');
const teamNamePill = $('teamNamePill');
const memberAvatars = $('memberAvatars');
const inviteTeamBtn = $('inviteTeamBtn');
const signOutBtn = $('signOutBtn');
const inviteModal = $('inviteModal');
const inviteModalContent = $('inviteModalContent');
const repeatBtn = $('repeatBtn');
const dayPicker = $('dayPicker');
const themeModeRow = $('themeModeRow');

// ── UTILS ──
function showToast(m, d = 2500) { toast.textContent = m; toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), d); }
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function linkify(text) { return text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); }
function renderText(text) { return linkify(esc(text)).replace(/\n/g, '<br>'); }
function isOverdue(t) { return t.dueAt && !t.done && t.dueAt.toDate().getTime() < Date.now(); }
function isDueSoon(t) { if (!t.dueAt || t.done) return false; const d = t.dueAt.toDate().getTime() - Date.now(); return d > 0 && d <= 3600000; }
function formatDue(ts) {
  const d = ts.toDate(), n = new Date(), tom = new Date(n); tom.setDate(tom.getDate() + 1);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === n.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === tom.toDateString()) return `Tomorrow, ${time}`;
  return `${months[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${time}`;
}
function toLocal(ts) {
  if (!ts) return '';
  const d = ts.toDate(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function dueMeta(t) { if (!t.dueAt) return ''; const c = isOverdue(t) ? ' overdue' : isDueSoon(t) ? ' due-soon' : ''; return `<span class="task-due${c}"><svg viewBox="0 0 12 12" fill="none" stroke-width="1.3"><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l2 1.5"/></svg>${formatDue(t.dueAt)}</span>`; }
function prioMeta(t) { return t.priority ? `<span class="priority-badge ${t.priority}">${t.priority.toUpperCase()}</span>` : ''; }
function assigneeMeta(t) {
  if (!t.assignee) return '';
  const m = teamMembers[t.assignee];
  if (!m) return `<span class="assignee-badge">${esc(t.assignee)}</span>`;
  return `<span class="assignee-badge"><img src="${m.avatar}" alt="">${esc(m.name.split(' ')[0])}</span>`;
}
function recurMeta(t) {
  if (!t.recurDays || !t.recurDays.length) return '';
  const label = t.recurDays.map(d => recurDayNames[d] || d).join(', ');
  return `<span class="recur-badge"><svg viewBox="0 0 16 16" stroke-width="1.5" stroke-linecap="round"><path d="M2 8a6 6 0 0111.3-2.8M14 8a6 6 0 01-11.3 2.8"/><path d="M14 2v4h-4M2 14v-4h4"/></svg>${label}</span>`;
}
function sortByDue(a) { return [...a].sort((a, b) => { if (!a.dueAt && !b.dueAt) return 0; if (!a.dueAt) return 1; if (!b.dueAt) return -1; return a.dueAt.toDate() - b.dueAt.toDate(); }); }
function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

function getNextRecurDate(rDays, refTime) {
  const dayMap = {sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayNum = today.getDay();
  const targets = rDays.map(d => dayMap[d]).filter(n => n !== undefined).sort((a,b) => a - b);
  if (!targets.length) return new Date();
  let diff = null;
  for (const t of targets) {
    const d = t - todayNum;
    if (d > 0) { diff = d; break; }
  }
  if (diff === null) diff = 7 - todayNum + targets[0];
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  if (refTime) {
    const rt = refTime instanceof Date ? refTime : refTime.toDate();
    next.setHours(rt.getHours(), rt.getMinutes(), 0, 0);
  } else {
    next.setHours(9, 0, 0, 0);
  }
  return next;
}

// ── SHOW VIEWS ──
function showView(name) {
  loadingView.style.display = 'none';
  authView.classList.remove('active');
  teamView.classList.remove('active');
  appView.classList.remove('active');
  if (name === 'auth') authView.classList.add('active');
  else if (name === 'team') teamView.classList.add('active');
  else if (name === 'app') appView.classList.add('active');
}

// ── DATE ──
const now = new Date();
dateDisplay.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

// ── THEME ──
function applyTheme() {
  isDark = resolveIsDark();
  const r = document.documentElement.style;
  r.setProperty('--accent', currentAccent.value);
  r.setProperty('--accent-hover', currentAccent.hover);
  const p = isDark ? currentBg.dark : currentBg.light;
  r.setProperty('--bg', p.bg); r.setProperty('--card', p.card); r.setProperty('--border', p.border);
  r.setProperty('--done-bg', p.doneBg); r.setProperty('--done-text', p.doneTxt);
  r.setProperty('--input-bg', p.inputBg); r.setProperty('--text-muted', p.txtMuted); r.setProperty('--text', p.txt);
  document.querySelectorAll('.logo-dot').forEach(d => d.style.background = currentAccent.value);
  document.documentElement.classList.toggle('dark', isDark);
  swatchesEl.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.color === currentAccent.value));
  bgSwatchesEl.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.color === currentBg.swatch));
  themeModeRow.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === themeMode));
  localStorage.setItem('trakr_theme', JSON.stringify(currentAccent));
  localStorage.setItem('trakr_bg', JSON.stringify(currentBg));
  localStorage.setItem('trakr_dark', themeMode);
}
accentColors.forEach(c => { const s = document.createElement('div'); s.className = 'swatch'; s.dataset.color = c.value; s.style.background = c.value; s.title = c.name; s.onclick = () => { currentAccent = c; applyTheme(); }; swatchesEl.appendChild(s); });
bgThemes.forEach(b => { const s = document.createElement('div'); s.className = 'swatch'; s.dataset.color = b.swatch; s.style.background = b.swatch; s.style.border = '1px solid #ccc'; s.title = b.name; s.onclick = () => { currentBg = b; applyTheme(); }; bgSwatchesEl.appendChild(s); });
themeModeRow.querySelectorAll('.theme-mode-btn').forEach(btn => {
  btn.onclick = () => { themeMode = btn.dataset.mode; applyTheme(); };
});
systemDarkMQ.addEventListener('change', () => { if (themeMode === 'auto') applyTheme(); });
themeToggleBtn.onclick = e => { e.stopPropagation(); themePanel.classList.toggle('open'); panelOverlay.classList.toggle('open'); };
panelOverlay.onclick = () => { themePanel.classList.remove('open'); panelOverlay.classList.remove('open'); };
applyTheme();

// ── RECURRING INPUT ──
function buildDayPicker(container, selectedDays, onChange) {
  container.innerHTML = '';
  recurDayKeys.forEach((key, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-toggle' + (selectedDays.includes(key) ? ' active' : '');
    btn.textContent = recurDayLabels[i];
    btn.onclick = () => {
      const idx = selectedDays.indexOf(key);
      if (idx > -1) selectedDays.splice(idx, 1); else selectedDays.push(key);
      btn.classList.toggle('active', selectedDays.includes(key));
      if (onChange) onChange(selectedDays);
    };
    container.appendChild(btn);
  });
}

buildDayPicker(dayPicker, recurDaysInput);
repeatBtn.onclick = () => {
  const isActive = repeatBtn.classList.toggle('active');
  dayPicker.classList.toggle('open', isActive);
  if (!isActive) { recurDaysInput.length = 0; dayPicker.querySelectorAll('.day-toggle').forEach(b => b.classList.remove('active')); }
};

// ── AUTH ──
$('googleSignIn').onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => showToast('Sign-in failed: ' + err.message));
};
signOutBtn.onclick = () => { if (unsubTasks) unsubTasks(); if (unsubTeam) unsubTeam(); auth.signOut(); };

auth.onAuthStateChanged(async user => {
  currentUser = user;
  if (!user) { showView('auth'); return; }
  const snap = await db.collection('users').doc(user.uid).get();
  if (snap.exists && snap.data().teamId) {
    loadTeam(snap.data().teamId);
  } else {
    await db.collection('users').doc(user.uid).set({ email: user.email, name: user.displayName, avatar: user.photoURL, teamId: null }, { merge: true });
    showTeamSetup();
  }
});

// ── TEAM SETUP ──
function showTeamSetup() {
  teamCard.innerHTML = `
    <div class="logo">Trakr<span class="logo-dot"></span></div>
    <p>Hey ${esc(currentUser.displayName.split(' ')[0])}! Create a team or join one.</p>
    <h2>Create Team</h2>
    <input class="team-input" id="newTeamName" placeholder="Team name (e.g. Marketing)">
    <button class="team-btn" id="createTeamBtn">Create Team</button>
    <div class="divider">or</div>
    <h2>Join Team</h2>
    <input class="team-input" id="joinCode" placeholder="Enter invite code">
    <button class="team-btn secondary" id="joinTeamBtn">Join Team</button>
  `;
  showView('team');
  document.querySelector('.logo-dot').style.background = currentAccent.value;

  $('createTeamBtn').onclick = async () => {
    const name = $('newTeamName').value.trim();
    if (!name) return showToast('Enter a team name');
    const code = genCode();
    const ref = await db.collection('teams').add({
      name, inviteCode: code, createdBy: currentUser.uid,
      members: { [currentUser.email]: { name: currentUser.displayName, avatar: currentUser.photoURL, role: 'admin' } }
    });
    await db.collection('users').doc(currentUser.uid).update({ teamId: ref.id });
    loadTeam(ref.id);
  };

  $('joinTeamBtn').onclick = async () => {
    const code = $('joinCode').value.trim().toUpperCase();
    if (!code) return showToast('Enter an invite code');
    const snap = await db.collection('teams').where('inviteCode', '==', code).get();
    if (snap.empty) return showToast('Invalid invite code');
    const teamDoc = snap.docs[0];
    await teamDoc.ref.set({
      members: {
        [currentUser.email]: {
          name: currentUser.displayName,
          avatar: currentUser.photoURL,
          role: 'member'
        }
      }
    }, { merge: true });
    await db.collection('users').doc(currentUser.uid).update({ teamId: teamDoc.id });
    loadTeam(teamDoc.id);
  };
}

// ── LOAD TEAM ──
function loadTeam(teamId) {
  showView('app');
  if (unsubTeam) unsubTeam();
  unsubTeam = db.collection('teams').doc(teamId).onSnapshot(doc => {
    if (!doc.exists) return;
    currentTeam = { id: doc.id, ...doc.data() };
    teamMembers = currentTeam.members || {};
    teamNamePill.textContent = currentTeam.name;
    renderMembers();
    populateAssignees();
  });

  if (unsubTasks) unsubTasks();
  unsubTasks = db.collection('teams').doc(teamId).collection('tasks').orderBy('position').onSnapshot(snap => {
    tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAll();
  });
}

function renderMembers() {
  memberAvatars.innerHTML = '';
  Object.entries(teamMembers).forEach(([email, m]) => {
    if (m.avatar) {
      const img = document.createElement('img');
      img.className = 'member-av'; img.src = m.avatar; img.title = m.name;
      memberAvatars.appendChild(img);
    } else {
      const div = document.createElement('div');
      div.className = 'member-av'; div.textContent = m.name[0]; div.title = m.name;
      memberAvatars.appendChild(div);
    }
  });
}

function populateAssignees() {
  const cur = assigneeSelect.value;
  assigneeSelect.innerHTML = '<option value="">Assign to</option>';
  Object.entries(teamMembers).forEach(([email, m]) => {
    const opt = document.createElement('option');
    opt.value = email; opt.textContent = m.name;
    assigneeSelect.appendChild(opt);
  });
  assigneeSelect.value = cur;
}

// ── INVITE MODAL ──
inviteTeamBtn.onclick = () => {
  inviteModalContent.innerHTML = `
    <button class="modal-close" id="closeInvite">&times;</button>
    <h3>Invite Teammates</h3>
    <p>Share this code with your team</p>
    <div class="invite-code-display" id="codeDisplay">${currentTeam.inviteCode}</div>
    <div class="copy-hint" id="copyCode">Click to copy</div>
  `;
  inviteModal.classList.add('active');
  $('closeInvite').onclick = () => inviteModal.classList.remove('active');
  $('copyCode').onclick = () => { navigator.clipboard.writeText(currentTeam.inviteCode).then(() => showToast('Copied!')); };
  inviteModal.onclick = e => { if (e.target === inviteModal) inviteModal.classList.remove('active'); };
};

// ── NOTIFICATIONS ──
let notifsOn = localStorage.getItem('trakr_notif') === 'true';
let notifiedIds = new Set(JSON.parse(localStorage.getItem('trakr_notified') || '[]'));
function updateNotifUI() { notifToggle.classList.toggle('active', notifsOn); notifLabel.textContent = notifsOn ? 'On' : 'Alerts'; }
updateNotifUI();
notifToggle.onclick = async () => {
  if (!notifsOn) {
    if (!('Notification' in window)) return showToast('Not supported');
    const p = await Notification.requestPermission();
    if (p === 'granted') { notifsOn = true; localStorage.setItem('trakr_notif', 'true'); showToast('Alerts on'); }
    else showToast('Permission denied');
  } else { notifsOn = false; localStorage.setItem('trakr_notif', 'false'); showToast('Alerts off'); }
  updateNotifUI();
};
function checkNotifs() {
  if (!notifsOn || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now(), fm = 300000;
  tasks.forEach(t => {
    if (t.done || !t.dueAt || notifiedIds.has(t.id)) return;
    const diff = t.dueAt.toDate().getTime() - now;
    if (diff <= fm && diff > -fm) {
      new Notification(`${t.priority ? t.priority.toUpperCase() + ': ' : ''}${t.text}`, { body: diff > 0 ? 'Due in < 5 min' : 'Overdue', tag: t.id });
      notifiedIds.add(t.id);
      localStorage.setItem('trakr_notified', JSON.stringify([...notifiedIds]));
    }
  });
}
setInterval(checkNotifs, 30000);

// ── VIEW TOGGLE ──
function setView(v) { currentView = v; localStorage.setItem('trakr_view', v); document.body.classList.toggle('kanban-mode', v === 'kanban'); viewToggle.classList.toggle('active', v === 'kanban'); viewLabel.textContent = v === 'kanban' ? 'List' : 'Board'; renderAll(); }
viewToggle.onclick = () => setView(currentView === 'list' ? 'kanban' : 'list');

function updateStats() {
  const a = tasks.filter(t => !t.done).length, d = tasks.filter(t => t.done).length, o = tasks.filter(t => isOverdue(t)).length;
  activeCount.textContent = a; doneCount.textContent = d; overdueCount.textContent = o;
  overduePill.style.display = o > 0 ? '' : 'none'; overduePill.classList.toggle('has-overdue', o > 0);
  clearDoneBtn.style.display = d > 0 ? 'block' : 'none';
}

function getFiltered() {
  if (currentFilter === 'active') return tasks.filter(t => !t.done);
  if (currentFilter === 'done') return tasks.filter(t => t.done);
  if (currentFilter === 'p0') return tasks.filter(t => t.priority === 'p0' && !t.done);
  if (currentFilter === 'p1') return tasks.filter(t => t.priority === 'p1' && !t.done);
  if (currentFilter === 'mine') return tasks.filter(t => t.assignee === currentUser.email && !t.done);
  if (currentFilter === 'overdue') return tasks.filter(t => isOverdue(t));
  return [...tasks];
}

// ── LIST RENDER ──
function renderList() {
  const filtered = getFiltered();
  taskList.innerHTML = '';
  if (!filtered.length) { emptyState.style.display = 'block'; const m = { all:'No tasks yet.', active:'All caught up!', done:'None completed.', p0:'No P0 tasks.', p1:'No P1 tasks.', mine:'Nothing assigned to you.', overdue:'Nothing overdue!' }; emptyState.querySelector('div:last-child').textContent = m[currentFilter] || m.all; }
  else emptyState.style.display = 'none';
  const labels = { all:'All tasks', active:'Active', done:'Completed', p0:'P0', p1:'P1', mine:'My tasks', overdue:'Overdue' };
  listLabel.textContent = labels[currentFilter] || 'All tasks';

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id; li.draggable = true;
    let meta = [dueMeta(task), prioMeta(task), assigneeMeta(task), recurMeta(task)];
    if (task.tag) meta.push(`<span class="task-tag ${task.tag}">${tagLabelsMap[task.tag] || task.tag}</span>`);
    meta = meta.filter(Boolean);
    const mHTML = meta.length ? `<div class="task-meta">${meta.join('')}</div>` : '';
    li.innerHTML = `<div class="drag-handle"><span></span><span></span><span></span></div><div class="checkbox" data-action="toggle"><svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polyline points="2.5,6 5,8.5 9.5,3.5"/></svg></div><div class="task-content"><div class="task-name">${renderText(task.text)}</div>${mHTML}</div><div class="task-actions"><button class="edit-btn" data-action="edit"><svg viewBox="0 0 16 16" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5l2 2-8 8H3.5v-2z"/><path d="M9.5 4.5l2 2"/></svg></button><button class="delete-btn" data-action="delete"><svg viewBox="0 0 16 16" fill="none" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></div>`;
    taskList.appendChild(li);
  });
}

// ── KANBAN ──
function renderKanban() {
  kanbanBoard.innerHTML = '';
  [...tagKeys, null].forEach(tagKey => {
    const colTasks = sortByDue(tasks.filter(t => (t.tag || null) === tagKey));
    const label = tagKey ? tagLabelsMap[tagKey] : 'Untagged';
    const color = tagKey ? tagColors[tagKey] : '#8A8580';
    const col = document.createElement('div'); col.className = 'kanban-col'; col.dataset.tag = tagKey || '__none';
    col.innerHTML = `<div class="kanban-col-header"><div class="col-label"><div class="col-dot" style="background:${color}"></div><span class="kanban-col-title">${label}</span></div><span class="kanban-col-count">${colTasks.length}</span></div>`;
    const cl = document.createElement('ul'); cl.className = 'kanban-cards'; cl.dataset.tag = tagKey || '__none';
    colTasks.forEach(task => {
      const card = document.createElement('li'); card.className = 'kanban-card' + (task.done ? ' done' : '');
      card.dataset.id = task.id; card.draggable = true;
      let meta = [dueMeta(task), prioMeta(task), assigneeMeta(task), recurMeta(task)].filter(Boolean);
      const mHTML = meta.length ? `<div class="k-card-meta">${meta.join('')}</div>` : '';
      card.innerHTML = `<div class="k-card-top"><div class="k-card-check" data-action="toggle"><svg viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polyline points="2,5 4,7 8,3"/></svg></div><span class="k-card-name">${renderText(task.text)}</span><div class="k-card-actions"><button data-action="edit"><svg viewBox="0 0 16 16" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5l2 2-8 8H3.5v-2z"/><path d="M9.5 4.5l2 2"/></svg></button><button data-action="delete"><svg viewBox="0 0 16 16" fill="none" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></div></div>${mHTML}`;
      cl.appendChild(card);
    });
    col.appendChild(cl); kanbanBoard.appendChild(col);
  });
  setupKanbanDrag();
}

function setupKanbanDrag() {
  kanbanBoard.querySelectorAll('.kanban-card').forEach(c => {
    c.addEventListener('dragstart', e => { dragSrcId = c.dataset.id; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragSrcId); });
    c.addEventListener('dragend', () => { c.classList.remove('dragging'); kanbanBoard.querySelectorAll('.drag-over,.drag-over-col').forEach(el => el.classList.remove('drag-over', 'drag-over-col')); dragSrcId = null; });
  });
  kanbanBoard.querySelectorAll('.kanban-cards').forEach(cl => {
    cl.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; kanbanBoard.querySelectorAll('.drag-over,.drag-over-col').forEach(el => el.classList.remove('drag-over', 'drag-over-col')); const card = e.target.closest('.kanban-card'); if (card && card.dataset.id !== dragSrcId) card.classList.add('drag-over'); else cl.classList.add('drag-over-col'); });
    cl.addEventListener('dragleave', e => { if (!cl.contains(e.relatedTarget)) cl.classList.remove('drag-over-col'); const card = e.target.closest('.kanban-card'); if (card) card.classList.remove('drag-over'); });
    cl.addEventListener('drop', e => {
      e.preventDefault(); kanbanBoard.querySelectorAll('.drag-over,.drag-over-col').forEach(el => el.classList.remove('drag-over', 'drag-over-col'));
      if (!dragSrcId) return;
      const newTag = cl.dataset.tag === '__none' ? null : cl.dataset.tag;
      const ref = db.collection('teams').doc(currentTeam.id).collection('tasks').doc(dragSrcId);
      ref.update({ tag: newTag });
      showToast(`Moved to ${newTag ? tagLabelsMap[newTag] : 'Untagged'}`);
    });
  });
  kanbanBoard.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]'); if (!btn) return;
    const card = e.target.closest('.kanban-card'); if (!card) return;
    const id = card.dataset.id, action = btn.dataset.action;
    const ref = db.collection('teams').doc(currentTeam.id).collection('tasks').doc(id);
    if (action === 'toggle') { handleToggle(id, ref); }
    else if (action === 'delete') ref.delete();
    else if (action === 'edit') { setView('list'); setTimeout(() => startEdit(id), 100); }
  });
}

function renderAll() { updateStats(); checkNotifs(); if (currentView === 'kanban') renderKanban(); else renderList(); }

// ── TOGGLE WITH RECURRING ──
function handleToggle(id, ref) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  ref.update({ done: !t.done });
  if (!t.done && t.recurDays && t.recurDays.length > 0) {
    const nextDate = getNextRecurDate(t.recurDays, t.dueAt);
    const maxPos = tasks.reduce((m, t) => Math.max(m, t.position || 0), 0);
    db.collection('teams').doc(currentTeam.id).collection('tasks').add({
      text: t.text,
      tag: t.tag || null,
      priority: t.priority || null,
      dueAt: firebase.firestore.Timestamp.fromDate(nextDate),
      assignee: t.assignee || null,
      recurDays: t.recurDays,
      done: false,
      createdBy: currentUser.email,
      position: maxPos + 1,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Next occurrence created');
  }
}

// ── EDIT ──
function startEdit(tid) {
  const task = tasks.find(t => t.id === tid); if (!task) return;
  currentEditRecurDays = [];
  const li = taskList.querySelector(`[data-id="${tid}"]`); if (!li) return;
  li.classList.add('editing'); li.draggable = false;
  const editRecurDays = task.recurDays ? [...task.recurDays] : [];
  currentEditRecurDays = editRecurDays;
  const assigneeOpts = Object.entries(teamMembers).map(([email, m]) => `<option value="${email}"${task.assignee === email ? ' selected' : ''}>${m.name}</option>`).join('');
  li.innerHTML = `<div class="edit-form"><textarea class="edit-text" rows="1">${esc(task.text)}</textarea><div class="edit-form-options"><input type="datetime-local" class="opt-datetime edit-due" value="${toLocal(task.dueAt)}"><select class="opt-select edit-priority">${priorityOptions.map(([v, l]) => `<option value="${v}"${task.priority === v ? ' selected' : ''}>${l}</option>`).join('')}</select><select class="opt-select edit-tag">${tagOptions.map(([v, l]) => `<option value="${v}"${task.tag === v ? ' selected' : ''}>${l}</option>`).join('')}</select><select class="opt-select edit-assignee"><option value="">Assign to</option>${assigneeOpts}</select><button type="button" class="repeat-btn edit-repeat-btn ${editRecurDays.length ? 'active' : ''}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 8a6 6 0 0111.3-2.8M14 8a6 6 0 01-11.3 2.8"/><path d="M14 2v4h-4M2 14v-4h4"/></svg>Repeat</button><div class="edit-form-actions"><button class="delete-btn" data-action="edit-delete" style="opacity:0.5;margin-right:auto" title="Delete task"><svg viewBox="0 0 16 16" fill="none" stroke="var(--overdue)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12M5.3 4V2.7a1 1 0 011-1h3.4a1 1 0 011 1V4M6.5 7v4.5M9.5 7v4.5"/><path d="M3.5 4l.7 8.3a1.5 1.5 0 001.5 1.4h4.6a1.5 1.5 0 001.5-1.4l.7-8.3"/></svg></button><button class="edit-cancel-btn" data-action="edit-cancel">Cancel</button><button class="edit-save-btn" data-action="edit-save">Save</button></div></div><div class="day-picker edit-day-picker ${editRecurDays.length ? 'open' : ''}"></div></div>`;
  const inp = li.querySelector('.edit-text'); inp.focus();
  inp.style.height = 'auto'; inp.style.height = inp.scrollHeight + 'px';
  inp.addEventListener('input', () => { inp.style.height = 'auto'; inp.style.height = inp.scrollHeight + 'px'; });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(tid, li, editRecurDays); } if (e.key === 'Escape') renderAll(); });
  const editDayPicker = li.querySelector('.edit-day-picker');
  buildDayPicker(editDayPicker, editRecurDays);
  const editRepeatBtn = li.querySelector('.edit-repeat-btn');
  editRepeatBtn.onclick = () => {
    const isActive = editRepeatBtn.classList.toggle('active');
    editDayPicker.classList.toggle('open', isActive);
    if (!isActive) { editRecurDays.length = 0; editDayPicker.querySelectorAll('.day-toggle').forEach(b => b.classList.remove('active')); }
  };
}

function saveEdit(tid, li, editRecurDays) {
  const text = li.querySelector('.edit-text').value.trim(); if (!text) return;
  const dv = li.querySelector('.edit-due').value;
  const ref = db.collection('teams').doc(currentTeam.id).collection('tasks').doc(tid);
  ref.update({
    text, dueAt: dv ? firebase.firestore.Timestamp.fromDate(new Date(dv)) : null,
    priority: li.querySelector('.edit-priority').value || null,
    tag: li.querySelector('.edit-tag').value || null,
    assignee: li.querySelector('.edit-assignee').value || null,
    recurDays: editRecurDays && editRecurDays.length > 0 ? editRecurDays : null
  });
  showToast('Updated');
}

// ── ADD TASK ──
function addTask() {
  const text = taskInput.value.trim(); if (!text) return;
  const maxPos = tasks.reduce((m, t) => Math.max(m, t.position || 0), 0);
  const hasRecur = recurDaysInput.length > 0;
  let dueAt = null;
  if (dueInput.value) {
    dueAt = firebase.firestore.Timestamp.fromDate(new Date(dueInput.value));
  } else if (hasRecur) {
    dueAt = firebase.firestore.Timestamp.fromDate(getNextRecurDate(recurDaysInput, null));
  }
  db.collection('teams').doc(currentTeam.id).collection('tasks').add({
    text, tag: tagSelect.value || null, priority: prioritySelect.value || null,
    dueAt: dueAt,
    assignee: assigneeSelect.value || null, done: false,
    recurDays: hasRecur ? [...recurDaysInput] : null,
    createdBy: currentUser.email, position: maxPos + 1,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  taskInput.value = ''; dueInput.value = ''; prioritySelect.value = ''; tagSelect.value = ''; assigneeSelect.value = '';
  recurDaysInput.length = 0;
  repeatBtn.classList.remove('active');
  dayPicker.classList.remove('open');
  dayPicker.querySelectorAll('.day-toggle').forEach(b => b.classList.remove('active'));
  taskInput.style.height = 'auto';
  taskInput.focus();
}
addBtn.onclick = addTask;
taskInput.onkeydown = e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addTask(); }
};
taskInput.oninput = () => { taskInput.style.height = 'auto'; taskInput.style.height = taskInput.scrollHeight + 'px'; };

// ── LIST EVENTS ──
taskList.addEventListener('click', e => {
  const item = e.target.closest('[data-action]'); if (!item) return;
  const li = e.target.closest('.task-item'); const id = li.dataset.id, action = item.dataset.action;
  const ref = db.collection('teams').doc(currentTeam.id).collection('tasks').doc(id);
  if (action === 'toggle') { handleToggle(id, ref); }
  else if (action === 'delete') { li.classList.add('removing'); setTimeout(() => ref.delete(), 200); }
  else if (action === 'edit') startEdit(id);
  else if (action === 'edit-save') { saveEdit(id, li, currentEditRecurDays); }
  else if (action === 'edit-delete') { li.classList.add('removing'); setTimeout(() => db.collection('teams').doc(currentTeam.id).collection('tasks').doc(id).delete(), 200); }
  else if (action === 'edit-cancel') renderAll();
});

// ── LIST DRAG ──
taskList.addEventListener('dragstart', e => { const li = e.target.closest('.task-item'); if (!li) return; dragSrcId = li.dataset.id; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragSrcId); });
taskList.addEventListener('dragend', e => { const li = e.target.closest('.task-item'); if (li) li.classList.remove('dragging'); taskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); dragSrcId = null; });
taskList.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const li = e.target.closest('.task-item'); if (!li || li.dataset.id === dragSrcId) return; taskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); li.classList.add('drag-over'); });
taskList.addEventListener('dragleave', e => { const li = e.target.closest('.task-item'); if (li) li.classList.remove('drag-over'); });
taskList.addEventListener('drop', e => {
  e.preventDefault(); taskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  const tli = e.target.closest('.task-item');
  if (!tli || !dragSrcId || tli.dataset.id === dragSrcId) return;
  const srcTask = tasks.find(t => t.id === dragSrcId);
  const targetTask = tasks.find(t => t.id === tli.dataset.id);
  if (!srcTask || !targetTask) return;
  const batch = db.batch();
  const base = db.collection('teams').doc(currentTeam.id).collection('tasks');
  batch.update(base.doc(dragSrcId), { position: targetTask.position });
  batch.update(base.doc(tli.dataset.id), { position: srcTask.position });
  batch.commit();
});

// ── FILTERS ──
document.querySelectorAll('.filter-btn').forEach(b => b.onclick = () => { document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); currentFilter = b.dataset.filter; renderAll(); });
clearDoneBtn.onclick = () => {
  const batch = db.batch();
  tasks.filter(t => t.done).forEach(t => batch.delete(db.collection('teams').doc(currentTeam.id).collection('tasks').doc(t.id)));
  batch.commit();
};

setView(currentView);
