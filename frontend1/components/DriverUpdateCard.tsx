import React from 'react';
import { DriverUpdate } from '../types';

interface DriverUpdateCardProps {
    data: DriverUpdate;
}

const AmbulanceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

export const DriverUpdateCard: React.FC<DriverUpdateCardProps> = ({ data }) => {
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 transform hover:scale-[1.02] transition-transform duration-300 ease-in-out">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-500 p-3 rounded-full">
                            <AmbulanceIcon />
                        </div>
                        <div>
                            <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">Driver Update</div>
                            <p className="block mt-1 text-lg leading-tight font-bold text-white">{data.driverName}</p>
                            <p className="text-slate-400">Ambulance: {data.ambulanceNumber}</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <div>
                        <p className="text-sm font-medium text-slate-400">Route</p>
                        <p className="font-semibold text-slate-200">{data.fromLocation} &rarr; {data.toLocation}</p>
                    </div>
                </div>
                <div className="mt-4 text-right text-xs text-slate-500">
                    Received: {new Date(data.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};