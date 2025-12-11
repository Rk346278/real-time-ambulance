import React, { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../src/services/socket";

interface HospitalDashboardProps {
    onBack: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onBack }) => {

    const [driverUpdates, setDriverUpdates] = useState([]);
    const [nurseUpdates, setNurseUpdates] = useState([]);

    const [ambulance, setAmbulance] = useState<any>(null);
    const [areaName, setAreaName] = useState<string>("Fetching...");

    // ⭐ LIVE AMBULANCE LOCATION VIA SOCKET
    useEffect(() => {
        socket.on("ambulance_update", async (data) => {
            setAmbulance(data);

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${data.lat}&lon=${data.lng}&format=json`
                );
                const json = await res.json();

                const display = json.display_name || "";
                const shortName = display.split(",").slice(0, 2).join(",");
                setAreaName(shortName);
            } catch (err) {
                setAreaName("Area unavailable");
            }
        });
    }, []);

    // ⭐ LOAD DATA
    const loadData = async () => {
        try {
            const d = await axios.get("http://localhost:3006/api/driver-updates");
            const n = await axios.get("http://localhost:3006/api/nurse-updates");

            setDriverUpdates(d.data);
            setNurseUpdates(n.data);
        } catch (err) {
            console.log("Error:", err);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
    }, []);

    // ⭐ CLEAR ALL RECORDS
    const clearAll = async () => {
        try {
            await axios.delete("http://localhost:3006/api/clear-all");
            setDriverUpdates([]);
            setNurseUpdates([]);
            alert("All data cleared successfully!");
        } catch (err) {
            alert("Failed to clear data");
        }
    };

    // ⭐ Color coding for severity
    const getSeverityColor = (score: number) => {
        if (score >= 80) return "text-red-400";
        if (score >= 50) return "text-yellow-300";
        return "text-green-300";
    };

    return (
        <div className="p-6 text-white">
            <button onClick={onBack} className="mb-6 text-blue-300">&larr; Home</button>

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold mb-6">Hospital Dashboard</h2>

                {/* ⭐ NEW CLEAR ALL BUTTON */}
                <button
                    onClick={clearAll}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded shadow-lg text-white"
                >
                    Clear All Data
                </button>
            </div>

            {/* ⭐ LIVE AMBULANCE STATUS */}
            <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg mb-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-3">🚑 Live Ambulance Status</h3>

                {ambulance ? (
                    <div className="space-y-1 text-sm">
                        <p><b>Latitude:</b> {ambulance.lat}</p>
                        <p><b>Longitude:</b> {ambulance.lng}</p>
                        <p><b>Area:</b> {areaName}</p>
                        <p><b>From:</b> {ambulance.from}</p>
                        <p><b>To:</b> {ambulance.to}</p>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">
                        Waiting for live ambulance location...
                    </p>
                )}
            </div>

            {/* ⭐ DRIVER UPDATES */}
            <h3 className="text-xl font-semibold mt-4">Driver Updates</h3>
            {driverUpdates.map((u: any, i) => (
                <div key={i} className="bg-gray-800 p-4 mt-3 rounded">
                    <p><b>From:</b> {u.fromLocation}</p>
                    <p><b>To:</b> {u.toLocation}</p>
                    <p><b>Ambulance:</b> {u.ambulanceNumber}</p>
                    <p><b>Driver:</b> {u.driverName}</p>
                </div>
            ))}

            {/* ⭐ NURSE UPDATES WITH SEVERITY SCORE */}
            <h3 className="text-xl font-semibold mt-10">Nurse Updates</h3>
            {nurseUpdates.map((u: any, i) => (
                <div key={i} className="bg-gray-700 p-4 mt-3 rounded">
                    <p><b>ID:</b> {u.patientId}</p>
                    <p><b>Name:</b> {u.patientName}</p>
                    <p><b>Age:</b> {u.age}</p>
                    <p><b>Condition:</b> {u.conditionSeverity}</p>
                    <p><b>Needs:</b> {u.immediateRequirement}</p>
                    <p><b>Notes:</b> {u.notes}</p>

                    <p className={`mt-2 font-bold ${getSeverityColor(u.severityScore)}`}>
                        Severity Score: {u.severityScore ?? "N/A"}
                    </p>
                </div>
            ))}
        </div>
    );
};
