import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600"
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {/* Trend indicator (optional) */}
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />}
                    {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />}
                    {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-500 mr-1" />}
                    <span className={
                        trend === 'up' ? 'text-green-600 font-medium' :
                            trend === 'down' ? 'text-red-600 font-medium' :
                                'text-gray-600 font-medium'
                    }>
                        {trendValue}
                    </span>
                    <span className="text-gray-400 ml-1">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
