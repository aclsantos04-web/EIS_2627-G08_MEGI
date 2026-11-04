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
function createRouteMap(
        mapId,
        originCoords,
        destinationCoords,
        originName,
        destinationName) {


    /* =========================================
       CRIAR MAPA
       ========================================= */

    const map = L.map(mapId);


    /* Adicionar OpenStreetMap */
    L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors"
            }
    ).addTo(map);



    /* =========================================
       MARCADORES
       ========================================= */

    const originMarker =
            L.marker(originCoords)
            .addTo(map)
            .bindPopup("Origin: " + originName);


    const destinationMarker =
            L.marker(destinationCoords)
            .addTo(map)
            .bindPopup("Destination: " + destinationName);



    /* Mostrar inicialmente os dois pontos */
    const initialBounds =
            L.latLngBounds(
                originCoords,
                destinationCoords
            );


    map.fitBounds(
            initialBounds,
            {
                padding: [40, 40]
            }
    );



    /* =========================================
       CALCULAR ROTA REAL COM OSRM
       ========================================= */


    /*
     * ATENÇÃO:
     * O OSRM recebe coordenadas na ordem:
     *
     * longitude, latitude
     *
     * enquanto o Leaflet normalmente usa:
     *
     * latitude, longitude
     */

    const originLongitude =
            originCoords[1];

    const originLatitude =
            originCoords[0];


    const destinationLongitude =
            destinationCoords[1];

    const destinationLatitude =
            destinationCoords[0];



    /*
     * Pedimos:
     *
     * overview=full
     * → rota completa
     *
     * geometries=geojson
     * → geometria num formato que o Leaflet
     *   consegue desenhar diretamente
     */

    const routeURL =
            "https://router.project-osrm.org/route/v1/driving/"
            + originLongitude + "," + originLatitude
            + ";"
            + destinationLongitude + "," + destinationLatitude
            + "?overview=full&geometries=geojson";



    fetch(routeURL)

            .then(function (response) {

                if (!response.ok) {
                    throw new Error(
                            "Route service unavailable"
                            );
                }

                return response.json();

            })


            .then(function (data) {


                /*
                 * Confirmar que o OSRM encontrou
                 * uma rota.
                 */

                if (
                        data.code !== "Ok"
                        ||
                        !data.routes
                        ||
                        data.routes.length === 0
                        ) {

                    throw new Error(
                            "No route found"
                            );

                }



                /*
                 * Primeira rota recomendada.
                 */

                const route =
                        data.routes[0];



                /*
                 * Obter a cor principal definida
                 * no style.css da equipa.
                 */

                let routeColour =
                        getComputedStyle(
                            document.documentElement
                        )
                        .getPropertyValue("--primary")
                        .trim();


                /*
                 * Fallback caso a variável CSS
                 * não exista.
                 */
                if (!routeColour) {
                    routeColour = "#1B4B91";
                }



                /*
                 * Desenhar a rota real.
                 */

                const routeLayer =
                        L.geoJSON(
                            route.geometry,
                            {
                                style: {
                                    color: routeColour,
                                    weight: 5,
                                    opacity: 0.85
                                }
                            }
                        )
                        .addTo(map);



                /*
                 * Ajustar automaticamente o mapa
                 * para mostrar a rota inteira.
                 */

                map.fitBounds(
                        routeLayer.getBounds(),
                        {
                            padding: [30, 30]
                        }
                );



                /*
                 * Se existirem elementos HTML para
                 * distância e duração, atualizamos.
                 */

                const distanceElement =
                        document.getElementById(
                            "routeDistance"
                        );


                const durationElement =
                        document.getElementById(
                            "routeDuration"
                        );



                /*
                 * OSRM devolve distância em metros.
                 */
                if (distanceElement) {

                    const distanceKm =
                            route.distance / 1000;


                    distanceElement.textContent =
                            distanceKm.toFixed(1)
                            + " km";

                }



                /*
                 * OSRM devolve duração em segundos.
                 */
                if (durationElement) {

                    const durationMinutes =
                            Math.round(
                                route.duration / 60
                            );


                    durationElement.textContent =
                            durationMinutes
                            + " min";

                }

            })


            .catch(function (error) {


                console.error(
                        "Error calculating route:",
                        error
                        );


                /*
                 * Se o serviço de routing falhar,
                 * mostramos pelo menos uma linha
                 * direta entre os dois pontos.
                 */

                const fallbackLine =
                        L.polyline(
                            [
                                originCoords,
                                destinationCoords
                            ],
                            {
                                color: "#1B4B91",
                                weight: 4,
                                dashArray: "8, 8"
                            }
                        )
                        .addTo(map);


                map.fitBounds(
                        fallbackLine.getBounds(),
                        {
                            padding: [30, 30]
                        }
                );

            });



    return map;

}
