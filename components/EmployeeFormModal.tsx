
import React, { useState, useEffect, useRef } from 'react';
import { Employee, SuccessionStatus, EducationHistory, PerformanceHistory, CareerHistory, DevelopmentHistory } from '../types';
import { CloseIcon, SparklesIcon, LoadingIcon, CameraIcon, AddIcon, DeleteIcon } from './icons';
import { generateEmployeeData } from '../services/geminiService';
import { performanceMap, potentialMap, getPerformanceScale, getPotentialScale, calculateSuccessionStatus, getBirthDateFromNIP } from '../utils/talentUtils';


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
        competency: 75,
        skills: '',
        criticalPosition: '',
        developmentPlan: '',
        successionStatus: 'Bukan Kandidat',
        educationHistory: [],
        performanceHistory: [],
        careerHistory: [],
        developmentHistory: [],
    });
    
    const [formData, setFormData] = useState(getInitialFormData());
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setGenerationError(null);
            const ensureId = (item: any) => ({ ...item, id: item.id || crypto.randomUUID() });

            if (employee) {
                setFormData({
                    ...employee,
                    skills: employee.skills.join(', '), 
                    educationHistory: (employee.educationHistory || []).map(ensureId),
                    performanceHistory: (employee.performanceHistory || []).map(ensureId),
                    careerHistory: (employee.careerHistory || []).map(ensureId),
                    developmentHistory: (employee.developmentHistory || []).map(ensureId),
                });
                setAvatarPreview(employee.avatar);
            } else {
                setFormData(getInitialFormData());
                setAvatarPreview(null);
            }
        }
    }, [employee, isOpen]);

    // Automatically update succession status when performance, potential, NIP or eselon changes
    useEffect(() => {
        if (isOpen) {
            const birthDate = getBirthDateFromNIP(formData.nip);
            const employeeForStatusCheck = {
                performance: formData.performance,
                potential: formData.potential,
                eselon: formData.eselon,
                birthDate: birthDate ? birthDate.toISOString() : undefined,
            };
            const newStatus = calculateSuccessionStatus(employeeForStatusCheck);
            // Only update if there's a change to prevent re-render loops
            if (newStatus !== formData.successionStatus) {
                setFormData(prev => ({ ...prev, successionStatus: newStatus }));
            }
        }
    }, [formData.performance, formData.potential, formData.nip, formData.eselon, isOpen]);


    // Automatically update main education fields from the latest education history entry
    useEffect(() => {
        if (!isOpen) return;

        const sortedEducation = [...(formData.educationHistory || [])]
            .filter(edu => edu.tahunLulus && edu.jenjang)
            .sort((a, b) => parseInt(b.tahunLulus, 10) - parseInt(a.tahunLulus, 10));
        
        const latestEducation = sortedEducation[0];

        const newPendidikan = latestEducation ? latestEducation.jenjang : '';
        const newJurusan = latestEducation ? latestEducation.jurusan : '';

        // Only update if there's a change to prevent re-render loops
        if (newPendidikan !== formData.pendidikan || newJurusan !== formData.jurusan) {
            setFormData(prev => ({
                ...prev,
                pendidikan: newPendidikan,
                jurusan: newJurusan
            }));
        }
    }, [formData.educationHistory, isOpen]);


    const handleGenerateData = async () => {
        if (!formData.jabatan) {
            setGenerationError("Silakan isi 'Jabatan' terlebih dahulu untuk memulai generasi AI.");
            return;
        }
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const generatedData = await generateEmployeeData(formData.jabatan, formData.unitKerja || "Pemerintah Kabupaten Aceh Barat");
            setFormData(prev => ({
                ...prev,
                ...generatedData,
                skills: Array.isArray(generatedData.skills) ? generatedData.skills.join(', ') : '',
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setGenerationError(`Gagal membuat data: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['performance', 'potential', 'competency'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    const handleAddItem = (field: 'educationHistory' | 'performanceHistory' | 'careerHistory' | 'developmentHistory') => {
        let newItem: EducationHistory | PerformanceHistory | CareerHistory | DevelopmentHistory;
        switch (field) {
            case 'educationHistory':
                newItem = { id: crypto.randomUUID(), jenjang: '', jurusan: '', institusi: '', tahunLulus: '' };
                break;
            case 'performanceHistory':
                newItem = { id: crypto.randomUUID(), tahun: '', skp: '', predikat: '' };
                break;
            case 'careerHistory':
                newItem = { id: crypto.randomUUID(), jabatan: '', unitKerja: '', tmt: '' };
                break;
            case 'developmentHistory':
                newItem = { id: crypto.randomUUID(), namaPelatihan: '', penyelenggara: '', tahun: '', jenis: 'Klasikal' };
                break;
        }
        setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), newItem] }));
    };

    const handleRemoveItem = (field: keyof Employee, id: string) => {
        setFormData(prev => ({ ...prev, [field]: (prev[field] as any[]).filter(item => item.id !== id) }));
    };

    const handleArrayItemChange = (field: keyof Employee, id: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const items = (prev[field] as any[]) || [];
            const newItems = items.map(item => (item.id === id ? { ...item, [name]: value } : item));
            return { ...prev, [field]: newItems };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Note: `pendidikan` and `jurusan` in formData are now always up-to-date thanks to a dedicated useEffect.
        
        const sortedDevelopment = [...(formData.developmentHistory || [])]
            .filter(dev => dev.tahun)
            .sort((a, b) => parseInt(b.tahun, 10) - parseInt(a.tahun, 10));
        const latestDevelopment = sortedDevelopment[0];

        const newEmployeeData: Omit<Employee, 'id' | 'avatar'> = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
            trainingAttended: latestDevelopment ? latestDevelopment.namaPelatihan : formData.trainingAttended,
        };

        const newEmployee: Employee = {
            id: employee?.id || formData.nip,
            ...newEmployeeData,
            birthDate: getBirthDateFromNIP(formData.nip)?.toISOString(),
            avatar: avatarPreview || `https://ui-avatars.com/api/?name=${newEmployeeData.name.replace(/\s/g, '+') || newEmployeeData.nip}&background=c7d2fe&color=3730a3&font-size=0.5`,
        };
        onSave(newEmployee);
    };


    if (!isOpen) return null;

    const eselonOptions = [
        'Staf', 'Pelaksana', 'Fungsional Terampil', 'Fungsional Ahli Pertama', 'Fungsional Ahli Muda',
        'Fungsional Ahli Madya', 'Fungsional Ahli Utama', 'Pengawas (Eselon IV)', 'Administrator (Eselon III)',
        'JPT Pratama (Eselon II)', 'JPT Madya (Eselon I.b)', 'JPT Utama (Eselon I.a)',
    ];
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition";
    const selectStyle = "mt-1 block w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition";
    const historySectionHeaderStyle = "flex justify-between items-center border-b pb-2";
    const historySectionTitleStyle = "font-semibold text-gray-800";
    const addButtonStyle = "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md hover:bg-indigo-100 transition-colors";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 flex flex-col relative" onClick={e => e.stopPropagation()}>
                {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-xl">
                        <LoadingIcon className="h-10 w-10 text-indigo-500 animate-spin"/>
                        <p className="mt-4 font-semibold text-gray-600">AI sedang membuat data talenta...</p>
                        <p className="text-sm text-gray-500">Mohon tunggu sejenak.</p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-900">{employee ? 'Edit Data Talenta ASN' : 'Tambah Talenta ASN Baru'}</h2>
                            {!employee && (
                                <button type="button" onClick={handleGenerateData} disabled={isGenerating} className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg hover:bg-purple-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors" title="Isi formulir secara otomatis menggunakan AI berdasarkan Jabatan">
                                    <SparklesIcon className="h-5 w-5" />
                                    <span>Isi dengan AI</span>
                                </button>
                            )}
                        </div>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                           <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {generationError && (
                        <div className="p-4 mx-6 mt-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                            <p className="font-bold">Gagal Membuat Data</p>
                            <p>{generationError}</p>
                        </div>
                    )}

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[70vh] overflow-y-auto">
                        <div className="md:col-span-2"><h3 className="font-semibold text-gray-800 border-b pb-2">Data Diri Pegawai</h3></div>
                        <div className="md:col-span-2 flex items-center gap-5">
                            <img src={avatarPreview || `https://ui-avatars.com/api/?name=${formData.name.replace(/\s/g, '+') || 'A'}&background=c7d2fe&color=3730a3&font-size=0.5`} alt="Avatar Preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-200"/>
                            <div>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/png, image/jpeg" className="hidden" id="avatar-upload"/>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <CameraIcon className="h-5 w-5 text-gray-500" />
                                    <span>Ubah Foto</span>
                                </button>
                                <p className="text-xs text-gray-500 mt-2">PNG atau JPG direkomendasikan.</p>
                            </div>
                        </div>
                        <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label><input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} /></div>
                        <div><label htmlFor="nip" className="block text-sm font-medium text-gray-700">NIP</label><input type="text" name="nip" id="nip" value={formData.nip} onChange={handleChange} required className={inputStyle} /></div>
                        <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Opsional)</label><input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className={inputStyle} /></div>
                        <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telepon</label><input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputStyle} /></div>

                        <div className="md:col-span-2 mt-4"><h3 className="font-semibold text-gray-800 border-b pb-2">Data Pekerjaan & Talenta</h3></div>
                        <div><label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan</label><input type="text" name="jabatan" id="jabatan" value={formData.jabatan} onChange={handleChange} required className={inputStyle} /></div>
                        <div><label htmlFor="pangkatGolongan" className="block text-sm font-medium text-gray-700">Pangkat / Golongan</label><input type="text" name="pangkatGolongan" id="pangkatGolongan" value={formData.pangkatGolongan} onChange={handleChange} required placeholder="Contoh: Penata, III/c" className={inputStyle} /></div>
                        <div><label htmlFor="unitKerja" className="block text-sm font-medium text-gray-700">SKPD (Unit Kerja)</label><input type="text" name="unitKerja" id="unitKerja" value={formData.unitKerja} onChange={handleChange} required className={inputStyle} /></div>
                        <div><label htmlFor="eselon" className="block text-sm font-medium text-gray-700">Eselon</label><select name="eselon" id="eselon" value={formData.eselon} onChange={handleChange} required className={selectStyle}>{eselonOptions.map(option => (<option key={option} value={option}>{option}</option>))}</select></div>
                        <div className="md:col-span-2"><label htmlFor="skills" className="block text-sm font-medium text-gray-700">Kompetensi Teknis (pisahkan dengan koma)</label><input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} placeholder="Contoh: Analisis Kebijakan, Manajemen Aset, dll." className={inputStyle} /></div>
                        <div className="md:col-span-2"><label htmlFor="criticalPosition" className="block text-sm font-medium text-gray-700">Jabatan Lowong/Kritikal Target</label><textarea name="criticalPosition" id="criticalPosition" value={formData.criticalPosition} onChange={handleChange} rows={2} placeholder="Contoh: Kepala Dinas Pekerjaan Umum dan Penataan Ruang" className={`${inputStyle} resize-none`}></textarea></div>

                        {/* Data Pendidikan */}
                        <div className="md:col-span-2 mt-4 space-y-3">
                            <div className={historySectionHeaderStyle}>
                                <h3 className={historySectionTitleStyle}>Data Pendidikan</h3>
                                <button type="button" onClick={() => handleAddItem('educationHistory')} className={addButtonStyle}><AddIcon className="h-4 w-4" /><span>Tambah</span></button>
                            </div>
                            {formData.educationHistory?.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr,1.5fr,1.5fr,1fr,auto] gap-x-3 gap-y-2 items-end p-3 bg-gray-50/70 rounded-lg border">
                                    <div className="w-full"><label className="text-xs text-gray-600">Jenjang</label><input type="text" name="jenjang" placeholder="S1" value={item.jenjang} onChange={(e) => handleArrayItemChange('educationHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Jurusan</label><input type="text" name="jurusan" placeholder="Ilmu Komputer" value={item.jurusan} onChange={(e) => handleArrayItemChange('educationHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Institusi</label><input type="text" name="institusi" placeholder="Universitas Gadjah Mada" value={item.institusi} onChange={(e) => handleArrayItemChange('educationHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Thn Lulus</label><input type="text" name="tahunLulus" placeholder="2010" value={item.tahunLulus} onChange={(e) => handleArrayItemChange('educationHistory', item.id, e)} className={inputStyle} /></div>
                                    <button type="button" onClick={() => handleRemoveItem('educationHistory', item.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"><DeleteIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>

                         {/* Data Karir */}
                        <div className="md:col-span-2 mt-4 space-y-3">
                            <div className={historySectionHeaderStyle}><h3 className={historySectionTitleStyle}>Data Karir/Jabatan</h3><button type="button" onClick={() => handleAddItem('careerHistory')} className={addButtonStyle}><AddIcon className="h-4 w-4" /><span>Tambah</span></button></div>
                            {formData.careerHistory?.map(item => (
                                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1.5fr,1.5fr,1fr,auto] gap-x-3 gap-y-2 items-end p-3 bg-gray-50/70 rounded-lg border">
                                    <div className="w-full"><label className="text-xs text-gray-600">Jabatan</label><input type="text" name="jabatan" value={item.jabatan} onChange={(e) => handleArrayItemChange('careerHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Unit Kerja</label><input type="text" name="unitKerja" value={item.unitKerja} onChange={(e) => handleArrayItemChange('careerHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">TMT</label><input type="date" name="tmt" value={item.tmt} onChange={(e) => handleArrayItemChange('careerHistory', item.id, e)} className={inputStyle} /></div>
                                    <button type="button" onClick={() => handleRemoveItem('careerHistory', item.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"><DeleteIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>

                        {/* Data Kinerja */}
                        <div className="md:col-span-2 mt-4 space-y-3">
                            <div className={historySectionHeaderStyle}><h3 className={historySectionTitleStyle}>Data Kinerja</h3><button type="button" onClick={() => handleAddItem('performanceHistory')} className={addButtonStyle}><AddIcon className="h-4 w-4" /><span>Tambah</span></button></div>
                            {formData.performanceHistory?.map(item => (
                                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,1.5fr,auto] gap-x-3 gap-y-2 items-end p-3 bg-gray-50/70 rounded-lg border">
                                    <div className="w-full"><label className="text-xs text-gray-600">Tahun</label><input type="text" name="tahun" placeholder="2023" value={item.tahun} onChange={(e) => handleArrayItemChange('performanceHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Nilai SKP</label><input type="text" name="skp" placeholder="95.5" value={item.skp} onChange={(e) => handleArrayItemChange('performanceHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Predikat</label><input type="text" name="predikat" placeholder="Sangat Baik" value={item.predikat} onChange={(e) => handleArrayItemChange('performanceHistory', item.id, e)} className={inputStyle} /></div>
                                    <button type="button" onClick={() => handleRemoveItem('performanceHistory', item.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"><DeleteIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>

                        {/* Data Pengembangan */}
                        <div className="md:col-span-2 mt-4 space-y-3">
                            <div className={historySectionHeaderStyle}><h3 className={historySectionTitleStyle}>Data Pengembangan</h3><button type="button" onClick={() => handleAddItem('developmentHistory')} className={addButtonStyle}><AddIcon className="h-4 w-4" /><span>Tambah</span></button></div>
                            {formData.developmentHistory?.map(item => (
                                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1.5fr,1.5fr,1fr,1fr,auto] gap-x-3 gap-y-2 items-end p-3 bg-gray-50/70 rounded-lg border">
                                    <div className="w-full"><label className="text-xs text-gray-600">Nama Pelatihan</label><input type="text" name="namaPelatihan" value={item.namaPelatihan} onChange={(e) => handleArrayItemChange('developmentHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Penyelenggara</label><input type="text" name="penyelenggara" value={item.penyelenggara} onChange={(e) => handleArrayItemChange('developmentHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Tahun</label><input type="text" name="tahun" placeholder="2023" value={item.tahun} onChange={(e) => handleArrayItemChange('developmentHistory', item.id, e)} className={inputStyle} /></div>
                                    <div className="w-full"><label className="text-xs text-gray-600">Jenis</label><select name="jenis" value={item.jenis} onChange={(e) => handleArrayItemChange('developmentHistory', item.id, e)} className={selectStyle}><option value="Klasikal">Klasikal</option><option value="Non-Klasikal">Non-Klasikal</option></select></div>
                                    <button type="button" onClick={() => handleRemoveItem('developmentHistory', item.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"><DeleteIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="md:col-span-2 mt-4"><h3 className="font-semibold text-gray-800 border-b pb-2">Penilaian & Suksesi</h3></div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                            <div>
                                <label htmlFor="performance" className="block text-sm font-medium text-gray-700">Skor Kinerja (Saat Ini)</label>
                                <input type="number" name="performance" id="performance" value={formData.performance} onChange={handleChange} required min="1" max="100" className={inputStyle} placeholder="1-100" />
                                <p className="text-xs text-gray-500 mt-1">Kategori: <span className="font-semibold">{performanceMap[getPerformanceScale(formData.performance)]}</span></p>
                            </div>
                            <div>
                                <label htmlFor="potential" className="block text-sm font-medium text-gray-700">Skor Potensi</label>
                                <input type="number" name="potential" id="potential" value={formData.potential} onChange={handleChange} required min="1" max="100" className={inputStyle} placeholder="1-100" />
                                <p className="text-xs text-gray-500 mt-1">Kategori: <span className="font-semibold">{potentialMap[getPotentialScale(formData.potential)]}</span></p>
                            </div>
                            <div>
                                <label htmlFor="competency" className="block text-sm font-medium text-gray-700">Skor Kompetensi</label>
                                <input type="number" name="competency" id="competency" value={formData.competency || ''} onChange={handleChange} required min="1" max="100" className={inputStyle} placeholder="1-100" />
                                <p className="text-xs text-gray-500 mt-1">Teknis, manajerial, &amp; sosio-kultural.</p>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="successionStatus" className="block text-sm font-medium text-gray-700">Status Suksesi (Otomatis)</label>
                            <div id="successionStatus" className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm font-semibold text-gray-800">{formData.successionStatus}</div>
                            <p className="text-xs text-gray-500 mt-1">Status ini ditentukan secara otomatis berdasarkan skor Kinerja, Potensi, dan usia pensiun.</p>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Batal</button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeFormModal;
