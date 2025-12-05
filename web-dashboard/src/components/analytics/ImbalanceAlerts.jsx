import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ImbalanceAlerts = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Data Imbalance Alerts</h3>
            </div>
            <div className="space-y-3">
                {alerts.map((alert, index) => (
                    <div key={index} className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start">
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-800">{alert.breed}</h4>
                            <p className="text-sm text-amber-700 mt-1">{alert.message}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {alert.count} samples
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImbalanceAlerts;
