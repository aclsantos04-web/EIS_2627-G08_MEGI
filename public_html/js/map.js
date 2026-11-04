document.addEventListener("DOMContentLoaded", function () {

    const mapContainer = document.getElementById("map");

    if (!mapContainer) {
        return;
    }

    // Coordenadas da FEUP
    const latitude = 41.1780;
    const longitude = -8.5980;

    // Criar mapa
    const map = L.map("map").setView(
        [latitude, longitude],
        15
    );

    // Adicionar OpenStreetMap
    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    // Marcador
    const marker = L.marker(
        [latitude, longitude]
    ).addTo(map);

    marker.bindPopup("FEUP");

});

