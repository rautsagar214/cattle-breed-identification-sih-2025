import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Download, RefreshCw, CheckCircle, AlertCircle, HardDrive } from 'lucide-react';

const DatasetAssembly = () => {
    const [breeds, setBreeds] = useState([]);
    const [selectedBreed, setSelectedBreed] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [versions, setVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(true);
    const [error, setError] = useState(null);

    // Hardcoded breeds for now, or could fetch from distinct approved samples
    const AVAILABLE_BREEDS = [
        'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Kankrej',
        'Hariana', 'Rathi', 'Ongole', 'Deoni', 'Krishna Valley'
    ];

    useEffect(() => {
        fetchDatasetVersions();
    }, []);

    const fetchDatasetVersions = async () => {
        try {
            setLoadingVersions(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dataset/dataset-versions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setVersions(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching dataset versions:', err);
        } finally {
            setLoadingVersions(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedBreed) return;

        if (!window.confirm(`Are you sure you want to push dataset for ${selectedBreed}? This will collect all approved images and create a new version.`)) {
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/dataset/generate-dataset`,
                { breed: selectedBreed },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert(`Dataset for ${selectedBreed} generated successfully!`);
                fetchDatasetVersions();
                setSelectedBreed('');
            }
        } catch (err) {
            console.error('Error generating dataset:', err);
            setError(err.response?.data?.message || 'Failed to generate dataset');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="px-6 pt-0">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Dataset Assembly</h2>
                <p className="text-gray-500 mt-1">Generate and download breed-specific datasets for training</p>
            </div>

            {/* Generator Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="text-indigo-600" size={20} />
                    Push New Dataset
                </h3>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Breed</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50"
                            value={selectedBreed}
                            onChange={(e) => setSelectedBreed(e.target.value)}
                            disabled={isGenerating}
                        >
                            <option value="">-- Choose Breed --</option>
                            {AVAILABLE_BREEDS.map(breed => (
                                <option key={breed} value={breed}>{breed}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!selectedBreed || isGenerating}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all ${!selectedBreed || isGenerating
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="animate-spin" size={18} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <HardDrive size={18} />
                                Push Dataset
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>

            {/* History Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dataset History</h3>

                {loadingVersions ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : versions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <Database className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-gray-500">No datasets generated yet.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Breed</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Version</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {versions.map((version) => (
                                        <tr key={version.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{version.breed}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">
                                                    v{version.version}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(version.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`${import.meta.env.VITE_API_URL}${version.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                                                >
                                                    <Download size={16} />
                                                    Download ZIP
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatasetAssembly;
