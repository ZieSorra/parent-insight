/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { Sidebar, NavigationPath } from './components/Sidebar';
import { Header } from './components/Header';
import { INITIAL_STUDENTS } from './data/mockData';
import { Student } from './types';
import { DashboardView } from './views/DashboardView';
import { DataSiswaView } from './views/DataSiswaView';
import { UploadLeggerView } from './views/UploadLeggerView';
import { WawancaraView } from './views/WawancaraView';
import { AnalisisTindakLanjutView } from './views/AnalisisTindakLanjutView';
import { PanduanGuruView } from './views/PanduanGuruView';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfileStatus(null);
      setAuthError(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfileStatus(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, role, workspace_id')
        .eq('id', session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setProfileStatus('Profil belum dapat dibaca. Periksa kebijakan RLS dan konfigurasi Supabase.');
      } else if (!data || !data.workspace_id) {
        setProfileStatus('Akun berhasil login, tetapi belum memiliki workspace. Administrator perlu menetapkan workspace pada public.profiles.');
      } else {
        setProfileStatus(null);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
    setAuthBusy(false);
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  const [currentPath, setCurrentPath] = useState<NavigationPath>('dashboard');
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('ziesorra-parent-insight-students-v1');
      return saved ? JSON.parse(saved) as Student[] : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });
  const [academicYear, setAcademicYear] = useState<string>(() => {
    try {
      return localStorage.getItem('ziesorra-parent-insight-academic-year-v1') || '2026/2027 - Ganjil';
    } catch {
      return '2026/2027 - Ganjil';
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Browser-local persistence only; not a secure multi-user database.
  useEffect(() => {
    try {
      localStorage.setItem('ziesorra-parent-insight-students-v1', JSON.stringify(students));
    } catch {
      setToastMessage('Penyimpanan browser penuh atau tidak tersedia. Catat perubahan agar tidak hilang.');
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('ziesorra-parent-insight-academic-year-v1', academicYear);
    } catch {
      // Continue if browser storage is unavailable.
    }
  }, [academicYear]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
    showToast(`Siswa "${newStudent.name}" ditambahkan ke penyimpanan browser ini, bukan database server.`);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    showToast(`Data "${updatedStudent.name}" diperbarui di browser ini; belum tersinkron ke server.`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    showToast(`Siswa "${student?.name || 'Siswa'}" dihapus dari penyimpanan browser ini.`);
  };

  const handleSuccessImport = (count: number) => {
    showToast(`Simulasi pratinjau selesai: ${count} baris terpilih. Data belum disimpan ke server.`);
    setCurrentPath('dashboard');
  };

  if (!authReady) {
    return <div className="min-h-screen grid place-items-center bg-surface text-on-surface">Memeriksa sesi Supabase…</div>;
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface p-6 text-on-surface">
        <div className="w-full max-w-lg rounded-2xl border border-outline/30 bg-white p-6 shadow-xl">
          <h1 className="text-xl font-bold">Parent Insight — konfigurasi database</h1>
          <p className="mt-3 text-sm leading-relaxed">Klien Supabase belum dikonfigurasi pada build ini. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY tersedia pada GitHub Actions, lalu jalankan ulang deployment.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface p-6 text-on-surface">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-outline/30 bg-white p-7 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white font-bold">Z</div>
            <div><h1 className="text-xl font-bold">ZIESORRA Parent Insight</h1><p className="text-sm text-secondary">Masuk untuk melanjutkan</p></div>
          </div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="auth-email">Email</label>
          <input id="auth-email" type="email" autoComplete="username" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="mb-4 w-full rounded-lg border border-outline/40 px-3 py-2.5" />
          <label className="mb-1 block text-sm font-semibold" htmlFor="auth-password">Kata sandi</label>
          <input id="auth-password" type="password" autoComplete="current-password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="mb-4 w-full rounded-lg border border-outline/40 px-3 py-2.5" />
          {authError && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{authError}</p>}
          <button disabled={authBusy} type="submit" className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">{authBusy ? 'Memeriksa akun…' : 'Masuk'}</button>
          <p className="mt-4 text-xs leading-relaxed text-secondary">Gunakan akun yang dibuat melalui Supabase Authentication. Pendaftaran publik tidak tersedia.</p>
        </form>
      </div>
    );
  }

  if (profileStatus) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface p-6 text-on-surface">
        <div className="w-full max-w-lg rounded-2xl border border-outline/30 bg-white p-6 shadow-xl">
          <h1 className="text-xl font-bold">Akun perlu disiapkan</h1>
          <p className="mt-3 text-sm leading-relaxed">{profileStatus}</p>
          <button onClick={handleLogout} className="mt-5 rounded-lg border border-outline/40 px-4 py-2 font-semibold">Keluar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex text-on-surface antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-on-surface text-surface px-4 py-3 rounded-2xl shadow-2xl border border-outline/30 animate-bounce">
          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-outline-variant hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <Sidebar
          currentPath={currentPath}
          onNavigate={(path) => {
            setCurrentPath(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            <Sidebar
              currentPath={currentPath}
              onNavigate={(path) => {
                setCurrentPath(path);
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-end gap-3 border-b border-outline/20 bg-white px-4 py-2 text-xs">
          <span>{session.user.email}</span>
          <button onClick={handleLogout} className="rounded-md border border-outline/40 px-3 py-1.5 font-semibold">Keluar</button>
        </div>
        <Header
          currentPath={currentPath}
          onNavigate={(path) => {
            setCurrentPath(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950" role="status">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-700" aria-hidden="true">privacy_tip</span>
              <div>
                <p className="text-sm font-bold">Mode uji terbatas — data belum tersinkron ke server</p>
                <p className="mt-1 text-xs leading-relaxed">Perubahan disimpan hanya di browser/perangkat ini. Belum ada login atau perlindungan akses berbasis akun. Jangan masukkan data pribadi siswa sungguhan melalui situs publik ini dan jangan gunakan perangkat bersama. Data contoh dapat direset dengan menghapus data situs di browser.</p>
              </div>
            </div>
          </div>
          {currentPath === 'dashboard' && (
            <DashboardView
              students={students}
              onNavigate={setCurrentPath}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {currentPath === 'data-siswa' && (
            <DataSiswaView
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onNavigateWawancara={() => setCurrentPath('wawancara-orang-tua')}
            />
          )}

          {currentPath === 'upload-legger' && (
            <UploadLeggerView
              onSuccessImport={handleSuccessImport}
              onNavigate={setCurrentPath}
            />
          )}

          {currentPath === 'wawancara-orang-tua' && (
            <WawancaraView
              students={students}
              onUpdateStudent={handleUpdateStudent}
              onNavigateLegger={() => setCurrentPath('upload-legger')}
            />
          )}

          {currentPath === 'analisis-dan-tindak-lanjut' && (
            <AnalisisTindakLanjutView
              students={students}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {currentPath === 'panduan-guru' && (
            <PanduanGuruView
              onNavigate={setCurrentPath}
            />
          )}
        </main>
      </div>
    </div>
  );
}
