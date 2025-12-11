export function startLiveTracking(routeInfo: any) {
  if (!navigator.geolocation) {
    alert("GPS is not supported on this device");
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        ...routeInfo, // from, to
      };

      fetch("http://localhost:3006/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords),
      });
    },
    (err) => {
      console.error("GPS error:", err);
    },
    { enableHighAccuracy: true }
  );
}
