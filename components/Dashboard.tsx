
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Employee, CriticalJob } from '../types';
import Header from './Header';
import EmployeeTable from './EmployeeTable';
import EmployeeFormModal from './EmployeeFormModal';
import ConfirmationModal from './ConfirmationModal';
import JobDescriptionModal from './JobDescriptionModal';
import DevelopmentPlanModal from './DevelopmentPlanModal';
import TalentPoolPage from '../pages/TalentPoolPage';
import CriticalJobsPage from '../pages/CriticalJobsPage';
import CriticalJobFormModal from './CriticalJobFormModal';
import { generateJobDescription, generateDevelopmentPlan, generateTalentPoolAnalysis } from '../services/geminiService';
import { getEmployeeBoxInfo, getEselonRank, findSuitableCandidates, calculateSuccessionStatus, getBirthDateFromNIP } from '../utils/talentUtils';
import { LoadingIcon, WarningIcon } from './icons';
import { loadEmployeesFromStorage, saveEmployeesToStorage, loadCriticalJobsFromStorage, saveCriticalJobsToStorage } from '../utils/storage';
import Sidebar from './Sidebar';
import DashboardSummary from './DashboardSummary';
import SelfServiceFormPage from '../pages/SelfServiceFormPage';

interface DashboardProps {
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoadingApp, setIsLoadingApp] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [viewMode, setViewMode] = useState<'summary' | 'list' | 'talentPool' | 'criticalJobs' | 'selfServiceForm'>('summary');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('eselon-desc');
    
    // State for Employee Modals
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    
    // State for Job Modals
    const [editingJob, setEditingJob] = useState<CriticalJob | null>(null);
    const [isJobFormModalOpen, setIsJobFormModalOpen] = useState(false);
    const [criticalJobs, setCriticalJobs] = useState<CriticalJob[]>([]);

    // Unified Confirmation Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ action: (() => void) | null, title: string, message: string }>({ action: null, title: '', message: '' });

    // State for AI-generated content modals
    const [jobDescContent, setJobDescContent] = useState({ title: '', content: '' });
    const [isJobDescModalOpen, setIsJobDescModalOpen] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    
    const [devPlanContent, setDevPlanContent] = useState({ title: '', content: '', employeeName: '' });
    const [isDevPlanModalOpen, setIsDevPlanModalOpen] = useState(false);
    const [isGeneratingDevPlan, setIsGeneratingDevPlan] = useState(false);
    
    // State for Talent Pool Analysis
    const [talentPoolAnalysis, setTalentPoolAnalysis] = useState('');
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
    
    const [error, setError] = useState<string | null>(null);

    // Effect to load data from localStorage.
    useEffect(() => {
        setIsLoadingApp(true);
        setError(null);
        try {
            setEmployees(loadEmployeesFromStorage());
            setCriticalJobs(loadCriticalJobsFromStorage());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Gagal memuat data dari penyimpanan lokal. Data mungkin rusak. Kesalahan: ${errorMessage}`);
        } finally {
            setIsLoadingApp(false);
        }
    }, []);

    // Effect to auto-generate analysis when switching to talent pool view
    useEffect(() => {
        const handleViewChange = async () => {
            if (viewMode === 'talentPool' && !talentPoolAnalysis && employees.length > 0) {
                setIsGeneratingAnalysis(true);
                setError(null);
                try {
                    const analysis = await generateTalentPoolAnalysis(employees);
                    setTalentPoolAnalysis(analysis);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                    setError(`Gagal membuat analisis talent pool: ${errorMessage}`);
                    setTalentPoolAnalysis('Terjadi kesalahan saat menghasilkan analisis.');
                } finally {
                    setIsGeneratingAnalysis(false);
                }
            }
        };
        handleViewChange();
    }, [viewMode, talentPoolAnalysis, employees]);

    const filteredEmployees = useMemo(() => {
        let processedEmployees = [...employees];
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        if (searchTerm) {
            processedEmployees = employees.filter(emp =>
                emp.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                emp.jabatan.toLowerCase().includes(lowerCaseSearchTerm) ||
                emp.unitKerja.toLowerCase().includes(lowerCaseSearchTerm) ||
                (emp.email && emp.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
                emp.nip.includes(lowerCaseSearchTerm)
            );
        }

        if (sortKey === 'default') return processedEmployees;

        const [key, direction] = sortKey.split('-');
        return processedEmployees.sort((a, b) => {
            let valA: any, valB: any;
            switch (key) {
                case 'eselon': valA = getEselonRank(a.eselon); valB = getEselonRank(b.eselon); break;
                case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
                case 'performance': valA = a.performance; valB = b.performance; break;
                case 'potential': valA = a.potential; valB = b.potential; break;
                case 'competency': valA = a.competency ?? 0; valB = b.competency ?? 0; break;
                default: return 0;
            }
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [employees, searchTerm, sortKey]);

    // --- Employee CRUD Handlers ---
    const handleAddEmployee = useCallback(() => { setEditingEmployee(null); setIsFormModalOpen(true); }, []);
    const handleEditEmployee = useCallback((employee: Employee) => { setEditingEmployee(employee); setIsFormModalOpen(true); }, []);
    const handleSaveEmployee = useCallback((employee: Employee) => {
        if (employees.some(e => e.nip === employee.nip && e.id !== employee.id)) {
            alert('Gagal menyimpan: NIP sudah terdaftar di sistem. Silakan gunakan NIP yang unik.');
            return;
        }

        const isEditing = !!editingEmployee;
        const newEmployees = isEditing 
            ? employees.map(e => e.id === employee.id ? employee : e)
            : [...employees, employee];

        setEmployees(newEmployees);
        saveEmployeesToStorage(newEmployees);
        setTalentPoolAnalysis('');
        setIsFormModalOpen(false);
        setEditingEmployee(null);
    }, [editingEmployee, employees]);

    const handleSaveFromSelfService = useCallback((employee: Employee) => {
        if (employees.some(e => e.nip === employee.nip)) {
            alert('Gagal menyimpan: NIP sudah terdaftar. Silakan gunakan NIP yang unik.');
            return;
        }
        const newEmployees = [...employees, employee];
        setEmployees(newEmployees);
        saveEmployeesToStorage(newEmployees);
        setTalentPoolAnalysis('');
        alert('Data pegawai berhasil disimpan dan ditambahkan ke Daftar Talenta.');
        setViewMode('list');
    }, [employees]);

    const handleDeleteEmployeeRequest = useCallback((id: string) => {
        setConfirmAction({
            action: () => {
                const newEmployees = employees.filter(e => e.id !== id);
                setEmployees(newEmployees);
                saveEmployeesToStorage(newEmployees);
                setTalentPoolAnalysis('');
            },
            title: "Konfirmasi Hapus Pegawai",
            message: "Apakah Anda yakin ingin menghapus data talenta ini? Tindakan ini tidak dapat diurungkan."
        });
        setIsConfirmModalOpen(true);
    }, [employees]);

    // --- Critical Job CRUD Handlers ---
    const handleAddJob = useCallback(() => { setEditingJob(null); setIsJobFormModalOpen(true); }, []);
    const handleEditJob = useCallback((job: CriticalJob) => { setEditingJob(job); setIsJobFormModalOpen(true); }, []);
    const handleSaveJob = useCallback((job: CriticalJob) => {
        const isEditing = !!editingJob;
        const finalJob = isEditing ? job : { ...job, id: `cj-${Date.now()}` };
        const newJobs = isEditing 
            ? criticalJobs.map(j => j.id === finalJob.id ? finalJob : j)
            : [...criticalJobs, finalJob];
        setCriticalJobs(newJobs);
        saveCriticalJobsToStorage(newJobs);
        setIsJobFormModalOpen(false);
        setEditingJob(null);
    }, [editingJob, criticalJobs]);

    const handleDeleteJobRequest = useCallback((id: string) => {
        setConfirmAction({
            action: () => {
                const newJobs = criticalJobs.filter(j => j.id !== id);
                setCriticalJobs(newJobs);
                saveCriticalJobsToStorage(newJobs);
            },
            title: "Konfirmasi Hapus Jabatan",
            message: "Apakah Anda yakin ingin menghapus jabatan kritis ini? Ini tidak akan menghapus data pegawai terkait."
        });
        setIsConfirmModalOpen(true);
    }, [criticalJobs]);
    
    // --- AI Generation Handlers ---
    const handleGenerateDescription = useCallback(async (employee: Employee) => {
        setIsGeneratingDesc(true); setError(null);
        setJobDescContent({ title: `Deskripsi Pekerjaan untuk ${employee.jabatan}`, content: '' });
        setIsJobDescModalOpen(true);
        try {
            const description = await generateJobDescription(employee.jabatan, employee.unitKerja);
            setJobDescContent(prev => ({ ...prev, content: description }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setJobDescContent(prev => ({ ...prev, content: `Terjadi kesalahan saat berkomunikasi dengan AI. ${errorMessage}` }));
        } finally { setIsGeneratingDesc(false); }
    }, []);

    const handleGenerateDevelopmentPlan = useCallback(async (employee: Employee) => {
        setIsGeneratingDevPlan(true); setError(null);
        setDevPlanContent({ title: `Rencana Pengembangan`, content: '', employeeName: employee.name });
        setIsDevPlanModalOpen(true);
        try {
            const plan = await generateDevelopmentPlan(employee);
            setDevPlanContent(prev => ({ ...prev, content: plan }));
            setEmployees(prevEmployees => {
                const newEmployees = prevEmployees.map(e => e.id === employee.id ? { ...e, developmentPlan: plan } : e);
                saveEmployeesToStorage(newEmployees);
                return newEmployees;
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setDevPlanContent(prev => ({ ...prev, content: `Terjadi kesalahan saat berkomunikasi dengan AI. ${errorMessage}` }));
        } finally { setIsGeneratingDevPlan(false); }
    }, []);

    const handleDownloadTemplate = useCallback(() => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Data Pegawai (Main Data)
        const employeeData = [
            {
                "NIP": "198501152010011001", "Nama Lengkap": "Ahmad Subarjo", "Jabatan": "Analis Kebijakan Ahli Muda", "Pangkat/Golongan": "Penata, III/c", "Unit Kerja (SKPD)": "BAPPEDA",
                "Eselon": "Fungsional Ahli Muda", "Email": "ahmad.s@example.com", "Telepon": "081234567890", "Skor Kinerja": 92, "Skor Potensi": 95, "Skor Kompetensi": 88,
                "Kompetensi Teknis (pisahkan koma)": "Analisis Data, Penyusunan Laporan", "Jabatan Target Suksesi": "Kepala Bidang Perencanaan"
            },
            {
                "NIP": "199003202015022002", "Nama Lengkap": "Siti Aminah", "Jabatan": "Pranata Komputer Ahli Pertama", "Pangkat/Golongan": "Penata Muda Tk. I, III/b", "Unit Kerja (SKPD)": "Dinas Komunikasi dan Informatika",
                "Eselon": "Fungsional Ahli Pertama", "Email": "siti.a@example.com", "Telepon": "081298765432", "Skor Kinerja": 85, "Skor Potensi": 91, "Skor Kompetensi": 90,
                "Kompetensi Teknis (pisahkan koma)": "Jaringan Komputer, Keamanan Siber, PHP", "Jabatan Target Suksesi": "Kepala Seksi Infrastruktur Digital"
            }
        ];
        const wsEmployees = XLSX.utils.json_to_sheet(employeeData);
        XLSX.utils.book_append_sheet(wb, wsEmployees, "Data Pegawai");

        // Helper function for history sheets
        const createHistorySheet = (sheetName: string, data: any[]) => {
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        };

        // Sheet 2: Riwayat Pendidikan
        createHistorySheet("Riwayat Pendidikan", [
            { "NIP": "198501152010011001", "Jenjang": "S1", "Jurusan": "Ilmu Administrasi Negara", "Institusi": "Universitas Gadjah Mada", "Tahun Lulus": 2008 },
            { "NIP": "198501152010011001", "Jenjang": "S2", "Jurusan": "Magister Administrasi Publik", "Institusi": "Universitas Indonesia", "Tahun Lulus": 2014 },
            { "NIP": "199003202015022002", "Jenjang": "S1", "Jurusan": "Teknik Informatika", "Institusi": "Institut Teknologi Bandung", "Tahun Lulus": 2012 }
        ]);

        // Sheet 3: Riwayat Karir
        createHistorySheet("Riwayat Karir", [
            { "NIP": "198501152010011001", "Jabatan": "Staf Pelaksana", "Unit Kerja": "BAPPEDA", "TMT": "2010-01-01" },
            { "NIP": "198501152010011001", "Jabatan": "Analis Kebijakan Ahli Muda", "Unit Kerja": "BAPPEDA", "TMT": "2016-04-01" }
        ]);

        // Sheet 4: Riwayat Kinerja
        createHistorySheet("Riwayat Kinerja", [
            { "NIP": "198501152010011001", "Tahun": 2022, "Nilai SKP": 91.5, "Predikat": "Sangat Baik" },
            { "NIP": "198501152010011001", "Tahun": 2023, "Nilai SKP": 92.0, "Predikat": "Sangat Baik" }
        ]);

        // Sheet 5: Riwayat Pengembangan
        createHistorySheet("Riwayat Pengembangan", [
            { "NIP": "198501152010011001", "Nama Pelatihan": "Pelatihan Kepemimpinan Administrator", "Penyelenggara": "BPSDM Provinsi", "Tahun": 2021, "Jenis": "Klasikal" }
        ]);

        XLSX.writeFile(wb, "Template_Import_Talenta_ASN.xlsx");
    }, []);

    const handleImportData = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".xlsx, .xls";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
    
            setIsImporting(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = event.target?.result;
                    const workbook = XLSX.read(data, { type: 'array' });
    
                    const sheetNames = {
                        employees: 'Data Pegawai',
                        education: 'Riwayat Pendidikan',
                        career: 'Riwayat Karir',
                        performance: 'Riwayat Kinerja',
                        development: 'Riwayat Pengembangan',
                    };
    
                    if (!workbook.SheetNames.includes(sheetNames.employees)) {
                        throw new Error(`Sheet utama "${sheetNames.employees}" tidak ditemukan. Pastikan file Excel Anda memiliki sheet ini dan sesuai dengan template.`);
                    }
    
                    const employeeWorksheet = workbook.Sheets[sheetNames.employees];
                    const employeeJson = XLSX.utils.sheet_to_json(employeeWorksheet) as any[];
    
                    const employeesMap = new Map<string, Employee>(employees.map(emp => [emp.nip, emp]));
                    let addedCount = 0;
                    let updatedCount = 0;
                    const validationErrors: string[] = [];
    
                    employeeJson.forEach((row, index) => {
                        const nip = String(row['NIP'] || '').trim();
                        const name = String(row['Nama Lengkap'] || '').trim();
                        if (!nip || !name) {
                            validationErrors.push(`Baris ${index + 2} di sheet "Data Pegawai" diabaikan karena NIP atau Nama Lengkap kosong.`);
                            return;
                        }
    
                        const existingEmployee = employeesMap.get(nip);
                        
                        const importedData: Partial<Employee> = {
                            nip, name: row['Nama Lengkap'], jabatan: row['Jabatan'], pangkatGolongan: row['Pangkat/Golongan'],
                            unitKerja: row['Unit Kerja (SKPD)'], email: row['Email'], phone: String(row['Telepon'] || ''), eselon: row['Eselon'],
                            performance: parseInt(row['Skor Kinerja'], 10) || 75,
                            potential: parseInt(row['Skor Potensi'], 10) || 75,
                            competency: parseInt(row['Skor Kompetensi'], 10) || 75,
                            skills: typeof row['Kompetensi Teknis (pisahkan koma)'] === 'string' ? row['Kompetensi Teknis (pisahkan koma)'].split(',').map((s:string) => s.trim()).filter(Boolean) : [],
                            criticalPosition: row['Jabatan Target Suksesi'],
                        };
                        
                        const baseEmployee: Employee = {
                            id: nip, nip, name: '', jabatan: '', pangkatGolongan: '', pendidikan: '', jurusan: '', unitKerja: '', phone: '',
                            trainingAttended: '', eselon: 'Staf', performance: 75, potential: 75, competency: 75, skills: [],
                            criticalPosition: '', developmentPlan: '', successionStatus: 'Bukan Kandidat',
                            avatar: `https://ui-avatars.com/api/?name=${String(importedData.name || nip).replace(/\s/g, '+')}&background=c7d2fe&color=3730a3&font-size=0.5`,
                            birthDate: getBirthDateFromNIP(nip)?.toISOString(), educationHistory: [], performanceHistory: [], careerHistory: [], developmentHistory: [],
                        };
    
                        const employeeToUpdate = existingEmployee ? { ...existingEmployee, ...importedData, educationHistory: [], careerHistory: [], performanceHistory: [], developmentHistory: [] } : { ...baseEmployee, ...importedData };
                        employeeToUpdate.birthDate = getBirthDateFromNIP(employeeToUpdate.nip)?.toISOString();
                        employeeToUpdate.successionStatus = calculateSuccessionStatus(employeeToUpdate);
                        employeesMap.set(nip, employeeToUpdate);

                        if(existingEmployee) { updatedCount++; } else { addedCount++; }
                    });
    
                    // Process History Sheets
                    const processHistorySheet = (sheetName: string, field: keyof Employee, factory: (row: any) => any) => {
                        if (workbook.SheetNames.includes(sheetName)) {
                            const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];
                            json.forEach(row => {
                                const nip = String(row['NIP'] || '').trim();
                                const employee = employeesMap.get(nip);
                                if (employee) {
                                    (employee[field] as any[]).push(factory(row));
                                }
                            });
                        }
                    };

                    processHistorySheet(sheetNames.education, 'educationHistory', row => ({ id: crypto.randomUUID(), jenjang: row['Jenjang'], jurusan: row['Jurusan'], institusi: row['Institusi'], tahunLulus: String(row['Tahun Lulus']) }));
                    processHistorySheet(sheetNames.career, 'careerHistory', row => ({ id: crypto.randomUUID(), jabatan: row['Jabatan'], unitKerja: row['Unit Kerja'], tmt: String(row['TMT']) }));
                    processHistorySheet(sheetNames.performance, 'performanceHistory', row => ({ id: crypto.randomUUID(), tahun: String(row['Tahun']), skp: String(row['Nilai SKP']), predikat: row['Predikat'] }));
                    processHistorySheet(sheetNames.development, 'developmentHistory', row => ({ id: crypto.randomUUID(), namaPelatihan: row['Nama Pelatihan'], penyelenggara: row['Penyelenggara'], tahun: String(row['Tahun']), jenis: row['Jenis'] === 'Non-Klasikal' ? 'Non-Klasikal' : 'Klasikal' }));

                    const newEmployeesList = Array.from(employeesMap.values());
                    
                    newEmployeesList.forEach(emp => {
                        if (emp.educationHistory && emp.educationHistory.length > 0) {
                            const sortedEdu = [...emp.educationHistory].filter(e => e.tahunLulus).sort((a,b) => parseInt(b.tahunLulus, 10) - parseInt(a.tahunLulus, 10));
                            if (sortedEdu[0]) { emp.pendidikan = sortedEdu[0].jenjang; emp.jurusan = sortedEdu[0].jurusan; }
                        }
                         if (emp.developmentHistory && emp.developmentHistory.length > 0) {
                            const sortedDev = [...emp.developmentHistory].filter(d => d.tahun).sort((a,b) => parseInt(b.tahun, 10) - parseInt(a.tahun, 10));
                            if (sortedDev[0]) { emp.trainingAttended = sortedDev[0].namaPelatihan; }
                        }
                    });
    
                    setEmployees(newEmployeesList);
                    saveEmployeesToStorage(newEmployeesList);
                    setTalentPoolAnalysis('');
                    
                    let alertMessage = `Impor berhasil!\n${addedCount} data baru ditambahkan.\n${updatedCount} data diperbarui.`;
                    if (validationErrors.length > 0) {
                        alertMessage += `\n\nPeringatan:\n${validationErrors.slice(0, 5).join('\n')}`;
                        if (validationErrors.length > 5) {
                            alertMessage += `\n...dan ${validationErrors.length - 5} peringatan lainnya.`;
                        }
                    }
                    alert(alertMessage);
                } catch (error) {
                    console.error("Error importing file:", error);
                    alert(`Gagal mengimpor file. ${error instanceof Error ? error.message : "Pastikan format file, nama sheet, dan nama kolom sudah benar."}`);
                } finally {
                    setIsImporting(false);
                }
            };
            reader.onerror = () => {
                alert('Gagal membaca file.');
                setIsImporting(false);
            }
            reader.readAsArrayBuffer(file);
        };
        input.click();
    }, [employees]);
    
    const handleExportData = useCallback(() => {
        if (employees.length === 0) { alert("Tidak ada data talenta untuk diekspor."); return; }
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Rekapitulasi Data Talenta ASN - Kabupaten Aceh Barat", 14, 15);
        doc.setFontSize(10);
        const reportDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Tanggal Laporan: ${reportDate}`, 14, 22);
        const headers = [["No", "Nama", "NIP", "Jabatan", "Unit Kerja", "Kinerja", "Potensi", "Kompetensi", "Kotak", "Kategori Kotak", "Status Suksesi"]];
        const rows = employees.map((emp, index) => {
            const { boxNumber, category } = getEmployeeBoxInfo(emp);
            return [index + 1, emp.name, emp.nip, emp.jabatan, emp.unitKerja, emp.performance, emp.potential, emp.competency ?? 'N/A', boxNumber, category, emp.successionStatus];
        });
        autoTable(doc, {
            head: headers, body: rows, startY: 30, theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: { 
                0: { cellWidth: 8 }, 
                5: { halign: 'center' }, 
                6: { halign: 'center' }, 
                7: { halign: 'center' },
                8: { halign: 'center' } 
            }
        });
        const date = new Date().toISOString().slice(0, 10);
        doc.save(`rekapitulasi-talenta-asn-${date}.pdf`);
    }, [employees]);

    if (isLoadingApp) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <LoadingIcon className="h-16 w-16 text-indigo-600 animate-spin" />
            <h1 className="mt-6 text-2xl font-bold text-gray-800">Mempersiapkan Aplikasi</h1>
            <p className="mt-2 text-gray-500">Memuat data talenta dari penyimpanan lokal...</p>
        </div>
    );
    
    if (error && employees.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg">
                <WarningIcon className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="mt-6 text-2xl font-bold text-gray-800">Oops! Terjadi Kesalahan</h1>
                <p className="mt-2 text-gray-600">{error}</p>
                <button 
                    onClick={() => { saveEmployeesToStorage([]); window.location.reload(); }}
                    className="mt-8 w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm transition-colors"
                >
                    Coba Muat Ulang & Hapus Cache Lokal
                </button>
            </div>
        </div>
    );

    const getHeaderTitle = () => {
        switch (viewMode) {
            case 'summary': return "Ringkasan Dashboard";
            case 'list': return "Daftar Talenta ASN";
            case 'talentPool': return "Analisis Talent Pool";
            case 'criticalJobs': return "Daftar Jabatan Kritikal";
            case 'selfServiceForm': return "Pengisian Data Mandiri Pegawai";
            default: return "";
        }
    };

    const getHeaderSubtitle = () => {
        switch (viewMode) {
            case 'summary': return "Tinjauan umum data manajemen talenta.";
            case 'list': return "Kelola data talenta ASN Pemerintah Kabupaten Aceh Barat.";
            case 'talentPool': return "Analisis 9-Box Matrix dan Kelompok Rencana Suksesi (KRS).";
            case 'criticalJobs': return "Kelola dan petakan calon suksesor untuk jabatan strategis.";
            case 'selfServiceForm': return "Isi formulir berikut untuk mendaftarkan data talenta Anda.";
            default: return "";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar viewMode={viewMode} setViewMode={setViewMode} onExportData={handleExportData} onLogout={onLogout} />
            <div className="flex-1 flex flex-col relative">
                {isImporting && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-lg">
                        <LoadingIcon className="h-12 w-12 text-indigo-500 animate-spin"/>
                        <p className="mt-4 font-semibold text-gray-600">Mengimpor data dari file Excel...</p>
                        <p className="text-sm text-gray-500">Mohon tunggu sejenak.</p>
                    </div>
                )}
                 <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                    <Header 
                        title={getHeaderTitle()}
                        subtitle={getHeaderSubtitle()}
                        showControls={viewMode === 'list'}
                        onAddEmployee={handleAddEmployee}
                        onSearchChange={(e) => setSearchTerm(e.target.value)}
                        sortKey={sortKey}
                        onSortKeyChange={setSortKey}
                        onImportData={handleImportData}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                    
                    <main className="mt-8">
                        {viewMode === 'summary' && <DashboardSummary employees={employees} criticalJobs={criticalJobs} />}
                        {viewMode === 'list' && (
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                                <EmployeeTable
                                    employees={filteredEmployees}
                                    onEdit={handleEditEmployee}
                                    onDelete={handleDeleteEmployeeRequest}
                                    onGenerateDescription={handleGenerateDescription}
                                    onGenerateDevelopmentPlan={handleGenerateDevelopmentPlan}
                                />
                            </div>
                        )}
                        {viewMode === 'talentPool' && (
                            <TalentPoolPage 
                                employees={employees} 
                                analysis={talentPoolAnalysis}
                                isLoading={isGeneratingAnalysis}
                                error={error}
                            />
                        )}
                        {viewMode === 'criticalJobs' && (
                             <CriticalJobsPage
                                criticalJobs={criticalJobs}
                                employees={employees}
                                findCandidates={findSuitableCandidates}
                                onAddJob={handleAddJob}
                                onEditJob={handleEditJob}
                                onDeleteJob={handleDeleteJobRequest}
                            />
                        )}
                        {viewMode === 'selfServiceForm' && (
                            <SelfServiceFormPage onSave={handleSaveFromSelfService} />
                        )}
                    </main>
                </div>
            </div>

            {isFormModalOpen && <EmployeeFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveEmployee} employee={editingEmployee} />}
            {isJobFormModalOpen && <CriticalJobFormModal isOpen={isJobFormModalOpen} onClose={() => setIsJobFormModalOpen(false)} onSave={handleSaveJob} job={editingJob} />}
            {isConfirmModalOpen && <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={() => { if(confirmAction.action) confirmAction.action(); setIsConfirmModalOpen(false); }} title={confirmAction.title} message={confirmAction.message} />}
            {isJobDescModalOpen && <JobDescriptionModal isOpen={isJobDescModalOpen} onClose={() => setIsJobDescModalOpen(false)} title={jobDescContent.title} description={jobDescContent.content} isLoading={isGeneratingDesc} error={null} />}
            {isDevPlanModalOpen && <DevelopmentPlanModal isOpen={isDevPlanModalOpen} onClose={() => setIsDevPlanModalOpen(false)} title={devPlanContent.title} content={devPlanContent.content} isLoading={isGeneratingDevPlan} error={null} employeeName={devPlanContent.employeeName} />}
        </div>
    );
};

export default Dashboard;
