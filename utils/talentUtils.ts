
import { Employee, SuccessionStatus, CriticalJob } from '../types';

// Define thresholds for scaling scores (1-100) to the 3-tier system.
const HIGH_THRESHOLD = 90;
const MEDIUM_THRESHOLD = 70;

export const eselonOrder = [
    'JPT Utama (Eselon I.a)',
    'JPT Madya (Eselon I.b)',
    'JPT Pratama (Eselon II)',
    'Administrator (Eselon III)',
    'Pengawas (Eselon IV)',
    'Fungsional Ahli Utama',
    'Fungsional Ahli Madya',
    'Fungsional Ahli Muda',
    'Fungsional Ahli Pertama',
    'Fungsional Terampil',
    'Pelaksana',
    'Staf',
];

/**
 * Gets the rank of an eselon for sorting purposes. Lower number is higher rank.
 * @param eselon The eselon string.
 * @returns A numerical rank.
 */
export const getEselonRank = (eselon: string): number => {
    const index = eselonOrder.indexOf(eselon);
    // If not found, return a high number to place it at the bottom.
    return index === -1 ? eselonOrder.length : index;
};


/**
 * Converts a performance score (1-100) to a 3-tier scale.
 * @param score The performance score.
 * @returns 1 (Di Bawah Ekspektasi), 2 (Sesuai Ekspektasi), or 3 (Di Atas Ekspektasi).
 */
export const getPerformanceScale = (score: number): number => {
    if (score >= HIGH_THRESHOLD) return 3;
    if (score >= MEDIUM_THRESHOLD) return 2;
    return 1;
};

/**
 * Converts a potential score (1-100) to a 3-tier scale.
 * @param score The potential score.
 * @returns 1 (Rendah), 2 (Menengah), or 3 (Tinggi).
 */
export const getPotentialScale = (score: number): number => {
    if (score >= HIGH_THRESHOLD) return 3;
    if (score >= MEDIUM_THRESHOLD) return 2;
    return 1;
};


// These maps translate the 3-tier scale value into a human-readable string.
export const performanceMap: { [key: number]: string } = { 1: 'Di Bawah Ekspektasi', 2: 'Sesuai Ekspektasi', 3: 'Di Atas Ekspektasi' };
export const potentialMap: { [key: number]: string } = { 1: 'Rendah', 2: 'Menengah', 3: 'Tinggi' };

export const boxNumberMap: { [key:string]: number } = {
    '33': 9, '23': 7, '13': 4,
    '32': 8, '22': 5, '12': 2,
    '31': 6, '21': 3, '11': 1,
};

export const categoryMap: { [key: number]: string } = {
    9: 'Kinerja di atas ekspektasi dan potensial tinggi',
    8: 'Kinerja sesuai ekspektasi dan potensial tinggi',
    7: 'Kinerja di atas ekspektasi dan potensial menengah',
    6: 'Kinerja di bawah ekspektasi dan potensial tinggi',
    5: 'Kinerja sesuai ekspektasi dan potensial menengah',
    4: 'Kinerja di atas ekspektasi dan potensial rendah',
    3: 'Kinerja di bawah ekspektasi dan potensial menengah',
    2: 'Kinerja sesuai ekspektasi dan potensial rendah',
    1: 'Kinerja di bawah ekspektasi dan potensial rendah',
};

export const recommendationMap: { [key: number]: string } = {
    9: 'Dipromosikan dan dipertahankan, Masuk Kelompok Rencana Suksesi Instansi/Nasional, Penghargaan.',
    8: 'Dipertahankan, Masuk Kelompok Rencana Suksesi Instansi, Rotasi/Perluasan jabatan, Bimbingan kinerja.',
    7: 'Dipertahankan, Masuk Kelompok Rencana Suksesi Instansi, Rotasi/Pengayaan jabatan, Pengembangan kompetensi, Tugas belajar.',
    6: 'Penempatan yang sesuai, Bimbingan kinerja, Konseling kinerja.',
    5: 'Penempatan yang sesuai, Bimbingan kinerja, Pengembangan kompetensi.',
    4: 'Rotasi, Pengembangan kompetensi.',
    3: 'Bimbingan kinerja, Konseling kinerja, Pengembangan kompetensi, Penempatan yang sesuai.',
    2: 'Bimbingan kinerja, Pengembangan kompetensi, Penempatan yang sesuai.',
    1: 'Diproses sesuai ketentuan peraturan perundangan.',
};

