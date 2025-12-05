import React, { useState, useEffect } from 'react';
import { getStats, getDistributions, getGrowthTrends, getImbalanceAlerts } from '../services/AnalyticsService';
import StatsCard from '../components/analytics/StatsCard';
import DistributionChart from '../components/analytics/DistributionChart';
import GrowthTrendChart from '../components/analytics/GrowthTrendChart';
import ImbalanceAlerts from '../components/analytics/ImbalanceAlerts';
import { CheckCircle, Users, Scan, Activity } from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState({ totalApproved: 0, totalRegistrations: 0, totalScans: 0 });
    const [distributions, setDistributions] = useState({ breedDistribution: [], angleDistribution: [] });
    const [growthData, setGrowthData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, distData, growthData, alertsData] = await Promise.all([
                    getStats(),
                    getDistributions(),
                    getGrowthTrends(),
                    getImbalanceAlerts()
                ]);

                setStats(statsData.data);
                setDistributions(distData.data);
                setGrowthData(growthData.data);
                setAlerts(alertsData.data);
            } catch (err) {
                setError('Failed to load analytics data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Breed-wise Analytics</h1>
                <p className="text-gray-500 mt-1">Overview of cattle breed data, distributions, and trends.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Total Approved Samples"
                    value={stats.totalApproved}
                    icon={CheckCircle}
                    color="green"
                />
                <StatsCard
                    title="Total Registrations"
                    value={stats.totalRegistrations}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Total Scans"
                    value={stats.totalScans}
                    icon={Scan}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Content - Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <GrowthTrendChart data={growthData} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DistributionChart
                            title="Breed Distribution"
                            data={distributions.breedDistribution}
                            type="pie"
                        />
                        <DistributionChart
                            title="Angle Distribution"
                            data={distributions.angleDistribution}
                            type="bar"
                        />
                    </div>
                </div>

                {/* Sidebar - Alerts & Additional Info */}
                <div className="space-y-6">
                    <ImbalanceAlerts alerts={alerts} />

                    {/* Placeholder for future insights or summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                            <Activity className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">Quick Insights</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Most registered breed: <span className="font-medium ml-1 text-gray-900">
                                    {distributions.breedDistribution.length > 0
                                        ? distributions.breedDistribution.sort((a, b) => b.value - a.value)[0].name
                                        : 'N/A'}
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Most common angle: <span className="font-medium ml-1 text-gray-900">
                                    {distributions.angleDistribution.length > 0
                                        ? distributions.angleDistribution.sort((a, b) => b.value - a.value)[0].name
                                        : 'N/A'}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
