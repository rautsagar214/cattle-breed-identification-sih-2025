import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users,
    UserPlus,
    LogOut,
    Menu,
    Search,
    MapPin,
    Phone,
    Mail,
    ChevronRight,
    Activity
} from 'lucide-react';
import a6logo from '../assets/a6logo.jpg';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('flw-list');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [flws, setFlws] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        state: '',
        city: '',
        address: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/');
        } else {
            fetchFlws();
        }
    }, [navigate]);

    const fetchFlws = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/api/workers/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setFlws(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching FLWs:', error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post(`${API_URL}/api/workers/register`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: `FLW Registered! Temp Password: ${response.data.data.tempPassword}` });
                setFormData({ name: '', phone: '', email: '', state: '', city: '', address: '' });
                fetchFlws(); // Refresh list
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Registration failed' });
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background font-sans">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-primary text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
                <div className="p-4 flex items-center justify-center border-b border-gray-700 h-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary">
                            <img src={a6logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        {sidebarOpen && <span className="font-heading font-bold text-xl tracking-wide">A6 Admin</span>}
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
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
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-surface border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-primary transition-colors">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 text-gray-500">
                            <Search size={18} />
                            <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-48" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-background">
                    {activeTab === 'flw-list' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl text-primary">Field Level Workers</h2>
                                <div className='flex gap-2'>
                                    <button onClick={() => setActiveTab('register')} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-colors shadow-md">
                                        <UserPlus size={18} /> Add New
                                    </button>
                                    <button onClick={fetchFlws} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-colors shadow-md">
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone number</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loading ? (
                                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading workers...</td></tr>
                                            ) : flws.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No workers found.</td></tr>
                                            ) : (
                                                flws.map((flw) => (
                                                    <tr key={flw.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                                    {flw.name.charAt(0)}
                                                                </div>
                                                                <span className="font-medium text-gray-900">{flw.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {flw.phone}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {flw.email}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {flw.address}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                                                <Activity size={10} /> Active
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'register' && (
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl text-primary mb-6">Register New FLW</h2>

                            <div className="bg-surface rounded-2xl shadow-lg border border-gray-100 p-8">
                                {message && (
                                    <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                        ></textarea>
                                    </div>

                                    <div className="col-span-2 flex justify-end gap-4 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('flw-list')}
                                            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitLoading}
                                            className="px-6 py-2 rounded-lg bg-secondary text-white shadow-md hover:bg-cyan-700 transition-colors disabled:opacity-70"
                                        >
                                            {submitLoading ? 'Registering...' : 'Register Worker'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
