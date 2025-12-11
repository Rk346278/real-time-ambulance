import React from 'react';
import { NurseUpdate, ConditionSeverity } from '../types';

interface NurseUpdateCardProps {
    data: NurseUpdate;
}

const PatientIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const getStatusInfo = (severity: ConditionSeverity): { text: string; bgColor: string; textColor: string; } => {
    switch (severity) {
        case ConditionSeverity.CRITICAL:
            return { text: 'Doctor On Standby', bgColor: 'bg-red-500', textColor: 'text-red-400' };
        case ConditionSeverity.SERIOUS:
            return { text: 'Doctor Preparing', bgColor: 'bg-yellow-500', textColor: 'text-yellow-400' };
        case ConditionSeverity.STABLE:
            return { text: 'Doctor Waiting', bgColor: 'bg-green-500', textColor: 'text-green-400' };
        default:
            return { text: 'Status Unknown', bgColor: 'bg-slate-500', textColor: 'text-slate-400' };
    }
};

const getSeverityBadge = (severity: ConditionSeverity): string => {
     switch (severity) {
        case ConditionSeverity.CRITICAL:
            return 'bg-red-500/20 text-red-300';
        case ConditionSeverity.SERIOUS:
            return 'bg-yellow-500/20 text-yellow-300';
        case ConditionSeverity.STABLE:
            return 'bg-green-500/20 text-green-300';
        default:
            return 'bg-slate-500/20 text-slate-300';
    }
}

export const NurseUpdateCard: React.FC<NurseUpdateCardProps> = ({ data }) => {
    const status = getStatusInfo(data.conditionSeverity);
    const severityBadgeClass = getSeverityBadge(data.conditionSeverity);
    
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 transform hover:scale-[1.02] transition-transform duration-300 ease-in-out">
            <div className={`h-2 ${status.bgColor}`}></div>
            <div className="p-6">
                <div className="flex justify-between items-start">
                     <div className="flex items-center space-x-4">
                        <div className="bg-indigo-500 p-3 rounded-full">
                           <PatientIcon />
                        </div>
                        <div>
                            <div className="uppercase tracking-wide text-sm text-indigo-400 font-semibold">Nurse Update</div>
                            <p className="block mt-1 text-lg leading-tight font-bold text-white">{data.patientName}, {data.age}</p>
                            <p className="text-slate-400">Patient ID: {data.patientId}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-400">Severity</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityBadgeClass}`}>
                            {data.conditionSeverity}
                        </span>
                    </div>
                </div>
                
                <div className="mt-4 border-t border-gray-700 pt-4 space-y-3">
                    {data.notes && (
                         <div>
                            <p className="text-sm font-medium text-slate-400">Notes</p>
                            <p className="text-slate-300 italic">"{data.notes}"</p>
                        </div>
                    )}
                </div>
                 <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                     <div>
                        <p className="text-sm font-medium text-slate-400">Doctor Preparation Status</p>
                        <p className={`font-bold text-lg ${status.textColor}`}>{status.text}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">Immediate Requirement</p>
                        <p className="font-bold text-lg text-yellow-300">{data.immediateRequirement}</p>
                    </div>
                </div>
                <div className="mt-4 text-right text-xs text-slate-500">
                    Received: {new Date(data.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};
