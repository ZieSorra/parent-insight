import React from 'react';

export type NavigationPath = 
  | 'dashboard' 
  | 'data-siswa' 
  | 'upload-legger' 
  | 'wawancara-orang-tua' 
  | 'analisis-dan-tindak-lanjut' 
  | 'panduan-guru';

interface SidebarProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'data-siswa', label: 'Data Siswa', icon: 'groups' },
    { id: 'upload-legger', label: 'Upload Legger', icon: 'upload_file' },
    { id: 'wawancara-orang-tua', label: 'Wawancara Orang Tua', icon: 'forum' },
    { id: 'analisis-dan-tindak-lanjut', label: 'Analisis & Tindak Lanjut', icon: 'insights' },
  ] as const;

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="h-20 flex items-center gap-3 px-6 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <img 
            alt="ZIESORRA Logo" 
            className="h-8 w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida/AEtjO1Ug_J1poeJuN1VkN_8VU4fN32NmZ0Xvu_2ktumy5px0tOiQdi22f-xvhqFl4lmNpc_cNzamVzR3m3eQKVnZ_7k6D8p3VIPEZJuNvqvuYQfcxZ_PocUIRwcit_fUyKbkHhkadady5U9iMMFm1bJMdEKecWEVbyXjisyNRrmQI3z5zE8AZNENyN5JSbU4U59TP6Et3IaFr9UWQyDJY8RbOvsNhawkdAjmDUggVx10vvChbQ2AZa9gJSppuzNe"
            onError={(e) => {
              // Graceful SVG badge fallback if external CDN unavailable
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-on-surface tracking-tight leading-tight">
              ZIESORRA
            </span>
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              Parent Insight
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 py-2">
          <div className="px-3 pb-2 text-[11px] font-semibold text-secondary uppercase tracking-wider">
            Menu Utama
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as NavigationPath)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all font-semibold text-sm ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info & Guide Link */}
      <div className="p-4 flex flex-col gap-3 border-t border-surface-container-low">
        <div className="bg-surface-container-low p-3 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              Satuan Pendidikan
            </span>
            <span className="text-[13px] font-semibold text-on-surface truncate">
              SDN Harapan Utama
            </span>
            <span className="text-[11px] text-secondary">NPSN: 20104829</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('panduan-guru')}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-colors text-[13px] font-semibold ${
            currentPath === 'panduan-guru'
              ? 'bg-primary-container text-on-primary'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
          <span>Panduan Guru & Pusat Bantuan</span>
        </button>
      </div>
    </aside>
  );
};
