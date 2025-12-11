import React, { useState } from "react";
import axios from "axios";
import { startLiveTracking } from "../src/services/driverLocation";

interface DriverDashboardProps {
    onBack: () => void;
    onSelectRoute: (route: any) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
    onBack,
    onSelectRoute
}) => {

    const [driverName, setDriverName] = useState("");
    const [ambulanceNumber, setAmbulanceNumber] = useState("");
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");

    const [routeOptions, setRouteOptions] = useState<any[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);

    const [loadingRoutes, setLoadingRoutes] = useState(false);
    const [isDriverSent, setIsDriverSent] = useState(false);

    // ----------------- GEO LOCATION -----------------
    const geocode = async (query: string) => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
            const res = await axios.get(url);
            if (res.data.length === 0) return null;

            return {
                lat: parseFloat(res.data[0].lat),
                lng: parseFloat(res.data[0].lon),
            };
        } catch {
            return null;
        }
    };

    // ----------------- SEND DRIVER UPDATE -----------------
    const sendDriverUpdate = async () => {
        if (!driverName || !ambulanceNumber || !fromLocation || !toLocation) {
            alert("Fill all fields first.");
            return;
        }

        try {
            await axios.post("http://localhost:3006/api/driver-updates", {
                driverName,
                ambulanceNumber,
                fromLocation,
                toLocation
            });

            alert("Driver update sent to hospital!");
            setIsDriverSent(true);

        } catch {
            alert("Failed to send driver update");
        }
    };

    // ----------------- FETCH ROUTES -----------------
    const fetchRoutes = async () => {
        if (!isDriverSent) {
            alert("Send driver update first!");
            return;
        }

        if (!fromLocation || !toLocation) {
            alert("Enter locations correctly");
            return;
        }

        setLoadingRoutes(true);

        const from = await geocode(fromLocation);
        const to = await geocode(toLocation);

        if (!from || !to) {
            alert("Invalid locations");
            setLoadingRoutes(false);
            return;
        }

        try {
            const resp = await axios.get("http://localhost:3006/api/get-route", {
                params: {
                    fromLat: from.lat,
                    fromLng: from.lng,
                    toLat: to.lat,
                    toLng: to.lng,
                },
            });

            const options = resp.data.routes.map((r: any, i: number) => ({
                index: i,
                distanceKm: (r.distance / 1000).toFixed(1),
                durationMin: (r.duration / 60).toFixed(1),
                geometry: r.geometry,
                signals: r.signals
            }));

            setRouteOptions(options);

        } catch {
            alert("Failed to fetch routes");
        } finally {
            setLoadingRoutes(false);
        }
    };

    // ----------------- START LIVE TRACKING -----------------
    const startTracking = () => {
        if (!isDriverSent) {
            alert("Send driver update first!");
            return;
        }

        if (!selectedRoute) {
            alert("Choose a route first!");
            return;
        }

        onSelectRoute(selectedRoute);

        // ✅ PASS durationMin FOR ETA
        startLiveTracking({
            from: fromLocation,
            to: toLocation,
            geometry: selectedRoute.geometry,
            signals: selectedRoute.signals,
            durationMin: selectedRoute.durationMin
        });
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl">

            <button onClick={onBack} className="text-blue-300 mb-4">← Back</button>

            <h2 className="text-3xl font-bold text-white text-center mb-6">
                Driver Dashboard
            </h2>

            <div className="space-y-4">
                <input className="w-full p-3 bg-gray-700 text-white rounded"
                    placeholder="Driver Name"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                />

                <input className="w-full p-3 bg-gray-700 text-white rounded"
                    placeholder="Ambulance Number"
                    value={ambulanceNumber}
                    onChange={e => setAmbulanceNumber(e.target.value)}
                />

                <input className="w-full p-3 bg-gray-700 text-white rounded"
                    placeholder="From Location"
                    value={fromLocation}
                    onChange={e => setFromLocation(e.target.value)}
                />

                <input className="w-full p-3 bg-gray-700 text-white rounded"
                    placeholder="To Location"
                    value={toLocation}
                    onChange={e => setToLocation(e.target.value)}
                />

                <button onClick={sendDriverUpdate}
                    className="w-full py-3 bg-blue-600 text-white rounded">
                    Send Driver Update
                </button>

                <button onClick={fetchRoutes}
                    className="w-full py-3 bg-yellow-600 text-white rounded">
                    Get Route Suggestions
                </button>

                <button onClick={startTracking}
                    className="w-full py-3 bg-green-600 text-white rounded">
                    Start Live Tracking
                </button>
            </div>

            {routeOptions.length > 0 && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-bold text-white">Select a Route</h3>

                    {routeOptions.map(opt => (
                        <div key={opt.index} className="p-4 bg-gray-700 rounded">
                            <p><b>Distance:</b> {opt.distanceKm} km</p>
                            <p><b>Time:</b> {opt.durationMin} min</p>
                            <p><b>Signals:</b> {opt.signals.length}</p>

                            <button
                                onClick={() => setSelectedRoute(opt)}
                                className="mt-3 bg-blue-600 px-4 py-2 rounded">
                                Choose This Route
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
