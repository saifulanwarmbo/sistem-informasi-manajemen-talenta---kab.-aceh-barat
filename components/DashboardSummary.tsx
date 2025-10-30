import React, { useMemo } from 'react';
import { Employee, CriticalJob } from '../types';
import { getEmployeeBoxInfo } from '../utils/talentUtils';
import { UsersIcon, StarIcon, BriefcaseIcon, UserCircleIcon } from './icons';

interface StatCardProps {
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    label: string;
    value: string | number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg flex items-center gap-5 border-l-4" style={{ borderColor: color }}>
        <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            {React.cloneElement(icon, { className: 'h-6 w-6', style: { color } })}
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
    </div>
);

interface ChartCardProps {
    title: string;
    data: { label: string; value: number; color: string; }[];
    total: number;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, total }) => {
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {sortedData.map(({ label, value, color }) => (
                    <div key={label} className="w-full">
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold text-gray-600">{label}</span>
                            <span className="font-bold text-gray-800">{value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="h-2.5 rounded-full"
                                style={{ width: `${total > 0 ? (value / total) * 100 : 0}%`, backgroundColor: color, transition: 'width 0.5s ease-in-out' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TopTalentsCard: React.FC<{ talents: Employee[] }> = ({ talents }) => {
    const boxColorMap: { [key: number]: string } = {
        9: 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-200',
        8: 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200',
        7: 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200'
    };

    return (
     <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Talenta Unggulan (Kotak 7, 8, 9)</h3>
        {talents.length > 0 ? (
            <div className="space-y-3">
                {talents.map(talent => {
                    const { boxNumber } = getEmployeeBoxInfo(talent);
                    return (
                        <div key={talent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors duration-150">
                            <img src={talent.avatar} alt={talent.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-800 truncate">{talent.name}</p>
                                <p className="text-xs text-gray-500 truncate">{talent.jabatan}</p>
                            </div>
                            <div title={`Pegawai di Kotak ${boxNumber}`} className={`cursor-help text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${boxColorMap[boxNumber] || 'bg-gray-100 text-gray-700'}`}>
                                K-{boxNumber}
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
            <p className="text-center text-gray-500 py-4">Belum ada talenta unggulan di Kotak 7, 8, atau 9.</p>
        )}
    </div>
)};


const DashboardSummary: React.FC<{ employees: Employee[], criticalJobs: CriticalJob[] }> = ({ employees, criticalJobs }) => {
    const summary = useMemo(() => {
        const totalEmployees = employees.length;
        const totalCriticalJobs = criticalJobs.length;
        const totalVacancies = criticalJobs.reduce((sum, job) => sum + job.vacancies, 0);

        const boxCounts = employees.reduce((acc, emp) => {
            const { boxNumber } = getEmployeeBoxInfo(emp);
            acc[boxNumber] = (acc[boxNumber] || 0) + 1;
            return acc;
        }, {} as { [key: number]: number });
        
        const successionStatusCounts = employees.reduce((acc, emp) => {
            const status = emp.successionStatus;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        
        const readyNowCount = successionStatusCounts['Siap Sekarang'] || 0;

        const topTalents = employees
            .filter(emp => [7, 8, 9].includes(getEmployeeBoxInfo(emp).boxNumber))
            .sort((a, b) => {
                const boxA = getEmployeeBoxInfo(a).boxNumber;
                const boxB = getEmployeeBoxInfo(b).boxNumber;

                if (boxA !== boxB) {
                    return boxB - boxA; // Urutkan berdasarkan nomor kotak (9, 8, 7)
                }
                return b.performance - a.performance; // Jika kotak sama, urutkan berdasarkan kinerja
            })
            .slice(0, 5);

        return { totalEmployees, totalCriticalJobs, totalVacancies, readyNowCount, boxCounts, successionStatusCounts, topTalents };
    }, [employees, criticalJobs]);

    const boxChartData = {
        title: "Distribusi pada 9-Box Matrix",
        total: summary.totalEmployees,
        data: [
            { label: "Kotak 9 (Bintang)", value: summary.boxCounts[9] || 0, color: '#4f46e5' },
            { label: "Kotak 8 (Performer Tinggi)", value: summary.boxCounts[8] || 0, color: '#0ea5e9' },
            { label: "Kotak 7 (Potensi Tinggi)", value: summary.boxCounts[7] || 0, color: '#6366f1' },
            { label: "Kotak 5 (Pekerja Inti)", value: summary.boxCounts[5] || 0, color: '#38bdf8' },
            { label: "Lainnya", value: (summary.boxCounts[1] || 0) + (summary.boxCounts[2] || 0) + (summary.boxCounts[3] || 0) + (summary.boxCounts[4] || 0) + (summary.boxCounts[6] || 0), color: '#6b7280' },
        ],
    };

    const successionChartData = {
        title: "Status Kesiapan Suksesi",
        total: summary.totalEmployees,
        data: [
            { label: "Siap Sekarang", value: summary.successionStatusCounts['Siap Sekarang'] || 0, color: '#10b981' },
            { label: "1-2 Tahun", value: summary.successionStatusCounts['1-2 Tahun'] || 0, color: '#3b82f6' },
            { label: "Potensi Masa Depan", value: summary.successionStatusCounts['Potensi Masa Depan'] || 0, color: '#f59e0b' },
            { label: "Bukan Kandidat", value: summary.successionStatusCounts['Bukan Kandidat'] || 0, color: '#9ca3af' },
        ]
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UsersIcon />} label="Total Talenta ASN" value={summary.totalEmployees} color="#3b82f6" />
                <StatCard icon={<BriefcaseIcon />} label="Jabatan Kritikal" value={summary.totalCriticalJobs} color="#a855f7" />
                <StatCard icon={<UserCircleIcon />} label="Total Lowongan" value={summary.totalVacancies} color="#f59e0b" />
                <StatCard icon={<StarIcon />} label="Kandidat Siap Sekarang" value={summary.readyNowCount} color="#10b981" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-3 space-y-6">
                    <ChartCard {...boxChartData} />
                    <ChartCard {...successionChartData} />
                 </div>
                 <div className="lg:col-span-2">
                    <TopTalentsCard talents={summary.topTalents} />
                 </div>
            </div>
        </div>
    );
}

export default DashboardSummary;