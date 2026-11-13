document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================
       1. MAPA INTERATIVO (CLIQUE NO MAPA + MORADA + COORDENADAS)
       ========================================================= */
    const originLatInput = document.getElementById('originLat');
    const originLongInput = document.getElementById('originLong');
    const destLatInput = document.getElementById('destLat');
    const destLongInput = document.getElementById('destLong');

    const originAddrInput = document.getElementById('originAddress');
    const destAddrInput = document.getElementById('destAddress');
    const btnSearchOrigin = document.getElementById('btnSearchOrigin');
    const btnSearchDest = document.getElementById('btnSearchDest');
    const originSuggestions = document.getElementById('originSuggestions');
    const destSuggestions = document.getElementById('destSuggestions');

    const targetOriginBtn = document.getElementById('targetOriginBtn');
    const targetDestBtn = document.getElementById('targetDestBtn');
    const mapHintText = document.getElementById('mapHintText');

    // Controla se o próximo clique no mapa altera 'origin' ou 'destination'
    let clickMode = 'origin';

    function setClickMode(mode) {
        clickMode = mode;
        if (mode === 'origin') {
            targetOriginBtn.classList.add('active-origin');
            targetDestBtn.classList.remove('active-dest');
            mapHintText.innerHTML = 'Click on the map to set <strong>Origin</strong>, search an address, or edit coordinates';
        } else {
            targetDestBtn.classList.add('active-dest');
            targetOriginBtn.classList.remove('active-origin');
            mapHintText.innerHTML = 'Click on the map to set <strong>Destination</strong>, search an address, or edit coordinates';
        }
    }

    targetOriginBtn.addEventListener('click', () => setClickMode('origin'));
    targetDestBtn.addEventListener('click', () => setClickMode('destination'));

    // Ícones personalizados (Verde para Origem, Vermelho para Destino)
    const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Inicializar mapa Leaflet
    const initialOrigin = [parseFloat(originLatInput.value) || 41.1780, parseFloat(originLongInput.value) || -8.5980];
    const initialDest = [parseFloat(destLatInput.value) || 41.1496, parseFloat(destLongInput.value) || -8.6109];

    const map = L.map('map').setView(initialOrigin, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const originMarker = L.marker(initialOrigin, { icon: greenIcon }).addTo(map).bindPopup('Origin');
    const destMarker = L.marker(initialDest, { icon: redIcon }).addTo(map).bindPopup('Destination');
    let routeLayer = null;

    // Atualiza marcadores e calcula rota real via OSRM
    function updateRouteAndMarkers(fitMap = true) {
        const oLat = parseFloat(originLatInput.value);
        const oLng = parseFloat(originLongInput.value);
        const dLat = parseFloat(destLatInput.value);
        const dLng = parseFloat(destLongInput.value);

        if (isNaN(oLat) || isNaN(oLng) || isNaN(dLat) || isNaN(dLng)) return;

        const oCoords = [oLat, oLng];
        const dCoords = [dLat, dLng];

        originMarker.setLatLng(oCoords);
        destMarker.setLatLng(dCoords);

        const routeURL = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;

        fetch(routeURL)
            .then(res => res.json())
            .then(data => {
                if (routeLayer) {
                    map.removeLayer(routeLayer);
                }

                if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                    routeLayer = L.geoJSON(data.routes[0].geometry, {
                        style: { color: '#1B4B91', weight: 5, opacity: 0.85 }
                    }).addTo(map);
                } else {
                    routeLayer = L.polyline([oCoords, dCoords], {
                        color: '#1B4B91', weight: 4, dashArray: '8, 8'
                    }).addTo(map);
                }

                if (fitMap) {
                    map.fitBounds(routeLayer.getBounds(), { padding: [35, 35] });
                }
            })
            .catch(() => {
                if (routeLayer) map.removeLayer(routeLayer);
                routeLayer = L.polyline([oCoords, dCoords], {
                    color: '#1B4B91', weight: 4, dashArray: '8, 8'
                }).addTo(map);
            });
    }

    // Reverse Geocoding: preenche o nome da rua quando o utilizador clica no mapa
    function fillAddressFromCoords(lat, lng, targetInput) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.display_name) {
                    const shortAddr = data.display_name.split(',').slice(0, 3).join(',');
                    targetInput.value = shortAddr;
                }
            })
            .catch(() => {});
    }

    // Evento de clique no mapa
    map.on('click', (e) => {
        const lat = e.latlng.lat.toFixed(4);
        const lng = e.latlng.lng.toFixed(4);

        if (clickMode === 'origin') {
            originLatInput.value = lat;
            originLongInput.value = lng;
            originSuggestions.innerHTML = '';
            fillAddressFromCoords(lat, lng, originAddrInput);
            updateRouteAndMarkers(false);
            setClickMode('destination');
        } else {
            destLatInput.value = lat;
            destLongInput.value = lng;
            destSuggestions.innerHTML = '';
            fillAddressFromCoords(lat, lng, destAddrInput);
            updateRouteAndMarkers(false);
            setClickMode('origin');
        }
    });

    // Forward Geocoding: pesquisar coordenadas em Portugal e listar sugestões
    function searchAddress(query, addrInput, latField, lngField, suggestionsBox, btnElement) {
        const trimmed = query.trim();
        if (!trimmed) {
            alert('Please enter an address to search.');
            return;
        }

        const originalText = btnElement.textContent;
        btnElement.textContent = '...';
        btnElement.disabled = true;
        suggestionsBox.innerHTML = '';

        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pt&limit=4&q=${encodeURIComponent(trimmed)}`;

        fetch(url)
            .then(res => res.json())
            .then(results => {
                if (!results || results.length === 0) {
                    alert('No address found in Portugal. Try adding the city (e.g. "Rua de Santa Catarina, Porto").');
                    return;
                }

                if (results.length === 1) {
                    selectLocationResult(results[0], addrInput, latField, lngField, suggestionsBox);
                    return;
                }

                results.forEach(place => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = place.display_name;
                    item.addEventListener('click', () => {
                        selectLocationResult(place, addrInput, latField, lngField, suggestionsBox);
                    });
                    suggestionsBox.appendChild(item);
                });
            })
            .catch(() => {
                alert('Error connecting to address search service.');
            })
            .finally(() => {
                btnElement.textContent = originalText;
                btnElement.disabled = false;
            });
    }

    function selectLocationResult(place, addrInput, latField, lngField, suggestionsBox) {
        latField.value = parseFloat(place.lat).toFixed(4);
        lngField.value = parseFloat(place.lon).toFixed(4);
        addrInput.value = place.display_name.split(',').slice(0, 3).join(',');
        suggestionsBox.innerHTML = '';
        updateRouteAndMarkers(true);
    }

    btnSearchOrigin.addEventListener('click', () => {
        searchAddress(originAddrInput.value, originAddrInput, originLatInput, originLongInput, originSuggestions, btnSearchOrigin);
    });

    btnSearchDest.addEventListener('click', () => {
        searchAddress(destAddrInput.value, destAddrInput, destLatInput, destLongInput, destSuggestions, btnSearchDest);
    });

    // Permitir pesquisar carregando na tecla Enter dentro do campo de morada
    [originAddrInput, destAddrInput].forEach((input, idx) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (idx === 0) btnSearchOrigin.click();
                else btnSearchDest.click();
            }
        });
    });

    // Atualizar o mapa se o utilizador editar manualmente os inputs de Latitude/Longitude
    [originLatInput, originLongInput, destLatInput, destLongInput].forEach(input => {
        input.addEventListener('change', () => updateRouteAndMarkers(true));
    });

    // Desenha a rota inicial ao abrir a página
    updateRouteAndMarkers(true);


    /* =========================================================
       2. GESTÃO DOS PRODUTOS DA ENCOMENDA
       ========================================================= */
    const btnAddProduct = document.getElementById('btnAddProduct');
    const productSelect = document.getElementById('productSelect');
    const productQty = document.getElementById('productQty');
    const selectedProductsList = document.getElementById('selectedProductsList');
    const orderForm = document.getElementById('orderForm');

    let orderItems = [
        { name: 'Product A', weight: '5kg', vol: '0.02 m²', quantity: 2 }
    ];

    function renderProductList() {
        selectedProductsList.innerHTML = '';

        orderItems.forEach((item, index) => {
            const chip = document.createElement('div');
            chip.className = 'product-chip';
            chip.innerHTML = `
                <span>${item.name} | ${item.weight} | ${item.vol}</span>
                <div>
                    <span class="product-qty-badge">${item.quantity}</span>
                    <button type="button" class="btn-remove-item" data-index="${index}" title="Remove">✕</button>
                </div>
            `;
            selectedProductsList.appendChild(chip);
        });

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                orderItems.splice(idx, 1);
                renderProductList();
            });
        });
    }

    btnAddProduct.addEventListener('click', () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productName = selectedOption.value;
        const qty = parseInt(productQty.value, 10);

        if (!productName) {
            alert('Please select a product from the list.');
            return;
        }

        if (isNaN(qty) || qty <= 0) {
            alert('Quantity must be at least 1 unit.');
            return;
        }

        orderItems.push({
            name: productName,
            weight: selectedOption.getAttribute('data-weight'),
            vol: selectedOption.getAttribute('data-vol'),
            quantity: qty
        });

        renderProductList();
        productSelect.selectedIndex = 0;
        productQty.value = 1;
    });


    /* =========================================================
       3. SUBMISSÃO E VALIDAÇÕES DO FORMULÁRIO (SPRINT 1)
       ========================================================= */
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const originLat = originLatInput.value.trim();
        const originLong = originLongInput.value.trim();
        const destLat = destLatInput.value.trim();
        const destLong = destLongInput.value.trim();

        if (orderItems.length === 0) {
            alert('Error: You must add at least one product to the order.');
            return;
        }

        if (!originLat || !originLong || !destLat || !destLong) {
            alert('Error: All Latitude and Longitude fields (Origin and Destination) are required.');
            return;
        }

        const latRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
        const longRegex = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

        if (!latRegex.test(originLat) || !latRegex.test(destLat)) {
            alert('Error: Invalid Latitude (must be between -90 and 90).');
            return;
        }

        if (!longRegex.test(originLong) || !longRegex.test(destLong)) {
            alert('Error: Invalid Longitude (must be between -180 and 180).');
            return;
        }

        alert('Order submitted successfully! (Status: Initiated)');
        window.location.href = 'my-orders.html';
    });

    renderProductList();
});
