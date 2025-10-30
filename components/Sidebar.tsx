
import React from 'react';
import { UsersIcon, ViewGridIcon, DownloadIcon, LogoutIcon, BriefcaseIcon, HomeIcon, ClipboardListIcon, BrandIcon } from './icons';

interface SidebarProps {
    viewMode: 'summary' | 'list' | 'talentPool' | 'criticalJobs' | 'selfServiceForm';
    setViewMode: (view: 'summary' | 'list' | 'talentPool' | 'criticalJobs' | 'selfServiceForm') => void;
    onExportData: () => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ viewMode, setViewMode, onExportData, onLogout }) => {
    
    const navLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-200";
    const activeLinkClasses = "bg-slate-900 text-white font-semibold";
    
    return (
        <div className="w-64 bg-slate-800 text-white flex-shrink-0 flex flex-col p-4 shadow-2xl">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="bg-slate-900 p-2 rounded-lg">
                    <BrandIcon className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">SIM Talenta</h1>
                    <p className="text-xs text-gray-400">Kab. Aceh Barat</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                <h2 className="px-4 pt-4 pb-2 text-xs font-bold uppercase text-gray-500 tracking-wider">Manajemen Talenta</h2>
                <ul>
                    <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('summary'); }}
                           className={`${navLinkClasses} ${viewMode === 'summary' ? activeLinkClasses : ''}`}
                           aria-current={viewMode === 'summary' ? 'page' : undefined}>
                            <HomeIcon className="h-5 w-5 mr-3" />
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('list'); }}
                           className={`${navLinkClasses} ${viewMode === 'list' ? activeLinkClasses : ''}`}
                           aria-current={viewMode === 'list' ? 'page' : undefined}>
                            <UsersIcon className="h-5 w-5 mr-3" />
                            Daftar Talenta
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('talentPool'); }}
                           className={`${navLinkClasses} ${viewMode === 'talentPool' ? activeLinkClasses : ''}`}
                           aria-current={viewMode === 'talentPool' ? 'page' : undefined}>
                           <ViewGridIcon className="h-5 w-5 mr-3" />
                            Peta Talent Pool
                        </a>
                    </li>
                     <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('criticalJobs'); }}
                           className={`${navLinkClasses} ${viewMode === 'criticalJobs' ? activeLinkClasses : ''}`}
                           aria-current={viewMode === 'criticalJobs' ? 'page' : undefined}>
                           <BriefcaseIcon className="h-5 w-5 mr-3" />
                            Jabatan Kritikal
                        </a>
                    </li>
                     <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('selfServiceForm'); }}
                           className={`${navLinkClasses} ${viewMode === 'selfServiceForm' ? activeLinkClasses : ''}`}
                           aria-current={viewMode === 'selfServiceForm' ? 'page' : undefined}>
                           <ClipboardListIcon className="h-5 w-5 mr-3" />
                            Isi Data Mandiri
                        </a>
                    </li>
                </ul>

                <h2 className="px-4 pt-6 pb-2 text-xs font-bold uppercase text-gray-500 tracking-wider">Laporan</h2>
                <ul>
                    <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); onExportData(); }}
                           className={navLinkClasses}>
                            <DownloadIcon className="h-5 w-5 mr-3" />
                            Ekspor PDF
                        </a>
                    </li>
                </ul>
            </nav>

            <div className="mt-auto space-y-2">
                <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onLogout(); }}
                    className="flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-200"
                    title="Logout dari aplikasi"
                >
                    <LogoutIcon className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </a>
                <div className="px-4 py-3 bg-slate-900/50 rounded-lg text-center">
                    <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} BKPSDM Aceh Barat</p>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;