
import React from 'react';
import { AddIcon, SearchIcon, SelectorIcon, DocumentAddIcon, DocumentDownloadIcon } from './icons';

interface HeaderProps {
    title: string;
    subtitle: string;
    showControls: boolean;
    onAddEmployee: () => void;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    sortKey: string;
    onSortKeyChange: (key: string) => void;
    onImportData: () => void;
    onDownloadTemplate: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, showControls, onAddEmployee, onSearchChange, sortKey, onSortKeyChange, onImportData, onDownloadTemplate }) => {
    return (
        <header>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    <p className="mt-1 text-gray-500">{subtitle}</p>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap justify-end gap-y-2">
                     {showControls && (
                        <>
                            <div className="relative w-full sm:w-auto md:w-52">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari talenta..."
                                    onChange={onSearchChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm"
                                />
                            </div>
                             <div className="relative w-full sm:w-auto">
                                <select
                                    value={sortKey}
                                    onChange={(e) => onSortKeyChange(e.target.value)}
                                    className="appearance-none w-full bg-white text-gray-700 font-semibold px-4 py-2 pr-8 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                                    aria-label="Urutkan data talenta"
                                >
                                    <option value="default">Urutan Standar</option>
                                    <option value="eselon-desc">Eselon (Tertinggi)</option>
                                    <option value="eselon-asc">Eselon (Terendah)</option>
                                    <option value="name-asc">Nama (A-Z)</option>
                                    <option value="name-desc">Nama (Z-A)</option>
                                    <option value="performance-desc">Kinerja (Tertinggi)</option>
                                    <option value="performance-asc">Kinerja (Terendah)</option>
                                    <option value="potential-desc">Potensi (Tertinggi)</option>
                                    <option value="potential-asc">Potensi (Terendah)</option>
                                    <option value="competency-desc">Kompetensi (Tertinggi)</option>
                                    <option value="competency-asc">Kompetensi (Terendah)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <SelectorIcon className="h-4 w-4" />
                                </div>
                            </div>
                            <button
                                onClick={onDownloadTemplate}
                                className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow"
                                title="Unduh template Excel untuk impor data"
                            >
                                <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                                <span>Unduh Template</span>
                            </button>
                             <button
                                onClick={onImportData}
                                className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow"
                                title="Impor data talenta dari file Excel (.xlsx)"
                            >
                                <DocumentAddIcon className="h-5 w-5 mr-2" />
                                <span>Impor Excel</span>
                            </button>
                            <button
                                onClick={onAddEmployee}
                                className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <AddIcon className="h-5 w-5 mr-2" />
                                <span>Tambah</span>
                            </button>
                        </>
                     )}
                </div>
            </div>
        </header>
    );
};

export default Header;
