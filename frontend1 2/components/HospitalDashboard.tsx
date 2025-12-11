import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { socket } from "../src/services/socket";

interface HospitalDashboardProps {
    onBack: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onBack }) => {

    const [driverUpdates, setDriverUpdates] = useState<any[]>([]);
    const [nurseUpdates, setNurseUpdates] = useState<any[]>([]);

    const [ambulance, setAmbulance] = useState<any>(null);
    const [areaName, setAreaName] = useState<string>("Fetching...");
    const [eta, setEta] = useState<string>("Calculating...");

    const lastGeoUpdate = useRef<number>(0);

    // ⭐ LIVE AMBULANCE LOCATION (FAST)
    useEffect(() => {
        socket.on("ambulance_update", (data) => {
            setAmbulance(data);

            // ---------- THROTTLED REVERSE GEO (every 5s) ----------
            const now = Date.now();
            if (now - lastGeoUpdate.current > 5000) {
                lastGeoUpdate.current = now;

                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${data.lat}&lon=${data.lng}&format=json`)
                    .then(res => res.json())
                    .then(json => {
                        const display = json.display_name || "";
                        setAreaName(display.split(",").slice(0, 2).join(","));
                    })
                    .catch(() => setAreaName("Area unavailable"));
            }
        });

        return () => {
            socket.off("ambulance_update");
        };
    }, []);

    // ⭐ LOAD DRIVER + NURSE DATA
    const loadData = async () => {
        try {
            const d = await axios.get("http://localhost:3006/api/driver-updates");
            const n = await axios.get("http://localhost:3006/api/nurse-updates");

            setDriverUpdates(d.data);
            setNurseUpdates(n.data);
        } catch (err) {
            console.log("Error loading data");
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, []);

    // ⭐ ETA CALCULATION (AUTO UPDATE)
    useEffect(() => {
        if (!ambulance?.lat || !ambulance?.lng || !ambulance?.to) return;

        const calculateETA = async () => {
            try {
                const geo = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ambulance.to)}`
                ).then(r => r.json());

                if (!geo[0]) return;

                const res = await axios.get("http://localhost:3006/api/get-route", {
                    params: {
                        fromLat: ambulance.lat,
                        fromLng: ambulance.lng,
                        toLat: geo[0].lat,
                        toLng: geo[0].lon,
                    }
                });

                const seconds = res.data.routes[0].duration;
                setEta(`${Math.ceil(seconds / 60)} mins`);
            } catch {
                setEta("Unavailable");
            }
        };

        calculateETA();
    }, [ambulance]);

    // ⭐ CLEAR DATA
    const clearAll = async () => {
        await axios.delete("http://localhost:3006/api/clear-all");
        setDriverUpdates([]);
        setNurseUpdates([]);
        alert("All data cleared");
    };

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
                <button onClick={clearAll} className="bg-red-600 px-4 py-2 rounded">
                    Clear All Data
                </button>
            </div>

            {/* ⭐ LIVE AMBULANCE */}
            <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg mb-8">
                <h3 className="text-xl font-semibold mb-3">🚑 Live Ambulance Status</h3>

                {ambulance ? (
                    <div className="space-y-1 text-sm">
                        <p><b>Lat:</b> {ambulance.lat}</p>
                        <p><b>Lng:</b> {ambulance.lng}</p>
                        <p><b>Area:</b> {areaName}</p>
                        <p><b>From:</b> {ambulance.from}</p>
                        <p><b>To:</b> {ambulance.to}</p>
                        <p className="text-green-400 font-bold">
                            ETA: {eta}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-400">Waiting for ambulance...</p>
                )}
            </div>

            {/* ⭐ DRIVER UPDATES */}
            <h3 className="text-xl font-semibold">Driver Updates</h3>
            {driverUpdates.map((u, i) => (
                <div key={i} className="bg-gray-800 p-4 mt-3 rounded">
                    <p><b>Ambulance:</b> {u.ambulanceNumber}</p>
                    <p><b>Driver:</b> {u.driverName}</p>
                    <p><b>From:</b> {u.fromLocation}</p>
                    <p><b>To:</b> {u.toLocation}</p>
                </div>
            ))}

            {/* ⭐ NURSE UPDATES */}
            <h3 className="text-xl font-semibold mt-10">Nurse Updates</h3>
            {nurseUpdates.map((u, i) => (
                <div key={i} className="bg-gray-700 p-4 mt-3 rounded">
                    <p><b>Name:</b> {u.patientName}</p>
                    <p><b>Age:</b> {u.age}</p>
                    <p><b>Condition:</b> {u.conditionSeverity}</p>
                    <p><b>Needs:</b> {u.immediateRequirement}</p>
                    <p><b>Notes:</b> {u.notes}</p>
                    <p className={`mt-2 font-bold ${getSeverityColor(u.severityScore)}`}>
                        Severity Score: {u.severityScore}
                    </p>
                </div>
            ))}
        </div>
    );
};
