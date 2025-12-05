import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, User, AlertCircle, CheckCircle, Clock, ArrowLeft, ShieldCheck, ShieldAlert, Loader } from 'lucide-react';
import ImageEvaluationModal from './ImageEvaluationModal';

const PendingEvaluations = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRun, setSelectedRun] = useState(null);
    const [runDetails, setRunDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvaluationImage, setCurrentEvaluationImage] = useState(null);

    useEffect(() => {
        if (!selectedRun) {
            fetchPendingEvaluations();
        }
    }, [selectedRun]);

    const fetchPendingEvaluations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/pending-evaluations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setEvaluations(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching pending evaluations:', err);
            setError('Failed to load pending evaluations');
        } finally {
            setLoading(false);
        }
    };

    const fetchRunDetails = async (runId) => {
        try {
            setDetailsLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/run/${runId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRunDetails(response.data.data);
                setSelectedRun(runId);
            }
        } catch (err) {
            console.error('Error fetching run details:', err);
            alert('Failed to load run details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedRun(null);
        setRunDetails(null);
    };

    const handleStartEvaluation = (image) => {
        setCurrentEvaluationImage(image);
        setIsModalOpen(true);
    };

    const handleEvaluationComplete = async (result) => {
        console.log('Evaluation Result:', result);

        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Or import from env

            let endpoint = '';
            if (result.reject_reason) {
                endpoint = '/api/admin/reject-image';
            } else {
                endpoint = '/api/admin/approve-image';
            }

            const response = await axios.post(`${API_URL}${endpoint}`, result, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Update local state to reflect "Evaluated" status visually
                if (runDetails && currentEvaluationImage) {
                    const updatedImages = runDetails.images.map(img =>
                        img.url === currentEvaluationImage.url
                            ? { ...img, status: result.reject_reason ? 'Rejected' : 'Approved' }
                            : img
                    );
                    setRunDetails({ ...runDetails, images: updatedImages });
                }
                // Optional: Show success toast
            }
        } catch (err) {
            console.error('Error submitting evaluation:', err);
            alert('Failed to submit evaluation. Please try again.');
        }

        setIsModalOpen(false);
        setCurrentEvaluationImage(null);
    };

    if (loading && !selectedRun) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error && !selectedRun) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500 gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    // Detailed Review View
    if (selectedRun && runDetails) {
        const predictions = runDetails.predictions ? (typeof runDetails.predictions === 'string' ? JSON.parse(runDetails.predictions) : runDetails.predictions) : [];
        const topPrediction = predictions.length > 0 ? predictions[0] : null;
        const date = new Date(runDetails.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <div className="px-6 py-0 mx-auto">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Pending Evaluations</span>
                </button>

                {/* Run Details Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Run Details</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <User size={16} />
                                    <span>{runDetails.user_name || 'Unknown User'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} />
                                    <span>{date}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} />
                                    <span>{runDetails.location_name || 'Unknown Location'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100">
                            <span className="block text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">Identified Breed</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-indigo-900">{topPrediction?.breed || 'Unknown'}</span>
                                <span className="text-sm font-medium text-indigo-600">
                                    {((topPrediction?.confidence || 0) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Predictions List */}
                    <div className="w-full">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">All Predictions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            {predictions.map((pred, idx) => {
                                let colorClass = 'bg-gray-50 border-gray-200 text-gray-700';
                                let rankLabel = `#${idx + 1}`;

                                if (idx === 0) {
                                    colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                                } else if (idx === 1) {
                                    colorClass = 'bg-blue-50 border-blue-200 text-blue-800';
                                } else if (idx === 2) {
                                    colorClass = 'bg-amber-50 border-amber-200 text-amber-800';
                                }

                                return (
                                    <div key={idx} className={`relative border rounded-xl p-4 shadow-sm flex items-center justify-between ${colorClass}`}>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold opacity-70 uppercase tracking-wider mb-0.5">Rank {rankLabel}</span>
                                            <span className="font-bold text-lg">{pred.breed}</span>
                                        </div>
                                        <span className="font-bold text-xl">
                                            {(pred.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Images Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Image Evaluations</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {runDetails.images.map((image, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                {/* Image Area */}
                                <div className="bg-gray-100 relative aspect-video">
                                    <img
                                        src={image.url}
                                        alt={`Cattle ${image.angle}`}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>

                                {/* Evaluation Area */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-4 flex-1">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-gray-900 text-lg">{image.angle}</h4>

                                            {image.status === 'Approved' && (
                                                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                    <ShieldCheck size={18} />
                                                    <span className="font-semibold text-sm">Approved</span>
                                                </div>
                                            )}

                                            {image.status === 'Rejected' && (
                                                <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                                    <ShieldAlert size={18} />
                                                    <span className="font-semibold text-sm">Rejected</span>
                                                </div>
                                            )}

                                            {image.status === 'Pending' && (
                                                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                                    <Clock size={18} />
                                                    <span className="font-semibold text-sm">Pending</span>
                                                </div>
                                            )}

                                            {image.status === 'Evaluated' && (
                                                <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                    <CheckCircle size={18} />
                                                    <span className="font-semibold text-sm">Done</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {image.status === 'Pending' && (
                                        <button
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                                            onClick={() => handleStartEvaluation(image)}
                                        >
                                            Start Evaluation
                                        </button>
                                    )}

                                    {image.status !== 'Pending' && (
                                        <p className="text-gray-400 text-xs text-center italic">
                                            Evaluated
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <ImageEvaluationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    image={currentEvaluationImage}
                    runDetails={runDetails}
                    onComplete={handleEvaluationComplete}
                />
            </div>
        );
    }

    // List View
    return (
        <div className="px-6 pt-0">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Pending Evaluations</h2>
                <p className="text-gray-500 mt-1">Review and validate cattle breed predictions</p>
            </div>

            {evaluations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500">No pending evaluations at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {evaluations.map((run) => {
                        const predictions = run.predictions ? (typeof run.predictions === 'string' ? JSON.parse(run.predictions) : run.predictions) : [];
                        const topPrediction = predictions.length > 0 ? predictions[0] : null;
                        const date = new Date(run.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <div key={run.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                                {/* Header / Status */}
                                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-medium">
                                        <Clock size={14} />
                                        <span>Pending Review</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {run.total_pending_evals} / {run.total_images} Images
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1">
                                    {/* Breed Info */}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {topPrediction ? topPrediction.breed : 'Unknown Breed'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${(topPrediction?.confidence || 0) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">
                                                {((topPrediction?.confidence || 0) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 text-sm">
                                            <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="block text-gray-500 text-xs">Submitted by</span>
                                                <span className="font-medium text-gray-900">{run.user_name || 'Unknown User'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="block text-gray-500 text-xs">Location</span>
                                                <span className="font-medium text-gray-900 line-clamp-1">
                                                    {run.location_name || 'Unknown Location'}
                                                </span>
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

                                {/* Footer / Action */}
                                <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                                    <button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                                        onClick={() => fetchRunDetails(run.id)}
                                        disabled={detailsLoading && selectedRun === run.id}
                                    >
                                        {detailsLoading && selectedRun === run.id ? (
                                            <Loader className="animate-spin" size={18} />
                                        ) : (
                                            'Review Run'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PendingEvaluations;
