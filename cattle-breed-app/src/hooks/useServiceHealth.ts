import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export type HealthStatus = 'checking' | 'active' | 'waking_up' | 'offline';

export const useServiceHealth = () => {
    const [status, setStatus] = useState<HealthStatus>('checking');
    const [responseTime, setResponseTime] = useState<number | null>(null);

    const checkHealth = useCallback(async () => {
        setStatus('checking');
        const startTime = Date.now();

        // Set a timeout to switch to "waking_up" state if it takes too long
        const wakingUpTimer = setTimeout(() => {
            setStatus((prev) => (prev === 'checking' ? 'waking_up' : prev));
        }, 2000); // If no response in 2s, assume it's waking up

        try {
            console.log('💓 Checking service health...');
            await axios.get(`${API_URL}/health`, { timeout: 60000 }); // Long timeout for cold starts

            const endTime = Date.now();
            setResponseTime(endTime - startTime);
            setStatus('active');
            console.log('✅ Service is active');
        } catch (error) {
            console.error('❌ Service health check failed:', error);
            setStatus('offline');
        } finally {
            clearTimeout(wakingUpTimer);
        }
    }, []);

    useEffect(() => {
        checkHealth();
    }, [checkHealth]);

    return { status, checkHealth, responseTime };
};
