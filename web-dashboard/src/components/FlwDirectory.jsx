import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Edit2,
    Trash2,
    Filter,
    X,
    UserPlus,
    Activity
} from 'lucide-react';
import { State, City } from 'country-state-city';

const FlwDirectory = ({ setActiveTab }) => {
    const [flws, setFlws] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ state: '', city: '', status: 'active' });

    // Edit State
    const [editingFlw, setEditingFlw] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        state: '',
        stateCode: '',
        city: '',
        address: '',
        status: 'active'
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchFlws();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            if (/^\d*$/.test(value) && value.length <= 10) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
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

    const filteredFlws = flws.filter(flw => {
        const matchesSearch =
            flw.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            flw.phone?.includes(searchQuery) ||
            flw.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesState = filters.state ? flw.state === filters.state : true;
        const matchesCity = filters.city ? flw.city === filters.city : true;
        const matchesStatus = filters.status ? (flw.status || 'active') === filters.status : true;

        return matchesSearch && matchesState && matchesCity && matchesStatus;
    });

    return (
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

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <input
                    type="text"
                    placeholder="Search..."
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

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
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading workers...</td></tr>
                            ) : filteredFlws.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No workers found matching your criteria.</td></tr>
                            ) : (
                                filteredFlws.map((flw) => (
                                    <tr key={flw.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                    {flw.name?.charAt(0)}
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
                            {message && (
                                <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}
                            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
    );
};

export default FlwDirectory;
