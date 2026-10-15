/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { Sidebar, NavigationPath } from './components/Sidebar';
import { Header } from './components/Header';
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
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

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
        setWorkspaceId(data.workspace_id);
        setProfileStatus(null);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    if (!supabase || !session || !workspaceId) {
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, nis, nisn, full_name, gender, birth_place, birth_date, religion, blood_type, address, parent_name, parent_relation, parent_phone, parent_occupation, mother_name, mother_phone, mother_occupation, profile_data, class_id')
        .eq('workspace_id', workspaceId)
        .eq('is_active', true)
        .order('full_name');
      if (cancelled) return;
      if (error) {
        setToastMessage('Gagal membaca data siswa dari Supabase. Periksa RLS dan struktur tabel.');
        return;
      }
      const mapped: Student[] = (data || []).map((row: any) => {
        const extra = row.profile_data && typeof row.profile_data === 'object' ? row.profile_data : {};
        const scores = extra.scores || { pancasila: 0, indonesia: 0, matematika: 0, ipas: 0, seniBudaya: 0, pjok: 0 };
        return {
          ...INITIAL_STUDENTS[0],
          ...extra,
          id: row.id,
          nis: row.nis || '',
          nisn: row.nisn || '',
          name: row.full_name || '',
          gender: row.gender || 'L',
          birthPlace: row.birth_place || '',
          birthDate: row.birth_date || '',
          religion: row.religion || '',
          bloodType: row.blood_type || '',
          address: row.address || '',
          parentName: row.parent_name || '',
          parentRelation: row.parent_relation || '',
          parentPhone: row.parent_phone || '',
          parentOccupation: row.parent_occupation || '',
          motherName: row.mother_name || '',
          motherPhone: row.mother_phone || '',
          motherOccupation: row.mother_occupation || '',
          classRoom: extra.classRoom || 'Belum ditetapkan',
          phase: extra.phase || 'Fase C',
          scores,
          profileComplete: Boolean(row.address && row.parent_phone),
          needsProfileUpdate: false,
          hasWhatsApp: Boolean(row.parent_phone),
        };
      });
      setStudents(mapped);
    })();
    return () => { cancelled = true; };
  }, [session, workspaceId]);

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
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYear, setAcademicYear] = useState<string>(() => {
    try {
      return localStorage.getItem('ziesorra-parent-insight-academic-year-v1') || '2026/2027 - Ganjil';
    } catch {
      return '2026/2027 - Ganjil';
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleAddStudent = async (newStudent: Student) => {
    if (!supabase || !session || !workspaceId) return;
    const payload = {
      workspace_id: workspaceId,
      nis: newStudent.nis.trim(),
      nisn: newStudent.nisn.trim() || null,
      full_name: newStudent.name.trim(),
      gender: newStudent.gender,
      birth_place: newStudent.birthPlace || null,
      birth_date: /^\\d{4}-\\d{2}-\\d{2}$/.test(newStudent.birthDate) ? newStudent.birthDate : null,
      religion: newStudent.religion || null,
      blood_type: newStudent.bloodType || null,
      address: newStudent.address || null,
      parent_name: newStudent.parentName || null,
      parent_relation: newStudent.parentRelation || null,
      parent_phone: newStudent.parentPhone || null,
      parent_occupation: newStudent.parentOccupation || null,
      mother_name: newStudent.motherName || null,
      mother_phone: newStudent.motherPhone || null,
      mother_occupation: newStudent.motherOccupation || null,
      profile_data: { classRoom: newStudent.classRoom, phase: newStudent.phase, scores: newStudent.scores, academicGroup: newStudent.academicGroup, focusSubjects: newStudent.focusSubjects },
    };
    const { data, error } = await supabase.from('students').insert(payload).select('id').single();
    if (error) { showToast(`Gagal menyimpan siswa ke database: ${error.message}`); return; }
    setStudents(prev => [{ ...newStudent, id: data.id }, ...prev]);
    showToast(`Siswa "${newStudent.name}" berhasil disimpan ke Supabase.`);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    if (!supabase || !workspaceId) return;
    const { error } = await supabase.from('students').update({
      full_name: updatedStudent.name.trim(),
      address: updatedStudent.address || null,
      parent_name: updatedStudent.parentName || null,
      parent_phone: updatedStudent.parentPhone || null,
      profile_data: { classRoom: updatedStudent.classRoom, phase: updatedStudent.phase, scores: updatedStudent.scores, academicGroup: updatedStudent.academicGroup, focusSubjects: updatedStudent.focusSubjects },
      updated_at: new Date().toISOString(),
    }).eq('id', updatedStudent.id).eq('workspace_id', workspaceId);
    if (error) { showToast(`Gagal memperbarui data di Supabase: ${error.message}`); return; }
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    showToast(`Data "${updatedStudent.name}" berhasil diperbarui di Supabase.`);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!supabase || !workspaceId) return;
    const student = students.find(s => s.id === studentId);
    const { error } = await supabase.from('students').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', studentId).eq('workspace_id', workspaceId);
    if (error) { showToast(`Gagal menghapus siswa dari Supabase: ${error.message}`); return; }
    setStudents(prev => prev.filter(s => s.id !== studentId));
    showToast(`Siswa "${student?.name || 'Siswa'}" dinonaktifkan di Supabase.`);
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
          <div className="mb-5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950" role="status">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-700" aria-hidden="true">cloud_done</span>
              <div>
                <p className="text-sm font-bold">Supabase terhubung untuk Data Siswa</p>
                <p className="mt-1 text-xs leading-relaxed">Data pada halaman Data Siswa dibaca dan disimpan melalui Supabase dengan RLS. Data wawancara, nilai Legger, dan tindak lanjut belum dimigrasikan; halaman lain masih dapat menampilkan data contoh. Gunakan data uji sampai semua modul selesai diverifikasi.</p>
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
