import React, { useState } from 'react';
import { NavigationPath } from '../components/Sidebar';

interface PanduanGuruViewProps {
  onNavigate: (path: NavigationPath) => void;
}

export const PanduanGuruView: React.FC<PanduanGuruViewProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [checklist, setChecklist] = useState<{ [id: string]: boolean }>({
    'c1': true,
    'c2': true,
    'c3': true,
    'c4': false,
    'c5': false,
    'c6': false,
  });

  const checklistItems = [
    { id: 'c1', label: 'Legger nilai semester ganjil sudah diimpor & tervalidasi lengkap (28 siswa)' },
    { id: 'c2', label: 'Distribusi kebutuhan (Pendampingan / Penguatan / Pengayaan) telah dipetakan' },
    { id: 'c3', label: 'Jadwal wawancara orang tua & ruang dialog telah diatur' },
    { id: 'c4', label: 'Instrumen 6 pilar dialog siap dan catatan asesmen formatif telah dianalisis' },
    { id: 'c5', label: 'Draf lembar kesepakatan komitmen kolaborasi telah dipersiapkan' },
    { id: 'c6', label: 'Target SMART tindak lanjut & pemantauan mingguan telah disusun' },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const operationalSteps = [
    {
      step: '01',
      title: 'Validasi & Impor Legger',
      desc: 'Unggah file legger Excel rapor. Periksa status validasi dan perbaiki anomali jika ada nilai di luar rentang atau format tidak sesuai.',
      target: 'upload-legger' as NavigationPath,
      icon: 'file_upload',
      color: 'bg-primary/10 text-primary',
    },
    {
      step: '02',
      title: 'Pemetaan Kebutuhan Belajar',
      desc: 'Tinjau klaster akademik (Pendampingan, Penguatan, Pengayaan) di dashboard untuk memahami fokus bimbingan setiap anak.',
      target: 'dashboard' as NavigationPath,
      icon: 'insights',
      color: 'bg-tertiary/10 text-tertiary',
    },
    {
      step: '03',
      title: 'Persiapan Dialog Orang Tua',
      desc: 'Buka modul Wawancara untuk meninjau data awal anak, capaian asesmen, dan fokus pertanyaan pemantik sebelum temu orang tua.',
      target: 'wawancara-orang-tua' as NavigationPath,
      icon: 'contact_phone',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      step: '04',
      title: 'Pelaksanaan Dialog 6 Pilar',
      desc: 'Jalankan dialog ramah & solutif: dari apresiasi kebiasaan belajar, minat bakat, tantangan, hingga dukungan konkret di rumah.',
      target: 'wawancara-orang-tua' as NavigationPath,
      icon: 'forum',
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      step: '05',
      title: 'Penerbitan Lembar Kesepakatan',
      desc: 'Cetak lembar komitmen kemitraan tripartit yang memuat kesepakatan pembagian peran guru dan orang tua.',
      target: 'wawancara-orang-tua' as NavigationPath,
      icon: 'description',
      color: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      step: '06',
      title: 'Rencana SMART & Pemantauan',
      desc: 'Rumuskan target spesifik di modul Analisis & Tindak Lanjut, lalu catat perkembangan intervensi setiap pekan.',
      target: 'analisis-dan-tindak-lanjut' as NavigationPath,
      icon: 'trending_up',
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  const ethicsGuidelines = [
    {
      title: 'Prinsip Kemitraan Sejajar',
      subtitle: 'Orang tua adalah rekan utama, bukan terdakwa',
      desc: 'Hindari nada menghakimi atau menyudutkan wali murid saat membahas nilai rendah. Mulai selalu dengan apresiasi potensi anak sebelum membedah ruang perbaikan.',
      icon: 'handshake',
      border: 'border-l-4 border-l-primary',
    },
    {
      title: 'Kerahasiaan Data Siswa',
      subtitle: 'Etika privasi dan integritas profesional',
      desc: 'Data rapor, catatan psikososial, dan hasil wawancara bersifat rahasia. Jangan pernah membandingkan nilai anak dengan rekan sekelasnya di depan orang tua lain.',
      icon: 'lock',
      border: 'border-l-4 border-l-secondary',
    },
    {
      title: 'Berbasis Bukti (Data-Driven)',
      subtitle: 'Konkret & dapat dipertanggungjawabkan',
      desc: 'Gunakan catatan portofolio, lembar asesmen formatif harian, dan karya anak sebagai rujukan riil saat mendiskusikan kemajuan belajar.',
      icon: 'fact_check',
      border: 'border-l-4 border-l-tertiary',
    },
    {
      title: 'Solusi Aksi Nyata & Realistis',
      subtitle: 'SMART (Spesifik, Terukur, Relevan)',
      desc: 'Sepakati 1-2 kebiasaan konkret yang sanggup dijalankan di rumah (misal: 15 menit membaca rutin sebelum tidur), bukan tuntutan yang membebani keluarga.',
      icon: 'task_alt',
      border: 'border-l-4 border-l-emerald-500',
    },
  ];

  const faqs = [
    {
      q: 'Bagaimana jika orang tua menyangkal bahwa anaknya mengalami kendala belajar di kelas?',
      a: 'Buka sesi dengan hangat dan tunjukkan portofolio hasil karya atau lembar asesmen harian secara objektif tanpa memberi label negatif ("malas" atau "lambat"). Dengarkan perspektif orang tua tentang perilaku anak di rumah, lalu cari titik temu bahwa sekolah dan orang tua memiliki tujuan yang sama untuk kemajuan ananda.',
    },
    {
      q: 'Bagaimana menangani orang tua yang sibuk dan berhalangan hadir saat pembagian rapor?',
      a: 'ZIESORRA menyediakan fleksibilitas penjadwalan. Anda dapat menjadwalkan dialog pengganti melalui panggilan video (Google Meet / Zoom) atau telepon singkat terfokus (15 menit) menggunakan lembar panduan ZIESORRA, lalu mengirimkan draf lembar kesepakatan via WhatsApp.',
    },
    {
      q: 'Apakah lembar kesepakatan komitmen wajib dicetak?',
      a: 'Sangat disarankan dicetak 1 rangkap sebagai dokumentasi fisik sekolah dan bukti akreditasi, serta ditandatangani bersama. Namun ZIESORRA juga mendukung penyimpanan digital (PDF) yang dapat langsung diarsipkan di modul profil siswa.',
    },
    {
      q: 'Apa perbedaan antara kelompok "Penguatan" dan "Pendampingan"?',
      a: 'Kelompok "Pendampingan" adalah siswa yang membutuhkan perlakuan intensif dan pengulangan konsep dasar di bawah bimbingan langsung guru. Sedangkan kelompok "Penguatan" sudah memahami konsep dasar namun perlu latihan variasi soal dan pembiasaan ritme mandiri agar konsisten.',
    },
    {
      q: 'Kapan rencana tindak lanjut (SMART Plan) harus dievaluasi kembali?',
      a: 'Evaluasi berkala disarankan dilakukan setiap 2 minggu sekali secara internal oleh guru kelas, dan tinjauan kemajuan bersama orang tua dapat dilakukan pada tengah semester (PTS) atau melalui pesan mingguan singkat.',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2 tracking-wide uppercase">
            <span>Panduan & Regulasi</span>
            <span>•</span>
            <span>Kurikulum Merdeka Fase B</span>
            <span>•</span>
            <span>SOP Dialog Pembagian Rapor</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">
            Panduan Guru & Etika Dialog Kemitraan
          </h1>
          <p className="text-sm text-outline mt-1 max-w-2xl">
            Pedoman operasional langkah demi langkah bagi wali kelas untuk memaksimalkan momen pembagian rapor menjadi titik tolak transformasi belajar siswa.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => onNavigate('wawancara-orang-tua')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Mulai Sesi Dialog
          </button>
        </div>
      </div>

      {/* Grid: Workflow & Checklist Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 6 Operational Steps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">route</span>
              Alur Operasional Pengelolaan Rapor & Kemitraan
            </h2>
            <span className="text-xs text-outline font-medium">6 Tahap Standar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {operationalSteps.map((st) => (
              <div
                key={st.step}
                onClick={() => onNavigate(st.target)}
                className="group bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black tracking-widest text-primary/70 bg-primary/10 px-2 py-0.5 rounded-md">
                      TAHAP {st.step}
                    </span>
                    <div className={`p-2 rounded-xl ${st.color}`}>
                      <span className="material-symbols-outlined text-[20px]">{st.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-outline leading-relaxed mt-1.5">
                    {st.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-4 pt-3 border-t border-outline-variant/20">
                  <span>Buka Modul</span>
                  <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Readiness Checklist with Dynamic SVG Ring */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">checklist</span>
                Checklist Kesiapan
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                {completedCount}/{checklistItems.length} Siap
              </span>
            </div>

            {/* SVG Ring */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low mb-5">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-outline-variant/30"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-500 ease-out"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-on-surface">{progressPercent}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Status Kesiapan Kelas</p>
                <p className="text-[11px] text-outline mt-0.5">
                  {progressPercent === 100
                    ? 'Luar biasa! Semua instrumen siap untuk sesi rapor.'
                    : 'Lengkapi seluruh item sebelum membuka sesi dialog tatap muka.'}
                </p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              {checklistItems.map(item => (
                <label
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    checklist[item.id]
                      ? 'bg-emerald-50/50 border-emerald-200 text-on-surface'
                      : 'bg-surface-container-lowest border-outline-variant/30 text-outline hover:border-outline-variant'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.id]}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className={`leading-snug ${checklist[item.id] ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
            <span>Diverifikasi oleh: Wali Kelas IV-A</span>
            <span className="font-semibold text-primary">v2.4 Merdeka</span>
          </div>
        </div>
      </div>

      {/* Ethics & Principles Bento */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">volunteer_activism</span>
          Etika & Komunikasi Dialog Efektif dengan Orang Tua
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ethicsGuidelines.map((eth, idx) => (
            <div
              key={idx}
              className={`bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between ${eth.border}`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-[20px]">{eth.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface leading-tight">
                  {eth.title}
                </h3>
                <p className="text-[11px] font-semibold text-secondary mt-1">
                  {eth.subtitle}
                </p>
                <p className="text-xs text-outline leading-relaxed mt-2.5">
                  {eth.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">help</span>
            Pertanyaan yang Sering Diajukan (FAQ & Solusi Situasional)
          </h2>
          <span className="text-xs text-outline font-medium">Bantuan Cepat Guru</span>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-outline-variant/30 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left bg-surface-container-low/40 hover:bg-surface-container-low transition-colors"
                >
                  <span className="text-sm font-bold text-on-surface pr-4 flex items-center gap-2">
                    <span className="text-primary font-black text-xs">Q{idx + 1}.</span>
                    {faq.q}
                  </span>
                  <span className="material-symbols-outlined text-outline shrink-0 transition-transform duration-200">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 text-xs text-outline leading-relaxed">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
