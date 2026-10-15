import React, { useState, useMemo } from 'react';
import { LeggerUploadItem, ImportHistory } from '../types';
import { INITIAL_LEGGER_ITEMS, INITIAL_IMPORT_HISTORIES } from '../data/mockData';

interface UploadLeggerViewProps {
  onSuccessImport: (count: number) => void;
  onNavigate?: (path: any) => void;
}

export const UploadLeggerView: React.FC<UploadLeggerViewProps> = ({ onSuccessImport, onNavigate }) => {
  const [leggerItems, setLeggerItems] = useState<LeggerUploadItem[]>(INITIAL_LEGGER_ITEMS);
  const [importHistories, setImportHistories] = useState<ImportHistory[]>(INITIAL_IMPORT_HISTORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'valid' | 'anomaly' | 'mismatch'>('all');
  const [selectedNos, setSelectedNos] = useState<number[]>([1, 2, 3, 6, 7]);
  const [isImporting, setIsImporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Anomaly fix modal state
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [edoScore, setEdoScore] = useState(85);
  const [dediIpas, setDediIpas] = useState(72);

  // File upload simulator state
  const [currentFileName, setCurrentFileName] = useState('Legger_Semester_1_Kelas4A_Final.xlsx');
  const [selectedSheet, setSelectedSheet] = useState('Nilai_Sumatif_FaseB');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredItems = useMemo(() => {
    return leggerItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nis.includes(searchQuery) ||
        item.nisn.includes(searchQuery);

      let matchTab = true;
      if (activeTab === 'valid') {
        matchTab = item.status === 'valid';
      } else if (activeTab === 'anomaly') {
        matchTab = item.status === 'anomaly';
      } else if (activeTab === 'mismatch') {
        matchTab = item.anomalyType === 'nis_mismatch';
      }

      return matchSearch && matchTab;
    });
  }, [leggerItems, searchQuery, activeTab]);

  const downloadLeggerTemplate = () => {
    const csv = '\uFEFFNo;NIS;NISN;Nama;Pancasila;Bahasa Indonesia;Matematika;IPAS;Seni Budaya;PJOK\r\n1;;;;;;;;;';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-legger-parent-insight.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Template CSV berhasil diunduh. Fitur impor otomatis belum aktif.');
  };

  const handleFixAnomalies = () => {
    setLeggerItems((prev) =>
      prev.map((item) => {
        if (item.no === 5) {
          return {
            ...item,
            seniBudaya: edoScore,
            status: 'valid',
            anomalyType: undefined,
            anomalyMessage: undefined,
          };
        }
        if (item.no === 4) {
          return {
            ...item,
            ipas: dediIpas,
            isRegistered: true,
            status: 'valid',
            anomalyType: undefined,
            anomalyMessage: undefined,
          };
        }
        return item;
      })
    );
    setSelectedNos([1, 2, 3, 4, 5, 6, 7]);
    setFixModalOpen(false);
    showToast('Perubahan validasi hanya berlaku pada pratinjau ini; belum tersimpan ke server.');
  };

  const handleExecuteImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      const validCount = selectedNos.length;
      const newHistory: ImportHistory = {
        id: `hist-${Date.now()}`,
        fileName: currentFileName,
        fileType: 'xlsx',
        importTime: 'Hari ini, 09:45 WIB',
        semester: 'Semester 1 (Ganjil)',
        academicYear: '2026/2027',
        phase: 'Fase B',
        rowCount: 28,
        operator: 'Ibu Siti Rahmawati, S.Pd.',
        status: 'synchronized',
      };
      setImportHistories([newHistory, ...importHistories]);
      onSuccessImport(validCount);
      showToast(`${validCount} baris dipilih pada pratinjau prototipe; belum tersimpan ke server.`);
    }, 1400);
  };

  const handleSimulateChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFileName(file.name);
      showToast(`Berkas ${file.name} berhasil diunggah. Memulai auto-audit legger...`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Dynamic Toast Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Breadcrumb Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              Fase B
            </span>
            <span className="text-outline-variant text-[11px]">•</span>
            <span className="text-secondary text-[11px]">Kelas IV-A</span>
            <span className="text-outline-variant text-[11px]">•</span>
            <span className="text-primary text-[11px] font-semibold">Impor Legger Nilai</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Upload Legger Nilai Rapor</h1>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Impor berkas legger nilai dari format Excel (.xlsx, .xls) atau CSV. Lakukan validasi
            otomatis identitas siswa (NIS/NISN) dan rentang nilai kurikulum sebelum disinkronkan ke
            database akademik ZIESORRA.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
          <button
            onClick={() => downloadLeggerTemplate()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Unduh Template (.xlsx)</span>
          </button>
          <button
            onClick={() => showToast('Panduan format kolom: No, NIS, NISN, Nama, dan 6 Mapel standar.')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-low text-secondary hover:text-on-surface text-xs font-semibold transition-all border border-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">help_center</span>
            <span>Panduan Format Kolom</span>
          </button>
        </div>
      </div>

      {/* 2. Ringkasan Status Impor (4 Kartu Metrik Ringkas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Baris */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-2 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
              Total Baris Terbaca
            </span>
            <span className="w-8 h-8 rounded-lg bg-secondary-container/60 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-on-surface">
              28 <span className="text-base text-secondary font-normal">Siswa</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs text-on-surface-variant">1 Berkas Aktif (Sheet 1)</span>
            </div>
          </div>
        </div>

        {/* Valid Siap Impor */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-2 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
              Identifikasi Valid
            </span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-on-surface">
              25 <span className="text-base text-primary font-semibold">(89.3%)</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
              <span className="text-xs text-on-surface-variant">NIS cocok, nilai lengkap (0-100)</span>
            </div>
          </div>
        </div>

        {/* Perlu Pemeriksaan */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-2 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
              Perlu Pemeriksaan
            </span>
            <span className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-error">
              3 <span className="text-base text-error/80 font-normal">Baris</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-error"></span>
              <span className="text-xs text-on-surface-variant">1 NIS hilang, 1 kosong, 1 &gt; 100</span>
            </div>
          </div>
        </div>

        {/* Berkas Sumber */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-2 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase tracking-wider font-semibold">
              Berkas Sumber
            </span>
            <span className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-on-surface truncate" title={currentFileName}>
              {currentFileName}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] text-tertiary">Sheet: {selectedSheet}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Panel Konfigurasi Target Legger */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-6 border border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
            <h2 className="text-lg font-bold text-on-surface">Konfigurasi Target Legger</h2>
          </div>
          <span className="text-[11px] font-semibold text-secondary bg-surface-container-low px-2.5 py-1 rounded-md self-start sm:self-auto border border-surface-container">
            Mode prototipe: belum terhubung ke database
          </span>
        </div>

        {/* Form Filter Baris Atas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Tahun Ajaran */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Tahun Ajaran</label>
            <div className="relative">
              <select className="w-full appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer border border-transparent hover:border-surface-container">
                <option>2026/2027 - Ganjil (Aktif)</option>
                <option>2026/2027 - Genap</option>
                <option>2024/2025 - Ganjil (Arsip)</option>
                <option>2023/2024 - Genap (Arsip)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Semester */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Semester</label>
            <div className="relative">
              <select className="w-full appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer border border-transparent hover:border-surface-container">
                <option>Semester 1 (Ganjil)</option>
                <option>Semester 2 (Genap)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Kelas / Fase */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Kelas / Fase</label>
            <div className="relative">
              <select className="w-full appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer border border-transparent hover:border-surface-container">
                <option>Kelas IV-A (Fase B)</option>
                <option>Kelas IV-B (Fase B)</option>
                <option>Kelas III-A (Fase B)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Jenis Penilaian */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Jenis Penilaian</label>
            <div className="relative">
              <select className="w-full appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer border border-transparent hover:border-surface-container">
                <option>Sumatif Akhir Semester (SAS)</option>
                <option>Formatif Harian Rata-rata</option>
                <option>PTS / Sumatif Tengah Semester</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Sheet Excel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Pilih Lembar (Sheet)</label>
            <div className="relative">
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full appearance-none bg-surface-container-low text-on-surface text-xs font-medium pl-3 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer border border-transparent hover:border-surface-container"
              >
                <option value="Nilai_Sumatif_FaseB">Nilai_Sumatif_FaseB (28)</option>
                <option value="Rekap_Kehadiran_Kelas4A">Rekap_Kehadiran_Kelas4A</option>
                <option value="Nilai_Karakter_Pancasila">Nilai_Karakter_Pancasila</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* File Status Box */}
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-surface-container">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">table_chart</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-on-surface truncate">{currentFileName}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-surface-container-highest text-primary font-semibold">
                  184 KB
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-secondary-container text-on-secondary-container font-medium">
                  Terunggah 09:15 WIB
                </span>
              </div>
              <span className="text-xs text-secondary mt-0.5">
                Diproses oleh: Ibu Siti Rahmawati, S.Pd. • 6 Kolom Mata Pelajaran terdeteksi otomatis
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>Ganti File</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleSimulateChangeFile}
              />
            </label>
            <button
              onClick={() => showToast('Validasi ulang selesai: 25 baris valid, 2 anomali terdeteksi.')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Validasi Ulang Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tab Filter & Panel Peringatan Cerdas */}
      <div className="flex flex-col gap-4">
        {/* Tab Filter Navigasi */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-surface-container">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span>Semua Data</span>
              <span className="bg-surface-container-lowest/20 px-1.5 py-0.5 rounded text-[11px]">
                {leggerItems.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('valid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'valid'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span>Data Valid Siap Impor</span>
              <span className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] text-primary">
                {leggerItems.filter((i) => i.status === 'valid').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('anomaly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'anomaly'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span>Perlu Pemeriksaan</span>
              <span className="bg-error-container px-1.5 py-0.5 rounded text-[11px] text-error font-bold">
                {leggerItems.filter((i) => i.status === 'anomaly').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('mismatch')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mismatch'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span>Ketidaksesuaian Identitas</span>
              <span className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] text-secondary">
                1
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1">
            <div className="relative w-64">
              <span className="material-symbols-outlined text-[18px] text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-surface-container"
                placeholder="Cari NIS atau nama siswa..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Banner Peringatan Cerdas */}
        <div className="bg-surface-container-high p-4 rounded-xl flex items-start gap-3 shadow-sm border border-surface-container">
          <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
            verified_user
          </span>
          <div className="flex flex-col gap-0.5 text-on-surface">
            <span className="text-sm font-bold text-primary">Pencocokan Siswa Ketat Aktif</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              NIS dan NISN digunakan sebagai kunci identitas unik tunggal. Siswa dengan perbedaan
              ejaan nama atau NIS tidak terdaftar pada Kelas IV-A otomatis ditandai untuk mencegah
              pertukaran nilai rapor siswa.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Pratinjau Tabel Legger & Validasi */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container">
        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-on-surface">Pratinjau Data Matriks Nilai Rapor</span>
            <span className="text-[11px] font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded">
              Fase B • Kurikulum Merdeka
            </span>
          </div>
          <div className="flex items-center gap-3 text-secondary text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              Siap Impor ({leggerItems.filter((i) => i.status === 'valid').length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
              Anomali Data ({leggerItems.filter((i) => i.status === 'anomaly').length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/70 text-secondary text-[11px] uppercase tracking-wider font-semibold border-b border-surface-container">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    checked={
                      selectedNos.length > 0 &&
                      filteredItems
                        .filter((i) => i.status === 'valid')
                        .every((i) => selectedNos.includes(i.no))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNos(
                          filteredItems.filter((i) => i.status === 'valid').map((i) => i.no)
                        );
                      } else {
                        setSelectedNos([]);
                      }
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    type="checkbox"
                  />
                </th>
                <th className="py-3 px-3 w-16 text-center">No & Status</th>
                <th className="py-3 px-4">Kunci Identitas (NIS / NISN)</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3 text-center">P. Pancasila</th>
                <th className="py-3 px-3 text-center">B. Indonesia</th>
                <th className="py-3 px-3 text-center">Matematika</th>
                <th className="py-3 px-3 text-center">IPAS</th>
                <th className="py-3 px-3 text-center">Seni Budaya</th>
                <th className="py-3 px-3 text-center">PJOK</th>
                <th className="py-3 px-4">Status & Rekomendasi Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs text-on-surface">
              {filteredItems.map((item) => {
                const isSelected = selectedNos.includes(item.no);
                const isAnomaly = item.status === 'anomaly';

                return (
                  <tr
                    key={item.no}
                    className={`transition-colors ${
                      isAnomaly
                        ? 'bg-error-container/20 hover:bg-error-container/30'
                        : 'hover:bg-surface-container-low/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        checked={isSelected}
                        disabled={isAnomaly}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedNos(selectedNos.filter((n) => n !== item.no));
                          } else {
                            setSelectedNos([...selectedNos, item.no]);
                          }
                        }}
                        className={`w-4 h-4 rounded text-primary focus:ring-primary ${
                          isAnomaly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        type="checkbox"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono">
                        <span className="text-[11px] text-secondary">
                          {String(item.no).padStart(2, '0')}
                        </span>
                        {isAnomaly ? (
                          <span className="material-symbols-outlined text-error text-[18px]">
                            {item.anomalyType === 'out_of_range' ? 'cancel' : 'warning'}
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            check_circle
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span
                          className={`font-mono font-semibold ${
                            item.anomalyType === 'nis_mismatch' ? 'text-error font-bold flex items-center gap-1' : 'text-on-surface'
                          }`}
                        >
                          {item.nis}
                          {item.anomalyType === 'nis_mismatch' && (
                            <span className="material-symbols-outlined text-[14px]">error</span>
                          )}
                        </span>
                        <span className="text-[11px] text-secondary font-mono">
                          NISN: {item.nisn}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            isAnomaly
                              ? 'bg-surface-container text-secondary'
                              : 'bg-surface-container-high text-primary'
                          }`}
                        >
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{item.name}</span>
                          <span
                            className={`text-[11px] ${
                              !item.isRegistered ? 'text-error font-medium' : 'text-secondary'
                            }`}
                          >
                            {item.isRegistered
                              ? 'Data master: Terdaftar IV-A'
                              : 'Tidak terdaftar di Kelas IV-A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.pancasila}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.indonesia}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.matematika}</td>
                    <td
                      className={`py-3.5 px-3 text-center font-mono ${
                        item.ipas === null ? 'bg-error-container text-error font-bold rounded' : ''
                      }`}
                    >
                      {item.ipas !== null ? item.ipas : '-'}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-center font-mono ${
                        item.seniBudaya > 100
                          ? 'bg-error-container text-error font-bold rounded'
                          : ''
                      }`}
                    >
                      {item.seniBudaya} {item.seniBudaya > 100 && '⚠️'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.pjok}</td>
                    <td className="py-3.5 px-4">
                      {isAnomaly ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-error-container text-error">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                            {item.anomalyMessage}
                          </span>
                          <button
                            onClick={() => setFixModalOpen(true)}
                            className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold hover:bg-primary hover:text-on-primary transition-colors text-[11px]"
                          >
                            Koreksi
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container-high text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                          Valid (Siap Impor)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pratinjau Baris */}
        <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 text-secondary text-xs border-t border-surface-container">
          <span>
            Menampilkan {filteredItems.length} siswa pratinjau. 21 siswa lainnya valid dan terverifikasi
            di lembar kerja ini.
          </span>
          <div className="flex items-center gap-2">
            <span className="text-on-surface font-semibold">Halaman 1 dari 1</span>
          </div>
        </div>
      </div>

      {/* 6. Bar Aksi Konfirmasi Impor (Action Card) */}
      <div className="sticky bottom-6 z-30 bg-surface-container-lowest/95 backdrop-blur-md p-6 rounded-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">
              {selectedNos.length} dari {leggerItems.length} Siswa Siap Diimpor ke Database
            </span>
            <span className="text-xs text-secondary">
              {leggerItems.filter((i) => i.status === 'anomaly').length} baris anomali akan dilewati (dapat diperbaiki nanti atau diunggah ulang).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full md:w-auto justify-end">
          <button
            onClick={() => showToast('Operasi impor dibatalkan.')}
            className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all"
            type="button"
          >
            Batal
          </button>
          <button
            onClick={() => setFixModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container text-xs font-semibold transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">build</span>
            <span>Perbaiki Anomali</span>
          </button>
          <button
            disabled={isImporting}
            onClick={handleExecuteImport}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-bold text-xs transition-all shadow-md active:scale-98 disabled:opacity-70"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isImporting ? 'animate-spin' : ''
              }`}
            >
              {isImporting ? 'sync' : 'database'}
            </span>
            <span>
              {isImporting
                ? 'Menyinkronkan ke Supabase...'
                : `Impor ${selectedNos.length} Data Valid ke Database`}
            </span>
          </button>
        </div>
      </div>

      {/* 7. Riwayat Impor Legger (Audit Trail) */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">history</span>
            <h2 className="text-lg font-bold text-on-surface">Riwayat Impor & Audit Trail Legger</h2>
          </div>
          <span className="text-xs text-secondary font-mono">Tersimpan dalam log Supabase Storage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-semibold border-b border-surface-container">
                <th className="py-3 px-4">Nama Berkas</th>
                <th className="py-3 px-4">Waktu Impor</th>
                <th className="py-3 px-4">Semester / Fase</th>
                <th className="py-3 px-4 text-center">Jumlah Baris</th>
                <th className="py-3 px-4">Operator / Wali Kelas</th>
                <th className="py-3 px-4">Status Integrasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs text-on-surface">
              {importHistories.map((hist) => (
                <tr key={hist.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        {hist.fileType === 'xlsx' ? 'description' : 'csv'}
                      </span>
                      <span className="font-semibold text-on-surface font-mono">{hist.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-secondary">{hist.importTime}</td>
                  <td className="py-3.5 px-4">
                    {hist.semester} • {hist.phase}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">{hist.rowCount} Siswa</td>
                  <td className="py-3.5 px-4 text-on-surface">{hist.operator}</td>
                  <td className="py-3.5 px-4">
                    {hist.status === 'synchronized' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container-high text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        Berhasil Disinkronkan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                        Arsip Valid
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => showToast(`Membuka berkas arsip ${hist.fileName}...`)}
                      className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                      title="Lihat Rekap"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Info Keamanan */}
        <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between text-secondary text-xs border border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">security</span>
            <span>
              Seluruh rekaman terenkripsi SSL 256-bit dan dicatat secara atomik di Supabase PostgreSQL dengan RLS (Row Level Security).
            </span>
          </div>
          <span className="text-[11px] text-outline font-semibold">ZIESORRA Core v2.4</span>
        </div>
      </div>

      {/* ANOMALY FIX MODAL */}
      {fixModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
              onClick={() => setFixModalOpen(false)}
            ></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-surface-container-lowest text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md p-6 space-y-4 border border-surface-container">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">build</span>
                  <h3 className="text-base font-bold text-on-surface">Perbaiki 2 Anomali Nilai</h3>
                </div>
                <button
                  onClick={() => setFixModalOpen(false)}
                  className="text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Fix 1: Edo Ramadhan */}
                <div className="p-3 bg-surface-container-low rounded-lg space-y-2 border border-surface-container">
                  <div className="font-semibold text-on-surface flex items-center justify-between">
                    <span>Edo Ramadhan (NIS 212405)</span>
                    <span className="text-error font-bold">Skor Seni Budaya: 105 ⚠️</span>
                  </div>
                  <p className="text-secondary">
                    Skor melebihi batas 100. Harap masukkan nilai skala 0–100 yang sesuai hasil ujian:
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-secondary">Koreksi Nilai:</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={edoScore}
                      onChange={(e) => setEdoScore(Number(e.target.value))}
                      className="w-20 h-8 px-2 bg-surface-container-lowest rounded border border-surface-container text-on-surface font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Fix 2: Dedi Kurniawan */}
                <div className="p-3 bg-surface-container-low rounded-lg space-y-2 border border-surface-container">
                  <div className="font-semibold text-on-surface flex items-center justify-between">
                    <span>Dedi Kurniawan (NIS 212499)</span>
                    <span className="text-error font-bold">Nilai IPAS Kosong</span>
                  </div>
                  <p className="text-secondary">
                    Isi estimasi nilai susulan atau asesmen portofolio:
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-secondary">Nilai IPAS:</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={dediIpas}
                      onChange={(e) => setDediIpas(Number(e.target.value))}
                      className="w-20 h-8 px-2 bg-surface-container-lowest rounded border border-surface-container text-on-surface font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setFixModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleFixAnomalies}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container"
                >
                  Simpan & Perbarui Validasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
