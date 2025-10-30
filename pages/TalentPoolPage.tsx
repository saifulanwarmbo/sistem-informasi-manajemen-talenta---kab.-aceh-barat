import React from 'react';
import { Employee } from '../types';
import NineBoxGrid from '../components/NineBoxGrid';
import TalentAnalysis from '../components/TalentAnalysis';

interface TalentPoolPageProps {
    employees: Employee[];
    analysis: string;
    isLoading: boolean;
    error: string | null;
}

const TalentPoolPage: React.FC<TalentPoolPageProps> = ({ employees, analysis, isLoading, error }) => {
    return (
        <div className="space-y-8">
            <section className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Peta Talent Pool (9-Box Matrix)</h2>
                <NineBoxGrid employees={employees} />
            </section>
            
            <section className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Analisis Talent Pool & Rekomendasi untuk Komite Suksesi (AI)</h2>
                <TalentAnalysis analysis={analysis} isLoading={isLoading} error={error} />
            </section>
        </div>
    );
};

export default TalentPoolPage;