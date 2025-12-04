import React, { useState } from 'react';
import axios from 'axios';
import { State, City } from 'country-state-city';

const RegisterFlw = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        state: '',
        stateCode: '',
        city: '',
        address: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Registration failed' });
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
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
    );
};

export default RegisterFlw;
