
import React, { useState, useEffect } from 'react';
import { CriticalJob } from '../types';
import { CloseIcon } from './icons';
import { eselonOrder } from '../utils/talentUtils';

interface CriticalJobFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: CriticalJob) => void;
    job: CriticalJob | null;
}

const CriticalJobFormModal: React.FC<CriticalJobFormModalProps> = ({ isOpen, onClose, onSave, job }) => {
    const getInitialFormData = (): Omit<CriticalJob, 'id'> => ({
        title: '',
        unitKerja: '',
        description: '',
        requiredEselon: 'Administrator (Eselon III)',
        vacancies: 1,
    });
    
    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (job) {
                setFormData(job);
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [job, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['vacancies'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newJobData: CriticalJob = {
            id: job?.id || '', // ID will be generated in the parent component for new jobs
            ...formData,
        };
        onSave(newJobData);
    };

    if (!isOpen) return null;

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition";
    const selectStyle = "mt-1 block w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition";
    const textareaStyle = `${inputStyle} resize-y min-h-[80px]`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl m-4 flex flex-col relative" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">{job ? 'Edit Jabatan Kritikal' : 'Tambah Jabatan Kritikal Baru'}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                           <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[70vh] overflow-y-auto">
                        
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Nama Jabatan</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className={inputStyle} placeholder="Contoh: Kepala Dinas..." />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="unitKerja" className="block text-sm font-medium text-gray-700">SKPD (Unit Kerja)</label>
                            <input type="text" name="unitKerja" id="unitKerja" value={formData.unitKerja} onChange={handleChange} required className={inputStyle} placeholder="Contoh: BAPPEDA" />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Singkat Jabatan</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} required className={textareaStyle} placeholder="Jelaskan peran dan tanggung jawab utama jabatan ini."/>
                        </div>

                        <div>
                            <label htmlFor="requiredEselon" className="block text-sm font-medium text-gray-700">Eselon yang Dibutuhkan</label>
                             <select name="requiredEselon" id="requiredEselon" value={formData.requiredEselon} onChange={handleChange} required className={selectStyle}>
                                {eselonOrder.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="vacancies" className="block text-sm font-medium text-gray-700">Jumlah Lowongan</label>
                            <input type="number" name="vacancies" id="vacancies" value={formData.vacancies} onChange={handleChange} required min="1" className={inputStyle} />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                            Simpan Jabatan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriticalJobFormModal;