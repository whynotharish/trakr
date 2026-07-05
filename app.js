// =====================================================
// TRAKR — app.js
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
let currentFilter = 'active';
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
let inputSubtasks = [];
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
const descInput = $('descInput');
const subtaskInput = $('subtaskInput');
const inputSubtaskList = $('inputSubtaskList');
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
function subtaskMeta(t) {
  if (!t.subtasks || !t.subtasks.length) return '';
  const done = t.subtasks.filter(s => s.done).length;
  const total = t.subtasks.length;
  return `<span class="subtask-count"><svg viewBox="0 0 12 12" stroke-width="1.3"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5"/><polyline points="3.5,6 5.5,8 8.5,4" fill="none"/></svg>${done}/${total}</span>`;
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

function taskRef(id) { return db.collection('teams').doc(currentTeam.id).collection('tasks').doc(id); }

// ── SHOW VIEWS ──
function showView(name) {
  const finishSwitch = () => {
    loadingView.style.display = 'none';
    authView.classList.remove('active');
    teamView.classList.remove('active');
    appView.classList.remove('active');
    if (name === 'auth') authView.classList.add('active');
    else if (name === 'team') teamView.classList.add('active');
    else if (name === 'app') appView.classList.add('active');
  };
  if (loadingView.style.display !== 'none') {
    loadingView.classList.add('fade-out');
    setTimeout(finishSwitch, 380);
  } else {
    finishSwitch();
  }
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
    <div class="divider">or</div>
    <button class="team-btn secondary" id="skipTeamBtn">Use individually</button>
    <p style="font-size:11px;margin-bottom:0;margin-top:4px;">You can always invite others later</p>
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

  $('skipTeamBtn').onclick = async () => {
    const firstName = currentUser.displayName.split(' ')[0];
    const code = genCode();
    const ref = await db.collection('teams').add({
      name: `${firstName}'s Tasks`, inviteCode: code, createdBy: currentUser.uid, personal: true,
      members: { [currentUser.email]: { name: currentUser.displayName, avatar: currentUser.photoURL, role: 'admin' } }
    });
    await db.collection('users').doc(currentUser.uid).update({ teamId: ref.id });
    loadTeam(ref.id);
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
  inviteModal.onclick = e => { if (e.target === inviteModal) inviteModal.classList.remove('ac
