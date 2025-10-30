import React from 'react';
import { Employee } from '../types';
import { getPerformanceScale, getPotentialScale } from '../utils/talentUtils';


interface NineBoxGridProps {
    employees: Employee[];
}

const potentialAxis = [
    { p: 1, label: 'Rendah', color: 'bg-red-50 text-red-800' },
    { p: 2, label: 'Menengah', color: 'bg-sky-50 text-sky-800' },
    { p: 3, label: 'Tinggi', color: 'bg-indigo-50 text-indigo-800' },
];

const performanceAxis = [
    { p: 3, label: 'Di Atas Ekspektasi', color: 'text-green-700' },
    { p: 2, label: 'Sesuai Ekspektasi', color: 'text-sky-700' },
    { p: 1, label: 'Di Bawah Ekspektasi', color: 'text-red-700' },
];

const boxInfoMap: { [key: string]: { label: string; title: string; color: string; bgColor: string } } = {
    '33': { label: 'Kotak 9', title: 'Bintang Masa Depan', color: 'bg-indigo-600 text-white', bgColor: 'bg-indigo-50' },
    '23': { label: 'Kotak 7', title: 'Potensi Tinggi', color: 'bg-indigo-400 text-white', bgColor: 'bg-indigo-50' },
    '13': { label: 'Kotak 4', title: 'Berlian Kasar', color: 'bg-yellow-400 text-yellow-900', bgColor: 'bg-yellow-50' },
    '32': { label: 'Kotak 8', title: 'Performer Tinggi', color: 'bg-sky-600 text-white', bgColor: 'bg-sky-50' },
    '22': { label: 'Kotak 5', title: 'Pekerja Inti', color: 'bg-sky-400 text-white', bgColor: 'bg-sky-50' },
    '12': { label: 'Kotak 2', title: 'Dilema', color: 'bg-yellow-500 text-white', bgColor: 'bg-yellow-50' },
    '31': { label: 'Kotak 6', title: 'Teka-teki', color: 'bg-amber-500 text-white', bgColor: 'bg-amber-50' },
    '21': { label: 'Kotak 3', title: 'Performer Rata-rata', color: 'bg-red-400 text-white', bgColor: 'bg-red-50' },
    '11': { label: 'Kotak 1', title: 'Risiko Tinggi', color: 'bg-red-600 text-white', bgColor: 'bg-red-50' },
};


const NineBoxGrid: React.FC<NineBoxGridProps> = ({ employees }) => {
    const grid: { [key: string]: Employee[] } = {};

    for (let p = 1; p <= 3; p++) {
        for (let k = 1; k <= 3; k++) {
            grid[`${p}${k}`] = [];
        }
    }

    employees.forEach(emp => {
        const performanceScale = getPerformanceScale(emp.performance);
        const potentialScale = getPotentialScale(emp.potential);
        const key = `${potentialScale}${performanceScale}`;
        if (grid[key]) {
            grid[key].push(emp);
        }
    });

    return (
        <div className="grid grid-cols-[auto,1fr,1fr,1fr] grid-rows-[auto,1fr,1fr,1fr,auto] gap-2 items-stretch">
            {/* Y-Axis Label */}
            <div className="col-start-1 row-start-2 row-span-3 flex items-center justify-center transform -rotate-90">
                <div className="font-bold text-gray-500 uppercase tracking-wider text-sm whitespace-nowrap">Kinerja</div>
            </div>

            {/* Grid Cells */}
            {performanceAxis.map((perf, perfIndex) => (
                <React.Fragment key={`row-${perf.p}`}>
                    <div className={`row-start-${perfIndex + 2} col-start-1 font-bold ${perf.color} flex items-center justify-end pr-3 text-right text-sm`}>
                        <span>{perf.label}</span>
                    </div>
                    {potentialAxis.map((pot, potIndex) => {
                        const key = `${pot.p}${perf.p}`;
                        const boxInfo = boxInfoMap[key];
                        const cellEmployees = grid[key] || [];

                        return (
                            <div key={key} className={`col-start-${potIndex + 2} row-start-${perfIndex + 2} rounded-lg border border-gray-200 p-3 min-h-[140px] ${boxInfo.bgColor}`}>
                                <h3 title={boxInfo.title} className={`cursor-help px-2.5 py-1 inline-block text-xs font-bold rounded-full mb-3 ${boxInfo.color}`}>{boxInfo.label}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {cellEmployees.length > 0 ? cellEmployees.map(emp => (
                                        <div key={emp.id} className="group relative flex flex-col items-center text-center w-14" title={`${emp.name} \n(${emp.jabatan})`}>
                                            <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-110" />
                                            <span className="text-xs text-gray-600 truncate w-full mt-1">{emp.name.split(' ')[0]}</span>
                                        </div>
                                    )) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-xs text-gray-400">Kosong</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}

            {/* X-axis labels */}
            <div className="col-start-2 row-start-1 col-span-3 grid grid-cols-3 gap-2 mb-1">
                {potentialAxis.map(pot => (
                    <div key={`label-${pot.p}`} className={`text-center font-bold text-sm p-2 rounded-md ${pot.color}`}>
                        {pot.label}
                    </div>
                ))}
            </div>
             <div className="col-start-2 row-start-5 col-span-3 flex items-center justify-center font-bold text-gray-500 uppercase tracking-wider text-sm mt-2">
                Potensi
            </div>
        </div>
    );
};

export default NineBoxGrid;