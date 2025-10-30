import { Employee, CriticalJob } from '../types';

const EMPLOYEES_STORAGE_KEY = 'simt_employees_data_v1';
const CRITICAL_JOBS_STORAGE_KEY = 'simt_critical_jobs_data_v1';

/**
 * Loads employee data from localStorage.
 * If no data is found, it returns an empty array. This prevents the application
 * from being seeded with initial sample data.
 * @returns An array of Employee objects.
 */
export const loadEmployeesFromStorage = (): Employee[] => {
    const storedData = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (storedData) {
        // The try-catch block for parsing is handled at the call sites.
        return JSON.parse(storedData) as Employee[];
    }
    // If no data exists, return an empty array to ensure a clean slate.
    return [];
};

/**
 * Saves the provided employee data to localStorage.
 * @param employees The array of Employee objects to save.
 */
export const saveEmployeesToStorage = (employees: Employee[]): void => {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
};


/**
 * Loads critical jobs data from localStorage.
 * If no data is found, it returns an empty array. This prevents the application
 * from being seeded with initial sample data.
 * @returns An array of CriticalJob objects.
 */
export const loadCriticalJobsFromStorage = (): CriticalJob[] => {
    const storedData = localStorage.getItem(CRITICAL_JOBS_STORAGE_KEY);
    if (storedData) {
        // The try-catch block for parsing is handled at the call sites.
        return JSON.parse(storedData) as CriticalJob[];
    }
    // If no data exists, return an empty array to ensure a clean slate.
    return [];
};

/**
 * Saves the provided critical jobs data to localStorage.
 * @param jobs The array of CriticalJob objects to save.
 */
export const saveCriticalJobsToStorage = (jobs: CriticalJob[]): void => {
    localStorage.setItem(CRITICAL_JOBS_STORAGE_KEY, JSON.stringify(jobs));
};
