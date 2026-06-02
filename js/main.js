/* ===== Burndemic main.js ===== */
const state = { matkul:[], tugas:[], user:{} };
const titles = {
  dashboard:'Dashboard Akademik',
  matkul:'Mata Kuliah',
  kehadiran:'Kehadiran',
  tugas:'Tugas',
  rekomendasi:'Rekomendasi Tindakan',
  profil:'Profil Saya'
};
let prevSec = null;
let curSec = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  // Onboarding
  document.getElementById('startBtn').onclick = () => goPage('register');
  document.getElementById('toLoginLink').onclick = e => { e.preventDefault(); goPage('login'); };
  // Login
  document.getElementById('loginForm').onsubmit = handleLogin;
  document.getElementById('toRegisterLink').onclick = e => { e.preventDefault(); goPage('register'); };
  document.getElementById('backFromLogin').onclick = e => { e.preventDefault(); goPage('onboard'); };
  document.getElementById('passToggle1').onclick = () => togglePass('loginPass','passToggle1');
  // Register
  document.getElementById('registerForm').onsubmit = handleRegister;
  document.getElementById('toLoginFromReg').onclick = e => { e.preventDefault(); goPage('login'); };
  document.getElementById('backFromReg').onclick = e => { e.preventDefault(); goPage('onboard'); };
  document.getElementById('passToggle2').onclick = () => togglePass('regPass','passToggle2');
  document.getElementById('passToggle3').onclick = () => togglePass('regPass2','passToggle3');
  // Sidebar nav
  document.querySelectorAll('[data-sec]').forEach(btn => {
    btn.onclick = () => goSec(btn.getAttribute('data-sec'));
  });
  // Mobile sidebar
  document.getElementById('sbToggle').onclick = () => {
    document.getElementById('mainSb').classList.toggle('open');
    document.getElementById('sbOverlay').classList.toggle('open');
  };
  document.getElementById('sbOverlay').onclick = closeSb;
  // Back button
  document.getElementById('backBtn').onclick = () => { if(prevSec) goSec(prevSec); };
  // Logout
  document.getElementById('logoutBtn').onclick = showLogoutModal;
  // Forms
  document.getElementById('saveMK').onclick = saveMK;
  document.getElementById('saveHadir').onclick = saveHadir;
  document.getElementById('saveTugas').onclick = saveTugas;
  // Init
  renderDash();
});

/* ===== PAGE NAVIGATION ===== */
function goPage(id) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('pg-' + id);
  if (el) el.classList.add('active');
}

