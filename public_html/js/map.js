/* =========================================================
   MAP.JS
   Funções comuns para mapas Leaflet do projeto CMS.
   ========================================================= */

/*
 * Cria um mapa com uma rota real por estrada
 * entre uma origem e um destino.
 *
 * originCoords e destinationCoords usam:
 * [latitude, longitude]
 */
function createRouteMap(mapId, originCoords, destinationCoords, originName, destinationName) {

    /* =========================
       CRIAR MAPA
       ========================= */

    const map = L.map(mapId);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    /* =========================
       ÍCONES DOS MARCADORES
       ========================= */

    /* Origem = verde */
    const originIcon = L.divIcon({
        className: "",
        html: `
            <div style="
                width:34px;
                height:34px;
                background:#2E9E57;
                border:2px solid white;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                box-shadow:0 3px 9px rgba(0,0,0,.30);
                display:flex;
                align-items:center;
                justify-content:center;">
                <div style="
                    width:9px;
                    height:9px;
                    background:white;
                    border-radius:50%;">
                </div>
            </div>`,
        iconSize: [34, 42],
        iconAnchor: [17, 38],
        popupAnchor: [0, -38]
    });

    /* Destino = vermelho */
    const destinationIcon = L.divIcon({
        className: "",
        html: `
            <div style="
                width:34px;
                height:34px;
                background:#D64545;
                border:2px solid white;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                box-shadow:0 3px 9px rgba(0,0,0,.30);
                display:flex;
                align-items:center;
                justify-content:center;">
                <div style="
                    width:9px;
                    height:9px;
                    background:white;
                    border-radius:50%;">
                </div>
            </div>`,
        iconSize: [34, 42],
        iconAnchor: [17, 38],
        popupAnchor: [0, -38]
    });

    /* =========================
       MARCADORES
       ========================= */

    const originMarker = L.marker(originCoords, {
        icon: originIcon
    }).addTo(map).bindPopup(
        "<strong style='color:#2E9E57;'>Origin</strong><br>" + originName
    );

    const destinationMarker = L.marker(destinationCoords, {
        icon: destinationIcon
    }).addTo(map).bindPopup(
        "<strong style='color:#D64545;'>Destination</strong><br>" + destinationName
    );

    /* =========================
       LEGENDA DO MAPA
       ========================= */

    const legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function () {
        const div = L.DomUtil.create("div", "route-map-legend");

        div.innerHTML = `
            <div style="
                background:white;
                padding:9px 12px;
                border-radius:9px;
                box-shadow:0 3px 10px rgba(0,0,0,.16);
                font-size:12px;
                line-height:1.7;
                color:#25364A;">

                <div style="display:flex;align-items:center;gap:7px;">
                    <span style="
                        width:10px;
                        height:10px;
                        background:#2E9E57;
                        border-radius:50%;
                        display:inline-block;">
                    </span>
                    <span>Origin</span>
                </div>

                <div style="display:flex;align-items:center;gap:7px;">
                    <span style="
                        width:10px;
                        height:10px;
                        background:#D64545;
                        border-radius:50%;
                        display:inline-block;">
                    </span>
                    <span>Destination</span>
                </div>

                <div style="display:flex;align-items:center;gap:7px;">
                    <span style="
                        width:18px;
                        height:4px;
                        background:#1B4B91;
                        border-radius:4px;
                        display:inline-block;">
                    </span>
                    <span>Route</span>
                </div>
            </div>`;

        return div;
    };

    legend.addTo(map);

    /* Mostrar inicialmente a origem e o destino */
    const initialBounds = L.latLngBounds(originCoords, destinationCoords);

    map.fitBounds(initialBounds, {
        padding: [40, 40]
    });

    /* =========================
       CALCULAR ROTA COM OSRM
       ========================= */

    /*
     * Leaflet usa:
     * [latitude, longitude]
     *
     * OSRM usa:
     * longitude,latitude
     */
    const originLongitude = originCoords[1];
    const originLatitude = originCoords[0];
    const destinationLongitude = destinationCoords[1];
    const destinationLatitude = destinationCoords[0];

    const routeURL =
        "https://router.project-osrm.org/route/v1/driving/" +
        originLongitude + "," + originLatitude + ";" +
        destinationLongitude + "," + destinationLatitude +
        "?overview=full&geometries=geojson";

    fetch(routeURL)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Route service unavailable");
            }

            return response.json();
        })
        .then(function (data) {

            /* Confirmar que foi encontrada uma rota */
            if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
                throw new Error("No route found");
            }

            const route = data.routes[0];

            /* Usar a cor principal definida no CSS */
            let routeColour = getComputedStyle(document.documentElement)
                .getPropertyValue("--primary")
                .trim();

            /* Cor de fallback caso --primary não exista */
            if (!routeColour) {
                routeColour = "#1B4B91";
            }

            /* Desenhar a rota real */
            const routeLayer = L.geoJSON(route.geometry, {
                style: {
                    color: routeColour,
                    weight: 5,
                    opacity: 0.85
                }
            }).addTo(map);

            /* Ajustar o mapa para mostrar a rota completa */
            map.fitBounds(routeLayer.getBounds(), {
                padding: [30, 30]
            });

            /* Atualizar distância e duração, se existirem na página */
            const distanceElement = document.getElementById("routeDistance");
            const durationElement = document.getElementById("routeDuration");

            if (distanceElement) {
                const distanceKm = route.distance / 1000;
                distanceElement.textContent = distanceKm.toFixed(1) + " km";
            }

            if (durationElement) {
                const durationMinutes = Math.round(route.duration / 60);
                durationElement.textContent = durationMinutes + " min";
            }
        })
        .catch(function (error) {
            console.error("Error calculating route:", error);

            /*
             * Se o serviço de rotas falhar,
             * mostrar uma linha direta entre os dois pontos.
             */
            const fallbackLine = L.polyline(
                [originCoords, destinationCoords],
                {
                    color: "#1B4B91",
                    weight: 4,
                    dashArray: "8, 8"
                }
            ).addTo(map);

            map.fitBounds(fallbackLine.getBounds(), {
                padding: [30, 30]
            });
        });

    return map;
}