import React, { useState } from 'react';
import axios from 'axios';
import { socket } from '../src/services/socket';
import { ConditionSeverity, ImmediateRequirement } from '../types';

interface NurseDashboardProps {
    onBack: () => void;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({ onBack }) => {
    const [patientId, setPatientId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [conditionSeverity, setConditionSeverity] = useState<ConditionSeverity>(ConditionSeverity.STABLE);
    const [immediateRequirement, setImmediateRequirement] = useState<ImmediateRequirement>(ImmediateRequirement.WHEELCHAIR);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const resetForm = () => {
        setPatientId('');
        setPatientName('');
        setAge('');
        setConditionSeverity(ConditionSeverity.STABLE);
        setImmediateRequirement(ImmediateRequirement.WHEELCHAIR);
        setNotes('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!patientId || !patientName || !age) {
            setMessage({ text: 'Please fill patient ID, name, and age.', type: 'error' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const payload = {
            patientId,
            patientName,
            age: parseInt(age, 10),
            conditionSeverity,
            immediateRequirement,
            notes,
        };

        try {
            // ⭐ THIS IS THE ONLY FIX YOU NEEDED ⭐
            await axios.post('http://localhost:3006/api/nurse-updates', payload);

            socket.emit('nurseUpdate', payload);

            setMessage({ text: 'Update sent successfully!', type: 'success' });
            resetForm();
        } catch (error) {
            console.error('Error sending nurse update:', error);
            setMessage({ text: 'Failed to send update. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl shadow-indigo-500/10 border border-gray-700">
             <div className="relative mb-6">
                <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 transition-colors">&larr; Home</button>
                <h2 className="text-3xl font-bold text-slate-100 text-center">Nurse Dashboard</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Patient ID</label>
                        <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border-gray-600 rounded-md text-white" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300">Patient Name</label>
                        <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border-gray-600 rounded-md text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Age</label>
                        <input type="number" min="0" value={age} onChange={e => setAge(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border-gray-600 rounded-md text-white" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300">Condition Severity</label>
                        <select value={conditionSeverity} onChange={e => setConditionSeverity(e.target.value as ConditionSeverity)}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 text-white py-2 rounded-md">
                            {Object.values(ConditionSeverity).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300">Immediate Requirement</label>
                    <select value={immediateRequirement} onChange={e => setImmediateRequirement(e.target.value as ImmediateRequirement)}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 text-white py-2 rounded-md">
                        {Object.values(ImmediateRequirement).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300">Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 text-white px-3 py-2 rounded-md"
                        placeholder="Patient notes here..." />
                </div>

                <div>
                    <button type="submit" disabled={submitting}
                        className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-900">
                        {submitting ? 'Sending...' : 'Send Nurse Update'}
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-md text-sm ${
                        message.type === 'success'
                            ? 'bg-green-900/50 text-green-300 border border-green-700'
                            : 'bg-red-900/50 text-red-300 border border-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
};
