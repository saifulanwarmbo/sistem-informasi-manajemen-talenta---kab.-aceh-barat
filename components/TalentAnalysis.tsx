
import React from 'react';
import { LoadingIcon } from './icons';

interface TalentAnalysisProps {
    analysis: string;
    isLoading: boolean;
    error: string | null;
}

const TalentAnalysis: React.FC<TalentAnalysisProps> = ({ analysis, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <LoadingIcon className="h-12 w-12 text-indigo-500 animate-spin" />
                <p className="mt-4 text-gray-600 font-semibold">AI sedang menganalisis data talenta Anda...</p>
                <p className="text-sm text-gray-400">Ini mungkin memerlukan beberapa saat.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-700 bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p>{error}</p>
            </div>
        );
    }
    
    if (!analysis) {
        return <div className="text-center p-8 text-gray-500">Analisis belum dibuat. Data talenta mungkin kosong atau analisis sedang diproses.</div>
    }

    return (
        <div 
            className="prose prose-sm sm:prose-base max-w-none text-gray-600 prose-headings:text-gray-900 prose-h3:text-lg prose-h3:font-bold prose-h3:border-b prose-h3:border-gray-200 prose-h3:pb-2 prose-h3:mb-3 prose-strong:text-gray-800 prose-ul:list-disc prose-ul:pl-5 prose-li:mb-1 marker:text-indigo-500"
            dangerouslySetInnerHTML={{ __html: analysis }} 
        />
    );
};

export default TalentAnalysis;
