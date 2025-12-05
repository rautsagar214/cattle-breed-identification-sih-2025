import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserPlus,
    LogOut,
    Menu,
    Search,
    FileText,
    ClipboardCheck,
    ShieldCheck,
    ShieldAlert,
    Database
} from 'lucide-react';
import a6logo from '../assets/a6_logo.svg';
import FlwDirectory from '../components/FlwDirectory';
import RegisterFlw from '../components/RegisterFlw';
import RegistrationsList from '../components/RegistrationsList';
import PendingEvaluations from '../components/PendingEvaluations';
import ApprovedSamples from '../components/ApprovedSamples';
import RejectedSamples from '../components/RejectedSamples';
import DatasetAssembly from '../components/DatasetAssembly';
import Analytics from './Analytics';
import { BarChart2 } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('flw-list');
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-background font-sans">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${sidebarOpen ? 'md:w-64' : 'md:w-20'} fixed md:static inset-y-0 left-0 bg-primary text-white transition-all duration-300 flex flex-col shadow-2xl z-20 h-full`}>
                <div className="p-4 flex items-center justify-center border-b border-gray-700 h-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary">
                            <img src={a6logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        {sidebarOpen && <span className="font-heading font-bold text-xl tracking-wide">A6 Admin</span>}
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => setActiveTab('flw-list')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'flw-list' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Users size={20} />
                        {sidebarOpen && <span>FLW Directory</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('register')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'register' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <UserPlus size={20} />
                        {sidebarOpen && <span>Register FLW</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('registrations')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'registrations' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <FileText size={20} />
                        {sidebarOpen && <span>Registrations</span>}
                    </button>

                    <div className="pt-4 pb-2">
                        {sidebarOpen && <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Evaluation</p>}
                        {!sidebarOpen && <div className="h-px bg-gray-700 mx-4 my-2"></div>}
                    </div>

                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <BarChart2 size={20} />
                        {sidebarOpen && <span>Analytics</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('pending-evaluations')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pending-evaluations' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <ClipboardCheck size={20} />
                        {sidebarOpen && <span>Pending Reviews</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('approved-samples')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'approved-samples' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <ShieldCheck size={20} />
                        {sidebarOpen && <span>Approved Samples</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('rejected-samples')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'rejected-samples' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <ShieldAlert size={20} />
                        {sidebarOpen && <span>Rejected Samples</span>}
                    </button>

                    <div className="pt-4 pb-2">
                        {sidebarOpen && <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ML Ops</p>}
                        {!sidebarOpen && <div className="h-px bg-gray-700 mx-4 my-2"></div>}
                    </div>

                    <button
                        onClick={() => setActiveTab('dataset-assembly')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dataset-assembly' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Database size={20} />
                        {sidebarOpen && <span>Dataset Assembly</span>}
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside >

            {/* Mobile Sidebar Overlay */}
            {
                isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-10"
                        onClick={() => setSidebarOpen(false)}
                    />
                )
            }

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-surface border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-primary transition-colors">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 text-gray-500">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent outline-none text-sm w-48"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-background">
                    {activeTab === 'flw-list' && <FlwDirectory setActiveTab={setActiveTab} />}
                    {activeTab === 'register' && <RegisterFlw onSuccess={() => setActiveTab('flw-list')} />}
                    {activeTab === 'registrations' && <RegistrationsList />}
                    {activeTab === 'pending-evaluations' && <PendingEvaluations />}
                    {activeTab === 'approved-samples' && <ApprovedSamples />}
                    {activeTab === 'rejected-samples' && <RejectedSamples />}
                    {activeTab === 'analytics' && <Analytics />}
                    {activeTab === 'dataset-assembly' && <DatasetAssembly />}
                </main >
            </div >
        </div >
    );
};

export default Dashboard;
