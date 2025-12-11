export function startLiveTracking(routeInfo: any) {
  if (!navigator.geolocation) {
    alert("GPS is not supported on this device");
    return;
  }

  // ✅ Take ETA from selected route (OSRM duration)
  const etaMinutes =
    routeInfo.durationMin
      ? Number(routeInfo.durationMin)
      : 10; // fallback safety

  navigator.geolocation.watchPosition(
    (pos) => {
      const payload = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,

        // ✅ EXPLICIT – no guessing
        from: routeInfo.from,
        to: routeInfo.to,

        // ✅ ETA sent to backend
        etaMinutes,

        // ✅ Needed for signal simulation
        signals: routeInfo.signals || []
      };

      fetch("http://localhost:3006/update-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    },
    (err) => {
      console.error("GPS error:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,     // ✅ fresh GPS every time
      timeout: 5000      // ✅ faster updates
    }
  );
}