export const getEmployeeBoxInfo = (employee: Employee) => {
    const potentialScale = getPotentialScale(employee.potential);
    const performanceScale = getPerformanceScale(employee.performance);

    const key = `${potentialScale}${performanceScale}`;
    const boxNumber = boxNumberMap[key] || 0;
    const category = categoryMap[boxNumber] || 'Tidak terklasifikasi';
    const recommendation = recommendationMap[boxNumber] || 'Tidak ada rekomendasi spesifik.';
    return { boxNumber, category, recommendation };
};

/**
 * Determines the succession status based on performance, potential, and retirement status.
 * @param employee The employee object (or a partial object with relevant fields).
 * @returns The calculated succession status.
 */
export const calculateSuccessionStatus = (employee: Pick<Employee, 'performance' | 'potential' | 'birthDate' | 'eselon'>): SuccessionStatus => {
    // Rule 1: Retirement status overrides everything.
    // An employee who has passed or is within 1 year of retirement is not a candidate.
    if (employee.birthDate && employee.eselon && (isOverRetirementAge(employee as Employee) || isApproachingRetirement(employee as Employee))) {
        return 'Bukan Kandidat';
    }

    // Rule 2: If not retiring, use the 9-Box Matrix score.
    const potentialScale = getPotentialScale(employee.potential);
    const performanceScale = getPerformanceScale(employee.performance);
    const key = `${potentialScale}${performanceScale}`;
    const boxNumber = boxNumberMap[key] || 0;

    switch (boxNumber) {
        case 9:
        case 8:
            return 'Siap Sekarang';
        case 7:
        case 5:
            return '1-2 Tahun';
        case 6:
        case 4:
        case 3:
            return 'Potensi Masa Depan';
        case 1:
        case 2:
        default:
            return 'Bukan Kandidat';
    }
};

/**
 * Finds suitable candidates for a critical job from a list of employees,
 * correlated with their "Jabatan Lowong/Kritikal Target" field.
 * @param job The critical job to fill.
 * @param employees The list of all employees.
 * @returns A sorted array of suitable employees.
 */
export const findSuitableCandidates = (job: CriticalJob, employees: Employee[]): Employee[] => {
    const targetJobTitle = job.title.trim().toLowerCase();

    const candidates = employees.filter(emp => {
        // Condition 1: The employee's targeted critical position must match the job's title.
        const employeeTargetPosition = emp.criticalPosition?.trim().toLowerCase();
        if (employeeTargetPosition !== targetJobTitle) {
            return false;
        }

        // Condition 2: The employee must be a high-potential/high-performance talent (Boxes 7, 8, 9).
        const { boxNumber } = getEmployeeBoxInfo(emp);
        const isTopTalent = [7, 8, 9].includes(boxNumber);

        return isTopTalent;
    });

    // Sort candidates: Box 9 > 8 > 7, then by performance score descending.
    return candidates.sort((a, b) => {
        const boxA = getEmployeeBoxInfo(a).boxNumber;
        const boxB = getEmployeeBoxInfo(b).boxNumber;

        if (boxA !== boxB) {
            return boxB - boxA; // Higher box number first
        }
        return b.performance - a.performance; // Higher performance first
    });
};

/**
 * Parses an 18-digit Indonesian NIP to extract the birth date.
 * It considers the gender encoding where the birth day is incremented by 40 for females.
 * @param nip The 18-digit NIP string.
 * @returns A Date object or null if the NIP format is invalid.
 */
export const getBirthDateFromNIP = (nip: string): Date | null => {
    if (!nip || nip.length < 8) {
        return null;
    }

    try {
        const yearStr = nip.substring(0, 4);
        const monthStr = nip.substring(4, 6);
        const dayStr = nip.substring(6, 8);
        
        let day = parseInt(dayStr, 10);
        // In Indonesian NIP, female birth dates are encoded by adding 40 to the day.
        if (day > 40) {
            day -= 40;
        }

        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed in JS Date

        // Basic validation
        if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
            return null;
        }

        const birthDate = new Date(year, month, day);
        // Check if the date is valid (e.g., not Feb 30)
        if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
            return null;
        }

        return birthDate;
    } catch (e) {
        console.error("Error parsing NIP:", e);
        return null;
    }
};

