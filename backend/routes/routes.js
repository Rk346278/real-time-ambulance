const express = require("express");
const router = express.Router();
const axios = require("axios");

// GET ROUTES USING OSRM (FREE)
router.get("/get-route", async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng } = req.query;

        const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&alternatives=true`;

        const response = await axios.get(url);

        return res.json(response.data);
    } catch (err) {
        console.error("OSRM ROUTE ERROR:", err);
        res.status(500).json({ error: "Route fetch failed" });
    }
});

module.exports = router;
