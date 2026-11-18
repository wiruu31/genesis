/* Genesis v2.0.0, genesis-core.js
 * Logika murni tanpa DOM: penyimpanan, progres, penilaian kuis, aturan penguasaan.
 * Bisa dijalankan di Node untuk pengujian (node --test test/).
 *
 * Kunci penyimpanan (satu namespace, berversi):
 *   btc-learn:v1:profile | :progress | :quiz-attempts | :lab-attempts | :review-items | :preferences
 */
(function (root) {
  'use strict';

  const NS = 'btc-learn:v1:';
  const SCHEMA = 1;
  const AMBANG = 80;
  const NAMA = ['profile', 'progress', 'quiz-attempts', 'lab-attempts', 'review-items', 'preferences'];

  /* ---------- StorageAdapter ---------- */
  function memoriBackend() {
    const m = new Map();
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => { m.set(k, String(v)); },
      removeItem: (k) => { m.delete(k); },
      keys: () => Array.from(m.keys()),
    };
  }

  function lsBackend(ls) {
    return {
      getItem: (k) => ls.getItem(k),
      setItem: (k, v) => ls.setItem(k, v),
      removeItem: (k) => ls.removeItem(k),
      keys: () => { const out = []; for (let i = 0; i < ls.length; i++) out.push(ls.key(i)); return out; },
    };
  }

  /* Semua akses dibungkus try/catch. Jika localStorage tidak bisa dipakai, jatuh ke memori dan
     `persisten` bernilai false agar UI bisa memberi tahu pengguna. */
  function createStorage(ls) {
    let backend;
    let persisten = false;
    try {
      if (!ls) throw new Error('tidak ada');
      const uji = NS + 'uji';
      ls.setItem(uji, '1');
      ls.removeItem(uji);
      backend = lsBackend(ls);
      persisten = true;
    } catch (e) {
      backend = memoriBackend();
    }
    const api = {
      persisten,
      get(nama, fallback) {
        try {
          const raw = backend.getItem(NS + nama);
          if (raw === null) return { nilai: fallback, rusak: false };
          return { nilai: JSON.parse(raw), rusak: false };
        } catch (e) {
          return { nilai: fallback, rusak: true };
        }
      },
      set(nama, nilai) {
        try { backend.setItem(NS + nama, JSON.stringify(nilai)); return true; } catch (e) { return false; }
      },
      /* Hanya menghapus kunci milik namespace btc-learn. Data lain di origin yang sama tidak disentuh. */
      clearAll() {
        try {
          backend.keys().filter((k) => k && k.startsWith('btc-learn:')).forEach((k) => backend.removeItem(k));
          return true;
        } catch (e) { return false; }
      },
    };
    return api;
  }

  /* ---------- bentuk data bawaan dan sanitasi (migrasi idempoten) ---------- */
  const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

  function defaultProgress() { return { schemaVersion: SCHEMA, lessons: {}, labs: {}, levels: {} }; }
  function defaultPrefs() { return { schemaVersion: SCHEMA, theme: 'auto', reducedMotion: 'auto', textSize: 'normal' }; }
  function defaultProfile(now) { return { schemaVersion: SCHEMA, createdAt: now || new Date().toISOString() }; }

  const STATUS = ['not-started', 'in-progress', 'completed', 'mastered'];

  function sanitizeProgress(raw) {
    const out = defaultProgress();
    if (!isObj(raw)) return out;
    if (isObj(raw.lessons)) {
      for (const [id, v] of Object.entries(raw.lessons)) {
        if (!isObj(v) || !STATUS.includes(v.status)) continue;
        out.lessons[id] = { status: v.status, startedAt: v.startedAt || null, completedAt: v.completedAt || null, masteredAt: v.masteredAt || null };
      }
    }
    if (isObj(raw.labs)) {
      for (const [id, v] of Object.entries(raw.labs)) {
        if (isObj(v)) out.labs[id] = { completed: !!v.completed, at: v.at || null };
      }
    }
    if (isObj(raw.levels)) {
      for (const [id, v] of Object.entries(raw.levels)) {
        if (isObj(v)) out.levels[id] = { mastered: !!v.mastered, at: v.at || null };
      }
    }
    return out;
  }

  function sanitizeAttempts(raw) {
    const out = {};
    if (!isObj(raw)) return out;
    for (const [k, arr] of Object.entries(raw)) {
      if (!Array.isArray(arr)) continue;
      out[k] = arr.filter((a) => isObj(a) && Number.isFinite(a.score) && Number.isFinite(a.total) && a.total > 0)
        .map((a) => ({ at: a.at || null, score: a.score, total: a.total, appCorrect: !!a.appCorrect, wrong: Array.isArray(a.wrong) ? a.wrong.filter((x) => typeof x === 'string') : [] }))
        .slice(-20);
    }
    return out;
  }

  function sanitizePrefs(raw) {
    const out = defaultPrefs();
    if (!isObj(raw)) return out;
    if (['auto', 'light', 'dark'].includes(raw.theme)) out.theme = raw.theme;
    if (['auto', 'on', 'off'].includes(raw.reducedMotion)) out.reducedMotion = raw.reducedMotion;
    if (['normal', 'large'].includes(raw.textSize)) out.textSize = raw.textSize;
    return out;
  }

  /* ---------- penilaian kuis ---------- */
  /* answers: { [questionId]: indeksOpsi }. Soal yang belum dijawab dihitung salah. */
  function gradeQuiz(questions, answers) {
    const wrong = [];
    let score = 0;
    let appTotal = 0;
    let appCorrect = 0;
    for (const q of questions) {
      const benar = Number.isInteger(answers[q.id]) && answers[q.id] === q.answer;
      if (benar) score++; else wrong.push(q.id);
      if (q.application) { appTotal++; if (benar) appCorrect++; }
    }
    const total = questions.length;
    const pct = total ? Math.round((score / total) * 100) : 0;
    return { score, total, pct, wrong, appTotal, appCorrect, appOk: appTotal === 0 ? true : appCorrect > 0 };
  }

  /* Penguasaan lesson: skor minimal 80% dan sedikitnya satu soal aplikasi benar. */
  function lessonMasteredBy(hasil) { return hasil.total > 0 && hasil.pct >= AMBANG && hasil.appOk; }

  /* ---------- repositori progres ---------- */
  function createRepo(storage, data, now) {
    const jam = now || (() => new Date().toISOString());
    let progress, attempts, prefs, profile;
    const peringatan = [];

    function load() {
      const p = storage.get('progress', null);
      const a = storage.get('quiz-attempts', null);
      const f = storage.get('preferences', null);
      const pr = storage.get('profile', null);
      if (p.rusak || a.rusak || f.rusak || pr.rusak) peringatan.push('Sebagian data tersimpan rusak dan diganti dengan nilai awal.');
      progress = sanitizeProgress(p.nilai);
      attempts = sanitizeAttempts(a.nilai);
      prefs = sanitizePrefs(f.nilai);
      profile = isObj(pr.nilai) ? pr.nilai : defaultProfile(jam());
      if (!storage.persisten) peringatan.push('Penyimpanan peramban tidak tersedia. Progres hanya bertahan selama tab ini terbuka.');
      return repo;
    }

    function simpan() {
      const ok = [
        storage.set('progress', progress),
        storage.set('quiz-attempts', attempts),
        storage.set('preferences', prefs),
        storage.set('profile', profile),
      ].every(Boolean);
      if (!ok && !peringatan.includes('Gagal menyimpan progres.')) peringatan.push('Gagal menyimpan progres.');
      return ok;
    }

    const rank = (s) => STATUS.indexOf(s);

    function setStatus(id, status) {
      const cur = progress.lessons[id] || { status: 'not-started', startedAt: null, completedAt: null, masteredAt: null };
      if (rank(status) <= rank(cur.status)) return cur.status;
      cur.status = status;
      const t = jam();
      if (!cur.startedAt) cur.startedAt = t;
      if (rank(status) >= rank('completed') && !cur.completedAt) cur.completedAt = t;
      if (status === 'mastered' && !cur.masteredAt) cur.masteredAt = t;
      progress.lessons[id] = cur;
      return status;
    }

    const repo = {
      peringatan,
      load,
      get progress() { return progress; },
      get prefs() { return prefs; },
      get attempts() { return attempts; },

      statusLesson(id) { return (progress.lessons[id] && progress.lessons[id].status) || 'not-started'; },
      mulaiLesson(id) { setStatus(id, 'in-progress'); simpan(); },
      selesaiLesson(id) { setStatus(id, 'completed'); simpan(); },

      /* Mengembalikan hasil penilaian dan menaikkan status bila memenuhi aturan penguasaan. */
      catatKuis(kunci, questions, answers, lessonId) {
        const hasil = gradeQuiz(questions, answers);
        const list = attempts[kunci] || (attempts[kunci] = []);
        list.push({ at: jam(), score: hasil.score, total: hasil.total, appCorrect: hasil.appCorrect > 0, wrong: hasil.wrong });
        if (list.length > 20) list.splice(0, list.length - 20);
        if (lessonId) {
          setStatus(lessonId, 'completed');
          if (lessonMasteredBy(hasil)) setStatus(lessonId, 'mastered');
        }
        repo.hitungUlangLevel();
        simpan();
        return hasil;
      },

      terbaikKuis(kunci) {
        const list = attempts[kunci] || [];
        let best = null;
        for (const a of list) {
          const pct = Math.round((a.score / a.total) * 100);
          if (!best || pct > best.pct) best = { pct, appCorrect: a.appCorrect, at: a.at };
        }
        return best;
      },

      catatLab(labId) {
        if (!progress.labs[labId] || !progress.labs[labId].completed) progress.labs[labId] = { completed: true, at: jam() };
        repo.hitungUlangLevel();
        simpan();
      },
      labSelesai(labId) { return !!(progress.labs[labId] && progress.labs[labId].completed); },

      /* Penguasaan level: checkpoint >= 80% DAN lab utama level selesai.
         Level tanpa checkpoint (Level 0): semua lesson sudah selesai. */
      levelDikuasai(levelId) {
        const lessons = data.lessonsOfLevel(levelId);
        if (!lessons.length) return false;
        if (levelId === 0) return lessons.every((l) => rank(repo.statusLesson(l.id)) >= rank('completed'));
        const cp = repo.terbaikKuis('cp-level-' + levelId);
        const labUtama = data.labs.find((l) => l.mainFor === levelId);
        const labOk = labUtama ? repo.labSelesai(labUtama.id) : true;
        return !!(cp && cp.pct >= AMBANG && labOk);
      },

      hitungUlangLevel() {
        for (const lv of data.levels) {
          if (lv.status !== 'tersedia') continue;
          const ok = repo.levelDikuasai(lv.id);
          const cur = progress.levels[lv.id];
          if (ok && !(cur && cur.mastered)) progress.levels[lv.id] = { mastered: true, at: jam() };
          if (!ok && cur && cur.mastered) progress.levels[lv.id] = { mastered: false, at: null };
        }
      },
      levelStatus(levelId) { return !!(progress.levels[levelId] && progress.levels[levelId].mastered); },

      ringkasanLevel(levelId) {
        const lessons = data.lessonsOfLevel(levelId);
        const selesai = lessons.filter((l) => rank(repo.statusLesson(l.id)) >= rank('completed')).length;
        const kuasai = lessons.filter((l) => repo.statusLesson(l.id) === 'mastered').length;
        return { total: lessons.length, selesai, kuasai };
      },

      /* Lesson berikutnya yang direkomendasikan: yang sedang dikerjakan, lalu yang pertama belum selesai. */
      lanjut() {
        const seq = data.sequence();
        return seq.find((l) => repo.statusLesson(l.id) === 'in-progress')
          || seq.find((l) => rank(repo.statusLesson(l.id)) < rank('completed'))
          || null;
      },

      /* Soal yang pernah salah pada percobaan terakhir tiap kuis, dipakai ulasan. */
      soalUlasan() {
        const out = [];
        for (const [kunci, list] of Object.entries(attempts)) {
          const last = list[list.length - 1];
          if (last && last.wrong.length) out.push({ kunci, wrong: last.wrong });
        }
        return out;
      },

      /* Impor: data disanitasi dulu, tidak pernah dipercaya apa adanya. */
      impor(prog, att) {
        progress = sanitizeProgress(prog);
        attempts = sanitizeAttempts(att);
        repo.hitungUlangLevel();
        simpan();
      },

      setPrefs(patch) { prefs = sanitizePrefs(Object.assign({}, prefs, patch)); simpan(); return prefs; },

      reset() {
        const ok = storage.clearAll();
        progress = defaultProgress(); attempts = {}; prefs = defaultPrefs(); profile = defaultProfile(jam());
        return ok;
      },
    };
    return repo;
  }

  root.GenesisCore = {
    NS, SCHEMA, AMBANG, NAMA, STATUS,
    createStorage, createRepo, gradeQuiz, lessonMasteredBy,
    sanitizeProgress, sanitizeAttempts, sanitizePrefs, defaultProgress, defaultPrefs,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.GenesisCore;
})(typeof self !== 'undefined' ? self : globalThis);
