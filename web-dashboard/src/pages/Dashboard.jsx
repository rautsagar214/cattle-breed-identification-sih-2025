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
    Activity,
    Edit2,
    Trash2,
    Filter,
    X
} from 'lucide-react';
import { State, City } from 'country-state-city';
import a6logo from '../assets/a6_logo.svg';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('flw-list');
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [flws, setFlws] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        email: '',
        state: '',
        stateCode: '',
        city: '',
        address: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ state: '', city: '', status: 'active' });
    const [showFilters, setShowFilters] = useState(false);

    // Edit State
    const [editingFlw, setEditingFlw] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
        const { name, value } = e.target;

        if (name === 'phone') {
            // Only allow numbers and max 10 digits
            if (/^\d*$/.test(value) && value.length <= 10) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (formData.phone.length !== 10) {
            setMessage({ type: 'error', text: 'Phone number must be exactly 10 digits' });
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMessage({ type: 'error', text: 'Please enter a valid email address' });
            return;
        }

        setSubmitLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post(`${API_URL}/api/workers/register`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: `FLW Registered! Temp Password: ${response.data.data.tempPassword}` });
                setFormData({ name: '', phone: '', email: '', state: '', stateCode: '', city: '', address: '' });
                fetchFlws(); // Refresh list
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Registration failed' });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(`${API_URL}/api/workers/update/${editingFlw.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'FLW Updated Successfully!' });
                setShowEditModal(false);
                setEditingFlw(null);
                setFormData({ name: '', phone: '', email: '', state: '', stateCode: '', city: '', address: '' });
                fetchFlws();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this worker?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            // We use update to set status to inactive (soft delete)
            // First find the worker to keep other details same, or just send status update if backend supports partial
            // Our backend expects full object currently, let's find the worker first from local state
            const worker = flws.find(w => w.id === id);
            if (!worker) return;

            const updatedWorker = { ...worker, status: 'inactive' };

            await axios.put(`${API_URL}/api/workers/update/${id}`, updatedWorker, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchFlws();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to deactivate worker');
        }
    };

    const openEditModal = (flw) => {
        setEditingFlw(flw);
        // Find state code from name if needed, or store code in DB. 
        // Assuming DB stores name for now based on previous code, but let's try to match
        const stateObj = State.getStatesOfCountry('IN').find(s => s.name === flw.state);

        setFormData({
            name: flw.name,
            phone: flw.phone,
            email: flw.email,
            state: flw.state || '',
            stateCode: stateObj ? stateObj.isoCode : '',
            city: flw.city || '',
            address: flw.address || '',
            status: flw.status || 'active'
        });
        setShowEditModal(true);
    };

    // Filter Logic
    const filteredFlws = flws.filter(flw => {
        const matchesSearch =
            flw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            flw.phone.includes(searchQuery) ||
            flw.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesState = filters.state ? flw.state === filters.state : true;
        const matchesCity = filters.city ? flw.city === filters.city : true;
        const matchesStatus = filters.status ? (flw.status || 'active') === filters.status : true;

        return matchesSearch && matchesState && matchesCity && matchesStatus;
    });

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

                <nav className="flex-1 py-6 px-3 space-y-2">
                    <button
                        onClick={() => {
                            setActiveTab('flw-list');
                            setFormData({ name: '', phone: '', email: '', state: '', stateCode: '', city: '', address: '' });
                            setMessage(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'flw-list' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Users size={20} />
                        {sidebarOpen && <span>FLW Directory</span>}
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('register');
                            setFormData({ name: '', phone: '', email: '', state: '', stateCode: '', city: '', address: '' });
                            setMessage(null);
                        }}
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
                    {activeTab === 'flw-list' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl text-primary">Field Level Workers</h2>
                                <div className='flex gap-2'>
                                    <button onClick={() => {
                                        setActiveTab('register');
                                        setFormData({ name: '', phone: '', email: '', state: '', stateCode: '', city: '', address: '' });
                                        setMessage(null);
                                    }} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-colors shadow-md">
                                        <UserPlus size={18} /> Add New
                                    </button>
                                    <button onClick={fetchFlws} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-colors shadow-md">
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Filters Section */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Filter size={18} />
                                    <span className="text-sm font-medium">Filters:</span>
                                </div>

                                <select
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                                    value={filters.state}
                                    onChange={(e) => setFilters({ ...filters, state: e.target.value, city: '' })}
                                >
                                    <option value="">All States</option>
                                    {State.getStatesOfCountry('IN').map((state) => (
                                        <option key={state.isoCode} value={state.name}>{state.name}</option>
                                    ))}
                                </select>

                                <select
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    disabled={!filters.state}
                                >
                                    <option value="">All Cities</option>
                                    {filters.state && (() => {
                                        const stateCode = State.getStatesOfCountry('IN').find(s => s.name === filters.state)?.isoCode;
                                        return stateCode ? City.getCitiesOfState('IN', stateCode).map(city => (
                                            <option key={city.name} value={city.name}>{city.name}</option>
                                        )) : [];
                                    })()}
                                </select>

                                <select
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                {(filters.state || filters.city || filters.status) && (
                                    <button
                                        onClick={() => setFilters({ state: '', city: '', status: '' })}
                                        className="text-red-500 text-xs hover:underline ml-auto"
                                    >
                                        Clear Filters
                                    </button>
                                )}
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
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loading ? (
                                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading workers...</td></tr>
                                            ) : filteredFlws.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No workers found matching your criteria.</td></tr>
                                            ) : (
                                                filteredFlws.map((flw) => (
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
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {flw.city}, {flw.state}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${(flw.status || 'active') === 'active'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                <Activity size={10} /> {flw.status || 'active'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => openEditModal(flw)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(flw.id)}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Deactivate"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
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
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 border-r border-gray-300 pr-2">
                                                <span className="text-lg">🇮🇳</span>
                                                <span className="text-gray-500 text-sm font-medium">+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full pl-24 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                                placeholder="9876543210"
                                                required
                                            />
                                        </div>
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
                                        <select
                                            name="state"
                                            value={formData.stateCode}
                                            onChange={(e) => {
                                                const selectedStateCode = e.target.value;
                                                const selectedState = State.getStatesOfCountry('IN').find(s => s.isoCode === selectedStateCode);
                                                setFormData({
                                                    ...formData,
                                                    state: selectedState ? selectedState.name : '',
                                                    stateCode: selectedStateCode,
                                                    city: ''
                                                });
                                            }}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none bg-white"
                                        >
                                            <option value="">Select State</option>
                                            {State.getStatesOfCountry('IN').map((state) => (
                                                <option key={state.isoCode} value={state.isoCode}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none bg-white"
                                            disabled={!formData.stateCode}
                                        >
                                            <option value="">Select City</option>
                                            {formData.stateCode && City.getCitiesOfState('IN', formData.stateCode).map((city) => (
                                                <option key={city.name} value={city.name}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
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
                                            onClick={() => {
                                                setFormData({ name: '', phone: '', email: '', state: '', stateCode: '', city: '', address: '' });
                                                setMessage(null);
                                            }}
                                            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                            Reset Form
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
                        </div >
                    )}

                    {/* Edit Modal */}
                    {showEditModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-800">Edit Worker Details</h3>
                                    <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Reuse form fields logic but mapped to formData */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-secondary" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-secondary" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-secondary" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <select name="state" value={formData.stateCode} onChange={(e) => {
                                                const selectedStateCode = e.target.value;
                                                const selectedState = State.getStatesOfCountry('IN').find(s => s.isoCode === selectedStateCode);
                                                setFormData({ ...formData, state: selectedState ? selectedState.name : '', stateCode: selectedStateCode, city: '' });
                                            }} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-secondary">
                                                <option value="">Select State</option>
                                                {State.getStatesOfCountry('IN').map((state) => <option key={state.isoCode} value={state.isoCode}>{state.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <select name="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-secondary" disabled={!formData.stateCode}>
                                                <option value="">Select City</option>
                                                {formData.stateCode && City.getCitiesOfState('IN', formData.stateCode).map((city) => <option key={city.name} value={city.name}>{city.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select name="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-secondary">
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-secondary"></textarea>
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-4 mt-4">
                                            <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200">Cancel</button>
                                            <button type="submit" disabled={submitLoading} className="px-6 py-2 rounded-lg bg-secondary text-white hover:bg-cyan-700">{submitLoading ? 'Saving...' : 'Save Changes'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </main >
            </div >
        </div >
    );
};

export default Dashboard;
