# Ambulance Tracking & Emergency Transit Coordination System

A full-stack web application for coordinating ambulance drivers, in-transit nurses/paramedics, and receiving hospitals during emergency patient transport.

The system provides route planning, nearby hospital discovery, patient triage information, and real-time notifications between ambulance teams and hospitals.

> Note: Ambulance movement and traffic-signal behavior are simulated using route data. The project does not currently use physical GPS hardware, real traffic signals, or IoT devices.

## Overview

During emergency ambulance transport, hospitals may not have enough information about the incoming ambulance, patient condition, or expected arrival before the ambulance reaches the hospital.

This project provides three interfaces:

- Ambulance Driver Dashboard
- Nurse / Paramedic Dashboard
- Hospital Dashboard

The driver can calculate a route, find hospitals along the route, select a receiving hospital, and send trip information.

The nurse or paramedic can submit patient information and clinical notes. The backend processes the notes using a rule-based triage system and sends the resulting assessment to the selected hospital.

The hospital dashboard receives driver and patient updates through Socket.IO.

## Features

### Ambulance Driver Dashboard

- Enter pickup and destination locations.
- Convert addresses to coordinates using OpenStreetMap Nominatim.
- Calculate driving routes using OSRM.
- View route distance, duration, and route geometry.
- Find hospitals within a 1.5 km corridor of the selected route.
- Select a receiving hospital.
- Send ambulance trip information to the hospital.
- View the route using an interactive Leaflet map.
- Simulate ambulance movement along the selected route.

### Nurse / Paramedic Dashboard

- Enter patient name and age.
- Enter the destination hospital code.
- Enter clinical notes about the patient's condition.
- Submit patient information to the backend.
- Calculate a rule-based severity level and score.
- Determine an immediate hospital requirement based on predefined conditions.
- Send the assessment to the receiving hospital.

### Hospital Dashboard

- Connect using a hospital code.
- Join a dedicated Socket.IO room.
- Receive ambulance trip notifications.
- Receive nurse / paramedic patient updates.
- View patient severity and required preparation.
- Display ambulance route and ETA information.
- Reverse-geocode coordinates to display readable location information.

### Mapping and Geospatial Features

- Leaflet-based interactive maps.
- OpenStreetMap map tiles.
- OSRM route calculation.
- OpenStreetMap Nominatim geocoding.
- Haversine distance calculation.
- Hospital filtering based on route proximity.
- Animated ambulance movement along the calculated route.
- Simulated traffic signals along the route.

### Real-Time Communication

Socket.IO is used to send updates between the backend and hospital dashboards.

Each hospital uses a dedicated Socket.IO room:

```text
hospital:<hospitalCode>

Enter pickup and destination
            |
            v
Geocode locations
            |
            v
Request route from OSRM
            |
            v
Receive route geometry
            |
            v
Find hospitals near route
            |
            v
Select receiving hospital
            |
            v
Send trip information
            |
            v
Hospital receives update
