
import React from 'react';
import { CloseIcon, LoadingIcon, SparklesIcon } from './icons';

interface JobDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    isLoading: boolean;
    error: string | null;
}

const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({ isOpen, onClose, title, description, isLoading, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                           <SparklesIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 ml-4">{title}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <LoadingIcon className="h-10 w-10 text-indigo-500 animate-spin" />
                            <p className="mt-4 text-gray-500">AI sedang membuat deskripsi...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-700 bg-red-50 p-4 rounded-lg">
                            <p className="font-semibold">Terjadi Kesalahan</p>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 prose-headings:text-gray-900 prose-strong:text-gray-800" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />').replace(/###\s*(.*)/g, '<h3 class="font-semibold text-lg mt-4 mb-2">$1</h3>').replace(/\*\*\s*(.*?)\*\*/g, '<strong>$1</strong>').replace(/-\s(.*)/g, '<li class="ml-4">$1</li>') }} />
                    )}
                </div>
                <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDescriptionModal;