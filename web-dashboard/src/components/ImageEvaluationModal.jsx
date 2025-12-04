import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, AlertTriangle, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ImageEvaluationModal = ({ isOpen, onClose, image, runDetails, onComplete }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({
        angle: '',
        isCattle: null,
        isIdentifiable: null,
        isMultiple: null,
        quality: {
            lighting: null,
            sharpness: null,
            centered: null
        },
        finalBreed: ''
    });
    const [rejectReason, setRejectReason] = useState('');

    // Zoom & Pan State
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);

    useEffect(() => {
        if (isOpen && image) {
            setAnswers(prev => ({ ...prev, angle: image.angle }));
            setStep(1);
            setRejectReason('');
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen, image]);

    if (!isOpen || !image) return null;

    // Pan Handlers
    const handleMouseDown = (e) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoom > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleReject = (reason) => {
        setRejectReason(reason);
        setStep('reject');
    };

    const getEvaluatorId = () => {
        try {
            const userStr = localStorage.getItem('adminUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.id;
            }
        } catch (e) {
            console.error('Error parsing admin user:', e);
        }
        return null;
    };

    const handleComplete = () => {
        const approvalObject = {
            run_id: runDetails.id,
            original_image_url: image.url,
            final_image_url: image.url, // Assuming no edit for now
            final_angle: answers.angle,
            evaluator_final_breed: answers.finalBreed || (runDetails.predictions && runDetails.predictions[0]?.breed),
            average_top3_predictions: runDetails.predictions, // Passing existing predictions
            location_latitude: runDetails.latitude,
            location_longitude: runDetails.longitude,
            quality_notes: JSON.stringify(answers.quality),
            evaluator_id: getEvaluatorId(),
            evaluation_timestamp: new Date().toISOString()
        };

        console.log('APPROVAL OBJECT:', approvalObject);
        onComplete(approvalObject);
    };

    const handleConfirmReject = () => {
        const rejectionObject = {
            run_id: runDetails.id,
            image_url: image.url,
            reject_reason: rejectReason,
            evaluator_id: getEvaluatorId(),
            timestamp: new Date().toISOString()
        };

        console.log('REJECTION OBJECT:', rejectionObject);
        onComplete(rejectionObject);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: // Angle Selection
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Step 1: Verify Angle</h3>
                        <p className="text-gray-500 text-sm">Confirm or correct the image angle.</p>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            value={answers.angle}
                            onChange={(e) => setAnswers({ ...answers, angle: e.target.value })}
                        >
                            <option value="Side Profile">Side Profile</option>
                            <option value="Front Profile">Front Profile</option>
                            <option value="45 Degree View">45 Degree View</option>
                            <option value="Top View">Top View</option>
                            <option value="Back View">Back View</option>
                        </select>
                        <button onClick={handleNext} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Next
                        </button>
                    </div>
                );

            case 2: // Species Check
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Step 2: Species Check</h3>
                        <p className="text-gray-500 text-sm">Is this a cattle or buffalo?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleNext}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                            >
                                <Check className="mx-auto mb-2 text-gray-400 group-hover:text-green-600" />
                                <span className="block font-bold text-gray-700 group-hover:text-green-700">Yes</span>
                            </button>
                            <button
                                onClick={() => handleReject('Not a cattle/buffalo')}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
                            >
                                <X className="mx-auto mb-2 text-gray-400 group-hover:text-red-600" />
                                <span className="block font-bold text-gray-700 group-hover:text-red-700">No</span>
                            </button>
                        </div>
                    </div>
                );

            case 3: // Identifiability Check
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Step 3: Identifiability Check</h3>
                        <p className="text-gray-500 text-sm">Is the animal clearly identifiable?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleNext}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                            >
                                <Check className="mx-auto mb-2 text-gray-400 group-hover:text-green-600" />
                                <span className="block font-bold text-gray-700 group-hover:text-green-700">Yes</span>
                            </button>
                            <button
                                onClick={() => handleReject('Animal not clearly identifiable')}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
                            >
                                <X className="mx-auto mb-2 text-gray-400 group-hover:text-red-600" />
                                <span className="block font-bold text-gray-700 group-hover:text-red-700">No</span>
                            </button>
                        </div>
                    </div>
                );

            case 4: // Multiple Animals Check
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Step 4: Multiple Animals</h3>
                        <p className="text-gray-500 text-sm">Are there multiple animals visible?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleReject('Multiple animals visible')}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
                            >
                                <AlertTriangle className="mx-auto mb-2 text-gray-400 group-hover:text-red-600" />
                                <span className="block font-bold text-gray-700 group-hover:text-red-700">Yes</span>
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                            >
                                <Check className="mx-auto mb-2 text-gray-400 group-hover:text-green-600" />
                                <span className="block font-bold text-gray-700 group-hover:text-green-700">No</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 italic">
                            * If yes, please reject. Editing feature coming soon.
                        </p>
                    </div>
                );

            case 5: // Quality Checks
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Step 5: Quality Checks</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Lighting OK?</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAnswers({ ...answers, quality: { ...answers.quality, lighting: true } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${answers.quality.lighting === true ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border'}`}
                                    >Yes</button>
                                    <button
                                        onClick={() => setAnswers({ ...answers, quality: { ...answers.quality, lighting: false } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${answers.quality.lighting === false ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500 border'}`}
                                    >No</button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Sharpness OK?</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAnswers({ ...answers, quality: { ...answers.quality, sharpness: true } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${answers.quality.sharpness === true ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border'}`}
                                    >Yes</button>
                                    <button
                                        onClick={() => setAnswers({ ...answers, quality: { ...answers.quality, sharpness: false } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${answers.quality.sharpness === false ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500 border'}`}
                                    >No</button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Centered properly?</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAnswers({ ...answers, quality: { ...answers.quality, centered: true } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${answers.quality.centered === true ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border'}`}
                                    >Yes</button>
                                    <button
                                        onClick={() => setAnswers({ ...answers, quality: { ...answers.quality, centered: false } })}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${answers.quality.centered === false ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500 border'}`}
                                    >No</button>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNext} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Next
                        </button>
                    </div>
                );

            case 6: // Breed Validation
                const predictions = runDetails.predictions ? (typeof runDetails.predictions === 'string' ? JSON.parse(runDetails.predictions) : runDetails.predictions) : [];
                const topBreed = predictions[0]?.breed || 'Unknown';
                const confidence = predictions[0]?.confidence || 0;

                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Step 6: Breed Validation</h3>

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Identified Breed</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-bold text-indigo-900">{topBreed}</span>
                                <span className="text-sm font-medium text-indigo-600">{(confidence * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Final Breed Decision</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                value={answers.finalBreed || topBreed}
                                onChange={(e) => setAnswers({ ...answers, finalBreed: e.target.value })}
                            >
                                <option value={topBreed}>{topBreed} (Suggested)</option>
                                {/* Add other breeds from predictions or a full list if needed */}
                                {predictions.slice(1).map((pred, idx) => (
                                    <option key={idx} value={pred.breed}>{pred.breed} ({(pred.confidence * 100).toFixed(1)}%)</option>
                                ))}
                                <option value="Other">Other (Specify manually)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            Approve & Finish
                        </button>
                    </div>
                );

            case 'reject':
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Reject Image?</h3>
                            <p className="text-gray-500 mt-2">Reason: <span className="font-medium text-gray-900">{rejectReason}</span></p>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-24 resize-none"
                                placeholder="Add any specific details about the rejection..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button
                                onClick={() => setStep(1)} // Or go back to previous step? For now reset.
                                className="px-4 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">

                {/* Left: Image Preview */}
                <div
                    className="w-full md:w-2/3 bg-gray-900 relative flex items-center justify-center overflow-hidden group cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        className="relative transition-transform duration-75 ease-linear will-change-transform"
                        style={{
                            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`
                        }}
                    >
                        <img
                            ref={imageRef}
                            src={image.url}
                            alt="Evaluation Subject"
                            className="max-w-full max-h-[85vh] object-contain pointer-events-none"
                        />
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="hover:text-indigo-400"><ZoomOut size={20} /></button>
                        <span className="text-sm font-medium min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, z + 0.5))} className="hover:text-indigo-400"><ZoomIn size={20} /></button>
                        <div className="w-px h-4 bg-white/20 mx-1"></div>
                        <button onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }} className="hover:text-indigo-400"><RotateCcw size={18} /></button>
                    </div>

                    <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium z-10">
                        {image.angle}
                    </div>
                </div>

                {/* Right: Evaluation Form */}
                <div className="w-full md:w-1/3 flex flex-col bg-white border-l border-gray-100">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Evaluation</h2>
                            <p className="text-sm text-gray-500">Step {typeof step === 'number' ? step : 'Final'} of 6</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {renderStepContent()}
                    </div>

                    {/* Progress Bar */}
                    {typeof step === 'number' && (
                        <div className="h-1.5 bg-gray-100 w-full">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${(step / 6) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEvaluationModal;
