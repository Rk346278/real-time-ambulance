// Full updated RouteMapPage.tsx with CSS effects + hospital live updates
// NOTE: This file includes inline <style> for glow effects and uses Socket.IO for hospital dashboard live updates.

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";

interface RouteMapProps {
  route: {
    fromLocation: string;
    toLocation: string;
    distanceKm: string;
    durationMin: string;
    traffic: string;
    geometry: any;
  };
  onBack: () => void;
}

const socket = io("http://localhost:3006"); // hospital dashboard live updates

export const RouteMapPage: React.FC<RouteMapProps> = ({ route, onBack }) => {
  const mapRef = useRef<any>(null);
  const ambulanceRef = useRef<any>(null);
  const signalRefs = useRef<any[]>([]);
  const [fakeSignals, setFakeSignals] = useState<any[]>([]);
  const [signalStates, setSignalStates] = useState<any>({});

  // --- 1. Generate fake signals every ~350m ---
  const generateFakeSignals = () => {
    const coords = route.geometry.coordinates;
    const signals: any[] = [];
    let accumulated = 0;

    for (let i = 1; i < coords.length; i++) {
      const [lng1, lat1] = coords[i - 1];
      const [lng2, lat2] = coords[i];
      const dist = L.latLng(lat1, lng1).distanceTo(L.latLng(lat2, lng2));
      accumulated += dist;

      if (accumulated >= 350) {
        signals.push({ id: `S${signals.length + 1}`, lat: lat2, lng: lng2, state: "red" });
        accumulated = 0;
      }
    }

    const initial: any = {};
    signals.forEach((s) => (initial[s.id] = "red"));
    setSignalStates(initial);
    setFakeSignals(signals);
  };

  // --- 2. Init map + route ---
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [route.geometry.coordinates[0][1], route.geometry.coordinates[0][0]],
        zoom: 14,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);
    }

    const polyline = L.polyline(route.geometry.coordinates.map((c: any) => [c[1], c[0]]), {
      color: "cyan",
      weight: 5,
    }).addTo(mapRef.current);

    mapRef.current.fitBounds(polyline.getBounds());
    generateFakeSignals();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // --- 3. Draw signal markers ---
  useEffect(() => {
    if (!mapRef.current || fakeSignals.length === 0) return;

    signalRefs.current = fakeSignals.map((sig) => {
      const marker = L.circleMarker([sig.lat, sig.lng], {
        radius: 12,
        color: "red",
        fillColor: "red",
        fillOpacity: 1,
        className: "signal-glow",
      }).addTo(mapRef.current);
      return { ...sig, marker };
    });
  }, [fakeSignals]);

  // --- 4. Animate ambulance + signal logic + hospital live update ---
  useEffect(() => {
    if (!mapRef.current) return;

    const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);
    let index = 0;

    const ambulanceIcon = L.divIcon({
      html: `<div class="ambulance-glow">🚑</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    ambulanceRef.current = L.marker(coords[0], { icon: ambulanceIcon }).addTo(mapRef.current);

    const move = () => {
      if (index >= coords.length - 1) return;

      const [lat1, lng1] = coords[index];
      const [lat2, lng2] = coords[index + 1];
      const steps = 20;
      let step = 0;

      const animate = () => {
        step++;
        const lat = lat1 + ((lat2 - lat1) * step) / steps;
        const lng = lng1 + ((lng2 - lng1) * step) / steps;

        ambulanceRef.current.setLatLng([lat, lng]);

        // Live update for hospital dashboard
        socket.emit("ambulanceLocation", { lat, lng, speed: "40km/h" });

        const updated = { ...signalStates };

        // signal proximity logic
        signalRefs.current.forEach((sig: any) => {
          const d = L.latLng(lat, lng).distanceTo(L.latLng(sig.lat, sig.lng));

          if (d < 200 && sig.state === "red") {
            sig.state = "yellow";
            sig.marker.setStyle({ color: "yellow", fillColor: "yellow" });
            updated[sig.id] = "yellow";

            setTimeout(() => {
              sig.state = "green";
              sig.marker.setStyle({ color: "lime", fillColor: "lime" });
              setSignalStates((p: any) => ({ ...p, [sig.id]: "green" }));
            }, 500);
          }

          if (d > 200 && sig.state === "green") {
            sig.state = "red";
            sig.marker.setStyle({ color: "red", fillColor: "red" });
            updated[sig.id] = "red";
          }
        });

        setSignalStates(updated);

        if (step < steps) requestAnimationFrame(animate);
        else {
          index++;
          move();
        }
      };

      animate();
    };

    move();
  }, [fakeSignals]);

  return (
    <div className="p-4 text-white">
      <style>{`
        .signal-glow {
          filter: drop-shadow(0 0 6px red);
        }
        .ambulance-glow {
          font-size: 30px;
          filter: drop-shadow(0 0 10px #00eaff);
        }
      `}</style>

      <button onClick={onBack} className="mb-4 text-blue-400 hover:text-blue-300">← Back</button>

      <h2 className="text-3xl font-bold mb-3">
        Route: {route.fromLocation} → {route.toLocation}
      </h2>

      <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
        <p><b>Distance:</b> {route.distanceKm} km</p>
        <p><b>Time:</b> {route.durationMin} min</p>
        <p><b>Traffic:</b> {route.traffic}</p>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg mb-4 border border-gray-700">
        <h3 className="text-xl font-semibold mb-2">Smart Signal Status</h3>
        <div className="space-y-1">
          {Object.entries(signalStates).map(([id, st]: any) => (
            <div key={id} className="flex justify-between text-sm">
              <span>{id}</span>
              <span
                className={
                  st === "green"
                    ? "text-green-400"
                    : st === "yellow"
                    ? "text-yellow-300"
                    : "text-red-400"
                }
              >
                {st.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div id="map" style={{ width: "100%", height: "500px", borderRadius: "10px", boxShadow: "0 0 10px #00eaff70" }}></div>
    </div>
  );
};
