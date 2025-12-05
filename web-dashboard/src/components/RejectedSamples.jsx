import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, ShieldAlert, Search, AlertTriangle } from 'lucide-react';

const RejectedSamples = () => {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRejectedSamples();
    }, []);

    const fetchRejectedSamples = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/rejected-samples`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSamples(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching rejected samples:', err);
            setError('Failed to load rejected samples');
        } finally {
            setLoading(false);
        }
    };

    const filteredSamples = samples.filter(sample =>
        sample.reject_reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.evaluator_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="px-6 pt-0">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Rejected Samples</h2>
                    <p className="text-gray-500 mt-1">Images flagged as unsuitable for training</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search reason or evaluator..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredSamples.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <ShieldAlert className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Rejected Samples</h3>
                    <p className="text-gray-500">Rejected evaluations will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSamples.map((sample) => {
                        const date = new Date(sample.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        });

                        return (
                            <div key={sample.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                                <div className="bg-gray-100 relative aspect-video">
                                    <img
                                        src={sample.image_url}
                                        alt="Rejected Sample"
                                        className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale"
                                    />
                                    <div className="absolute inset-0 bg-red-900/10"></div>
                                    <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                        <ShieldAlert size={12} />
                                        Rejected
                                    </div>
                                </div>

                                <div className="p-5 flex-1">
                                    <div className="flex items-start gap-2 mb-4">
                                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase tracking-wider font-bold">Reason</span>
                                            <p className="text-gray-900 font-medium">{sample.reject_reason}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-gray-50">
                                        <div className="flex items-start gap-3 text-sm">
                                            <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="block text-gray-500 text-xs">Evaluator</span>
                                                <span className="font-medium text-gray-900">{sample.evaluator_name || 'Admin'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="block text-gray-500 text-xs">Date</span>
                                                <span className="font-medium text-gray-900">{date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RejectedSamples;
