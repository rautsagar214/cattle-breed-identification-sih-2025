import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Filter,
    Search,
    Eye,
    X
} from 'lucide-react';
import { State, City } from 'country-state-city';

const RegistrationsList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [regLoading, setRegLoading] = useState(false);
    const [regFilters, setRegFilters] = useState({
        search: '',
        state: '',
        city: '',
        species: '',
        breed: '',
        premisesType: '',
        startDate: '',
        endDate: ''
    });
    const [regPagination, setRegPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showRegDetailModal, setShowRegDetailModal] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchRegistrations();
    }, [regPagination.page, regPagination.limit]);

    const fetchRegistrations = async () => {
        setRegLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const queryParams = new URLSearchParams({
                page: regPagination.page,
                limit: regPagination.limit,
                ...regFilters
            }).toString();

            const response = await axios.get(`${API_URL}/api/registration/list?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRegistrations(response.data.data);
                setRegPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl text-primary">Cattle Registrations</h2>
                <button onClick={fetchRegistrations} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-colors shadow-md">
                    Refresh
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Filter size={18} />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Tag ID, Owner, Breed..."
                            className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary w-64"
                            value={regFilters.search}
                            onChange={(e) => setRegFilters({ ...regFilters, search: e.target.value })}
                        />
                    </div>

                    {/* State */}
                    <select
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                        value={regFilters.state}
                        onChange={(e) => setRegFilters({ ...regFilters, state: e.target.value, city: '' })}
                    >
                        <option value="">All States</option>
                        {State.getStatesOfCountry('IN').map((state) => (
                            <option key={state.isoCode} value={state.name}>{state.name}</option>
                        ))}
                    </select>

                    {/* City */}
                    <select
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                        value={regFilters.city}
                        onChange={(e) => setRegFilters({ ...regFilters, city: e.target.value })}
                        disabled={!regFilters.state}
                    >
                        <option value="">All Cities</option>
                        {regFilters.state && (() => {
                            const stateCode = State.getStatesOfCountry('IN').find(s => s.name === regFilters.state)?.isoCode;
                            return stateCode ? City.getCitiesOfState('IN', stateCode).map(city => (
                                <option key={city.name} value={city.name}>{city.name}</option>
                            )) : [];
                        })()}
                    </select>

                    {/* Species */}
                    <select
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                        value={regFilters.species}
                        onChange={(e) => setRegFilters({ ...regFilters, species: e.target.value })}
                    >
                        <option value="">All Species</option>
                        <option value="cattle">Cattle</option>
                        <option value="buffalo">Buffalo</option>
                    </select>

                    {/* Premises Type */}
                    <select
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                        value={regFilters.premisesType}
                        onChange={(e) => setRegFilters({ ...regFilters, premisesType: e.target.value })}
                    >
                        <option value="">All Premises</option>
                        <option value="Farm">Farm</option>
                        <option value="Goushala">Goushala</option>
                        <option value="Household">Household</option>
                        <option value="Other">Other</option>
                    </select>

                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">From:</span>
                        <input
                            type="date"
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                            value={regFilters.startDate}
                            onChange={(e) => setRegFilters({ ...regFilters, startDate: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">To:</span>
                        <input
                            type="date"
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-secondary"
                            value={regFilters.endDate}
                            onChange={(e) => setRegFilters({ ...regFilters, endDate: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={() => {
                            setRegFilters({
                                search: '',
                                state: '',
                                city: '',
                                species: '',
                                breed: '',
                                premisesType: '',
                                startDate: '',
                                endDate: ''
                            });
                            setRegPagination({ ...regPagination, page: 1 });
                            fetchRegistrations();
                        }}
                        className="text-red-500 text-xs hover:underline ml-auto"
                    >
                        Clear Filters
                    </button>

                    <button
                        onClick={() => {
                            setRegPagination({ ...regPagination, page: 1 });
                            fetchRegistrations();
                        }}
                        className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-300 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tag ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Owner Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Breed</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Species</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Premises Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {regLoading ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading registrations...</td></tr>
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No registrations found.</td></tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {
                                        setSelectedRegistration(reg);
                                        setShowRegDetailModal(true);
                                    }}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{reg.pashu_aadhar_tag_id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{reg.owner_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{reg.breed}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">{reg.species}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{reg.premises_location || reg.location_name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Rows per page:</span>
                        <select
                            value={regPagination.limit}
                            onChange={(e) => setRegPagination({ ...regPagination, limit: Number(e.target.value), page: 1 })}
                            className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-secondary"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span className="ml-4">
                            Showing {((regPagination.page - 1) * regPagination.limit) + 1}-{Math.min(regPagination.page * regPagination.limit, regPagination.total)} of {regPagination.total} records
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setRegPagination({ ...regPagination, page: Math.max(1, regPagination.page - 1) })}
                            disabled={regPagination.page === 1}
                            className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-sm text-gray-600">Page {regPagination.page} of {regPagination.totalPages || 1}</span>
                        <button
                            onClick={() => setRegPagination({ ...regPagination, page: Math.min(regPagination.totalPages, regPagination.page + 1) })}
                            disabled={regPagination.page >= regPagination.totalPages}
                            className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Registration Detail Modal */}
            {showRegDetailModal && selectedRegistration && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-800">Registration Details</h3>
                            <button onClick={() => setShowRegDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Images */}
                            {selectedRegistration.image_urls && selectedRegistration.image_urls.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cattle Images</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {selectedRegistration.image_urls.map((url, idx) => (
                                            <img key={idx} src={url} alt={`Cattle ${idx + 1}`} className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {/* Animal Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <span className="text-lg">🐄</span>
                                        <h4 className="font-bold text-gray-800">Animal Details</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tag ID</span>
                                            <span className="font-medium text-gray-900">{selectedRegistration.pashu_aadhar_tag_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Species</span>
                                            <span className="font-medium text-gray-900 capitalize">{selectedRegistration.species}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Sex</span>
                                            <span className="font-medium text-gray-900 capitalize">{selectedRegistration.sex}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Age</span>
                                            <span className="font-medium text-gray-900">{selectedRegistration.age_years} Years {selectedRegistration.age_months} Months</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phenotypic Characteristics</span>
                                            <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedRegistration.phenotypic_characteristics || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Identification Marks</span>
                                            <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedRegistration.identification_marks || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Breed Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <span className="text-lg">🧬</span>
                                        <h4 className="font-bold text-gray-800">Breed Information</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        {selectedRegistration.is_breed_overridden ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">AI Predicted Breed</span>
                                                    <span className="font-medium text-gray-900">
                                                        {selectedRegistration.predictions && selectedRegistration.predictions.length > 0
                                                            ? selectedRegistration.predictions[0].breed
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">AI Confidence</span>
                                                    <span className="font-medium text-gray-900">
                                                        {selectedRegistration.predictions && selectedRegistration.predictions.length > 0
                                                            ? `${(selectedRegistration.predictions[0].confidence * 100).toFixed(2)}%`
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                                    <span className="text-yellow-700 font-medium">Final Breed (Overridden)</span>
                                                    <span className="font-bold text-yellow-800">{selectedRegistration.breed}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-gray-500 text-xs">Override Reason</span>
                                                    <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs italic">
                                                        "{selectedRegistration.override_reason || 'No reason provided'}"
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Identified Breed</span>
                                                    <span className="font-bold text-green-700">{selectedRegistration.breed}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Confidence Score</span>
                                                    <span className="font-medium text-gray-900">
                                                        {selectedRegistration.predictions && selectedRegistration.predictions.length > 0
                                                            ? `${(selectedRegistration.predictions[0].confidence * 100).toFixed(2)}%`
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Owner Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <span className="text-lg">👤</span>
                                        <h4 className="font-bold text-gray-800">Owner Details</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name</span>
                                            <span className="font-medium text-gray-900">{selectedRegistration.owner_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Contact</span>
                                            <span className="font-medium text-gray-900">{selectedRegistration.owner_contact}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Premises Type</span>
                                            <span className="font-medium text-gray-900">{selectedRegistration.premises_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-xs">Address</span>
                                            <p className="font-medium text-gray-900">{selectedRegistration.owner_address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Health & Production */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <span className="text-lg">🩺</span>
                                        <h4 className="font-bold text-gray-800">Health & Production</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Milk Yield</span>
                                            <span className="font-medium text-gray-900">{selectedRegistration.milk_yield_info || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Vaccination Records</span>
                                            <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedRegistration.health_vaccination_records || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Breeding History</span>
                                            <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedRegistration.reproductive_breeding_history || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Birth/Death Info</span>
                                            <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedRegistration.birth_death_registration_info || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Metadata */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Registration Metadata</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="block text-gray-500 text-xs mb-1">Registered By</span>
                                        <span className="font-medium text-gray-900">{selectedRegistration.registered_by_name || 'Unknown User'}</span>
                                        <span className="block text-xs text-gray-400 mt-0.5">ID: {selectedRegistration.user_id}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs mb-1">Registration Date</span>
                                        <span className="font-medium text-gray-900">{new Date(selectedRegistration.created_at).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs mb-1">Location</span>
                                        <span className="font-medium text-gray-900">{selectedRegistration.location_name || 'N/A'}</span>
                                        {selectedRegistration.latitude && selectedRegistration.longitude && (
                                            <span className="block text-xs text-gray-400 mt-0.5">
                                                {selectedRegistration.latitude.toFixed(4)}, {selectedRegistration.longitude.toFixed(4)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrationsList;
