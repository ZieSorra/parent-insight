/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
    showToast(`Siswa "${newStudent.name}" berhasil ditambahkan ke database kelas.`);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    showToast(`Data "${updatedStudent.name}" berhasil diperbarui.`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    showToast(`Siswa "${student?.name || 'Siswa'}" telah dihapus.`);
  };

  const handleSuccessImport = (count: number) => {
    showToast(`Berhasil menyinkronkan legger nilai rapor (${count} baris data siswa tervalidasi).`);
    setCurrentPath('dashboard');
  };

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
