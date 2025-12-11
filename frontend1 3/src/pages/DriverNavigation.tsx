import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { socket } from "../services/socket";

// Ambulance Icon
const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [40, 40],
});

interface DriverNavigationProps {
  route: any;   // from selectedRoute
  onBack: () => void;
}

export const DriverNavigation: React.FC<DriverNavigationProps> = ({ route, onBack }) => {
  const [ambulancePos, setAmbulancePos] = useState<[number, number] | null>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  const mapRef = useRef<any>(null);

  // Convert OSRM geometry to leaflet lat-lng format
  const routeCoords = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);

  // Fetch real signals from backend
  useEffect(() => {
    const loadSignals = async () => {
      try {
        const resp = await axios.post("http://localhost:3006/api/get-real-signals", {
          route: route.geometry.coordinates,
        });

        setSignals(resp.data.signals);
      } catch (err) {
        console.log("Signal fetch error:", err);
      }
    };

    loadSignals();
  }, []);

  // Live ambulance update listener
  useEffect(() => {
    socket.on("ambulance_update", (data) => {
      setAmbulancePos([data.lat, data.lng]);
    });

    socket.on("signal_approach", (data) => {
      setActiveSignal(data.signal);
    });

    return () => {
      socket.off("ambulance_update");
      socket.off("signal_approach");
    };
  }, []);

  // Auto zoom to route on load
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-gray-900 text-white">

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-[999] bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-blue-300 hover:bg-gray-700"
      >
        ← Back
      </button>

      {/* TOP LEFT ROUTE INFO CARD */}
      <div className="absolute top-20 left-4 z-[999] bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg w-72">
        <h3 className="text-xl font-bold mb-2">🚑 Route Info</h3>
        <p><b>Distance:</b> {(route.distance/1000).toFixed(1)} km</p>
        <p><b>ETA:</b> {(route.duration/60).toFixed(1)} min</p>
      </div>

      {/* SIGNAL LIST */}
      <div className="absolute bottom-4 left-4 z-[999] bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg w-72 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-2">🚦 Signals on Route</h3>

        {signals.length === 0 && <p className="text-gray-400">Loading signals...</p>}

        {signals.map((sig, i) => (
          <div key={i} className={`p-3 rounded mb-2 border
            ${activeSignal === sig.name 
              ? "bg-green-900/40 border-green-600 animate-pulse" 
              : "bg-gray-700 border-gray-600"}`}
          >
            <b>{sig.name}</b>
          </div>
        ))}
      </div>

      {/* MAP */}
      <MapContainer
        center={routeCoords[0]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* ROUTE PATH */}
        <Polyline positions={routeCoords} color="blue" weight={6} />

        {/* SIGNAL MARKERS */}
        {signals.map((sig, i) => (
          <Marker key={i} position={[sig.lat, sig.lng]}>
            <Popup>{sig.name}</Popup>
          </Marker>
        ))}

        {/* AMBULANCE MARKER */}
        {ambulancePos && (
          <Marker icon={ambulanceIcon} position={ambulancePos}>
            <Popup>Ambulance</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