/* ===== SECTION NAVIGATION ===== */
function goSec(sec) {
  prevSec = curSec !== sec ? curSec : prevSec;
  curSec = sec;
  document.querySelectorAll('.pg-sec').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('sec-' + sec);
  if (el) el.classList.add('active');
  document.querySelectorAll('[data-sec]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`[data-sec="${sec}"]`).forEach(b => b.classList.add('active'));
  document.getElementById('tbTitle').textContent = titles[sec] || sec;
  const mainSecs = ['dashboard','matkul','kehadiran','tugas','rekomendasi'];
  const backBtn = document.getElementById('backBtn');
  backBtn.style.display = (!mainSecs.includes(sec) && prevSec) ? 'flex' : 'none';
  closeSb();
  window.scrollTo(0,0);
  renderSection(sec);
}

function closeSb() {
  document.getElementById('mainSb').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('open');
}

function renderSection(sec) {
  if (sec==='dashboard') renderDash();
  if (sec==='matkul') renderMK();
  if (sec==='kehadiran') renderHadir();
  if (sec==='tugas') renderTugas();
  if (sec==='rekomendasi') renderRek();
  if (sec==='profil') renderProfil();
}

/* ===== AUTH ===== */
function handleLogin(e) {
  e.preventDefault();
  const em = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPass').value.trim();
  const err = document.getElementById('loginEmailErr');
  const passErr = document.getElementById('loginPassErr');
  if (!em || !pw) {
    if (!em) { err.textContent='Email wajib diisi.'; err.style.display='block'; }
    else { err.style.display='none'; }
    if (!pw) { passErr.style.display='block'; }
    else { passErr.style.display='none'; }
    return;
  }
  err.style.display='none';
  passErr.style.display='none';
  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (!savedUser) {
    toast('Akun belum terdaftar.', 'err');
    return;
  }

  if (savedUser.email !== em || savedUser.password !== pw) {
    toast('Email atau password salah.', 'err');
    return;
  }

  state.user = savedUser;
  setUserUI();
  goPage('app');
  goSec('dashboard');
  setTimeout(() => openTutorial(), 400);
  toast('Selamat datang kembali! 👋','ok');
}

function handleRegister(e) {
  e.preventDefault();
  const nama = document.getElementById('regNama').value.trim();
  const nim = document.getElementById('regNIM').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const prodi = document.getElementById('regProdi').value.trim() || 'Sistem Informasi';
  const angkatan = document.getElementById('regAngkatan').value.trim() || '2025';
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const err = document.getElementById('regPassErr');
  if (!nama || !nim || !email || !pass) {
    err.textContent='Semua field bertanda * wajib diisi.';
    err.style.display='block';
    return;
  }
  if (pass !== pass2) {
    err.textContent='Password tidak cocok.';
    err.style.display='block';
    return;
  }
  err.style.display='none';
    state.user = { 
      nama, 
      nim, 
      email, 
      prodi, 
      angkatan,
      password: pass
    };

    localStorage.setItem("user", JSON.stringify(state.user));
  setUserUI();
  goPage('app');
  goSec('dashboard');
  setTimeout(() => openTutorial(), 400);
  toast('Akun berhasil dibuat! Selamat datang 🎉','ok');
}

function setUserUI() {
  const { nama, nim, prodi } = state.user;
  const av = (nama||'MH').slice(0,2).toUpperCase();
  document.getElementById('userAv').textContent = av;
  document.getElementById('userName').textContent = nama;
  document.getElementById('userNIM').textContent = prodi || 'Universitas Brawijaya';
}

function togglePass(inputId, toggleId) {
  const inp = document.getElementById(inputId);
  const tog = document.getElementById(toggleId);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  tog.className = show ? 'ti ti-eye-off ii' : 'ti ti-eye ii';
}

/* ===== LOGOUT ===== */
function showLogoutModal() { document.getElementById('logoutModal').classList.add('open'); }
function hideLogoutModal() { document.getElementById('logoutModal').classList.remove('open'); }
function doLogout() {
  hideLogoutModal();
  state.matkul = [];
  state.tugas = [];
  state.user = {};
  goPage('onboard');
  toast('Berhasil keluar. Sampai jumpa! 👋','ok');
}

/* ===== HELPERS ===== */
function getStatus(n,h) {
  if(n<60||h<75) return 'r';
  if(n<70||h<80) return 'y';
  return 'g';
}
function getBadge(n,h) {
  const s = getStatus(n,h);
  const m = {
    r:['br','dr','Risiko'],
    y:['by','dy','Perhatian'],
    g:['bg','dg','Aman']
  };
  const [bc,dc,lbl] = m[s];
  return `<span class="badge ${bc}"><span class="dot ${dc}"></span>${lbl}</span>`;
}
function getGrade(n) {
  if(n>=85)return'A';
  if(n>=80)return'B+';
  if(n>=75)return'B';
  if(n>=70)return'B-';
  if(n>=65)return'C+';
  if(n>=60)return'C';
  if(n>=55)return'D';
  return'E';
}
function getNColor(n) { return n<60?'var(--rd)':n<70?'var(--yw)':'var(--n900)'; }
function getHColor(h) { return h<75?'var(--rd)':h<80?'var(--yw)':'var(--n900)'; }

function dueClass(dl) {
  if(!dl) return '';
  const diff = (new Date(dl) - new Date()) / (1000*60*60*24);
  if(diff<=2) return 'urg';
  if(diff<=5) return 'sn';
  return '';
}
function dueBadge(dl) {
  const c = dueClass(dl);
  if(c==='urg') return '<span class="badge br"><span class="dot dr"></span>Mendesak</span>';
  if(c==='sn')  return '<span class="badge by"><span class="dot dy"></span>Segera</span>';
  return '<span class="badge bb"><span class="dot db"></span>Normal</span>';
}

function getNotifs() {
  const list = [];
  state.matkul.forEach(m => {
    if(m.hadir<75) list.push({cls:'ni-r',icon:'ti-alert-triangle',text:`<strong>Kehadiran ${m.nama}</strong> hanya ${m.hadir}% — mendekati batas minimum.`});
    if(m.nilai<70) list.push({cls:'ni-y',icon:'ti-info-circle',text:`<strong>Nilai ${m.nama}</strong> di bawah 70 — perlu perhatian.`});
  });
  state.tugas.filter(t=>!t.selesai).forEach(t => {
    if(dueClass(t.deadline)==='urg') list.push({cls:'ni-r',icon:'ti-clock',text:`<strong>Deadline ${t.nama}</strong> sangat dekat!`});
  });
  return list;
}

function emptyEl(icon, text) {
  return `<div class="empty"><i class="ti ${icon}"></i><p>${text}</p></div>`;
}

/* ===== DASHBOARD ===== */
function renderDash() {
  const mk = state.matkul;
  const total = mk.length;
  document.getElementById('dMK').textContent = total;
  document.getElementById('dIPK').textContent = total ? ((mk.reduce((a,m)=>a+m.nilai,0)/total)/25).toFixed(2) : '-';
  document.getElementById('dHadir').textContent = total ? Math.round(mk.reduce((a,m)=>a+m.hadir,0)/total)+'%' : '-';
  document.getElementById('dTugas').textContent = state.tugas.filter(t=>!t.selesai).length;

  document.getElementById('dMKList').innerHTML = total
    ? mk.map(m => `
        <div class="mk-row">
          <div>
            <div class="mk-name">${m.nama}</div>
            <div class="mk-sub">Nilai: <span style="color:${getNColor(m.nilai)};font-weight:600;">${m.nilai}</span> · Hadir: <span style="color:${getHColor(m.hadir)};font-weight:600;">${m.hadir}%</span></div>
          </div>
          ${getBadge(m.nilai,m.hadir)}
        </div>`).join('')
    : emptyEl('ti-inbox','Belum ada mata kuliah.<br>Tambahkan di menu Mata Kuliah.');

  const ns = getNotifs();
  document.getElementById('dNotif').innerHTML = ns.length
    ? ns.map(n => `
        <div class="notif-item">
          <div class="ni ${n.cls}"><i class="ti ${n.icon}"></i></div>
          <div>
            <div class="n-text">${n.text}</div>
            <div class="n-time">Baru saja</div>
          </div>
        </div>`).join('')
    : emptyEl('ti-bell-off','Tidak ada notifikasi saat ini.');

  const chart = document.getElementById('dChart');
  chart.innerHTML = total
    ? mk.map(m => {
        const pct = Math.round((m.nilai/100)*100);
        const col = m.nilai>=70?'var(--bl)':m.nilai>=60?'var(--yw)':'var(--rd)';
        const s = m.nama.split(' ').map(w=>w[0]).join('').slice(0,4);
        return `<div class="cb-wrap">
          <div class="c-val">${m.nilai}</div>
          <div class="cbar" style="height:${pct}%;background:${col};"></div>
          <div class="c-lbl" title="${m.nama}">${s}</div>
        </div>`;
      }).join('')
    : `<div style="width:100%;text-align:center;color:var(--n400);font-size:12px;padding:30px 0;">Belum ada data nilai</div>`;

  const pending = state.tugas.filter(t=>!t.selesai).slice(0,5);
  document.getElementById('dTodo').innerHTML = pending.length
    ? pending.map(t => `
        <div class="todo-item">
          <div class="chk" onclick="toggleTodo(${state.tugas.indexOf(t)})" role="checkbox" tabindex="0" onkeydown="if(event.key==='Enter')toggleTodo(${state.tugas.indexOf(t)})"></div>
          <span class="t-txt">${t.nama}</span>
          <span class="t-due ${dueClass(t.deadline)}">${t.deadline}</span>
        </div>`).join('')
    : emptyEl('ti-check','Tidak ada tugas pending. 🎉');

  updateNotifDot();
}

/* ===== MATA KULIAH ===== */
function renderMK() {
  const mk = state.matkul;
  document.getElementById('mkTotal').textContent = mk.length;
  document.getElementById('mkAman').textContent = mk.filter(m=>getStatus(m.nilai,m.hadir)==='g').length;
  document.getElementById('mkPerhatian').textContent = mk.filter(m=>getStatus(m.nilai,m.hadir)==='y').length;
  document.getElementById('mkRisiko').textContent = mk.filter(m=>getStatus(m.nilai,m.hadir)==='r').length;
  document.getElementById('mkBody').innerHTML = mk.length
    ? mk.map((m,i) => `
        <tr>
          <td class="td-m">${m.nama}</td>
          <td>${m.sks}</td>
          <td style="font-weight:600;color:${getNColor(m.nilai)}">${m.nilai}</td>
          <td>${getGrade(m.nilai)}</td>
          <td style="font-weight:600;color:${getHColor(m.hadir)}">${m.hadir}%</td>
          <td>${getBadge(m.nilai,m.hadir)}</td>
          <td>
            <button class="btn btn-d btn-sm" onclick="hapusMK(${i})">
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--n400);">Belum ada mata kuliah. Tambahkan di bawah</td></tr>`;
  updateSelects();
}

/* ===== KEHADIRAN ===== */
function renderHadir() {
  const mk = state.matkul;
  document.getElementById('hadirList').innerHTML = mk.length
    ? mk.map(m => {
        const cls = m.hadir>=80?'fill-g':m.hadir>=75?'fill-y':'fill-r';
        const vc  = m.hadir>=80?'var(--gr-d)':m.hadir>=75?'var(--yw-d)':'var(--rd-d)';
        const sub = m.hadir<75
          ? `<div class="p-sub danger"><i class="ti ti-alert-triangle"></i> Mendekati batas minimum 75%!</div>`
          : m.hadir<80
          ? `<div class="p-sub warn">Perlu perhatian — jaga agar tidak turun</div>`
          : `<div class="p-sub">${m.perH||0} / ${m.perT||0} pertemuan hadir</div>`;
        return `
          <div class="prog-wrap">
            <div class="prog-hdr">
              <span class="prog-name">${m.nama}</span>
              <span style="font-size:12px;font-weight:700;color:${vc}">${m.hadir}%</span>
            </div>
            <div class="pbar"><div class="pfill ${cls}" style="width:${m.hadir}%;"></div></div>
            ${sub}
          </div>`;
      }).join('')
    : emptyEl('ti-calendar-off','Belum ada mata kuliah.<br>Tambahkan mata kuliah terlebih dahulu.');
  updateSelects();
}

/* ===== TUGAS ===== */
function renderTugas() {
  const pending = state.tugas.filter(t=>!t.selesai);
  const done = state.tugas.filter(t=>t.selesai);
  document.getElementById('tTotal').textContent = state.tugas.length;
  document.getElementById('tDone').textContent = done.length;
  document.getElementById('tPending').textContent = pending.length;
  document.getElementById('tMendekati').textContent = pending.filter(t=>dueClass(t.deadline)==='urg').length;

  document.getElementById('tPendingList').innerHTML = pending.length
    ? pending.map(t => {
        const i = state.tugas.indexOf(t);
        return `<tr>
          <td class="td-m">${t.nama}</td>
          <td style="color:var(--n600)">${t.matkul}</td>
          <td style="font-weight:500">${t.deadline}</td>
          <td>${dueBadge(t.deadline)}</td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-g btn-sm" onclick="selesaiTugas(${i})" title="Tandai selesai">
                <i class="ti ti-check" style="color:var(--gr);"></i>
              </button>
              <button class="btn btn-d btn-sm" onclick="hapusTugas(${i})" title="Hapus">
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--n400);">Tidak ada tugas pending.</td></tr>`;

  document.getElementById('tDoneList').innerHTML = done.length
    ? done.map(t => `<tr>
        <td style="text-decoration:line-through;color:var(--n400)">${t.nama}</td>
        <td style="color:var(--n400)">${t.matkul}</td>
        <td><span class="badge bg"><span class="dot dg"></span>Selesai</span></td>
      </tr>`).join('')
    : `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--n400);">Belum ada tugas selesai.</td></tr>`;

  updateSelects();
}

/* ===== REKOMENDASI ===== */
function renderRek() {
  const wrap = document.getElementById('rekList');
  if(!state.matkul.length && !state.tugas.length) {
    wrap.innerHTML = emptyEl('ti-mood-smile','Tambahkan data mata kuliah dan tugas<br>untuk mendapatkan rekomendasi.');
    return;
  }
  const urgent=[], warn=[], ok=[];
  state.matkul.forEach(m => {
    if(m.hadir<75)
      urgent.push({icon:'ti-run',title:`Hadiri semua sisa kelas ${m.nama}`,desc:`Kehadiranmu ${m.hadir}% — satu absen lagi bisa tidak boleh ujian.`});
    else if(m.hadir<80)
      warn.push({icon:'ti-calendar-check',title:`Jaga kehadiran ${m.nama}`,desc:`Kehadiranmu ${m.hadir}%, perlu dijaga agar tidak turun ke bawah 75%.`});

    if(m.nilai<60)
      urgent.push({icon:'ti-school',title:`Tingkatkan nilai ${m.nama} segera`,desc:`Nilai ${m.nilai} sangat rendah — konsultasi ke dosen dan pelajari ulang materi.`});
    else if(m.nilai<70)
      warn.push({icon:'ti-book',title:`Perhatikan nilai ${m.nama}`,desc:`Nilai ${m.nilai} di bawah 70 — perlu usaha lebih untuk persiapan UAS.`});
    else
      ok.push({icon:'ti-trophy',title:`Pertahankan performa ${m.nama}`,desc:`Nilai ${m.nilai} dan kehadiran ${m.hadir}% sudah baik. Terus konsisten!`});
  });
  state.tugas.filter(t=>!t.selesai).forEach(t => {
    const dc = dueClass(t.deadline);
    if(dc==='urg') urgent.push({icon:'ti-file-text',title:`Kumpulkan: ${t.nama}`,desc:`Deadline ${t.deadline} sudah sangat dekat. Segera kerjakan!`});
    else if(dc==='sn') warn.push({icon:'ti-clock',title:`Segera kerjakan: ${t.nama}`,desc:`Deadline ${t.deadline}. Cicil sekarang agar tidak menumpuk.`});
  });

  let html = '';
  if(urgent.length) {
    html += `<div class="rsl rsl-r"><i class="ti ti-alert-circle"></i> Mendesak — Tindak segera</div>`;
    html += urgent.map(r=>`<div class="rec-card rec-u"><i class="ti ${r.icon}"></i><div><div class="rc-title">${r.title}</div><div class="rc-desc">${r.desc}</div></div></div>`).join('');
  }
  if(warn.length) {
    html += `<div class="rsl rsl-y"><i class="ti ti-alert-triangle"></i> Segera — Perlu perhatian</div>`;
    html += warn.map(r=>`<div class="rec-card rec-w"><i class="ti ${r.icon}"></i><div><div class="rc-title">${r.title}</div><div class="rc-desc">${r.desc}</div></div></div>`).join('');
  }
  if(ok.length) {
    html += `<div class="rsl rsl-g"><i class="ti ti-circle-check"></i> Baik — Pertahankan</div>`;
    html += ok.map(r=>`<div class="rec-card rec-ok"><i class="ti ${r.icon}"></i><div><div class="rc-title">${r.title}</div><div class="rc-desc">${r.desc}</div></div></div>`).join('');
  }
  wrap.innerHTML = html || emptyEl('ti-mood-smile','Semua kondisi akademikmu baik!');
}

/* ===== PROFIL ===== */
function renderProfil() {
  const u = state.user;
  const mk = state.matkul;
  const av = (u.nama||'MH').slice(0,2).toUpperCase();
  document.getElementById('profileAvBig').textContent = av;
  document.getElementById('profileName').textContent = u.nama || 'Mahasiswa';
  document.getElementById('profileNIM').textContent = (u.nim||'—') + ' — Universitas Brawijaya';
  document.getElementById('profileProdi').textContent = u.prodi || 'Sistem Informasi';
  document.getElementById('prName').textContent = u.nama || '—';
  document.getElementById('prNIM').textContent = u.nim || '—';
  document.getElementById('prEmail').textContent = u.email || '—';
  document.getElementById('prAngkatan').textContent = u.angkatan || '—';
  const total = mk.length;
  document.getElementById('prIPK').textContent = total ? ((mk.reduce((a,m)=>a+m.nilai,0)/total)/25).toFixed(2) : '-';
  document.getElementById('prMK').textContent = total;
  document.getElementById('prAman').textContent = mk.filter(m=>getStatus(m.nilai,m.hadir)==='g').length;
  document.getElementById('prRisiko').textContent = mk.filter(m=>getStatus(m.nilai,m.hadir)==='r').length;
}

/* ===== ACTIONS ===== */
function saveMK() {
  const nama  = document.getElementById('mkNama').value.trim();
  const sks   = parseInt(document.getElementById('mkSKS').value) || 3;
  const nilai = parseInt(document.getElementById('mkNilai').value);
  const hadir = parseInt(document.getElementById('mkHadir').value);
  if(!nama || isNaN(nilai) || isNaN(hadir)) { toast('Lengkapi semua field wajib.','err'); return; }
  if(nilai<0||nilai>100||hadir<0||hadir>100) { toast('Nilai dan kehadiran harus 0–100.','err'); return; }
  state.matkul.push({nama, sks, nilai, hadir, perH:Math.round((hadir/100)*14), perT:14});
  renderMK();
  toast('Mata kuliah berhasil ditambahkan!','ok');
  document.getElementById('mkNama').value='';
  document.getElementById('mkNilai').value='';
  document.getElementById('mkHadir').value='';
}

function hapusMK(i) {
  state.matkul.splice(i,1);
  renderMK();
  toast('Mata kuliah dihapus.','err');
}

function saveHadir() {
  const idx    = document.getElementById('hadirMK').value;
  const tgl    = document.getElementById('hadirTgl').value;
  const status = document.getElementById('hadirStatus').value;
  if(idx===''||!tgl) { toast('Pilih mata kuliah dan tanggal.','err'); return; }
  const m = state.matkul[idx];
  m.perT = (m.perT||0) + 1;
  if(status==='Hadir') m.perH = (m.perH||0) + 1;
  m.hadir = Math.round(((m.perH||0)/m.perT)*100);
  renderHadir();
  toast('Kehadiran berhasil dicatat!','ok');
  document.getElementById('hadirTgl').value='';
}

function saveTugas() {
  const nama    = document.getElementById('tNama').value.trim();
  const matkul  = document.getElementById('tMKSel').value || 'Umum';
  const deadline = document.getElementById('tDL').value;
  if(!nama||!deadline) { toast('Nama tugas dan deadline wajib diisi.','err'); return; }
  state.tugas.push({nama, matkul, deadline, selesai:false});
  renderTugas();
  toast('Tugas berhasil ditambahkan!','ok');
  document.getElementById('tNama').value='';
  document.getElementById('tDL').value='';
}

function selesaiTugas(i) {
  state.tugas[i].selesai = true;
  renderTugas();
  toast('Tugas ditandai selesai! ✅','ok');
}

function hapusTugas(i) {
  state.tugas.splice(i,1);
  renderTugas();
  toast('Tugas dihapus.','err');
}

function toggleTodo(i) {
  state.tugas[i].selesai = !state.tugas[i].selesai;
  renderDash();
}

function updateSelects() {
  const h = document.getElementById('hadirMK');
  const t = document.getElementById('tMKSel');
  const opts  = '<option value="">Pilih Mata Kuliah</option>' + state.matkul.map((m,i)=>`<option value="${i}">${m.nama}</option>`).join('');
  const optsT = '<option value="">Pilih mata kuliah</option>' + state.matkul.map(m=>`<option>${m.nama}</option>`).join('') + '<option>Lainnya</option>';
  if(h) h.innerHTML = opts;
  if(t) t.innerHTML = optsT;
}

/* ===== TOAST ===== */
function toast(msg, type) {
  const t = document.getElementById('toast-el');
  t.innerHTML = `<i class="ti ti-${type==='ok'?'circle-check':'alert-circle'}" style="font-size:15px;"></i> ${msg}`;
  t.className = type==='ok' ? 't-ok' : 't-err';
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>{ t.className=''; }, 3200);
}

/* ===== NOTIFIKASI PANEL ===== */
function openNotifPanel() {
  const ns = getNotifs();
  document.getElementById('notifCount').textContent = ns.length + ' notifikasi baru';
  const list = document.getElementById('notifPanelList');
  if(ns.length===0) {
    list.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:12px;">
        <i class="ti ti-bell-off" style="font-size:40px;color:var(--n200);"></i>
        <p style="font-size:13px;color:var(--n400);line-height:1.6;">Tidak ada notifikasi saat ini. <br>Kondisi akademikmu baik!</p>
      </div>`;
  } else {
    const niMap = {
      'ti-alert-triangle':{ bg:'#FCEBEB', ic:'#791F1F' },
      'ti-info-circle':   { bg:'#FAEEDA', ic:'#633806' },
      'ti-clock':         { bg:'#FCEBEB', ic:'#791F1F' },
    };
    list.innerHTML = ns.map((n,i) => {
      const s = niMap[n.icon] || { bg:'#EAF3FB', ic:'#1E5FA8' };
      return `
        <div onclick="notifClick(${i})"
          style="display:flex;align-items:flex-start;gap:12px;padding:14px 24px;border-bottom:1px solid var(--n100);cursor:pointer;transition:background .15s;"
          onmouseover="this.style.background='var(--n50)'"
          onmouseout="this.style.background='transparent'">
          <div style="width:36px;height:36px;border-radius:9px;background:${s.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="ti ${n.icon}" style="font-size:17px;color:${s.ic};"></i>
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;color:var(--n600);line-height:1.5;">${n.text}</div>
            <div style="font-size:11px;color:var(--n400);margin-top:3px;">Baru saja · Klik untuk lihat detail</div>
          </div>
          <i class="ti ti-chevron-right" style="font-size:16px;color:var(--n400);margin-top:2px;flex-shrink:0;"></i>
        </div>`;
    }).join('');
  }
  document.getElementById('notifPanel').style.display = 'block';
}

function editProfileField(field){
  let currentValue = '';
  let label = '';

  switch(field){
    case 'nama':
      currentValue = state.user.nama || '';
      label = 'Nama Lengkap';
      break;

    case 'nim':
      currentValue = state.user.nim || '';
      label = 'NIM';
      break;

    case 'email':
      currentValue = state.user.email || '';
      label = 'Email';
      break;

    case 'angkatan':
      currentValue = state.user.angkatan || '';
      label = 'Angkatan';
      break;
  }

  const newValue = prompt(`Ubah ${label}`, currentValue);

  if(!newValue || newValue.trim() === ''){
    return;
  }

  switch(field){
    case 'nama':
      state.user.nama = newValue.trim();
      break;

    case 'nim':
      state.user.nim = newValue.trim();
      break;

    case 'email':
      state.user.email = newValue.trim();
      break;

    case 'angkatan':
      state.user.angkatan = newValue.trim();
      break;
  }

  renderProfil();
  setUserUI();

  localStorage.setItem("user", JSON.stringify(state.user));

  toast(`${label} berhasil diperbarui`, 'ok');
}

function changePassword(){

  const oldPass = prompt('Masukkan password lama');

  if(oldPass !== state.user.password){
    toast('Password lama salah','err');
    return;
  }

  const newPass = prompt('Masukkan password baru');

  if(!newPass){
    return;
  }

  const confirmPass = prompt('Konfirmasi password baru');

  if(newPass !== confirmPass){
    toast('Konfirmasi password tidak cocok','err');
    return;
  }

  state.user.password = newPass;

  localStorage.setItem("user", JSON.stringify(state.user));

  toast('Password berhasil diubah','ok');
}

function notifClick(i) {
  closeNotifPanel();
  const ns = getNotifs();
  const n = ns[i];
  if(!n) return;
  if(n.icon==='ti-clock') goSec('tugas');
  else if(n.icon==='ti-alert-triangle') goSec('kehadiran');
  else goSec('matkul');
}

function closeNotifPanel() {
  document.getElementById('notifPanel').style.display = 'none';
}

/* ===== TUTORIAL ===== */
function openTutorial() {
  document.getElementById('tutorialPanel').style.display = 'flex';
}
function closeTutorial() {
  document.getElementById('tutorialPanel').style.display = 'none';
}

/* ===== NOTIF BELL ===== */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('#notifBell');
  if(btn) openNotifPanel();
});

function updateNotifDot() {
  const dot = document.getElementById('notifDot');
  if(!dot) return;
  const ns = getNotifs();
  dot.style.display = ns.length>0 ? 'block' : 'none';
}


