export interface StudentProfile {
  id: string;
  name: string;
  regNo: string;
  section: string;
  baselineIndex: number;
  present: boolean;
  checkInTime: string | null;
  /** 128-d face descriptor captured at enrollment via face-api.js. Undefined = no biometric enrolled yet. */
  descriptor?: number[];
}

const NAMES = [
  'S. YESHWIN',
  'A. KHANNA',
  'R. PATEL',
  'M. AL MANSOORI',
  'L. FERNANDES',
  'J. SINGH',
  'T. OBI',
  'K. ZHANG',
  'D. KUMAR',
  'N. RAHMAN',
  'F. HOSSAIN',
  'V. IYER',
  'C. DUBOIS',
  'H. AHMED',
  'B. NAIR',
  'O. EZE',
  'P. SHARMA',
  'G. MENON',
  'X. LI',
  'Q. AL FALASI',
];

const SECTIONS = ['9-A', '9-A', '9-A', '9-B', '9-B', '9-A', '10-A', '9-A', '9-B', '10-A', '9-A', '9-B', '10-B', '9-A', '9-B', '10-A', '9-A', '9-B', '10-A', '9-A'];

const INDICES = [1.22, 1.27, 1.31, 1.34, 1.36, 1.37, 1.38, 1.39, 1.41, 1.43, 1.28, 1.33, 1.35, 1.37, 1.40, 1.42, 1.45, 1.29, 1.32, 1.44];

export const STUDENTS: StudentProfile[] = NAMES.map((name, i) => ({
  id: `P-${String(i + 1).padStart(2, '0')}`,
  name,
  regNo: `00143${String(60 + i).padStart(2, '0')}`,
  section: SECTIONS[i],
  baselineIndex: INDICES[i],
  present: i === 0,
  checkInTime: i === 0 ? '08:02:14' : null,
}));

export const AUTH_USER = {
  name: 'S. YESHWIN',
  regNo: '0014365',
  school: 'Ambassador School, Dubai',
  motto: 'Inspire, Inquire, Innovate',
  grade: 'Grade 9-A',
};

// Continuous frequency distribution intervals from the project report
export interface FreqInterval {
  label: string;
  lower: number;
  upper: number;
  frequency: number;
  cumulative: number;
}

export const FREQ_DISTRIBUTION: FreqInterval[] = [
  { label: '1.20-1.25', lower: 1.2, upper: 1.25, frequency: 2, cumulative: 2 },
  { label: '1.25-1.30', lower: 1.25, upper: 1.3, frequency: 3, cumulative: 5 },
  { label: '1.30-1.35', lower: 1.3, upper: 1.35, frequency: 4, cumulative: 9 },
  { label: '1.35-1.40', lower: 1.35, upper: 1.4, frequency: 9, cumulative: 18 },
  { label: '1.40-1.45', lower: 1.4, upper: 1.45, frequency: 1, cumulative: 19 },
  { label: '1.45-1.50', lower: 1.45, upper: 1.5, frequency: 1, cumulative: 20 },
];

export const MODAL_CLASS = '1.35-1.40';
export const MODAL_FREQUENCY = 9;
export const TOTAL_STUDENTS = 20;
