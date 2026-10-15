import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface WawancaraViewProps {
  students: Student[];
  onUpdateStudent: (updatedStudent: Student) => void;
  onNavigateLegger: () => void;
}

export const WawancaraView: React.FC<WawancaraViewProps> = ({
  students,
  onUpdateStudent,
  onNavigateLegger,
}) => {
  const [activeStudentId, setActiveStudentId] = useState<string>('std-1');
  const [currentStep, setCurrentStep] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('D');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'selesai' | 'belum' | 'tindak_lanjut' | 'draf'>('all');
  const [statusDropdown, setStatusDropdown] = useState('all');
  const [tindakLanjutDropdown, setTindakLanjutDropdown] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active student being edited in the form
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  // Form field states
  const [studyHabitText, setStudyHabitText] = useState(
    'Belajar pukul 19.30 - 20.30 WIB (~45 menit). Perlu diingatkan 1x, belajar tenang saat tidak ada tayangan TV.'
  );
  const [interestsText, setInterestsText] = useState(
    'Sangat menyukai eksperimen IPA & merakit robotika kertas. Menyukai tantangan jika disajikan visual atau teka-teki logika.'
  );
  const [challengingTopics, setChallengingTopics] = useState<string[]>([
    'Operasi Hitung Perkalian & Pembagian Susun',
    'Hafalan Teks Cerita Sejarah',
    'Kosakata Bahasa Inggris',
  ]);
  const [homeObstacles, setHomeObstacles] = useState(
    'Cepat lelah bila materi terlalu banyak teks hafalan abstrak tanpa ilustrasi atau aplikasi nyata. Sering menunda membuka buku matematika jika merasa soalnya rumit.'
  );
  const [facilityStatus, setFacilityStatus] = useState('kondusif');
  const [parentNote, setParentNote] = useState(
    'Mohon bantuannya agar Fauzan tidak merasa cemas atau minder saat diadakan kuis hitungan cepat di papan tulis.'
  );

  // Print Preview Modal
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveDraft = () => {
    const updated: Student = {
      ...activeStudent,
      interviewStatus: 'draf',
      interviewStep: currentStep,
      interviewNotes: {
        ...activeStudent.interviewNotes,
        studyHabit: studyHabitText,
        interests: interestsText,
        challenges: challengingTopics,
        homeObstacles: homeObstacles,
        teacherNotes: parentNote,
      },
    };
    onUpdateStudent(updated);
    showToast(`Draf wawancara ${activeStudent.name} berhasil disimpan.`);
  };

  const handleCompleteInterview = () => {
    const updated: Student = {
      ...activeStudent,
      interviewStatus: 'selesai',
      interviewStep: 'F',
      interviewAgreement: 'Pendampingan Hitung (MTK)',
      interviewNotes: {
        ...activeStudent.interviewNotes,
        studyHabit: studyHabitText,
        interests: interestsText,
        challenges: challengingTopics,
        homeObstacles: homeObstacles,
        teacherNotes: parentNote,
      },
    };
    onUpdateStudent(updated);
    showToast(`Kesepakatan wawancara ${activeStudent.name} resmi diselesaikan dan dikunci.`);
  };

  const handleSendWhatsApp = () => {
    const phone = activeStudent.parentPhone || '08123456789';
    const text = encodeURIComponent(
      `Halo Bpk/Ibu ${activeStudent.parentName}, berikut ringkasan kesepakatan pembagian rapor semester ganjil Ananda ${activeStudent.name} di SDN Harapan Utama. Terima kasih atas kerja samanya.`
    );
    window.open(`https://wa.me/62${phone.replace(/[^0-9]/g, '').slice(1)}?text=${text}`, '_blank');
    showToast(`Menyiapkan pesan WhatsApp ke ${activeStudent.parentName}...`);
  };

  // Filtered students for bottom table
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery);

      let matchQuick = true;
      if (quickFilter === 'selesai') {
        matchQuick = s.interviewStatus === 'selesai';
      } else if (quickFilter === 'belum') {
        matchQuick = s.interviewStatus === 'belum' || s.interviewStatus === 'terjadwal';
      } else if (quickFilter === 'tindak_lanjut') {
        matchQuick = s.academicGroup === 'pendampingan';
      } else if (quickFilter === 'draf') {
        matchQuick = s.interviewStatus === 'draf';
      }

      return matchSearch && matchQuick;
    });
  }, [students, searchQuery, quickFilter]);

  const selectStudentForInterview = (student: Student) => {
    setActiveStudentId(student.id);
    if (student.interviewNotes) {
      if (student.interviewNotes.studyHabit) setStudyHabitText(student.interviewNotes.studyHabit);
      if (student.interviewNotes.interests) setInterestsText(student.interviewNotes.interests);
      if (student.interviewNotes.challenges) setChallengingTopics(student.interviewNotes.challenges);
      if (student.interviewNotes.homeObstacles) setHomeObstacles(student.interviewNotes.homeObstacles);
      if (student.interviewNotes.teacherNotes) setParentNote(student.interviewNotes.teacherNotes);
    }
    showToast(`Beralih ke formulir wawancara: ${student.name}`);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
            <span>Fase B</span>
            <span className="text-outline-variant">•</span>
            <span>Kelas IV-A</span>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface-variant font-medium">Instrumen Evaluasi & Dialog</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Wawancara & Kemitraan Orang Tua
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Panduan wawancara dialogis saat pembagian rapor semester ganjil. Gali kebiasaan belajar di
            rumah, minat anak, serta bangun komitmen tindak lanjut bersama orang tua tanpa pelabelan
            sepihak.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => showToast('Panduan dialog wawancara orang tua (.pdf) berhasil diunduh.')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-all shadow-sm border border-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Unduh Panduan Dialog (.pdf)</span>
          </button>
          <button
            onClick={() => {
              const pendingStudent = students.find((s) => s.interviewStatus === 'belum') || students[0];
              selectStudentForInterview(pendingStudent);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-on-primary-fixed-variant transition-all shadow-md active:scale-98"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_comment</span>
            <span>+ Mulai Sesi Wawancara Baru</span>
          </button>
        </div>
      </div>

      {/* STATISTIK & PROGRES WAWANCARA (4 CARDS + PROGRESS BAR) */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
                Total Siswa Kelas
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">groups</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">28</span>
              <span className="text-xs text-on-surface-variant font-medium">Siswa</span>
            </div>
            <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center gap-1.5 text-on-surface-variant text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>15 Laki-laki</span>
              <span className="text-outline-variant">•</span>
              <span>13 Perempuan</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
                Belum Dilakukan
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-[11px] font-semibold text-on-surface-variant">
                35.7%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">10</span>
              <span className="text-xs text-on-surface-variant font-medium">Siswa</span>
            </div>
            <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center gap-1.5 text-secondary text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Antrean jadwal rapor bergilir</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
                Wawancara Selesai
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-semibold">
                64.3%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">18</span>
              <span className="text-xs text-primary font-medium">Siswa</span>
            </div>
            <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center gap-1.5 text-primary text-xs">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>18 kesepakatan tersimpan</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
                Perlu Tindak Lanjut
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-semibold">
                25%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-error">7</span>
              <span className="text-xs text-error font-medium">Siswa</span>
            </div>
            <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center gap-1.5 text-on-surface-variant text-xs">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span>Prioritas pendampingan kolaboratif</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Summary */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-container">
          <div className="flex flex-col gap-1 w-full sm:w-2/3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">Progres Dialog Pembagian Rapor</span>
              <span className="font-bold text-primary">18 dari 28 Siswa Selesai (64%)</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: '64.3%' }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-xs whitespace-nowrap bg-surface-container-low px-4 py-2 rounded-lg border border-surface-container">
            <span className="material-symbols-outlined text-[18px] text-tertiary">schedule</span>
            <span>Estimasi waktu tersisa: ~4 jam sesi tatap muka</span>
          </div>
        </div>
      </div>

      {/* FORMULIR WAWANCARA BERTAHAP (ACTIVE STATE FOR SELECTED STUDENT) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6 border border-surface-container">
        {/* Header Form */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-container">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center text-lg font-bold shadow-sm">
              {activeStudent.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-on-surface">
                  Formulir Dialog Orang Tua — {activeStudent.name}
                </h2>
                <span className="px-2 py-0.5 rounded bg-surface-container text-primary text-[11px] font-semibold">
                  {activeStudent.classRoom} • NISN {activeStudent.nisn}
                </span>
              </div>
              <span className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                Status: {activeStudent.interviewStatus === 'selesai' ? 'Selesai & Dikunci' : 'Draf Tersimpan'} • Terakhir diedit: Hari ini 09:42 WIB oleh Ibu Siti Rahmawati, S.Pd.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Pengeditan dibatalkan.')}
              className="px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-all border border-surface-container"
              type="button"
            >
              Batal
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-3.5 py-2 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-all border border-surface-container"
              type="button"
            >
              Simpan Draf
            </button>
            <button
              onClick={handleCompleteInterview}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-on-primary-fixed-variant transition-all shadow-sm active:scale-98"
              type="button"
            >
              Selesaikan & Kunci Kesepakatan
            </button>
          </div>
        </div>

        {/* Stepper Navigation (A to F) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 bg-surface-container-low p-2 rounded-xl border border-surface-container">
          {(
            [
              { id: 'A', title: 'A. Info Sesi', desc: 'Selesai' },
              { id: 'B', title: 'B. Kebiasaan Belajar', desc: 'Selesai' },
              { id: 'C', title: 'C. Minat & Bakat', desc: 'Selesai' },
              { id: 'D', title: 'D. Tantangan', desc: 'Sedang Diisi' },
              { id: 'E', title: 'E. Dukungan Keluarga', desc: 'Berikutnya' },
              { id: 'F', title: 'F. Kesepakatan', desc: 'Penutupan' },
            ] as const
          ).map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                }`}
                type="button"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive ? 'bg-on-primary text-primary' : 'bg-surface-container-high text-primary'
                  }`}
                >
                  {step.id}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate">{step.title}</span>
                  <span
                    className={`text-[10px] truncate ${
                      isActive ? 'text-primary-fixed' : 'text-on-surface-variant'
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Body (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Form Input Aktif */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Panel Step A: Collapsed Data Pertemuan */}
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between border border-surface-container">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Data Pertemuan: {activeStudent.parentName} ({activeStudent.parentRelation})
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {activeStudent.interviewDate || '19 Des 2024'}, {activeStudent.interviewTime || '08:30 WIB'} • Metode: Tatap Muka di Kelas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep('A')}
                className="text-primary text-xs font-semibold hover:underline"
                type="button"
              >
                Ubah
              </button>
            </div>

            {/* Step Content Rendering */}
            {currentStep === 'D' && (
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-4 border border-surface-container">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary text-xs font-bold flex items-center justify-center">
                      D
                    </span>
                    <h3 className="text-sm font-bold text-on-surface">
                      Identifikasi Tantangan & Hambatan Belajar
                    </h3>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">4 Pertanyaan Inti</span>
                </div>

                {/* Field 1: Challenging Subjects */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    1. Materi atau mata pelajaran yang dirasa paling menantang bagi anak saat ini:
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {challengingTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-medium flex items-center gap-1 shadow-sm"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() =>
                            setChallengingTopics(challengingTopics.filter((t) => t !== topic))
                          }
                          className="hover:text-red-200"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const newT = prompt('Tambahkan topik menantang:');
                        if (newT) setChallengingTopics([...challengingTopics, newT]);
                      }}
                      className="px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-surface-container"
                      type="button"
                    >
                      + Tambah Topik
                    </button>
                  </div>
                </div>

                {/* Field 2: Specific Obstacles */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    2. Kendala spesifik yang diamati orang tua saat anak belajar di rumah:
                  </label>
                  <textarea
                    value={homeObstacles}
                    onChange={(e) => setHomeObstacles(e.target.value)}
                    className="w-full bg-surface-container-low p-3 rounded-lg text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 border border-surface-container transition-all"
                    placeholder="Tuliskan amatan orang tua..."
                    rows={3}
                  ></textarea>
                </div>

                {/* Field 3: Facilities Radio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    3. Apakah ada hambatan sarana, waktu, atau lingkungan fisik belajar?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border transition-colors ${
                        facilityStatus === 'kondusif'
                          ? 'bg-surface-container border-primary/30'
                          : 'bg-surface-container-low border-surface-container'
                      }`}
                    >
                      <input
                        checked={facilityStatus === 'kondusif'}
                        onChange={() => setFacilityStatus('kondusif')}
                        className="w-4 h-4 text-primary"
                        name="sarana"
                        type="radio"
                      />
                      <span className="text-xs text-on-surface font-medium">
                        Fasilitas cukup & ruang belajar kondusif
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border transition-colors ${
                        facilityStatus === 'bergantian'
                          ? 'bg-surface-container border-primary/30'
                          : 'bg-surface-container-low border-surface-container'
                      }`}
                    >
                      <input
                        checked={facilityStatus === 'bergantian'}
                        onChange={() => setFacilityStatus('bergantian')}
                        className="w-4 h-4 text-primary"
                        name="sarana"
                        type="radio"
                      />
                      <span className="text-xs text-on-surface-variant font-medium">
                        Perangkat gawai digunakan bergantian
                      </span>
                    </label>
                  </div>
                </div>

                {/* Field 4: Special Note */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    4. Catatan penting dari orang tua yang diharapkan diperhatikan guru:
                  </label>
                  <textarea
                    value={parentNote}
                    onChange={(e) => setParentNote(e.target.value)}
                    className="w-full bg-surface-container-low p-3 rounded-lg text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 border border-surface-container transition-all"
                    placeholder="Catatan khusus..."
                    rows={2}
                  ></textarea>
                </div>
              </div>
            )}

            {currentStep !== 'D' && (
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-surface-container-low">
                  <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary text-xs font-bold flex items-center justify-center">
                    {currentStep}
                  </span>
                  <h3 className="text-sm font-bold text-on-surface">
                    {currentStep === 'A' && 'A. Verifikasi Informasi Sesi & Kontak Wali'}
                    {currentStep === 'B' && 'B. Eksplorasi Kebiasaan & Durasi Belajar di Rumah'}
                    {currentStep === 'C' && 'C. Penggalian Minat, Bakat, & Karakter Unik Anak'}
                    {currentStep === 'E' && 'E. Komitmen & Dukungan Nyata Keluarga di Rumah'}
                    {currentStep === 'F' && 'F. Kesepakatan Final & Rencana Evaluasi 2 Minggu'}
                  </h3>
                </div>

                {currentStep === 'B' && (
                  <div className="space-y-2 text-xs">
                    <label className="font-semibold text-on-surface">Catatan Kebiasaan Belajar di Rumah:</label>
                    <textarea
                      rows={3}
                      value={studyHabitText}
                      onChange={(e) => setStudyHabitText(e.target.value)}
                      className="w-full p-3 bg-surface-container-low rounded-lg border border-surface-container"
                    />
                  </div>
                )}

                {currentStep === 'C' && (
                  <div className="space-y-2 text-xs">
                    <label className="font-semibold text-on-surface">Aktivitas & Minat yang Paling Disukai:</label>
                    <textarea
                      rows={3}
                      value={interestsText}
                      onChange={(e) => setInterestsText(e.target.value)}
                      className="w-full p-3 bg-surface-container-low rounded-lg border border-surface-container"
                    />
                  </div>
                )}

                {(currentStep === 'A' || currentStep === 'E' || currentStep === 'F') && (
                  <div className="p-4 bg-surface-container-low rounded-lg text-xs text-secondary leading-relaxed space-y-2">
                    <p>
                      Informasi bagian ini telah terhubung dengan data master profil wali dan legger akademik.
                    </p>
                    <p>
                      Tekan tombol <strong>"Simpan & Lanjut"</strong> untuk memperbarui data ke sistem.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const steps: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
                  const idx = steps.indexOf(currentStep);
                  if (idx > 0) setCurrentStep(steps[idx - 1]);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Kembali</span>
              </button>
              <button
                onClick={() => {
                  const steps: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
                  const idx = steps.indexOf(currentStep);
                  if (idx < steps.length - 1) {
                    setCurrentStep(steps[idx + 1]);
                    showToast(`Beralih ke Langkah ${steps[idx + 1]}`);
                  } else {
                    handleCompleteInterview();
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-on-primary-fixed-variant transition-all shadow-sm active:scale-98"
                type="button"
              >
                <span>
                  {currentStep === 'F' ? 'Kunci & Selesaikan' : 'Simpan & Lanjut'}
                </span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Live Synthesis Preview Card (Bento Split) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Preview Card */}
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4 border border-surface-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                  <span className="text-sm font-bold text-on-surface">Sintesis Wawasan Sesi Ini</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold">
                  Auto-Sync
                </span>
              </div>

              {/* Ringkasan Bagian Terisi */}
              <div className="flex flex-col gap-3">
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container/60 shadow-xs">
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold">
                    Kebiasaan Belajar di Rumah
                  </span>
                  <p className="text-xs text-on-surface mt-1 font-medium leading-relaxed">
                    {studyHabitText}
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container/60 shadow-xs">
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold">
                    Minat Menonjol
                  </span>
                  <p className="text-xs text-on-surface mt-1 font-medium leading-relaxed">
                    {interestsText}
                  </p>
                </div>
                {/* Draft Tindak Lanjut Awal */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container/60 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-error font-semibold uppercase">
                      Rencana Solutif Matematika
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Fase B</span>
                  </div>
                  <p className="text-xs text-on-surface mt-1 leading-relaxed">
                    Gunakan manipulatif konkret (balok pecahan & grid kotak perkalian) di kelas. Kolaborasi rumah: kuis santai 10 menit tanpa timer.
                  </p>
                </div>
              </div>

              {/* Guidance Box for Teacher */}
              <div className="bg-primary/5 p-3 rounded-lg flex items-start gap-2.5 border border-primary/10">
                <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                  lightbulb
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-primary">Tips Dialog Empatis ZIESORRA:</span>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    Hindari melabeli "lemah berhitung". Formulasikan sebagai{' '}
                    <em>"proses pematangan fondasi representasi bilangan konkret menuju abstrak."</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Access Legger Terkait */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between border border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">table_chart</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">
                    Data Legger Nilai {activeStudent.name.split(' ')[0]}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Rata-rata Kelas: 78.4 • Nilai Siswa: {activeStudent.averageScore.toFixed(1)}
                  </span>
                </div>
              </div>
              <button
                onClick={onNavigateLegger}
                className="text-primary text-xs font-semibold hover:underline"
                type="button"
              >
                Buka Legger
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: TABEL & DAFTAR SISWA KELAS DENGAN STATUS WAWANCARA */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-surface-container">
        {/* Header Tabel & Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              Daftar Wawancara & Pendampingan Siswa
            </h2>
            <p className="text-xs text-on-surface-variant">
              Kelola jadwal temu, catat draf pembagian rapor, dan pantau hasil rekomendasi keluarga.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1.5 rounded-lg border border-surface-container">
            {[
              { id: 'all', label: `Semua Siswa (${students.length})` },
              { id: 'selesai', label: 'Selesai (18)' },
              { id: 'belum', label: 'Belum Diwawancara (10)' },
              { id: 'tindak_lanjut', label: 'Perlu Tindak Lanjut (7)' },
              { id: 'draf', label: 'Draf (2)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setQuickFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  quickFilter === tab.id
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'hover:bg-surface-container-lowest text-on-surface-variant'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Control Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center pt-2">
          <div className="lg:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low pl-10 pr-4 py-2 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container border border-surface-container transition-all"
              placeholder="Cari nama siswa, NISN, atau wali murid..."
              type="text"
            />
          </div>
          <div className="lg:col-span-3">
            <select
              value={statusDropdown}
              onChange={(e) => setStatusDropdown(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container"
            >
              <option value="all">Status: Semua Status (18 Selesai)</option>
              <option value="selesai">Selesai & Kunci</option>
              <option value="draf">Draf Belum Selesai</option>
              <option value="belum">Belum Dilakukan</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <select
              value={tindakLanjutDropdown}
              onChange={(e) => setTindakLanjutDropdown(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container"
            >
              <option value="all">Tindak Lanjut: Semua (7 Perlu Aksi)</option>
              <option value="mtk">Pendampingan Khusus (Matematika)</option>
              <option value="sains">Pengayaan Mandiri (Sains)</option>
              <option value="monitoring">Monitoring Kebiasaan Belajar</option>
            </select>
          </div>
          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setQuickFilter('all');
                setStatusDropdown('all');
                setTindakLanjutDropdown('all');
              }}
              className="w-full sm:w-auto p-2 bg-surface-container-low hover:bg-surface-container rounded-lg text-on-surface-variant flex items-center justify-center border border-surface-container"
              type="button"
              title="Reset"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-semibold border-b border-surface-container">
                <th className="py-3 px-4 w-10">
                  <input className="rounded text-primary focus:ring-0" type="checkbox" />
                </th>
                <th className="py-3 px-4">Nama Siswa & NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-4">Jadwal Sesi</th>
                <th className="py-3 px-4">Status Sesi</th>
                <th className="py-3 px-4">Rekomendasi Tindak Lanjut</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-on-surface divide-y divide-surface-container">
              {filteredStudents.slice(0, 7).map((student) => {
                const isActiveStudent = student.id === activeStudentId;
                const initials = student.name.slice(0, 2).toUpperCase();

                let statusBadge = null;
                if (student.interviewStatus === 'selesai') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      Selesai (Tersimpan)
                    </span>
                  );
                } else if (student.interviewStatus === 'draf') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-primary text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Draf Tersimpan
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                      Belum Dilakukan
                    </span>
                  );
                }

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isActiveStudent
                        ? 'bg-primary-fixed/20 hover:bg-primary-fixed/30'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        checked={isActiveStudent}
                        onChange={() => selectStudentForInterview(student)}
                        className="rounded text-primary focus:ring-0"
                        type="checkbox"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            student.academicGroup === 'pendampingan'
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{student.name}</span>
                          <span className="text-[11px] text-on-surface-variant font-mono">
                            NISN: {student.nisn}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium">
                      {student.classRoom} • {student.phase}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{student.parentName}</span>
                        <span className="text-[11px] text-on-surface-variant">
                          {student.parentRelation}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {student.interviewDate ? (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <span className="material-symbols-outlined text-[16px]">event</span>
                          {student.interviewDate}, {student.interviewTime || '09:00 WIB'}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">Belum Terjadwal</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{statusBadge}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-container text-[11px] text-on-surface font-medium">
                        {student.interviewAgreement || 'Menunggu dialog'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => selectStudentForInterview(student)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          student.interviewStatus !== 'selesai'
                            ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container'
                        }`}
                        type="button"
                      >
                        {student.interviewStatus === 'selesai' ? 'Lihat Ringkasan' : 'Lanjut Isi'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: PRATINJAU LEMBAR KESEPAKATAN TERPADU (SIAP CETAK / KESEPAKATAN ORTU & GURU) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6 border border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">
                  Pratinjau Lembar Kesepakatan Terpadu — {activeStudent.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-semibold">
                  Resmi & Terverifikasi
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Dokumen hasil kesepakatan pembagian rapor yang dapat diunduh orang tua via portal wali murid.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPrintModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-all flex items-center gap-1.5 border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Cetak PDF</span>
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-all flex items-center gap-1.5 border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">share</span>
              <span>Kirim WhatsApp Wali</span>
            </button>
          </div>
        </div>

        {/* 4-Quadrant Visual Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kuadran 1: Kekuatan & Minat */}
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 border border-surface-container">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">star</span>
              <span className="text-xs font-bold uppercase">1. Kekuatan Karakter & Minat Menonjol</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              Memiliki daya ingin tahu tinggi, logika visual kuat, dan sangat tekun dalam menyelesaikan
              proyek rancang bangun sederhana. Responsif terhadap model pembelajaran berbasis
              eksperimen nyata.
            </p>
          </div>

          {/* Kuadran 2: Tantangan Belajar Nyata */}
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 border border-surface-container">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[20px]">flag</span>
              <span className="text-xs font-bold uppercase">2. Area yang Memerlukan Dukungan</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              Transisi konsep operasi hitung susun (perkalian & pembagian Fase B) menimbulkan kecemasan
              bila diuji secara cepat. Memerlukan jembatan representasi benda konkret sebelum rumus abstrak.
            </p>
          </div>

          {/* Kuadran 3: Komitmen Keluarga */}
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 border border-surface-container">
            <div className="flex items-center gap-2 text-tertiary">
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="text-xs font-bold uppercase">3. Komitmen Pendampingan Keluarga di Rumah</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              Orang tua mendampingi latihan hitung santai berdurasi 10 menit (3x seminggu), memastikan ruang
              tenang tanpa televisi pukul 19.30 - 20.30 WIB, serta memberikan apresiasi proses bukan sekadar skor.
            </p>
          </div>

          {/* Kuadran 4: Rencana Aksi Guru & Jadwal Evaluasi */}
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 border border-surface-container">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[20px]">event_repeat</span>
              <span className="text-xs font-bold uppercase">4. Rencana Aksi Guru & Jadwal Review</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              Guru menyediakan lembar bantuan visual (kotak kisi perkalian) di kelas, memberikan penguatan
              personal sebelum tes, dan menjadwalkan evaluasi perkembangan bersama orang tua pada{' '}
              <strong>15 Januari 2025</strong>.
            </p>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="bg-surface-container p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-surface-container-high">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span>
            <span>
              Catatan ini bersifat rahasia untuk pendidik & wali murid. Analisis berbasis dialog murni
              tanpa pengelompokan label gaya belajar kaku. Data tersimpan aman dengan enkripsi RLS.
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant uppercase font-semibold whitespace-nowrap">
            ZIESORRA Parent Insight Engine v2.4
          </span>
        </div>
      </div>

      {/* PRINT PREVIEW MODAL */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
              onClick={() => setPrintModalOpen(false)}
            ></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl p-8 space-y-6 border border-slate-200">
              {/* Official Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    Z
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      LEMBAR KESEPAKATAN PENDAMPINGAN BELAJAR
                    </h2>
                    <p className="text-xs text-slate-500">
                      SDN Harapan Utama • Kelas IV-A (Fase B) • Semester Ganjil 2024/2025
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Student Metadata Box */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500">Nama Siswa:</span>
                  <p className="font-bold text-slate-900 text-sm">{activeStudent.name}</p>
                  <span className="text-slate-500">NISN / NIS:</span>
                  <p className="font-mono text-slate-900">{activeStudent.nisn} / {activeStudent.nis}</p>
                </div>
                <div>
                  <span className="text-slate-500">Orang Tua / Wali:</span>
                  <p className="font-bold text-slate-900 text-sm">{activeStudent.parentName}</p>
                  <span className="text-slate-500">Wali Kelas:</span>
                  <p className="text-slate-900">Ibu Siti Rahmawati, S.Pd.</p>
                </div>
              </div>

              {/* Agreement Points */}
              <div className="space-y-3 text-xs text-slate-800">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-1">A. Kekuatan & Minat</h4>
                  <p>Memiliki daya ingin tahu tinggi, logika visual kuat, dan responsif terhadap pembelajaran konkret.</p>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                  <h4 className="font-bold text-amber-900 mb-1">B. Area Dukungan Terarah</h4>
                  <p>Penguatan konsep algoritma perkalian bersusun melalui manipulatif grid dan bimbingan teratur.</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 mb-1">C. Komitmen Orang Tua & Review Sekolah</h4>
                  <p>Pendampingan 15 menit sebelum tidur di rumah. Sesi evaluasi kemajuan bersama dijadwalkan 15 Januari 2025.</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-6 text-center text-xs text-slate-700">
                <div>
                  <p>Orang Tua / Wali Murid,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{activeStudent.parentName}</p>
                </div>
                <div>
                  <p>Wali Kelas IV-A,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">Ibu Siti Rahmawati, S.Pd.</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setPrintModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Cetak Lembar Dokumen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
