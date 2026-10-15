export type AcademicGroup = 'pendampingan' | 'penguatan' | 'pengayaan';

export type InterviewStatus = 'belum' | 'terjadwal' | 'draf' | 'selesai';

export type ActionPlanStatus = 'Direncanakan' | 'Berjalan' | 'Selesai' | 'Perlu Ditinjau';

export interface SubjectScores {
  pancasila: number;
  indonesia: number;
  matematika: number;
  ipas: number;
  seniBudaya: number;
  pjok: number;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  age: number;
  religion: string;
  bloodType: string;
  address: string;
  classRoom: string;
  phase: string;
  academicGroup: AcademicGroup;
  averageScore: number;
  focusSubjects: string[];
  scores: SubjectScores;
  
  // Parent/Guardian data
  parentName: string;
  parentRelation: string;
  parentPhone: string;
  parentOccupation: string;
  hasWhatsApp: boolean;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  
  // System statuses
  profileComplete: boolean;
  needsProfileUpdate: boolean;
  missingField?: string;
  leggerStatus: 'ok' | 'anomaly' | 'pending';
  
  // Interview data
  interviewStatus: InterviewStatus;
  interviewDate?: string;
  interviewTime?: string;
  interviewAgreement?: string;
  interviewStep?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  interviewNotes?: {
    studyHabit?: string;
    interests?: string;
    challenges?: string[];
    homeObstacles?: string;
    physicalFacility?: string;
    parentSupportAgreed?: string[];
    teacherNotes?: string;
  };
  
  // Action plan data
  actionPlan?: {
    priorityNeed: string;
    triangulationReason: string;
    smartGoal: string;
    teacherStrategy: string;
    familySupport: string;
    personInCharge: string;
    startDate: string;
    evaluationDate: string;
    indicator: string;
    status: ActionPlanStatus;
    evaluationScore?: number;
    evaluationNotes?: string;
  };
  
  // History logs
  timelineLogs?: {
    id: string;
    title: string;
    description: string;
    date: string;
    author: string;
    type: 'success' | 'chat' | 'flag' | 'warning';
  }[];
}

export interface LeggerUploadItem {
  no: number;
  nis: string;
  nisn: string;
  name: string;
  isRegistered: boolean;
  pancasila: number;
  indonesia: number;
  matematika: number;
  ipas: number | null;
  seniBudaya: number;
  pjok: number;
  status: 'valid' | 'anomaly';
  anomalyType?: 'nis_mismatch' | 'out_of_range' | 'empty_field';
  anomalyMessage?: string;
}

export interface ImportHistory {
  id: string;
  fileName: string;
  fileType: 'xlsx' | 'csv';
  importTime: string;
  semester: string;
  academicYear: string;
  phase: string;
  rowCount: number;
  operator: string;
  status: 'synchronized' | 'archive';
}
