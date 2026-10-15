import React, { useState } from 'react';
import { NavigationPath } from './Sidebar';

interface HeaderProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  selectedClass?: string;
  setSelectedClass?: (cls: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  academicYear,
  setAcademicYear,
  selectedClass = 'IV-A',
  setSelectedClass = () => {},
  onToggleMobileMenu,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);

  const getBreadcrumbs = () => {
    switch (currentPath) {
      case 'dashboard':
        return {
          section: 'Akademik',
          phase: 'Fase B',
          title: 'Dashboard Akademik & Insight',
        };
      case 'data-siswa':
        return {
          section: 'Fase B • Kelas IV-A',
          phase: 'Basis Data',
          title: 'Manajemen Data Siswa',
        };
      case 'upload-legger':
        return {
          section: 'Fase B',
          phase: 'Impor Nilai',
          title: 'Upload Legger Nilai Rapor',
        };
      case 'wawancara-orang-tua':
        return {
          section: 'Fase B • Kelas IV-A',
          phase: 'Dialog Ortu',
          title: 'Wawancara & Kemitraan Orang Tua',
        };
      case 'analisis-dan-tindak-lanjut':
        return {
          section: 'Akademik & Perkembangan',
          phase: 'Fase B',
          title: 'Analisis & Tindak Lanjut',
        };
      case 'panduan-guru':
        return {
          section: 'Bantuan & Operasional',
          phase: 'Kurikulum Merdeka',
          title: 'Panduan Guru & Pusat Bantuan',
        };
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 left-0 right-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 px-4 md:px-6 flex items-center justify-between border-b border-surface-container">
      {/* Left: Breadcrumbs & Screen Title */}
      <div className="flex items-center gap-3 md:gap-6">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
            title="Menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              {breadcrumbs.section}
            </span>
            <span className="text-[11px] text-outline-variant">/</span>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              {breadcrumbs.phase}
            </span>
          </div>
          <span className="text-lg font-semibold text-on-surface tracking-tight">
            {breadcrumbs.title}
          </span>
        </div>

        {/* Filters in Header */}
        <div className="hidden xl:flex items-center gap-3 ml-4">
          <div className="relative">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container"
            >
              <option value="2026/2027 - Ganjil">Tahun Ajaran 2026/2027 - Ganjil (Aktif)</option>
              <option value="2026/2027 - Genap">Tahun Ajaran 2026/2027 - Genap</option>
              <option value="2024/2025 - Ganjil">Tahun Ajaran 2024/2025 - Ganjil (Arsip)</option>
              <option value="2023/2024 - Genap">Tahun Ajaran 2023/2024 - Genap (Arsip)</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container"
            >
              <option value="IV-A">Kelas: IV-A (Fase B)</option>
              <option value="IV-B">Kelas: IV-B (Fase B)</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Dynamic Contextual Action Button */}
        {currentPath !== 'upload-legger' ? (
          <button
            onClick={() => onNavigate('upload-legger')}
            className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-98"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Upload Legger</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('wawancara-orang-tua')}
            className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-98"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <span>Mulai Wawancara</span>
          </button>
        )}

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            aria-label="Notifikasi"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors relative"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {notificationCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-error absolute top-2 right-2 ring-2 ring-surface-container-lowest"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="font-semibold text-sm text-on-surface">Pemberitahuan Sistem</span>
                <button
                  onClick={() => {
                    setNotificationCount(0);
                    setShowNotifications(false);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Tandai dibaca
                </button>
              </div>
              <div className="flex flex-col gap-3 pt-3">
                <div 
                  onClick={() => {
                    onNavigate('upload-legger');
                    setShowNotifications(false);
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-error mt-1.5 shrink-0"></span>
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-on-surface">Anomali Legger Terdeteksi</span>
                    <span className="text-secondary text-[11px]">3 baris legger perlu verifikasi skor di luar rentang.</span>
                  </div>
                </div>
                <div 
                  onClick={() => {
                    onNavigate('wawancara-orang-tua');
                    setShowNotifications(false);
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-on-surface">Jadwal Wawancara Rapor</span>
                    <span className="text-secondary text-[11px]">Bunga Citra Lestari terjadwal besok pukul 09.00 WIB.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-surface-container">
          <img
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT50DAnOy8B7ish00MDRL9qMC96q_v2F_XnMrP74Bsew9fbO9d9QBnqaykX1p80yQBesIgZEG-lMED6xWOGIKm0KFNYdpY0zPDUpuoSFVto0sw1_rzVmf8IMsdWt_icyhyd47neC-BbVcV7dVxx_azeB3L5Ug41QDdfBzDbYgfuf7d1Wj_KaywzKhZBtoLn353KHjwgLYiRNSPc1zQQYHX0OlV9i3MoQWYHYAUpb5BUIncOV8M5INukQ"
            onError={(e) => {
              // Fallback if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-on-surface leading-tight">
              Ibu Siti Rahmawati, S.Pd.
            </span>
            <span className="text-[11px] text-secondary leading-tight">
              Wali Kelas IV-A
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
