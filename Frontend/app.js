
const API_URL = "https://campusnav-backend-4law.onrender.com";

let map, directionsService, directionsRenderer;
let currentMarker = null;
let startMarker = null;
let destMarker = null;
let locationData = [];

// ---------------- FETCH LOCATIONS ----------------
async function fetchLocations() {
  const res = await fetch(`${API_URL}/api/locations`);
  locationData = await res.json();
  populateDropdowns();
}

function populateDropdowns() {
  const startSelect = document.getElementById("start");
  const destSelect = document.getElementById("destination");

  startSelect.innerHTML = `<option value="">-- Select --</option>`;
  destSelect.innerHTML = `<option value="">-- Select --</option>`;

  locationData.forEach(loc => {
    const o1 = document.createElement("option");
    o1.value = loc.name;
    o1.text = loc.name;
    startSelect.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = loc.name;
    o2.text = loc.name;
    destSelect.appendChild(o2);
  });
}

function getCoordinates(name) {
  return locationData.find(l => l.name === name);
}

// ---------------- MAP INIT ----------------
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 17.5205, lng: 78.367 },
    zoom: 17,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  // First load static locations
  fetchLocations().then(() => {

    //trying to get current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = {
          name: "Current Location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Add to beginning
        locationData.unshift(userLoc);
        populateDropdowns();

        currentMarker = new google.maps.Marker({
          position: userLoc,
          map,
          icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          title: "You are here",
        });

        map.setCenter(userLoc);
      },
      () => {
        console.log("Location permission denied.");
      }
    );
  });
}

// ---------------- ROUTE + AI ----------------
async function updateRouteAndAI() {
  const start = document.getElementById("start").value;
  const dest = document.getElementById("destination").value;

  if (!start || !dest) {
    document.getElementById("ai-status").innerText =
      "AI Crowd Status: Checking...";
    return;
  }

  const s = getCoordinates(start);
  const d = getCoordinates(dest);

  if (!s || !d) return;

  directionsService.route(
    {
      origin: { lat: s.lat, lng: s.lng },
      destination: { lat: d.lat, lng: d.lng },
      travelMode: google.maps.TravelMode.WALKING,
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        const leg = result.routes[0].legs[0];

        document.getElementById("distance").innerText =
          `Distance: ${leg.distance.text}`;
        document.getElementById("duration").innerText =
          `Time: ${leg.duration.text}`;

        if (startMarker) startMarker.setMap(null);
        if (destMarker) destMarker.setMap(null);

        startMarker = new google.maps.Marker({
          position: s,
          map,
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          title: "Start",
        });

        destMarker = new google.maps.Marker({
          position: d,
          map,
          icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          title: "Destination",
        });
      }
    }
  );

  // Log route
  await fetch(`${API_URL}/api/log-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, destination: dest }),
  });

  // Fetching AI crowd status
  try {
    const res = await fetch(`${API_URL}/api/crowd-status`);
    const data = await res.json();
    document.getElementById("ai-status").innerText =
      `AI Crowd Status: ${data.status}`;
  } catch {
    document.getElementById("ai-status").innerText =
      "AI Crowd Status: Warming up… please wait";
  }
}

// ---------------- BUTTONS ----------------

// Recenter
document.getElementById("recenter-btn").addEventListener("click", () => {
  if (currentMarker) {
    map.setCenter(currentMarker.getPosition());
    map.setZoom(17);
  }
});

// Reset
document.getElementById("reset-btn").addEventListener("click", () => {
  directionsRenderer.setDirections({ routes: [] });
  document.getElementById("distance").innerText = "Distance: 0 km";
  document.getElementById("duration").innerText = "Time: 0 mins";
  document.getElementById("ai-status").innerText = "AI Crowd Status: Checking...";

  document.getElementById("start").selectedIndex = 0;
  document.getElementById("destination").selectedIndex = 0;

  if (startMarker) startMarker.setMap(null);
  if (destMarker) destMarker.setMap(null);
});

// Open in Google Maps
document.getElementById("navigate-btn").addEventListener("click", () => {
  const start = document.getElementById("start").value;
  const dest = document.getElementById("destination").value;

  if (!start || !dest) {
    alert("Please select both start and destination.");
    return;
  }

  const s = getCoordinates(start);
  const d = getCoordinates(dest);

  const url = `https://www.google.com/maps/dir/?api=1&origin=${s.lat},${s.lng}&destination=${d.lat},${d.lng}&travelmode=walking`;
  window.open(url, "_blank");
});

// ---------------- EVENTS ----------------
document.getElementById("start").addEventListener("change", updateRouteAndAI);
document.getElementById("destination").addEventListener("change", updateRouteAndAI);

window.initMap = initMap;
