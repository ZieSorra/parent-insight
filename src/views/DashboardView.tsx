import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { NavigationPath } from '../components/Sidebar';

interface DashboardViewProps {
  students: Student[];
  onNavigate: (path: NavigationPath) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  onNavigate,
  onUpdateStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [needFilter, setNeedFilter] = useState<'all' | 'pendampingan' | 'penguatan' | 'pengayaan'>('all');
  const [interviewFilter, setInterviewFilter] = useState<'all' | 'selesai' | 'terjadwal' | 'belum'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Drawer state for Quick Interview
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [drawerStudyHabit, setDrawerStudyHabit] = useState('');
  const [drawerSupports, setDrawerSupports] = useState<string[]>([
    'Mendampingi membaca 15 menit sebelum tidur',
    'Menyediakan sudut belajar tenang tanpa gawai saat jam belajar',
  ]);
  const [drawerTeacherNote, setDrawerTeacherNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.nis.includes(searchQuery);

      const matchNeed = needFilter === 'all' || s.academicGroup === needFilter;

      let matchInterview = true;
      if (interviewFilter === 'selesai') {
        matchInterview = s.interviewStatus === 'selesai';
      } else if (interviewFilter === 'terjadwal') {
        matchInterview = s.interviewStatus === 'terjadwal';
      } else if (interviewFilter === 'belum') {
        matchInterview = s.interviewStatus === 'belum' || s.interviewStatus === 'draf';
      }

      return matchSearch && matchNeed && matchInterview;
    });
  }, [students, searchQuery, needFilter, interviewFilter]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const openDrawerForStudent = (student: Student) => {
    setActiveStudent(student);
    setDrawerStudyHabit(
      student.interviewNotes?.studyHabit ||
        'Sangat menyukai eksperimen praktis, namun mudah terdistraksi jika belajar lebih dari 20 menit tanpa jeda...'
    );
    setDrawerSupports(
      student.interviewNotes?.parentSupportAgreed || [
        'Mendampingi membaca 15 menit sebelum tidur',
        'Menyediakan sudut belajar tenang tanpa gawai saat jam belajar',
      ]
    );
    setDrawerTeacherNote(
      student.interviewNotes?.teacherNotes ||
        'Berikan lembar modul pengayaan bertahap minggu ke-2'
    );
    setDrawerOpen(true);
  };

  const handleSaveDrawer = () => {
    if (!activeStudent) return;
    const updated: Student = {
      ...activeStudent,
      interviewStatus: 'selesai',
      interviewAgreement: activeStudent.focusSubjects[0]
        ? `Selesai (${activeStudent.focusSubjects[0]})`
        : 'Selesai (Kesepakatan Ada)',
      interviewNotes: {
        ...activeStudent.interviewNotes,
        studyHabit: drawerStudyHabit,
        parentSupportAgreed: drawerSupports,
        teacherNotes: drawerTeacherNote,
      },
    };
    onUpdateStudent(updated);
    setDrawerOpen(false);
    showToast(`Kesepakatan wawancara untuk ${updated.name} berhasil disimpan!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSyncAgain = () => {
    showToast('Sinkronisasi server belum tersedia. Data legger di halaman ini masih contoh prototipe.');
  };

  const handleExport = () => {
    showToast('Ekspor PDF belum tersedia. Tidak ada berkas yang diunduh.');
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. BANNER PENGINGAT STRATEGIS */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary-container to-tertiary p-8 text-on-primary shadow-sm">
        <div className="absolute -right-8 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-tertiary-fixed-dim/20 blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-white">
                calendar_clock
              </span>
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-on-primary backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Strategi Pembagian Rapor
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Momen Emas Pengambilan Rapor Semester Ganjil
              </h1>
              <p className="text-sm text-on-primary/90 leading-relaxed">
                Gunakan sesi pembagian rapor bukan hanya untuk menyerahkan angka, tetapi sebagai
                kesempatan berharga menggali kebutuhan belajar, preferensi aktivitas anak, dan
                menyepakati kolaborasi pendampingan belajar bersama orang tua.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => onNavigate('wawancara-orang-tua')}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-surface-container-lowest text-primary font-semibold text-sm hover:bg-surface-container-low transition-all shadow-sm active:scale-98"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">event_available</span>
              <span>Mulai Jadwalkan Wawancara</span>
            </button>
            <button
              onClick={() => onNavigate('panduan-guru')}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/15 hover:bg-white/25 text-white backdrop-blur-md font-semibold text-sm transition-all active:scale-98"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span>Panduan Pertanyaan Guru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KARTU STATISTIK UTAMA (4 Metrik Kunci) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Metrik 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Total Siswa Terdata
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">28</span>
              <span className="text-base text-secondary font-medium">Siswa</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-secondary">
              <span className="inline-flex items-center gap-1 text-primary font-medium">
                <span className="material-symbols-outlined text-[14px]">male</span> 15
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-tertiary font-medium">
                <span className="material-symbols-outlined text-[14px]">female</span> 13
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-surface-container-low flex items-center justify-between text-[11px] text-secondary">
            <span className="inline-flex items-center gap-1.5 text-on-surface-variant font-medium">
              <span className="w-2 h-2 rounded-full bg-primary"></span> 100% Sinkron Legger
            </span>
            <span className="text-secondary font-medium">Kelas IV-A</span>
          </div>
        </div>

        {/* Metrik 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-error uppercase font-semibold tracking-wider">
              Perlu Pendampingan
            </span>
            <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">flag</span>
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-error">6</span>
              <span className="text-base text-secondary font-medium">Siswa</span>
            </div>
            <p className="mt-2 text-xs text-secondary">
              Prioritas tinggi untuk remedial & wawancara terfokus
            </p>
          </div>
          <div className="pt-2">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-error h-full rounded-full" style={{ width: '21.4%' }}></div>
            </div>
          </div>
        </div>

        {/* Metrik 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Wawancara Selesai
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[18px]">forum</span>
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">18</span>
              <span className="text-base text-secondary font-medium">/ 28 Siswa</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary">
              <span className="font-semibold text-primary">64%</span>
              <span>kesepakatan tersimpan</span>
            </div>
          </div>
          <div className="pt-2">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>
        </div>

        {/* Metrik 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Progres Tindak Lanjut
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">75%</span>
              <span className="text-base text-secondary font-medium">Terstruktur</span>
            </div>
            <p className="mt-2 text-xs text-secondary">
              Rencana aksi remedial & pengayaan mandiri
            </p>
          </div>
          <div className="pt-2">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION VISUALISASI DISTRIBUSI PENDAMPINGAN & FOKUS TINDAK LANJUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kartu 1: Distribusi Kebutuhan Akademik */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface">
                Distribusi Kebutuhan Akademik Siswa
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary bg-surface-container px-2 py-1 rounded-md">
                <span className="material-symbols-outlined text-[14px]">analytics</span> Legger Real-time
              </span>
            </div>
            <p className="text-xs text-secondary">
              Berdasarkan nilai agregat sumatif & bukti portofolio pembelajaran Fase B
            </p>
          </div>

          {/* Visual Multi-segment bar */}
          <div className="my-6 space-y-3">
            <div className="h-4 w-full rounded-full bg-surface-container-low overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-error hover:opacity-90 transition-opacity cursor-pointer relative group"
                style={{ width: '21.4%' }}
                title="Perlu Pendampingan: 6 Siswa (21%)"
                onClick={() => setNeedFilter('pendampingan')}
              ></div>
              <div
                className="h-full bg-primary-container hover:opacity-90 transition-opacity cursor-pointer relative group"
                style={{ width: '50%' }}
                title="Penguatan: 14 Siswa (50%)"
                onClick={() => setNeedFilter('penguatan')}
              ></div>
              <div
                className="h-full bg-tertiary-container hover:opacity-90 transition-opacity cursor-pointer relative group"
                style={{ width: '28.6%' }}
                title="Pengayaan: 8 Siswa (29%)"
                onClick={() => setNeedFilter('pengayaan')}
              ></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Segmen 1 */}
              <div 
                onClick={() => setNeedFilter(needFilter === 'pendampingan' ? 'all' : 'pendampingan')}
                className={`p-3 rounded-lg flex flex-col gap-1 cursor-pointer transition-colors ${
                  needFilter === 'pendampingan' ? 'bg-error-container/40 ring-1 ring-error' : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                  <span className="text-[11px] text-secondary font-semibold">Perlu Pendampingan</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-on-surface">6 Siswa</span>
                  <span className="text-[11px] text-error font-semibold">21% (&lt; 70)</span>
                </div>
              </div>
              {/* Segmen 2 */}
              <div 
                onClick={() => setNeedFilter(needFilter === 'penguatan' ? 'all' : 'penguatan')}
                className={`p-3 rounded-lg flex flex-col gap-1 cursor-pointer transition-colors ${
                  needFilter === 'penguatan' ? 'bg-primary-fixed/50 ring-1 ring-primary' : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                  <span className="text-[11px] text-secondary font-semibold">Penguatan</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-on-surface">14 Siswa</span>
                  <span className="text-[11px] text-primary font-semibold">50% (70-84)</span>
                </div>
              </div>
              {/* Segmen 3 */}
              <div 
                onClick={() => setNeedFilter(needFilter === 'pengayaan' ? 'all' : 'pengayaan')}
                className={`p-3 rounded-lg flex flex-col gap-1 cursor-pointer transition-colors ${
                  needFilter === 'pengayaan' ? 'bg-tertiary-fixed/50 ring-1 ring-tertiary' : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                  <span className="text-[11px] text-secondary font-semibold">Pengayaan</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-on-surface">8 Siswa</span>
                  <span className="text-[11px] text-tertiary font-semibold">29% (≥ 85)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-secondary bg-surface-container-low/70 px-4 py-2.5 rounded-lg border border-surface-container">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">info</span>
            <span className="text-xs leading-tight">
              Analisis murni berbasis bukti capaian formatif & sumatif tanpa pelabelan gaya belajar kaku.
            </span>
          </div>
        </div>

        {/* Kartu 2: Fokus Tindak Lanjut Menjelang Rapor */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">assignment_turned_in</span>
              <h2 className="text-lg font-bold text-on-surface">
                Fokus Tindak Lanjut Rapor
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Persiapan</span>
          </div>

          <div className="space-y-3 my-3">
            <div 
              onClick={() => onNavigate('wawancara-orang-tua')}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-sm text-on-surface font-medium">Sesi Wawancara Menunggu Terjadwal</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[11px] font-semibold text-primary">
                4 Siswa
              </span>
            </div>
            <div 
              onClick={() => onNavigate('analisis-dan-tindak-lanjut')}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-sm text-on-surface font-medium">Modul Remedial Mandiri Disiapkan</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[11px] font-semibold text-primary">
                6 Paket
              </span>
            </div>
            <div 
              onClick={() => onNavigate('analisis-dan-tindak-lanjut')}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-sm text-on-surface font-medium">Paket Lembar Pengayaan Siap Cetak</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[11px] font-semibold text-primary">
                8 Berkas
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-secondary text-xs border-t border-surface-container-low">
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[16px] text-tertiary">sync</span>
              <span className="truncate">
                Sinkronisasi: 2 jam lalu (<span className="font-medium text-on-surface-variant">legger_semester1_kelas4a.xlsx</span>)
              </span>
            </div>
            <button
              onClick={handleSyncAgain}
              className="text-primary hover:underline font-semibold shrink-0 ml-2"
              type="button"
            >
              Sinkron Ulang
            </button>
          </div>
        </div>
      </div>

      {/* 4. TABEL SISWA PRIORITAS & MONITORING WAWANCARA */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container">
        {/* Toolbar Filter & Search */}
        <div className="p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-surface-container">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined text-[20px] text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-surface-container-low text-on-surface pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-transparent hover:border-surface-container"
                placeholder="Cari nama siswa atau NISN..."
                type="text"
              />
            </div>

            {/* Filter Kategori Kebutuhan */}
            <div className="relative">
              <select
                value={needFilter}
                onChange={(e) => {
                  setNeedFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-surface-container-low text-on-surface text-xs pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container font-medium"
              >
                <option value="all">Kebutuhan: Semua (28)</option>
                <option value="pendampingan">Perlu Pendampingan (6)</option>
                <option value="penguatan">Penguatan (14)</option>
                <option value="pengayaan">Pengayaan (8)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                arrow_drop_down
              </span>
            </div>

            {/* Filter Status Wawancara */}
            <div className="relative">
              <select
                value={interviewFilter}
                onChange={(e) => {
                  setInterviewFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-surface-container-low text-on-surface text-xs pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container font-medium"
              >
                <option value="all">Wawancara: Semua Status</option>
                <option value="selesai">Selesai (18)</option>
                <option value="terjadwal">Terjadwal (3)</option>
                <option value="belum">Belum Terjadwal (7)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Tombol Aksi Tabel */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Ekspor Laporan</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold border-b border-surface-container">
                <th className="py-3 px-6">Nama Siswa & NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Rata-rata & Fokus Mapel</th>
                <th className="py-3 px-4">Prioritas Pembelajaran</th>
                <th className="py-3 px-4">Status Wawancara Ortu</th>
                <th className="py-3 px-6 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm text-on-surface">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary">
                    Tidak ada data siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const initials = student.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('');

                  let badgeGroup = null;
                  if (student.academicGroup === 'pendampingan') {
                    badgeGroup = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-error text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Prioritas Tinggi
                      </span>
                    );
                  } else if (student.academicGroup === 'penguatan') {
                    badgeGroup = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Pendampingan Sedang
                      </span>
                    );
                  } else {
                    badgeGroup = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Pengayaan Mandiri
                      </span>
                    );
                  }

                  let interviewBadge = null;
                  if (student.interviewStatus === 'selesai') {
                    interviewBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {student.interviewAgreement || 'Selesai'}
                      </span>
                    );
                  } else if (student.interviewStatus === 'terjadwal') {
                    interviewBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Terjadwal ({student.interviewDate?.split(' ')[0] || '19 Des'})
                      </span>
                    );
                  } else {
                    interviewBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-secondary text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Belum Terjadwal
                      </span>
                    );
                  }

                  return (
                    <tr key={student.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                              student.academicGroup === 'pendampingan'
                                ? 'bg-error-container text-error'
                                : student.academicGroup === 'pengayaan'
                                ? 'bg-tertiary-fixed text-tertiary'
                                : 'bg-secondary-container text-primary'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{student.name}</div>
                            <div className="text-xs text-secondary font-mono">NISN: {student.nisn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-secondary whitespace-nowrap text-xs">
                        {student.classRoom} ({student.phase})
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold tabular-nums ${
                              student.averageScore < 70
                                ? 'text-error'
                                : student.averageScore >= 85
                                ? 'text-tertiary'
                                : 'text-primary'
                            }`}
                          >
                            {student.averageScore.toFixed(1)}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {student.focusSubjects.map((sbj, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px]"
                              >
                                {sbj}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">{badgeGroup}</td>
                      <td className="py-4 px-4 whitespace-nowrap">{interviewBadge}</td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {student.interviewStatus !== 'selesai' ? (
                            <button
                              onClick={() => openDrawerForStudent(student)}
                              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-all active:scale-98 shadow-sm"
                              type="button"
                            >
                              Mulai Wawancara
                            </button>
                          ) : (
                            <button
                              onClick={() => openDrawerForStudent(student)}
                              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all"
                              type="button"
                            >
                              Lihat Hasil
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onNavigate('analisis-dan-tindak-lanjut');
                            }}
                            className="p-1.5 rounded-lg hover:bg-surface-container text-secondary"
                            title="Detail Siswa"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination / Footer Bar */}
        <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 text-secondary text-xs border-t border-surface-container">
          <span>
            Menampilkan <strong className="text-on-surface">{paginatedStudents.length}</strong> dari{' '}
            <strong className="text-on-surface">{filteredStudents.length}</strong> siswa terdaftar
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  currentPage === pg
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container'
                    : 'hover:bg-surface-container text-secondary'
                }`}
                type="button"
              >
                {pg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. DOKUMENTASI & AKSES CEPAT FORMULIR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">psychology_alt</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Kerangka Wawancara Efektif (Fase B)</h3>
              <p className="text-xs text-secondary">
                Panduan observasi tanpa asumsi: gali aktivitas kegemaran, durasi fokus, dan lingkungan pendampingan.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
              <span className="text-[11px] font-bold text-primary uppercase">1. Kebiasaan Belajar</span>
              <p className="text-xs text-secondary mt-1">
                Kapan anak merasa paling bersemangat dan nyaman saat mengulang pelajaran di rumah?
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
              <span className="text-[11px] font-bold text-primary uppercase">2. Preferensi Aktivitas</span>
              <p className="text-xs text-secondary mt-1">
                Aktivitas motorik atau visual konkret apa yang paling sering anak ceritakan di rumah?
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container">
              <span className="text-[11px] font-bold text-primary uppercase">3. Kesepakatan Nyata</span>
              <p className="text-xs text-secondary mt-1">
                Satu komitmen realistis yang disepakati guru & ortu untuk dicoba 2 minggu pertama.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-secondary text-xs pt-2 border-t border-surface-container-low">
            <span>Tersedia lembar instrumen format PDF siap cetak untuk arsip wali kelas.</span>
            <button
              onClick={() => showToast('Lembar instrumen wawancara PDF berhasil diunduh.')}
              className="text-primary font-semibold hover:underline flex items-center gap-1"
              type="button"
            >
              Unduh Instrumen PDF <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="bg-surface-container-high p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-primary text-[11px] font-bold uppercase">
              Akses Pintas
            </div>
            <h3 className="text-base font-bold text-on-surface">Input Cepat Kesepakatan</h3>
            <p className="text-xs text-secondary">
              Catat ringkasan perbincangan informal saat tatap muka rapor tanpa menunggu selesai jam dinas.
            </p>
          </div>
          <div className="my-4 space-y-2">
            <button
              onClick={() => {
                const firstPending = students.find((s) => s.interviewStatus !== 'selesai') || students[0];
                openDrawerForStudent(firstPending);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-all shadow-sm active:scale-98"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
              <span>Buka Formulir Baru</span>
            </button>
            <button
              onClick={() => onNavigate('wawancara-orang-tua')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold hover:bg-surface-container transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Lihat Log Wawancara Terakhir</span>
            </button>
          </div>
          <div className="text-[11px] text-secondary text-center">
            Otomatis tersimpan & terenkripsi lokal
          </div>
        </div>
      </div>

      {/* Banner Footer Teknis */}
      <div className="py-3 px-6 rounded-xl bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-3 text-secondary text-xs shadow-sm border border-surface-container">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span className="font-semibold text-on-surface">Ziesorra Parent Insight Engine v2.4</span>
          <span className="text-outline-variant">•</span>
          <span>Komponen modular siap integrasi GitHub & Supabase Database</span>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant font-medium">
          <button onClick={() => onNavigate('panduan-guru')} className="hover:text-primary transition-colors">
            Bantuan Teknis
          </button>
          <button onClick={() => onNavigate('upload-legger')} className="hover:text-primary transition-colors">
            Audit Log Legger
          </button>
          <span className="text-secondary">Kebijakan Privasi Murid</span>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER MODAL (INTERAKTIF UNTUK INPUT WAWANCARA CEPAT) */}
      {drawerOpen && activeStudent && (
        <>
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>
          <aside className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-surface-container-lowest shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col justify-between border-l border-surface-container">
            {/* Header Drawer */}
            <div className="p-6 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">forum</span>
                </div>
                <div>
                  <span className="text-[11px] text-secondary uppercase font-semibold">
                    Formulir Kolaborasi Ortu
                  </span>
                  <h3 className="text-base font-bold text-on-surface">
                    {activeStudent.name}
                  </h3>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                onClick={() => setDrawerOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body Drawer (Formulir) */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="bg-surface-container-low p-4 rounded-lg space-y-1 border border-surface-container">
                <div className="flex justify-between text-xs text-secondary">
                  <span>
                    NISN: <span className="font-semibold text-on-surface font-mono">{activeStudent.nisn}</span>
                  </span>
                  <span>
                    Target Mapel:{' '}
                    <span className="font-semibold text-error">
                      {activeStudent.focusSubjects.join(' & ') || 'Umum'}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-secondary pt-1">
                  Catatan: Form ini berfokus pada strategi konkret di rumah yang disetujui bersama orang tua saat sesi rapor.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">
                  1. Hasil Penggalian Minat & Kebiasaan Belajar
                </label>
                <textarea
                  value={drawerStudyHabit}
                  onChange={(e) => setDrawerStudyHabit(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container"
                  placeholder="Contoh: Sangat menyukai eksperimen praktis, namun mudah terdistraksi jika belajar lebih dari 20 menit tanpa jeda..."
                  rows={3}
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">
                  2. Bentuk Dukungan Orang Tua yang Disepakati
                </label>
                <div className="space-y-2">
                  {[
                    'Mendampingi membaca 15 menit sebelum tidur',
                    'Menyediakan sudut belajar tenang tanpa gawai saat jam belajar',
                    'Memberikan pujian atas usaha proses bukan hanya nilai akhir',
                    'Latihan hitung santai 10 menit (3x seminggu) tanpa timer',
                  ].map((supportOption, i) => {
                    const isChecked = drawerSupports.includes(supportOption);
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors border border-surface-container/50"
                      >
                        <input
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDrawerSupports([...drawerSupports, supportOption]);
                            } else {
                              setDrawerSupports(drawerSupports.filter((s) => s !== supportOption));
                            }
                          }}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                          type="checkbox"
                        />
                        <span className="text-sm text-on-surface">{supportOption}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">
                  3. Catatan Khusus Tindak Lanjut Guru
                </label>
                <input
                  value={drawerTeacherNote}
                  onChange={(e) => setDrawerTeacherNote(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container"
                  placeholder="e.g. Berikan lembar modul pengayaan bertahap minggu ke-2"
                  type="text"
                />
              </div>
            </div>

            {/* Footer Drawer */}
            <div className="p-6 bg-surface-container-low flex items-center justify-end gap-3 border-t border-surface-container">
              <button
                className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                onClick={() => setDrawerOpen(false)}
                type="button"
              >
                Batal
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold transition-all shadow-sm active:scale-98"
                onClick={handleSaveDrawer}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Simpan Kesepakatan</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};
