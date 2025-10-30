
import React from 'react';
import { CriticalJob, Employee } from '../types';
import { getEmployeeBoxInfo } from '../utils/talentUtils';
import { UserCircleIcon, BriefcaseIcon, StarIcon, EditIcon, DeleteIcon, AddIcon } from '../components/icons';

const CandidateCard = ({ employee }: { employee: Employee }) => {
    const { boxNumber, category } = getEmployeeBoxInfo(employee);
    const boxColorMap: { [key: number]: string } = {
        9: 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-200',
        8: 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200',
        7: 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200'
    };
    
    return (
        <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
            <img src={employee.avatar} alt={employee.name} className="w-12 h-12 rounded-full object-cover"/>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{employee.name}</p>
                <p className="text-sm text-gray-500 truncate">{employee.jabatan}</p>
            </div>
            <div title={category} className={`cursor-help text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${boxColorMap[boxNumber] || 'bg-gray-100 text-gray-700'}`}>
                Kotak {boxNumber}
            </div>
        </div>
    );
};

const CriticalJobCard = ({ job, candidates, onEdit, onDelete }: { job: CriticalJob; candidates: Employee[]; onEdit: (job: CriticalJob) => void; onDelete: (jobId: string) => void; }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                    <StarIcon className="h-7 w-7" />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    <p className="text-sm font-medium text-gray-600">{job.unitKerja}</p>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-1">
                    <button onClick={() => onEdit(job)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100/60 transition-colors duration-200" title="Edit Jabatan Kritikal">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(job.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100/60 transition-colors duration-200" title="Hapus Jabatan Kritikal">
                        <DeleteIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
             <div className="mt-3">
                <p className="text-sm text-gray-500">{job.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-gray-500">
                        <BriefcaseIcon className="h-4 w-4" />
                        Eselon: {job.requiredEselon}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-gray-500">
                       <UserCircleIcon className="h-4 w-4" />
                        Lowongan: {job.vacancies}
                    </span>
                </div>
            </div>
        </div>
        <div className="p-6 bg-gray-50/70 flex-1">
            <h4 className="font-semibold text-gray-700 mb-3">Kandidat Suksesor yang Direkomendasikan</h4>
            {candidates.length > 0 ? (
                <div className="space-y-3">
                    {candidates.map(candidate => <CandidateCard key={candidate.id} employee={candidate} />)}
                </div>
            ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                    <p className="text-sm font-semibold text-gray-600">Tidak Ada Kandidat yang Direkomendasikan</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Sistem akan merekomendasikan talenta dari Kotak 7, 8, atau 9 yang isian "Jabatan Lowong/Kritikal Target"-nya cocok dengan nama jabatan ini.</p>
                </div>
            )}
        </div>
    </div>
);


interface CriticalJobsPageProps {
    criticalJobs: CriticalJob[];
    employees: Employee[];
    findCandidates: (job: CriticalJob, employees: Employee[]) => Employee[];
    onAddJob: () => void;
    onEditJob: (job: CriticalJob) => void;
    onDeleteJob: (jobId: string) => void;
}

const CriticalJobsPage: React.FC<CriticalJobsPageProps> = ({ criticalJobs, employees, findCandidates, onAddJob, onEditJob, onDeleteJob }) => {
    return (
        <div>
            <div className="flex justify-end mb-6">
                <button
                    onClick={onAddJob}
                    className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <AddIcon className="h-5 w-5 mr-2" />
                    <span>Tambah Jabatan Baru</span>
                </button>
            </div>
            {criticalJobs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {criticalJobs.map(job => {
                        const candidates = findCandidates(job, employees);
                        return <CriticalJobCard key={job.id} job={job} candidates={candidates} onEdit={onEditJob} onDelete={onDeleteJob} />;
                    })}
                </div>
            ) : (
                 <div className="text-center p-20 bg-white rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-700">Belum Ada Jabatan Kritikal</h3>
                    <p className="mt-2 text-gray-500">Silakan tambahkan jabatan kritikal untuk memulai perencanaan suksesi.</p>
                </div>
            )}
        </div>
    );
};

export default CriticalJobsPage;