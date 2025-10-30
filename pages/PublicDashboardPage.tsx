import React, { useState, useEffect } from 'react';
import { Employee, CriticalJob } from '../types';
import { loadEmployeesFromStorage, loadCriticalJobsFromStorage, saveEmployeesToStorage } from '../utils/storage';
import DashboardSummary from '../components/DashboardSummary';
import { WarningIcon, LoadingIcon, ArrowLeftIcon, ClipboardListIcon, BrandIcon } from '../components/icons';
import SelfServiceFormPage from './SelfServiceFormPage';

interface PublicDashboardPageProps {
    onLogin: (username: string, password: string) => boolean;
}

const PublicDashboardPage: React.FC<PublicDashboardPageProps> = ({ onLogin }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [criticalJobs, setCriticalJobs] = useState<CriticalJob[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const [view, setView] = useState<'summary' | 'selfServiceForm'>('summary');

    useEffect(() => {
        try {
            setEmployees(loadEmployeesFromStorage());
            setCriticalJobs(loadCriticalJobsFromStorage());
        } catch (err) {
            console.error("Failed to load data from storage", err);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);

        setTimeout(() => {
            const success = onLogin(username, password);
            if (!success) {
                setError('Nama pengguna atau kata sandi salah. Silakan coba lagi.');
            }
            setIsLoggingIn(false);
        }, 500);
    };
    
    const handleSaveFromSelfService = (employee: Employee) => {
        if (employees.some(e => e.nip === employee.nip)) {
            alert('Gagal menyimpan: NIP sudah terdaftar. Silakan gunakan NIP yang unik.');
            return;
        }
        const newEmployees = [...employees, employee];
        setEmployees(newEmployees);
        saveEmployeesToStorage(newEmployees);
        alert('Data Anda berhasil disimpan! Data akan ditinjau lebih lanjut oleh administrator.');
        setView('summary');
    };


    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/70">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm border">
                           <BrandIcon className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl leading-tight text-gray-800">Sistem Informasi Manajemen Talenta</h1>
                            <p className="text-sm text-gray-500">Pemerintah Kabupaten Aceh Barat</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {view === 'selfServiceForm' ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Pengisian Data Mandiri Pegawai</h2>
                                <p className="text-gray-600">Isi formulir berikut untuk mendaftarkan data talenta Anda.</p>
                            </div>
                            <button 
                                onClick={() => setView('summary')} 
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                <span>Kembali ke Dashboard</span>
                            </button>
                        </div>
                        <SelfServiceFormPage onSave={handleSaveFromSelfService} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Publik</h2>
                            <p className="text-gray-600 mb-6">Ringkasan grafis dan status terkini manajemen talenta ASN.</p>
                            {isLoadingData ? (
                                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg text-center p-4">
                                    <LoadingIcon className="h-12 w-12 text-indigo-600 animate-spin" />
                                    <h1 className="mt-4 text-xl font-bold text-gray-700">Memuat Data</h1>
                                    <p className="mt-1 text-gray-500">Mempersiapkan ringkasan data talenta...</p>
                                </div>
                            ) : (
                                <DashboardSummary employees={employees} criticalJobs={criticalJobs} />
                            )}
                        </div>

                        <div className="lg:col-span-1 space-y-8">
                             <div className="bg-white shadow-xl rounded-2xl p-8 space-y-4 text-center">
                                <ClipboardListIcon className="h-12 w-12 mx-auto text-indigo-500" />
                                <h2 className="text-xl font-bold text-gray-900">ASN Kabupaten Aceh Barat?</h2>
                                <p className="text-gray-500 text-sm">Lengkapi dan daftarkan data talenta Anda untuk mendukung pengembangan karir dan perencanaan suksesi yang lebih baik.</p>
                                <button
                                    onClick={() => setView('selfServiceForm')}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    Isi Data Mandiri Sekarang
                                </button>
                            </div>

                            <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 sticky top-28">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Akses Area Manajemen
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">Login untuk mengelola data talenta.</p>
                                </div>

                                <form onSubmit={handleLoginSubmit} className="space-y-5">
                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-3">
                                            <div className="flex">
                                                <div className="flex-shrink-0 pt-0.5">
                                                    <WarningIcon className="h-5 w-5 text-red-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-red-700">{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nama Pengguna</label>
                                        <div className="mt-1">
                                            <input
                                                id="username" name="username" type="text" autoComplete="username" required
                                                value={username} onChange={(e) => setUsername(e.target.value)}
                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                                                placeholder="admin"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                                        <div className="mt-1">
                                            <input
                                                id="password" name="password" type="password" autoComplete="current-password" required
                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                                                placeholder="password"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit" disabled={isLoggingIn}
                                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                                        >
                                            {isLoggingIn ? (
                                                <>
                                                    <LoadingIcon className="animate-spin h-5 w-5 mr-3" />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : ( 'Login' )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
             <footer className="text-center py-6 text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} BKPSDM Aceh Barat. All rights reserved.</p>
            </footer>
        </div>
    );
};
export default PublicDashboardPage;