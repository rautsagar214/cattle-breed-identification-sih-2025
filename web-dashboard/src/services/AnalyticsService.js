import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/analytics`;

export const getStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
};

export const getDistributions = async () => {
    try {
        const response = await axios.get(`${API_URL}/distributions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching distributions:', error);
        throw error;
    }
};

export const getGrowthTrends = async () => {
    try {
        const response = await axios.get(`${API_URL}/growth`);
        return response.data;
    } catch (error) {
        console.error('Error fetching growth trends:', error);
        throw error;
    }
};

export const getImbalanceAlerts = async () => {
    try {
        const response = await axios.get(`${API_URL}/alerts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching imbalance alerts:', error);
        throw error;
    }
};
