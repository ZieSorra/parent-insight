import React, { useState, useMemo } from 'react';
import { Student, ActionPlanStatus } from '../types';

interface AnalisisTindakLanjutViewProps {
  students: Student[];
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const AnalisisTindakLanjutView: React.FC<AnalisisTindakLanjutViewProps> = ({
  students,
  onUpdateStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-1');
  const [activeTab, setActiveTab] = useState<'triangulasi' | 'rencana' | 'riwayat'>('triangulasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [needFilter, setNeedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Note Modal for Tab 3
  const [newLogModalOpen, setNewLogModalOpen] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');

  // Find active student
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Form states for Plan Tab
  const [planPriority, setPlanPriority] = useState(
    activeStudent.actionPlan?.priorityNeed ||
      'Pemahaman Konseptual Perkalian Susun Bilangan Cacah (Matematika Fase B)'
  );
  const [planReason, setPlanReason] = useState(
    activeStudent.actionPlan?.triangulationReason ||
      'Capaian asesmen 64.5 dan catatan orang tua mengenai kecemasan hitung cepat tanpa media konkret'
  );
  const [planSmartGoal, setPlanSmartGoal] = useState(
    activeStudent.actionPlan?.smartGoal ||
      'Siswa mampu menyelesaikan 5 soal perkalian 2 digit x 1 digit dengan manipulatif blok kotak secara mandiri dalam 15 menit dengan akurasi minimal 80%.'
  );
  const [planTeacherStrategy, setPlanTeacherStrategy] = useState(
    activeStudent.actionPlan?.teacherStrategy ||
      'Penggunaan media konkret (grid perkalian berpetak), bimbingan berpasangan (peer tutoring) saat jam bimbingan mandiri 15 menit tiap Selasa & Kamis.'
  );
  const [planFamilySupport, setPlanFamilySupport] = useState(
    activeStudent.actionPlan?.familySupport ||
      'Pendampingan ayah latihan 3 soal visual tanpa pembatasan waktu (timer) sebelum tidur dengan suasana santai 3x seminggu.'
  );
  const [planStatus, setPlanStatus] = useState<ActionPlanStatus>(
    activeStudent.actionPlan?.status || 'Berjalan'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSavePlan = () => {
    const updated: Student = {
      ...activeStudent,
      actionPlan: {
        priorityNeed: planPriority,
        triangulationReason: planReason,
        smartGoal: planSmartGoal,
        teacherStrategy: planTeacherStrategy,
        familySupport: planFamilySupport,
        personInCharge: 'Ibu Siti Rahmawati, S.Pd. & Bpk. Hendra Gunawan (Wali)',
        startDate: activeStudent.actionPlan?.startDate || '2024-12-20',
        evaluationDate: activeStudent.actionPlan?.evaluationDate || '2025-01-15',
        indicator:
          activeStudent.actionPlan?.indicator ||
          'Peningkatan skor formatif terarah >= 75 dan kepercayaan diri meningkat',
        status: planStatus,
      },
    };
    onUpdateStudent(updated);
    showToast(`Rencana tindak lanjut untuk ${activeStudent.name} berhasil diperbarui.`);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle || !newLogDesc) return;
    const newEntry = {
      id: `log-${Date.now()}`,
      title: newLogTitle,
      description: newLogDesc,
      date: 'Hari ini',
      author: 'Ibu Siti Rahmawati, S.Pd.',
      type: 'success' as const,
    };
    const updated: Student = {
      ...activeStudent,
      timelineLogs: [newEntry, ...(activeStudent.timelineLogs || [])],
    };
    onUpdateStudent(updated);
    setNewLogModalOpen(false);
    setNewLogTitle('');
    setNewLogDesc('');
    showToast('Catatan lapangan observasi berhasil ditambahkan.');
  };

  // Filtered monitoring table
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.focusSubjects.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchSubject = true;
      if (subjectFilter !== 'all') {
        matchSubject = s.focusSubjects.some((f) =>
          f.toLowerCase().includes(subjectFilter.toLowerCase())
        );
      }

      let matchNeed = true;
      if (needFilter !== 'all') {
        matchNeed = s.academicGroup === needFilter;
      }

      let matchStatus = true;
      if (statusFilter !== 'all') {
        matchStatus = s.actionPlan?.status === statusFilter;
      }

      return matchSearch && matchSubject && matchNeed && matchStatus;
    });
  }, [students, searchQuery, subjectFilter, needFilter, statusFilter]);

  const selectStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    if (student.actionPlan) {
      setPlanPriority(student.actionPlan.priorityNeed);
      setPlanReason(student.actionPlan.triangulationReason);
      setPlanSmartGoal(student.actionPlan.smartGoal);
      setPlanTeacherStrategy(student.actionPlan.teacherStrategy);
      setPlanFamilySupport(student.actionPlan.familySupport);
      setPlanStatus(student.actionPlan.status);
    }
    showToast(`Memuat analisis komprehensif: ${student.name}`);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Screen Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-widest">
              Fase B
            </span>
            <span className="text-outline-variant text-[11px]">•</span>
            <span className="text-secondary text-[11px] uppercase tracking-widest">Kelas IV-A</span>
            <span className="text-outline-variant text-[11px]">•</span>
            <span className="text-primary text-[11px] font-bold uppercase tracking-wider">
              Sintesis Data & Rencana Intervensi
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Analisis Pembelajaran & Tindak Lanjut
          </h1>
          <p className="text-sm text-secondary leading-relaxed">
            Sintesis triangulasi bukti capaian asesmen legger nilai dan wawancara kualitatif orang tua
            untuk merumuskan intervensi pedagogis terukur tanpa pelabelan psikologis kaku.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => showToast('Ekspor PDF belum tersedia. Tidak ada berkas yang diunduh.')}
            className="flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm border border-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
            <span>Unduh Laporan (.pdf)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('rencana');
              showToast('Membuka formulir rencana tindak lanjut.');
            }}
            className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-98"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>+ Buat Rencana Tindak Lanjut</span>
          </button>
        </div>
      </div>

      {/* 1. Metric Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Perlu Pendampingan */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                Perlu Pendampingan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-800 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                Fokus Utama
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-on-surface">6</span>
              <span className="text-xs text-secondary">Siswa (21.4%)</span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-3 leading-snug">
            Bantuan terarah pada kompetensi prasyarat dasar dan media manipulatif konkret.
          </p>
        </div>

        {/* Card 2: Memerlukan Penguatan */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                Memerlukan Penguatan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-secondary-container text-on-secondary-container font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container mr-1.5"></span>
                Proporsi Mayoritas
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-on-surface">14</span>
              <span className="text-xs text-secondary">Siswa (50.0%)</span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-3 leading-snug">
            Pemantapan latihan terstruktur, pengayaan kosakata, dan variasi problem-solving.
          </p>
        </div>

        {/* Card 3: Siap Pengayaan */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                Siap Pengayaan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-800 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                Eksplorasi
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-on-surface">8</span>
              <span className="text-xs text-secondary">Siswa (28.6%)</span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-3 leading-snug">
            Tantangan kontekstual, penalaran logis mandiri, serta peran mentor sebaya.
          </p>
        </div>

        {/* Card 4: Rencana Aktif */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                Rencana Aktif
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-violet-50 text-violet-800 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-1.5"></span>
                Monitoring
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-on-surface">5</span>
              <span className="text-xs text-secondary">Siswa (17.9%)</span>
            </div>
          </div>
          <p className="text-xs text-secondary mt-3 leading-snug">
            3 Direncanakan, 2 Berjalan butuh evaluasi formatif berkala pekan ini.
          </p>
        </div>
      </div>

      {/* 2. Pedagogical Principle Notice Banner */}
      <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3.5 shadow-sm border border-surface-container">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[20px]">info</span>
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface font-bold">Prinsip Triangulasi Bukti ZIESORRA</span>
            <span className="text-[11px] px-2 py-0.5 bg-surface-container text-secondary rounded font-semibold">
              Pedoman Kurikulum Merdeka
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Kategori kebutuhan (Pendampingan, Penguatan, Pengayaan) bersifat dinamis dan fleksibel
            mengikuti bukti belajar aktual, bukan diagnosis permanen atau label gaya belajar kaku.
            Pemetaan kompetensi memisahkan fakta nilai terukur, catatan wali murid, dan interpretasi
            profesional guru.
          </p>
        </div>
      </div>

      {/* 3. Featured Section: Active Student Profile & Detailed Analysis Panel */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden border border-surface-container">
        {/* Profile Header Strip */}
        <div className="p-6 bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-700 text-xl flex items-center justify-center font-bold shrink-0">
              {activeStudent.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-on-surface truncate">{activeStudent.name}</h2>
                <span className="text-xs text-secondary font-mono">NISN: {activeStudent.nisn}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-900 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                  Perlu Pendampingan (Fokus: {activeStudent.focusSubjects.join(' & ')})
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-secondary text-xs flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">school</span> Kelas {activeStudent.classRoom} ({activeStudent.phase})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">person</span> Wali: {activeStudent.parentName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">event_available</span> Kehadiran: 98%
                </span>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-surface-container-lowest p-1 rounded-lg self-start lg:self-auto shrink-0 shadow-sm border border-surface-container">
            <button
              onClick={() => setActiveTab('triangulasi')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'triangulasi'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
              type="button"
            >
              Ringkasan Triangulasi Data
            </button>
            <button
              onClick={() => setActiveTab('rencana')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'rencana'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
              type="button"
            >
              Formulir Rencana Tindak Lanjut
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'riwayat'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
              type="button"
            >
              Riwayat & Evaluasi Berkala
            </button>
          </div>
        </div>

        {/* Tab Content 1: Triangulasi 3-Column Layout */}
        {activeTab === 'triangulasi' && (
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Bukti Akademik Legger */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-3.5 bg-gradient-to-b from-surface-container-low/40 to-surface-container-lowest shadow-sm border border-surface-container">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">analytics</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">Bukti Akademik Legger</span>
                  </div>
                  <span className="text-[11px] font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded">
                    SAS 1
                  </span>
                </div>

                {/* Mini Metric Box */}
                <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center justify-between shadow-xs border border-surface-container/60">
                  <span className="text-xs text-secondary">Rata-rata Nilai</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base text-amber-600 font-bold tabular-nums">
                      {activeStudent.averageScore.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-secondary">/ Target 75.0</span>
                  </div>
                </div>

                {/* Kompetensi yang Dikuasai */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                    Kompetensi yang Dikuasai:
                  </span>
                  <ul className="flex flex-col gap-1 text-on-surface-variant">
                    <li className="flex items-center justify-between py-1 px-2 rounded bg-surface-container-low/60">
                      <span>P. Pancasila (Aturan Sekolah)</span>
                      <span className="font-semibold text-on-surface font-mono">
                        {activeStudent.scores.pancasila}
                      </span>
                    </li>
                    <li className="flex items-center justify-between py-1 px-2 rounded bg-surface-container-low/60">
                      <span>B. Indonesia (Teks Narasi)</span>
                      <span className="font-semibold text-on-surface font-mono">
                        {activeStudent.scores.indonesia}
                      </span>
                    </li>
                    <li className="flex items-center justify-between py-1 px-2 rounded bg-surface-container-low/60">
                      <span>Seni Budaya & Prakarya</span>
                      <span className="font-semibold text-on-surface font-mono">
                        {activeStudent.scores.seniBudaya}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Kompetensi Perlu Diperkuat */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <span className="text-[11px] text-amber-700 uppercase tracking-wider font-semibold">
                    Kompetensi Perlu Diperkuat:
                  </span>
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-950 flex flex-col gap-1.5 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-900">Matematika (Perkalian Susun)</span>
                      <span className="font-bold text-amber-700 font-mono">
                        {activeStudent.scores.matematika}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-900">IPAS (Perpindahan Kalor)</span>
                      <span className="font-bold text-amber-700 font-mono">
                        {activeStudent.scores.ipas}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 mt-0.5">
                      Kesulitan utama pada retensi algoritma perkalian 2 digit bersusun.
                    </span>
                  </div>
                </div>

                {/* Footnote */}
                <div className="mt-auto pt-2 flex items-center gap-1.5 text-secondary text-[11px]">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Validasi: Sumatif Akhir Semester 1 & 3 portofolio</span>
                </div>
              </div>

              {/* Column 2: Bukti Kualitatif Wawancara Ortu */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-3.5 bg-gradient-to-b from-surface-container-low/40 to-surface-container-lowest shadow-sm border border-surface-container">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">Catatan Wawancara Ortu</span>
                  </div>
                  <span className="text-[11px] font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded">
                    12 Nov 2024
                  </span>
                </div>

                {/* Habit Section */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-surface-container-lowest shadow-xs border border-surface-container/60 text-xs">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                    Kebiasaan Belajar di Rumah:
                  </span>
                  <p className="text-on-surface-variant">
                    {activeStudent.interviewNotes?.studyHabit ||
                      'Belajar malam pk 19.30–20.30 WIB (~45 menit), butuh suasana tenang bebas suara televisi.'}
                  </p>
                </div>

                {/* Minat & Resonansi */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-surface-container-lowest shadow-xs border border-surface-container/60 text-xs">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                    Minat & Gaya Resonansi:
                  </span>
                  <p className="text-on-surface-variant">
                    {activeStudent.interviewNotes?.interests ||
                      'Sangat menyukai eksperimen IPA visual/konkret, mekanik rakit mainan, antusias saat pelajaran memakai peraga kotak berpetak.'}
                  </p>
                </div>

                {/* Tantangan Teramati Rumah */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-surface-container-lowest shadow-xs border border-surface-container/60 text-xs">
                  <span className="text-[11px] text-amber-700 uppercase tracking-wider font-semibold">
                    Tantangan Teramati di Rumah:
                  </span>
                  <p className="text-on-surface-variant">
                    {activeStudent.interviewNotes?.homeObstacles ||
                      'Cepat lelah jika hanya disuguhi lembar angka tanpa alat bantu. Cenderung minder/ragu jika ada tantangan hitung cepat di papan tulis.'}
                  </p>
                </div>

                {/* Kesiapan Keluarga */}
                <div className="mt-auto pt-2 flex items-start gap-2 bg-secondary-container/40 p-2.5 rounded-lg border border-secondary-container text-xs">
                  <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
                    handshake
                  </span>
                  <div className="flex flex-col text-[11px] text-on-surface">
                    <span className="font-semibold">Dukungan Keluarga Aktif:</span>
                    <span className="text-secondary">
                      Ayah ({activeStudent.parentName}) bersedia bimbingan 3x seminggu @ 15 menit dengan modul panduan praktis.
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 3: Sintesis & Rekomendasi Guru */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-3.5 bg-gradient-to-b from-surface-container-low/40 to-surface-container-lowest shadow-sm border border-surface-container">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">Sintesis Pedagogis Guru</span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary bg-surface-container-high px-2 py-0.5 rounded">
                    Fase B
                  </span>
                </div>

                {/* Kategori Kebutuhan Belajar */}
                <div className="p-3 rounded-lg bg-amber-500/10 flex flex-col gap-1 border border-amber-500/20 text-xs">
                  <span className="text-[11px] text-amber-900 uppercase font-semibold">
                    Kategori Kebutuhan Belajar:
                  </span>
                  <span className="text-xs text-amber-950 font-bold">
                    Pendampingan Terarah (Bukan Label Permanen)
                  </span>
                  <span className="text-amber-900 leading-snug">
                    Prioritas penguatan pondasi representasi visual sebelum masuk ke algoritma abstrak.
                  </span>
                </div>

                {/* Faktor Pendukung */}
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                    Faktor Pendukung Terverifikasi:
                  </span>
                  <p className="text-on-surface-variant">
                    Daya tangkap spasial sangat baik, literasi baca tinggi (skor 82), orang tua sangat kooperatif, kehadiran sekolah 98%.
                  </p>
                </div>

                {/* Hambatan Terverifikasi */}
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                    Hambatan Teknis:
                  </span>
                  <p className="text-on-surface-variant">
                    Kecemasan matematika timbul saat instruksi mengharuskan kecepatan tanpa bantuan media hitung konkret.
                  </p>
                </div>

                {/* Rencana Aksi */}
                <div className="mt-auto pt-2 bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between text-xs border border-surface-container">
                  <div className="flex flex-col">
                    <span className="text-secondary text-[11px]">Tindak Lanjut Terhubung:</span>
                    <span className="font-semibold text-primary">Modul Perkalian Berpetak v1</span>
                  </div>
                  <button
                    className="text-primary hover:text-primary-container font-semibold flex items-center gap-0.5"
                    onClick={() => setActiveTab('rencana')}
                    type="button"
                  >
                    Buka Formulir <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Active Plan Builder Form */}
        {activeTab === 'rencana' && (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-on-surface">
                  Formulir Rencana Tindak Lanjut Kolaboratif — {activeStudent.name}
                </h3>
                <p className="text-xs text-secondary">
                  Rencana intervensi individual terkoordinasi antara ruang kelas dan pendampingan di rumah.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Status: {planStatus}
              </span>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); handleSavePlan(); }}>
              {/* Field 1: Prioritas Kebutuhan Belajar */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-semibold text-on-surface">Prioritas Kebutuhan Belajar</label>
                <input
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface text-xs focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container transition-all"
                  type="text"
                  value={planPriority}
                  onChange={(e) => setPlanPriority(e.target.value)}
                />
              </div>

              {/* Field 2: Alasan / Bukti Dasar */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-semibold text-on-surface">
                  Alasan / Bukti Dasar (Triangulasi)
                </label>
                <input
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface text-xs focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container transition-all"
                  type="text"
                  value={planReason}
                  onChange={(e) => setPlanReason(e.target.value)}
                />
              </div>

              {/* Field 3: Tujuan Terukur */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-semibold text-on-surface">
                  Tujuan Terukur (SMART Target)
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface text-xs focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container transition-all"
                  rows={2}
                  value={planSmartGoal}
                  onChange={(e) => setPlanSmartGoal(e.target.value)}
                ></textarea>
              </div>

              {/* Field 4: Strategi Guru di Kelas */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">
                  Strategi & Aktivitas Guru di Kelas
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface text-xs focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container transition-all"
                  rows={3}
                  value={planTeacherStrategy}
                  onChange={(e) => setPlanTeacherStrategy(e.target.value)}
                ></textarea>
              </div>

              {/* Field 5: Dukungan Keluarga di Rumah */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">
                  Dukungan Disepakati Keluarga di Rumah
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface text-xs focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container transition-all"
                  rows={3}
                  value={planFamilySupport}
                  onChange={(e) => setPlanFamilySupport(e.target.value)}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary font-semibold">Ubah Status Rencana:</span>
                  <select
                    value={planStatus}
                    onChange={(e) => setPlanStatus(e.target.value as ActionPlanStatus)}
                    className="bg-surface-container-low text-xs text-on-surface px-3 py-1.5 rounded-lg focus:outline-none border border-surface-container"
                  >
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Perlu Ditinjau">Perlu Ditinjau Ulang</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setPlanStatus('Selesai');
                      showToast(`Rencana ${activeStudent.name} ditandai tuntas selesai.`);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm"
                    type="button"
                  >
                    Tandai Selesai
                  </button>
                  <button
                    className="px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-bold transition-all shadow-sm active:scale-98"
                    type="submit"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content 3: Progress & History Tracker */}
        {activeTab === 'riwayat' && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-on-surface">
                  Riwayat Catatan & Evaluasi Berkala — {activeStudent.name}
                </h3>
                <p className="text-xs text-secondary">
                  Log komunikasi kelas, observasi intervensi, dan sesi konsultasi wali murid.
                </p>
              </div>
              <button
                onClick={() => setNewLogModalOpen(true)}
                className="flex items-center gap-1.5 text-primary hover:text-primary-container text-xs font-semibold"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Tambah Catatan Lapangan</span>
              </button>
            </div>

            {/* Timeline Log Items */}
            <div className="flex flex-col gap-3">
              {(activeStudent.timelineLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-3 border border-surface-container"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-on-surface">{log.title}</span>
                      <span className="text-secondary leading-relaxed mt-0.5">{log.description}</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end text-left md:text-right shrink-0 text-xs">
                    <span className="font-semibold text-on-surface">{log.date}</span>
                    <span className="text-secondary text-[11px]">{log.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Monitoring Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden border border-surface-container">
        {/* Table Header & Toolbar */}
        <div className="p-6 flex flex-col gap-4 border-b border-surface-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-on-surface">
                Daftar & Status Tindak Lanjut Siswa Kelas IV-A
              </h3>
              <p className="text-xs text-secondary">
                Monitoring sintesis triangulasi dan perkembangan intervensi semester berjalan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Semua kolom ditampilkan.')}
                className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                <span>Kustom Kolom</span>
              </button>
              <button
                onClick={() => showToast('Data rekap intervensi berhasil diekspor ke CSV.')}
                className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Dropdown Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-surface-container-low p-2.5 rounded-xl border border-surface-container">
            <div className="md:col-span-4 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container"
                placeholder="Cari nama siswa, NISN, materi..."
                type="text"
              />
            </div>
            <div className="md:col-span-2 relative">
              <select className="w-full h-10 px-3 appearance-none rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none cursor-pointer border border-surface-container">
                <option>Kelas IV-A (Fase B)</option>
                <option>Kelas IV-B (Fase B)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
            <div className="md:col-span-2 relative">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full h-10 px-3 appearance-none rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none cursor-pointer border border-surface-container"
              >
                <option value="all">Semua Mapel</option>
                <option value="Matematika">Matematika</option>
                <option value="IPAS">IPAS</option>
                <option value="Indonesia">B. Indonesia</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
            <div className="md:col-span-2 relative">
              <select
                value={needFilter}
                onChange={(e) => setNeedFilter(e.target.value)}
                className="w-full h-10 px-3 appearance-none rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none cursor-pointer border border-surface-container"
              >
                <option value="all">Semua Kebutuhan</option>
                <option value="pendampingan">Perlu Pendampingan</option>
                <option value="penguatan">Memerlukan Penguatan</option>
                <option value="pengayaan">Siap Pengayaan</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
            <div className="md:col-span-2 relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 appearance-none rounded-lg bg-surface-container-lowest text-on-surface text-xs focus:outline-none cursor-pointer border border-surface-container"
              >
                <option value="all">Semua Status</option>
                <option value="Direncanakan">Direncanakan</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Selesai">Selesai</option>
                <option value="Perlu Ditinjau">Perlu Ditinjau</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-semibold border-b border-surface-container">
              <tr>
                <th className="py-3.5 px-4" scope="col">Siswa</th>
                <th className="py-3.5 px-4" scope="col">Kebutuhan Belajar</th>
                <th className="py-3.5 px-4" scope="col">Fokus Mapel</th>
                <th className="py-3.5 px-4 min-w-[220px]" scope="col">Bukti Sintesis (Legger + Wawancara)</th>
                <th className="py-3.5 px-4 min-w-[200px]" scope="col">Rencana Tindak Lanjut</th>
                <th className="py-3.5 px-4" scope="col">Evaluasi</th>
                <th className="py-3.5 px-4" scope="col">Status</th>
                <th className="py-3.5 px-4 text-right" scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface">
              {filteredStudents.slice(0, 7).map((student) => {
                const isSelected = student.id === selectedStudentId;
                const initials = student.name.slice(0, 2).toUpperCase();

                let needBadge = null;
                if (student.academicGroup === 'pendampingan') {
                  needBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                      Pendampingan
                    </span>
                  );
                } else if (student.academicGroup === 'penguatan') {
                  needBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-secondary-container text-on-secondary-container font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container mr-1.5"></span>
                      Penguatan
                    </span>
                  );
                } else {
                  needBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      Pengayaan
                    </span>
                  );
                }

                const plan = student.actionPlan;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-surface-container-high/40 hover:bg-surface-container-high'
                        : 'bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            student.academicGroup === 'pendampingan'
                              ? 'bg-amber-500/10 text-amber-800'
                              : student.academicGroup === 'pengayaan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-on-surface truncate">{student.name}</span>
                          <span className="text-[11px] text-secondary font-mono truncate">{student.nisn}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{needBadge}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-on-surface">
                      {student.focusSubjects.join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold">
                          Skor {student.averageScore.toFixed(1)}
                        </span>
                        <span className="text-secondary text-[11px] line-clamp-1">
                          {student.interviewNotes?.homeObstacles || 'Catatan pendampingan terstruktur'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-on-surface line-clamp-1 font-medium">
                          {plan?.teacherStrategy || 'Modul terarah + pendampingan ortu'}
                        </span>
                        <span className="text-secondary text-[11px]">Pj: Siti R., S.Pd.</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-secondary">
                      {plan?.evaluationDate || '15 Jan 2025'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                        {plan?.status || 'Berjalan'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isSelected ? (
                        <button
                          className="px-2.5 py-1 rounded bg-primary-container text-on-primary text-[11px] font-semibold"
                          type="button"
                        >
                          Aktif
                        </button>
                      ) : (
                        <button
                          onClick={() => selectStudent(student)}
                          className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold transition-all"
                          type="button"
                        >
                          Detail
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-container text-xs">
          <span className="text-secondary">
            Menampilkan <span className="font-semibold text-on-surface">1 - 7</span> dari{' '}
            <span className="font-semibold text-on-surface">{filteredStudents.length}</span> siswa (Kelas IV-A)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded-md bg-surface-container-lowest text-secondary text-xs shadow-sm border border-surface-container"
              type="button"
            >
              Sebelumnya
            </button>
            <button
              className="w-8 h-8 rounded-md bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center"
              type="button"
            >
              1
            </button>
            <button
              className="w-8 h-8 rounded-md bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs flex items-center justify-center shadow-sm border border-surface-container"
              type="button"
            >
              2
            </button>
            <button
              onClick={() => showToast('Halaman selanjutnya.')}
              className="px-3 py-1.5 rounded-md bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs shadow-sm border border-surface-container"
              type="button"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* 5. Riwayat Perkembangan & Evaluasi (Progress Tracking Section) */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-on-surface">Pelacakan Perkembangan Berkelanjutan</h3>
              <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Validasi Pasca-Intervensi
              </span>
            </div>
            <p className="text-xs text-secondary">
              Perbandingan kondisi awal asesmen legger terhadap skor formatif terarah pasca-pelaksanaan rencana.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-secondary font-medium">1 Tindak Lanjut Tuntas Pekan Ini</span>
          </div>
        </div>

        {/* Explanatory Policy Callout */}
        <div className="p-3 px-4 bg-surface-container-low rounded-lg text-secondary text-xs flex items-center gap-2 border border-surface-container">
          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">verified_user</span>
          <span>
            Grafik & perubahan capaian hanya dimunculkan jika terdapat data pengukuran asesmen ulang valid pasca-evaluasi. Siswa tanpa asesmen ulang berstatus <em>"Belum Dievaluasi"</em>.
          </span>
        </div>

        {/* Completed Case Demonstration Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* Case Highlight: Farah Nabila */}
          <div className="lg:col-span-2 p-4 rounded-xl bg-surface-container-low flex flex-col gap-3 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  FN
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">Farah Nabila (Evaluasi Terverifikasi)</span>
                  <span className="text-xs text-secondary">Matematika & IPAS • Selesai 02 Jan 2025</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +8.0 Poin
              </span>
            </div>

            {/* Comparative Score Bar Visual */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between text-secondary text-xs">
                <span>Kondisi Awal: 74.0 (Penguatan)</span>
                <span className="font-semibold text-on-surface">Hasil Evaluasi Formatif: 82.0 (Mandiri)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex shadow-inner">
                <div className="h-full bg-secondary-fixed-dim" style={{ width: '74%' }}></div>
                <div className="h-full bg-emerald-500 animate-pulse" style={{ width: '8%' }}></div>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Rekomendasi Lanjutan:</strong> Tujuan tercapai penuh melalui peer tutoring. Siswa beralih status dari{' '}
              <em>Penguatan</em> menjadi <em>Pengayaan mandiri</em> untuk modul bab selanjutnya.
            </p>
          </div>

          {/* Quick Summary Metrics */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col justify-between gap-3 border border-surface-container">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
                Status Evaluasi Kelas IV-A
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl text-on-surface font-bold">1 / 6</span>
                <span className="text-xs text-secondary">Target Intervensi Selesai</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-secondary">Jadwal Evaluasi Pekan Ini:</span>
                <span className="font-semibold text-on-surface">2 Siswa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Konsultasi Wali Terjadwal:</span>
                <span className="font-semibold text-on-surface">3 Sesi</span>
              </div>
            </div>
            <button
              onClick={() => showToast('Kalender intervensi semester ganjil dimuat.')}
              className="w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors text-center border border-surface-container"
              type="button"
            >
              Lihat Kalender Intervensi
            </button>
          </div>
        </div>
      </div>

      {/* Screen Footer Note */}
      <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-secondary text-xs">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">security</span>
          <span>Sistem Analisis & Tindak Lanjut ZIESORRA v2.4 • Kompatibel dengan Supabase RLS & Kurikulum Merdeka Fase B</span>
        </div>
        <span>Menjunjung privasi asesmen, etika pendidik, & tanpa pelabelan psikologis kaku</span>
      </div>

      {/* NEW FIELD LOG MODAL */}
      {newLogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
              onClick={() => setNewLogModalOpen(false)}
            ></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-surface-container-lowest text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md p-6 space-y-4 border border-surface-container">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                  <h3 className="text-base font-bold text-on-surface">Tambah Catatan Lapangan Observasi</h3>
                </div>
                <button
                  onClick={() => setNewLogModalOpen(false)}
                  className="text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-secondary">Judul Catatan Observasi</label>
                  <input
                    type="text"
                    required
                    value={newLogTitle}
                    onChange={(e) => setNewLogTitle(e.target.value)}
                    placeholder="Contoh: Observasi Latihan Perkalian Mandiri"
                    className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container"
                  />
                </div>

                <div>
                  <label className="font-semibold text-secondary">Detail Catatan Kemajuan / Kendala</label>
                  <textarea
                    rows={3}
                    required
                    value={newLogDesc}
                    onChange={(e) => setNewLogDesc(e.target.value)}
                    placeholder="Tulis amatan konkret terkait respon siswa terhadap media atau intervensi..."
                    className="w-full p-3 mt-1 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setNewLogModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
