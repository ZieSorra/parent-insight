import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface DataSiswaViewProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (id: string) => void;
  onNavigateWawancara?: () => void;
}

export const DataSiswaView: React.FC<DataSiswaViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onNavigateWawancara,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lengkap' | 'belum_lengkap' | 'alamat_kosong'>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'lengkap' | 'belum_lengkap' | 'pendampingan'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['std-1']);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Drawer & Modal States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profil' | 'legger' | 'wawancara'>('profil');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [syncingCloud, setSyncingCloud] = useState(false);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  // Drawer Form State
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editParentName, setEditParentName] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery) ||
        s.nisn.includes(searchQuery);

      let matchStatus = true;
      if (statusFilter === 'lengkap') {
        matchStatus = s.profileComplete && !s.missingField;
      } else if (statusFilter === 'belum_lengkap') {
        matchStatus = !s.profileComplete || !!s.missingField;
      } else if (statusFilter === 'alamat_kosong') {
        matchStatus = !s.address || s.address.trim() === '';
      }

      let matchQuick = true;
      if (quickFilter === 'lengkap') {
        matchQuick = s.profileComplete && !s.missingField;
      } else if (quickFilter === 'belum_lengkap') {
        matchQuick = !s.profileComplete || !!s.missingField;
      } else if (quickFilter === 'pendampingan') {
        matchQuick = s.academicGroup === 'pendampingan';
      }

      return matchSearch && matchStatus && matchQuick;
    });
  }, [students, searchQuery, statusFilter, quickFilter]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(paginatedStudents.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const openDrawer = (student: Student) => {
    setSelectedStudent(student);
    setEditName(student.name);
    setEditAddress(student.address || '');
    setEditParentName(student.parentName);
    setEditParentPhone(student.parentPhone);
    setDrawerTab('profil');
    setDrawerOpen(true);
  };

  const handleSaveDrawer = () => {
    if (!selectedStudent) return;
    const updated: Student = {
      ...selectedStudent,
      name: editName,
      address: editAddress,
      parentName: editParentName,
      parentPhone: editParentPhone,
      profileComplete: Boolean(editAddress.trim() && editParentPhone.trim()),
      missingField: !editParentPhone.trim()
        ? 'Kontak Belum Ada'
        : !editAddress.trim()
        ? 'Data Alamat Kosong'
        : undefined,
    };
    onUpdateStudent(updated);
    setDrawerOpen(false);
    showToast(`Data siswa ${updated.name} diperbarui di browser ini; belum tersinkron ke server.`);
  };

  const openDeleteModal = (student: Student) => {
    setStudentToDelete(student);
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    if (deleteConfirmText.trim().toUpperCase() !== 'HAPUS') {
      alert('Silakan ketik "HAPUS" untuk mengonfirmasi tindakan.');
      return;
    }
    onDeleteStudent(studentToDelete.id);
    setDeleteModalOpen(false);
    setStudentToDelete(null);
    showToast(`Data siswa ${studentToDelete.name} dihapus dari data lokal browser ini.`);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentNis || !newStudentNisn) {
      alert('Mohon lengkapi Nama, NIS, dan NISN.');
      return;
    }
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      nis: newStudentNis,
      nisn: newStudentNisn,
      name: newStudentName,
      gender: newStudentGender,
      birthPlace: 'Bandung',
      birthDate: '10 Januari 2014',
      age: 10,
      religion: 'Islam',
      bloodType: 'O',
      address: 'Jl. Harapan No. 1, Bandung',
      classRoom: 'IV-A',
      phase: 'Fase B',
      academicGroup: 'penguatan',
      averageScore: 75.0,
      focusSubjects: ['Matematika', 'B. Indonesia'],
      scores: {
        pancasila: 78,
        indonesia: 75,
        matematika: 74,
        ipas: 76,
        seniBudaya: 80,
        pjok: 80,
      },
      parentName: newStudentParent || 'Orang Tua Murid',
      parentRelation: 'Orang Tua',
      parentPhone: newStudentPhone || '0812-0000-0000',
      parentOccupation: 'Karyawan',
      hasWhatsApp: true,
      profileComplete: Boolean(newStudentPhone),
      needsProfileUpdate: false,
      leggerStatus: 'ok',
      interviewStatus: 'belum',
    };
    onAddStudent(newStudent);
    setAddModalOpen(false);
    setNewStudentName('');
    setNewStudentNis('');
    setNewStudentNisn('');
    setNewStudentParent('');
    setNewStudentPhone('');
    showToast(`Siswa baru ${newStudent.name} berhasil ditambahkan ke kelas IV-A.`);
  };

  const exportStudentsCsv = () => {
    const headers = ['NIS', 'NISN', 'Nama', 'Jenis Kelamin', 'Kelas', 'Nama Orang Tua', 'Telepon Orang Tua', 'Alamat'];
    const rows = filteredStudents.map((s) => [s.nis, s.nisn, s.name, s.gender, s.classRoom, s.parentName, s.parentPhone, s.address || '']);
    const escapeCsv = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-siswa-parent-insight.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Ekspor CSV selesai. Simpan file di lokasi yang aman.');
  };

  const handleCloudSync = () => {
    setSyncingCloud(true);
    setTimeout(() => {
      setSyncingCloud(false);
      showToast('Perubahan tersimpan di browser ini. Sinkronisasi server belum tersedia.');
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Dynamic Sync Alert / Success Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 bg-surface-container-lowest text-on-surface px-4 py-3 rounded-xl shadow-xl border border-surface-container transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-on-surface">Pemberitahuan Sistem</span>
            <span className="text-xs text-secondary">{toastMessage}</span>
          </div>
          <button
            className="ml-3 text-secondary hover:text-on-surface transition-colors"
            onClick={() => setToastMessage(null)}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-semibold uppercase tracking-wide">
              Fase B • Kelas IV-A
            </span>
            <span className="text-secondary text-xs">• Basis Data Terpadu</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Manajemen Data Siswa</h1>
          <p className="text-sm text-secondary max-w-3xl">
            Kelola profil lengkap peserta didik, kontak orang tua/wali murid, serta keterhubungannya
            dengan legger nilai dan catatan wawancara berkala.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportStudentsCsv()}
            className="flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm border border-surface-container transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
            <span>Ekspor Data</span>
          </button>
          <button
            onClick={() => showToast('Format template impor siswa siap digunakan.')}
            className="flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm border border-surface-container transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">upload_file</span>
            <span>Impor Excel/CSV</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all active:scale-98"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group border border-surface-container">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Total Siswa Terdaftar
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">{students.length}</span>
              <span className="text-base text-secondary font-medium">Siswa</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-secondary">
              <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
              <span>15 Laki-laki</span>
              <span className="text-outline-variant">•</span>
              <span className="inline-block w-2 h-2 rounded-full bg-tertiary-container"></span>
              <span>13 Perempuan</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group border border-surface-container">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Data Profil Lengkap
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">22</span>
              <span className="text-base text-secondary font-medium">Siswa (78%)</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary">
              <span className="material-symbols-outlined text-[16px] text-primary">check_small</span>
              <span className="truncate">NIK, kontak aktif & wali terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group border border-surface-container">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Perlu Dilengkapi
            </span>
            <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[20px]">notification_important</span>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">6</span>
              <span className="text-base text-secondary font-medium">Siswa (22%)</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary">
              <span className="material-symbols-outlined text-[16px] text-secondary">pending</span>
              <span className="truncate">Belum ada no. darurat / kontak wali</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group border border-surface-container">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
              Perlu Pembaruan
            </span>
            <div className="w-9 h-9 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]">update</span>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-error">3</span>
              <span className="text-base text-secondary font-medium">Siswa</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary">
              <span className="material-symbols-outlined text-[16px] text-error">info</span>
              <span className="truncate">Perubahan alamat & berkas baru</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-4 border border-surface-container">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-11 pr-4 bg-surface-container-low rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent hover:border-surface-container"
              placeholder="Cari berdasarkan nama lengkap, NIS, atau NISN..."
              type="text"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select className="h-11 appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container">
                <option>T.A 2026/2027 (Aktif)</option>
                <option>T.A 2024/2025 (Arsip)</option>
                <option>T.A 2023/2024 (Arsip)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select className="h-11 appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container">
                <option>Kelas: IV-A (Fase B)</option>
                <option>Kelas: IV-B (Fase B)</option>
                <option>Semua Kelas</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-11 appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container"
              >
                <option value="all">Semua Status Kelengkapan</option>
                <option value="lengkap">Lengkap Saja</option>
                <option value="belum_lengkap">Kontak Belum Lengkap</option>
                <option value="alamat_kosong">Data Alamat Kosong</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setQuickFilter('all');
                setCurrentPage(1);
              }}
              className="h-11 px-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-surface-container"
              title="Reset Filter"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto border-t border-surface-container-low">
          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider mr-1">
            Filter Cepat:
          </span>
          <button
            onClick={() => {
              setQuickFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              quickFilter === 'all'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
            }`}
          >
            <span>Semua Siswa</span>
            <span className="bg-surface-container-lowest/20 px-1.5 py-0.2 rounded-full text-[11px]">
              {students.length}
            </span>
          </button>
          <button
            onClick={() => {
              setQuickFilter('lengkap');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              quickFilter === 'lengkap'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
            }`}
          >
            <span>Profil Lengkap</span>
            <span className="bg-surface-container-high text-primary px-1.5 py-0.2 rounded-full text-[11px]">
              22
            </span>
          </button>
          <button
            onClick={() => {
              setQuickFilter('belum_lengkap');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              quickFilter === 'belum_lengkap'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
            }`}
          >
            <span>Belum Lengkap</span>
            <span className="bg-error-container text-error px-1.5 py-0.2 rounded-full text-[11px]">
              6
            </span>
          </button>
          <button
            onClick={() => {
              setQuickFilter('pendampingan');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              quickFilter === 'pendampingan'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
            }`}
          >
            <span>Perlu Pendampingan Ortu</span>
            <span className="bg-secondary-container text-on-secondary-fixed px-1.5 py-0.2 rounded-full text-[11px]">
              6
            </span>
          </button>
        </div>
      </div>

      {/* Comprehensive Student Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-semibold border-b border-surface-container">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    checked={
                      paginatedStudents.length > 0 &&
                      paginatedStudents.every((s) => selectedStudentIds.includes(s.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-primary focus:ring-0 cursor-pointer h-4 w-4 bg-surface-container-lowest"
                    type="checkbox"
                  />
                </th>
                <th className="py-3.5 px-4">Nama Lengkap & Identitas</th>
                <th className="py-3.5 px-4">JK & TTL</th>
                <th className="py-3.5 px-4">Kelas / Fase</th>
                <th className="py-3.5 px-4">Nama Orang Tua / Wali</th>
                <th className="py-3.5 px-4">Kontak / WhatsApp Wali</th>
                <th className="py-3.5 px-4">Status Kelengkapan</th>
                <th className="py-3.5 px-4">Keterkaitan Sistem</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low text-sm text-on-surface">
              {paginatedStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const initials = student.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('');

                let statusBadge = null;
                if (!student.parentPhone) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Kontak Belum Ada</span>
                    </span>
                  );
                } else if (!student.address || student.address.trim() === '') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-error text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      <span>Data Alamat Kosong</span>
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span>Lengkap</span>
                    </span>
                  );
                }

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-surface-container-low/60 transition-colors ${
                      isSelected ? 'bg-surface-container-low/30' : ''
                    }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <input
                        checked={isSelected}
                        onChange={() => handleToggleStudent(student.id)}
                        className="rounded text-primary focus:ring-0 cursor-pointer h-4 w-4 bg-surface-container-lowest"
                        type="checkbox"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                            student.academicGroup === 'pendampingan'
                              ? 'bg-primary-container text-on-primary'
                              : student.academicGroup === 'pengayaan'
                              ? 'bg-tertiary-fixed text-tertiary font-bold'
                              : 'bg-secondary-container text-on-secondary-fixed'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            onClick={() => openDrawer(student)}
                            className="font-semibold text-on-surface hover:text-primary cursor-pointer truncate"
                          >
                            {student.name}
                          </span>
                          <span className="text-xs text-secondary font-mono truncate">
                            NIS: {student.nis} • NISN: {student.nisn}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">
                          {student.gender === 'L' ? 'L (Laki-laki)' : 'P (Perempuan)'}
                        </span>
                        <span className="text-xs text-secondary">
                          {student.birthPlace}, {student.birthDate} ({student.age} Thn)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-primary text-[11px] font-semibold">
                        {student.classRoom} • {student.phase}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{student.parentName}</span>
                        <span className="text-[11px] text-secondary uppercase font-semibold">
                          {student.parentRelation}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {student.parentPhone ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-on-surface">
                            {student.parentPhone}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(student.parentPhone);
                              showToast(`Nomor ${student.parentPhone} disalin ke papan klip.`);
                            }}
                            className="text-secondary hover:text-primary transition-colors"
                            title="Salin Nomor WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                          <span
                            className="w-2 h-2 rounded-full bg-primary shrink-0"
                            title="Nomor Terverifikasi WhatsApp"
                          ></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-secondary italic">Belum Ada Nomor</span>
                          <button
                            onClick={() => openDrawer(student)}
                            className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-[11px] font-semibold hover:bg-primary hover:text-on-primary transition-colors"
                          >
                            + Tambah
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">{statusBadge}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-[11px] font-medium">
                          Legger OK
                        </span>
                        {student.interviewStatus === 'selesai' ? (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px]">
                            1 Wawancara
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-error-container text-error text-[11px] font-medium">
                            Belum Wawancara
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openDrawer(student)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-high rounded-md transition-colors"
                          title="Lihat Profil Detail"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => openDrawer(student)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-high rounded-md transition-colors"
                          title="Edit Data Siswa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(student)}
                          className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-md transition-colors"
                          title="Hapus Data"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-container">
          <div className="flex items-center gap-2 text-secondary text-xs">
            <span>Menampilkan</span>
            <span className="font-semibold text-on-surface">
              {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>
            <span>dari</span>
            <span className="font-semibold text-on-surface">{filteredStudents.length}</span>
            <span>siswa aktif di Kelas IV-A</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Sebelumnya</span>
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                  currentPage === pg
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <span>Selanjutnya</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Banner */}
      <div className="bg-surface-container rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-surface-container-high">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-on-surface">
              Sinkronisasi Database Cloud (Supabase) Aktif
            </h4>
            <p className="text-xs text-secondary">
              Terakhir disinkronkan otomatis hari ini pukul 08:42 WIB • 28 Siswa tersinkron
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCloudSync}
            disabled={syncingCloud}
            className="px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 border border-surface-container"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                syncingCloud ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>{syncingCloud ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* SLIDE-OVER DETAIL SISWA DRAWER */}
      {drawerOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-xl bg-surface-container-lowest shadow-2xl flex flex-col justify-between border-l border-surface-container">
              {/* Drawer Header */}
              <div className="p-6 bg-surface-container-low/70 flex items-start justify-between border-b border-surface-container">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center text-xl font-bold shadow-md">
                    {selectedStudent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-[11px] font-semibold">
                        Aktif
                      </span>
                      <span className="text-secondary text-[11px]">
                        {selectedStudent.classRoom} ({selectedStudent.phase})
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-on-surface">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs text-secondary font-mono">
                      NISN: {selectedStudent.nisn} • NIS: {selectedStudent.nis}
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Drawer Tabs & Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Tab Navigation */}
                <div className="flex border-b border-surface-container-high gap-6">
                  <button
                    onClick={() => setDrawerTab('profil')}
                    className={`pb-2.5 text-xs font-semibold relative transition-colors ${
                      drawerTab === 'profil'
                        ? 'text-primary after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    Profil & Kontak Wali
                  </button>
                  <button
                    onClick={() => setDrawerTab('legger')}
                    className={`pb-2.5 text-xs font-semibold relative transition-colors ${
                      drawerTab === 'legger'
                        ? 'text-primary after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    Legger & Akademik
                  </button>
                  <button
                    onClick={() => setDrawerTab('wawancara')}
                    className={`pb-2.5 text-xs font-semibold relative transition-colors ${
                      drawerTab === 'wawancara'
                        ? 'text-primary after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    Catatan Wawancara
                  </button>
                </div>

                {drawerTab === 'profil' && (
                  <>
                    {/* Status Akademik Terkini Box */}
                    <div className="p-4 rounded-xl bg-surface-container-low space-y-2 border border-surface-container">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-secondary uppercase font-semibold">
                          Status Kebutuhan Belajar
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>
                            {selectedStudent.academicGroup === 'pendampingan'
                              ? 'Perlu Pendampingan'
                              : selectedStudent.academicGroup === 'penguatan'
                              ? 'Penguatan'
                              : 'Pengayaan'}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-on-surface leading-relaxed">
                        Rata-rata asesmen: <strong>{selectedStudent.averageScore.toFixed(1)}</strong>{' '}
                        (Fokus: {selectedStudent.focusSubjects.join(', ')}).
                      </p>
                    </div>

                    {/* Form Edit Identitas */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">badge</span>
                        <span>Identitas Peserta Didik</span>
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-secondary">Nama Lengkap</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-secondary">Alamat Domisili Siswa</label>
                          <textarea
                            rows={2}
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full p-3 mt-1 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container"
                            placeholder="Alamat lengkap domisili..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kontak & Data Orang Tua/Wali */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">contacts</span>
                        <span>Kontak Orang Tua & Wali Murid</span>
                      </h3>
                      <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm space-y-3 border border-surface-container">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-secondary uppercase font-semibold">
                            Wali Utama ({selectedStudent.parentRelation})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-[11px] font-semibold">
                            Wali Terdaftar
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-secondary">Nama Wali</label>
                            <input
                              type="text"
                              value={editParentName}
                              onChange={(e) => setEditParentName(e.target.value)}
                              className="w-full h-9 px-3 mt-0.5 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-secondary">No. WhatsApp</label>
                            <input
                              type="text"
                              value={editParentPhone}
                              onChange={(e) => setEditParentPhone(e.target.value)}
                              placeholder="0812-xxxx-xxxx"
                              className="w-full h-9 px-3 mt-0.5 bg-surface-container-low rounded-lg text-xs font-mono text-on-surface focus:outline-none border border-surface-container"
                            />
                          </div>
                        </div>
                        {editParentPhone && (
                          <div className="flex items-center justify-between pt-1 text-xs text-secondary">
                            <span>Hubungi Cepat:</span>
                            <a
                              href={`https://wa.me/62${editParentPhone.replace(/[^0-9]/g, '').slice(1)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-colors text-xs font-semibold"
                            >
                              <span className="material-symbols-outlined text-[16px]">chat</span>
                              <span>Chat WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {drawerTab === 'legger' && (
                  <div className="space-y-4">
                    <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-on-surface">Rekap Nilai Sumatif SAS 1</span>
                        <span className="text-secondary font-mono">Fase B Kurikulum Merdeka</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-surface-container-lowest p-2.5 rounded-lg flex justify-between">
                          <span>Pendidikan Pancasila</span>
                          <span className="font-bold">{selectedStudent.scores.pancasila}</span>
                        </div>
                        <div className="bg-surface-container-lowest p-2.5 rounded-lg flex justify-between">
                          <span>Bahasa Indonesia</span>
                          <span className="font-bold">{selectedStudent.scores.indonesia}</span>
                        </div>
                        <div className="bg-surface-container-lowest p-2.5 rounded-lg flex justify-between">
                          <span>Matematika</span>
                          <span className="font-bold text-error">{selectedStudent.scores.matematika}</span>
                        </div>
                        <div className="bg-surface-container-lowest p-2.5 rounded-lg flex justify-between">
                          <span>IPAS</span>
                          <span className="font-bold">{selectedStudent.scores.ipas}</span>
                        </div>
                        <div className="bg-surface-container-lowest p-2.5 rounded-lg flex justify-between">
                          <span>Seni Budaya</span>
                          <span className="font-bold">{selectedStudent.scores.seniBudaya}</span>
                        </div>
                        <div className="bg-surface-container-lowest p-2.5 rounded-lg flex justify-between">
                          <span>PJOK</span>
                          <span className="font-bold">{selectedStudent.scores.pjok}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'wawancara' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">Status Wawancara Ortu:</span>
                        <span className="font-bold text-primary uppercase">
                          {selectedStudent.interviewStatus}
                        </span>
                      </div>
                      <p className="text-secondary">
                        {selectedStudent.interviewNotes?.studyHabit ||
                          'Belum ada catatan wawancara tersimpan untuk siswa ini.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Controls */}
              <div className="p-6 bg-surface-container-low/50 flex items-center justify-between border-t border-surface-container">
                <button
                  className="text-error hover:bg-error-container/40 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  onClick={() => openDeleteModal(selectedStudent)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Hapus Siswa</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                    onClick={() => setDrawerOpen(false)}
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold transition-colors shadow-sm"
                    onClick={handleSaveDrawer}
                    type="button"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
              onClick={() => setDeleteModalOpen(false)}
            ></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-surface-container-lowest text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6 space-y-4 border border-surface-container">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[26px]">warning</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-on-surface">
                    Konfirmasi Penghapusan Siswa
                  </h3>
                  <p className="text-sm text-secondary">
                    Anda akan menghapus data{' '}
                    <strong className="text-on-surface">
                      {studentToDelete.name} (NISN: {studentToDelete.nisn})
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-secondary space-y-1.5 leading-relaxed border border-surface-container">
                <p className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-error">info</span>
                  <span>Keterkaitan Data Aktif Terdeteksi:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Riwayat legger nilai Semester Ganjil 2024/2025 (6 Mata Pelajaran)</li>
                  <li>1 Draf kesepakatan wawancara orang tua & lembar intervensi rumah</li>
                </ul>
                <p className="pt-1 text-outline">
                  Data akademik tidak akan hilang permanen, namun akan diarsipkan ke status non-aktif
                  pada database sekolah.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-on-surface">
                  Ketik "HAPUS" untuk mengonfirmasi:
                </label>
                <input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-error/30 border border-surface-container"
                  placeholder="Ketik HAPUS di sini..."
                  type="text"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                  onClick={() => setDeleteModalOpen(false)}
                  type="button"
                >
                  Batalkan
                </button>
                <button
                  className="px-4 py-2.5 rounded-lg bg-error text-on-error text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                  disabled={deleteConfirmText.trim().toUpperCase() !== 'HAPUS'}
                  onClick={handleConfirmDelete}
                  type="button"
                >
                  Hapus dan Arsipkan Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
              onClick={() => setAddModalOpen(false)}
            ></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-surface-container-lowest text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6 space-y-4 border border-surface-container">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
                  <h3 className="text-lg font-bold text-on-surface">Tambah Siswa Baru (Kelas IV-A)</h3>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-secondary">Nama Lengkap Murid</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Contoh: Muhammad Rayhan"
                    className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border border-surface-container"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-secondary">NIS (Nomor Induk)</label>
                    <input
                      type="text"
                      required
                      value={newStudentNis}
                      onChange={(e) => setNewStudentNis(e.target.value)}
                      placeholder="2124xx"
                      className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none border border-surface-container"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary">NISN</label>
                    <input
                      type="text"
                      required
                      value={newStudentNisn}
                      onChange={(e) => setNewStudentNisn(e.target.value)}
                      placeholder="012xxxxxxx"
                      className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none border border-surface-container"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-secondary">Jenis Kelamin</label>
                    <select
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value as any)}
                      className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none border border-surface-container"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      value={newStudentParent}
                      onChange={(e) => setNewStudentParent(e.target.value)}
                      placeholder="Bpk / Ibu..."
                      className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none border border-surface-container"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-secondary">Nomor WhatsApp Aktif Wali</label>
                  <input
                    type="text"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full h-10 px-3 mt-1 bg-surface-container-low rounded-lg text-sm font-mono text-on-surface focus:outline-none border border-surface-container"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container"
                  >
                    Simpan Siswa
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