/**
 * Checks if an employee is approaching retirement (within the next year).
 * Retirement age is based on the employee's eselon/functional position.
 * @param employee The employee object, must have `birthDate` and `eselon` properties.
 * @returns True if the employee is approaching retirement, otherwise false.
 */
export const isApproachingRetirement = (employee: Employee): boolean => {
    if (!employee.birthDate) {
        return false;
    }

    let retirementAge: number;
    const eselon = employee.eselon;

    if (eselon.includes('Fungsional Ahli Utama')) {
        retirementAge = 65;
    } else if (
        eselon.includes('JPT Utama') ||
        eselon.includes('JPT Madya') ||
        eselon.includes('JPT Pratama') || // Eselon I & II
        eselon.includes('Fungsional Ahli Madya')
    ) {
        retirementAge = 60;
    } else {
        // Default for Administrator (III), Pengawas (IV), Fungsional Ahli Muda/Pertama, Pelaksana, etc.
        retirementAge = 58;
    }

    try {
        const birthDate = new Date(employee.birthDate);
        if (isNaN(birthDate.getTime())) {
            return false;
        }

        const retirementDate = new Date(birthDate.getFullYear() + retirementAge, birthDate.getMonth(), birthDate.getDate());
        
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        const now = new Date();

        // Check if retirement date is in the future but within the next year.
        return retirementDate > now && retirementDate <= oneYearFromNow;
    } catch (e) {
        console.error("Error calculating retirement status:", e);
        return false;
    }
};

/**
 * Checks if an employee has passed their retirement age.
 * Retirement age is based on the employee's eselon/functional position.
 * @param employee The employee object, must have `birthDate` and `eselon` properties.
 * @returns True if the employee is over retirement age, otherwise false.
 */
export const isOverRetirementAge = (employee: Employee): boolean => {
    if (!employee.birthDate) {
        return false;
    }

    let retirementAge: number;
    const eselon = employee.eselon;

    if (eselon.includes('Fungsional Ahli Utama')) {
        retirementAge = 65;
    } else if (
        eselon.includes('JPT Utama') ||
        eselon.includes('JPT Madya') ||
        eselon.includes('JPT Pratama') || // Eselon I & II
        eselon.includes('Fungsional Ahli Madya')
    ) {
        retirementAge = 60;
    } else {
        // Default for Administrator (III), Pengawas (IV), Fungsional Ahli Muda/Pertama, Pelaksana, etc.
        retirementAge = 58;
    }

    try {
        const birthDate = new Date(employee.birthDate);
        if (isNaN(birthDate.getTime())) {
            return false;
        }

        const retirementDate = new Date(birthDate.getFullYear() + retirementAge, birthDate.getMonth(), birthDate.getDate());
        const now = new Date();

        // Check if the current date is past the retirement date.
        return retirementDate <= now;
    } catch (e) {
        console.error("Error calculating retirement status:", e);
        return false;
    }
};

/**
 * Checks if an employee's education level is below S1/D4 (i.e., SMA, D3, or equivalent).
 * @param employee The employee object.
 * @returns True if education is below standard, otherwise false.
 */
export const isEducationBelowStandard = (employee: Employee): boolean => {
    if (!employee.pendidikan) {
        return false;
    }
    const educationLevel = employee.pendidikan.trim().toUpperCase();
    
    // List of education levels considered below S1/D4 standard
    const belowStandardLevels = [
        'SMA', 'SMK', 'MA', // High School and equivalents
        'D3', 'D-III', 'DIPLOMA 3', // Diploma 3
        'D2', 'D-II', 'DIPLOMA 2', // Diploma 2
        'D1', 'D-I', 'DIPLOMA 1'  // Diploma 1
    ];

    // Check if the education level is in the list or contains "SEDERAJAT" (equivalent)
    return belowStandardLevels.includes(educationLevel) || educationLevel.includes('SEDERAJAT');
};
