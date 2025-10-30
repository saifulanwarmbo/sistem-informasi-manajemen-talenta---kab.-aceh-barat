

import React, { useState, useEffect } from 'react';
import { Employee, SuccessionStatus } from '../types';
import { CloseIcon } from './icons';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Employee) => void;
    employee: Employee | null;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, onSave, employee }) => {
    const getInitialFormData = (): Omit<Employee, 'id' | 'avatar' | 'skills'> & { skills: string } => ({
        name: '',
        nip: '',
        jabatan: '',
        pangkatGolongan: '',
        pendidikan: '',
        jurusan: '',
        unitKerja: '',
        email: '',
        phone: '',
        trainingAttended: '',
        eselon: 'Staf',
        performance: 75,
        potential: 75,
        skills: '',
        criticalPosition: '',
        developmentPlan: '',
        successionStatus: 'Bukan Kandidat',
    });
    
    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (employee) {
                setFormData({
                    ...employee,
                    skills: employee.skills.join(', '), // Convert array to comma-separated string for editing
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [employee, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['performance', 'potential'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEmployeeData: Omit<Employee, 'id' | 'avatar'> = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s), // Convert string to array
        };

        const newEmployee: Employee = {
            id: employee?.id || formData.nip,
            ...newEmployeeData,
            avatar: employee?.avatar || `https://i.pravatar.cc/150?u=${newEmployeeData.nip}`,
        };
        onSave(newEmployee);
    };

    if (!isOpen) return null;

    const successionStatuses: SuccessionStatus[] = ['Siap Sekarang', '1-2 Tahun', 'Potensi Masa Depan', 'Bukan Kandidat'];
    const eselonOptions = [
        'Staf',
        'Pelaksana',
        'Fungsional Terampil',
        'Fungsional Ahli Pertama',
        'Fungsional Ahli Muda',
        'Fungsional Ahli Madya',
        'Fungsional Ahli Utama',
        'Pengawas (Eselon IV)',
        'Administrator (Eselon III)',
        'JPT Pratama (Eselon II)',
        'JPT Madya (Eselon I.b)',
        'JPT Utama (Eselon I.a)',
    ];
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition";
    const selectStyle = "mt-1 block w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition";


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">{employee ? 'Edit Data Talenta ASN' : 'Tambah Talenta ASN Baru'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                           <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[70vh] overflow-y-auto">
                        
                        <div className="md:col-span-2"><h3 className="font-semibold text-gray-800 border-b pb-2">Data Diri Pegawai</h3></div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="nip" className="block text-sm font-medium text-gray-700">NIP</label>
                            <input type="text" name="nip" id="nip" value={formData.nip} onChange={handleChange} required className={inputStyle} />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputStyle} />
                        </div>

                        <div className="md:col-span-2 mt-4"><h3 className="font-semibold text-gray-800 border-b pb-2">Data Pekerjaan & Talenta</h3></div>
                        <div>
                            <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan</label>
                            <input type="text" name="jabatan" id="jabatan" value={formData.jabatan} onChange={handleChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="pangkatGolongan" className="block text-sm font-medium text-gray-700">Pangkat / Golongan</label>
                            <input type="text" name="pangkatGolongan" id="pangkatGolongan" value={formData.pangkatGolongan} onChange={handleChange} required placeholder="Contoh: Penata, III/c" className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="pendidikan" className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                            <input type="text" name="pendidikan" id="pendidikan" value={formData.pendidikan} onChange={handleChange} required placeholder="Contoh: S1, S2" className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700">Jurusan</label>
                            <input type="text" name="jurusan" id="jurusan" value={formData.jurusan} onChange={handleChange} required placeholder="Contoh: Ilmu Pemerintahan" className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="unitKerja" className="block text-sm font-medium text-gray-700">SKPD (Unit Kerja)</label>
                            <input type="text" name="unitKerja" id="unitKerja" value={formData.unitKerja} onChange={handleChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="eselon" className="block text-sm font-medium text-gray-700">Eselon</label>
                            <select name="eselon" id="eselon" value={formData.eselon} onChange={handleChange} required className={selectStyle}>
                                {eselonOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                           <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Kompetensi Teknis (pisahkan dengan koma)</label>
                           <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} placeholder="Contoh: Analisis Kebijakan, Manajemen Aset, dll." className={inputStyle} />
                        </div>
                        <div className="md:col-span-2">
                           <label htmlFor="criticalPosition" className="block text-sm font-medium text-gray-700">Jabatan Kritis yang Ditargetkan</label>
                           <textarea name="criticalPosition" id="criticalPosition" value={formData.criticalPosition} onChange={handleChange} rows={2} placeholder="Contoh: Kepala Dinas Pekerjaan Umum dan Penataan Ruang" className={`${inputStyle} resize-none`}></textarea>
                        </div>
                        <div className="md:col-span-2">
                           <label htmlFor="trainingAttended" className="block text-sm font-medium text-gray-700">Pelatihan Terakhir Diikuti</label>
                           <input type="text" name="trainingAttended" id="trainingAttended" value={formData.trainingAttended} onChange={handleChange} placeholder="Contoh: Pelatihan Kepemimpinan Tingkat III" className={inputStyle} />
                        </div>

                        <div className="md:col-span-2 mt-4"><h3 className="font-semibold text-gray-800 border-b pb-2">Penilaian & Suksesi</h3></div>
                        <div>
                            <label htmlFor="performance" className="block text-sm font-medium text-gray-700">Skor Kinerja (1-100)</label>
                            <input type="number" name="performance" id="performance" value={formData.performance} onChange={handleChange} required min="1" max="100" className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="potential" className="block text-sm font-medium text-gray-700">Skor Potensi (1-100)</label>
                            <input type="number" name="potential" id="potential" value={formData.potential} onChange={handleChange} required min="1" max="100" className={inputStyle} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="successionStatus" className="block text-sm font-medium text-gray-700">Status Suksesi</label>
                            <select name="successionStatus" id="successionStatus" value={formData.successionStatus} onChange={handleChange} required className={selectStyle}>
                               {successionStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeFormModal;