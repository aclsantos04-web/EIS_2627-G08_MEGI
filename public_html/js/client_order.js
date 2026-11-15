document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================
       HELPER FUNCTIONS FOR INLINE ERROR MESSAGES (NO ALERTS)
       ========================================================= */
    function showFieldError(errorId, inputEl, message) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        if (inputEl) {
            inputEl.classList.add('invalid');
        }
    }

    function clearFieldError(errorId, inputEl) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
        if (inputEl) {
            inputEl.classList.remove('invalid');
        }
    }

    /* =========================================================
       1. INTERACTIVE MAP + ADDRESS SEARCH + ROUTE DISTANCE
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
    const legendDistance = document.getElementById('legendDistance');

    let clickMode = 'origin';
    let currentRouteKm = 4;

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

    function calcStraightDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function updateRouteAndMarkers(fitMap = true) {
        const oLat = parseFloat(originLatInput.value);
        const oLng = parseFloat(originLongInput.value);
        const dLat = parseFloat(destLatInput.value);
        const dLng = parseFloat(destLongInput.value);

        if (isNaN(oLat) || isNaN(oLng) || isNaN(dLat) || isNaN(dLng)) {
            updateServicePricing();
            return;
        }

        const oCoords = [oLat, oLng];
        const dCoords = [dLat, dLng];

        originMarker.setLatLng(oCoords);
        destMarker.setLatLng(dCoords);

        // Set initial straight distance immediately before OSRM responds
        currentRouteKm = Math.max(1, Math.round(calcStraightDistanceKm(oLat, oLng, dLat, dLng)));
        if (legendDistance) legendDistance.textContent = `${currentRouteKm} km`;
        updateServicePricing();

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
                    currentRouteKm = Math.max(1, Math.round(data.routes[0].distance / 1000));
                } else {
                    routeLayer = L.polyline([oCoords, dCoords], {
                        color: '#1B4B91', weight: 4, dashArray: '8, 8'
                    }).addTo(map);
                }

                if (legendDistance) legendDistance.textContent = `${currentRouteKm} km`;
                updateServicePricing();

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

    function fillAddressFromCoords(lat, lng, targetInput) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.display_name) {
                    targetInput.value = data.display_name.split(',').slice(0, 3).join(',');
                }
            })
            .catch(() => {});
    }

    map.on('click', (e) => {
        const lat = e.latlng.lat.toFixed(4);
        const lng = e.latlng.lng.toFixed(4);

        if (clickMode === 'origin') {
            originLatInput.value = lat;
            originLongInput.value = lng;
            clearFieldError('originLatError', originLatInput);
            clearFieldError('originLongError', originLongInput);
            originSuggestions.innerHTML = '';
            fillAddressFromCoords(lat, lng, originAddrInput);
            updateRouteAndMarkers(false);
            setClickMode('destination');
        } else {
            destLatInput.value = lat;
            destLongInput.value = lng;
            clearFieldError('destLatError', destLatInput);
            clearFieldError('destLongError', destLongInput);
            destSuggestions.innerHTML = '';
            fillAddressFromCoords(lat, lng, destAddrInput);
            updateRouteAndMarkers(false);
            setClickMode('origin');
        }
    });

    function searchAddress(query, addrInput, errorId, latField, lngField, suggestionsBox, btnElement) {
        clearFieldError(errorId, addrInput);
        const trimmed = query.trim();

        if (!trimmed) {
            showFieldError(errorId, addrInput, 'Please enter an address to search.');
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
                    showFieldError(errorId, addrInput, 'No address found in Portugal. Try adding the city (e.g. "Aliados, Porto").');
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
                showFieldError(errorId, addrInput, 'Unable to reach the address search service right now.');
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
        clearFieldError('originLatError', originLatInput);
        clearFieldError('originLongError', originLongInput);
        clearFieldError('destLatError', destLatInput);
        clearFieldError('destLongError', destLongInput);
        updateRouteAndMarkers(true);
    }

    btnSearchOrigin.addEventListener('click', () => {
        searchAddress(originAddrInput.value, originAddrInput, 'originAddrError', originLatInput, originLongInput, originSuggestions, btnSearchOrigin);
    });

    btnSearchDest.addEventListener('click', () => {
        searchAddress(destAddrInput.value, destAddrInput, 'destAddrError', destLatInput, destLongInput, destSuggestions, btnSearchDest);
    });

    originAddrInput.addEventListener('input', () => clearFieldError('originAddrError', originAddrInput));
    destAddrInput.addEventListener('input', () => clearFieldError('destAddrError', destAddrInput));

    [originAddrInput, destAddrInput].forEach((input, idx) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (idx === 0) btnSearchOrigin.click();
                else btnSearchDest.click();
            }
        });
    });

    [originLatInput, originLongInput, destLatInput, destLongInput].forEach(input => {
        input.addEventListener('change', () => updateRouteAndMarkers(true));
        input.addEventListener('input', () => {
            clearFieldError(input.id + 'Error', input);
            updateServicePricing();
        });
    });


    /* =========================================================
       2. PACKAGE PRODUCTS MANAGEMENT (WEIGHT & VOLUME IN m³)
       ========================================================= */
    const btnAddProduct = document.getElementById('btnAddProduct');
    const productSelect = document.getElementById('productSelect');
    const productQty = document.getElementById('productQty');
    const selectedProductsList = document.getElementById('selectedProductsList');
    const totalWeightDisplay = document.getElementById('totalWeightDisplay');
    const totalVolumeDisplay = document.getElementById('totalVolumeDisplay');

    let orderItems = [
        { name: 'Product A', weight: 5, vol: 0.02, quantity: 2 }
    ];

    function getCargoTotals() {
        let totalWeight = 0;
        let totalVol = 0;
        orderItems.forEach(item => {
            totalWeight += item.weight * item.quantity;
            totalVol += item.vol * item.quantity;
        });
        return { totalWeight, totalVol };
    }

    function renderProductList() {
        selectedProductsList.innerHTML = '';

        orderItems.forEach((item, index) => {
            const chip = document.createElement('div');
            chip.className = 'product-chip';
            chip.innerHTML = `
                <span>${item.name} | ${item.weight} kg | ${item.vol} m³</span>
                <div>
                    <span class="product-qty-badge">${item.quantity}</span>
                    <button type="button" class="btn-remove-item" data-index="${index}" title="Remove">✕</button>
                </div>
            `;
            selectedProductsList.appendChild(chip);
        });

        const { totalWeight, totalVol } = getCargoTotals();
        if (totalWeightDisplay) totalWeightDisplay.textContent = `${totalWeight.toFixed(1)} kg`;
        if (totalVolumeDisplay) totalVolumeDisplay.textContent = `${totalVol.toFixed(3)} m³`;

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                orderItems.splice(idx, 1);
                renderProductList();
                updateServicePricing();
            });
        });

        if (orderItems.length > 0) {
            clearFieldError('productError', productSelect);
        }
    }

    btnAddProduct.addEventListener('click', () => {
        clearFieldError('productError', productSelect);
        clearFieldError('productError', productQty);

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productName = selectedOption.value;
        const qty = parseInt(productQty.value, 10);

        if (!productName) {
            showFieldError('productError', productSelect, 'Please select a product from the list.');
            return;
        }

        if (isNaN(qty) || qty <= 0) {
            showFieldError('productError', productQty, 'Quantity must be at least 1 unit.');
            return;
        }

        orderItems.push({
            name: productName,
            weight: parseFloat(selectedOption.getAttribute('data-weight')),
            vol: parseFloat(selectedOption.getAttribute('data-vol')),
            quantity: qty
        });

        renderProductList();
        updateServicePricing();
        productSelect.selectedIndex = 0;
        productQty.value = 1;
    });

    productSelect.addEventListener('change', () => clearFieldError('productError', productSelect));
    productQty.addEventListener('input', () => clearFieldError('productError', productQty));


    /* =========================================================
       3. DELIVERY SERVICE SELECTION (MATCHING cms-home.html FORMULA)
       ========================================================= */
    const serviceCards = document.querySelectorAll('.service-option-card');
    const serviceButtons = document.querySelectorAll('.service-select-btn');
    const serviceOptionsGrid = document.getElementById('serviceOptionsGrid');
    const serviceLockedHint = document.getElementById('serviceLockedHint');

    const priceStandardEl = document.getElementById('priceStandard');
    const priceExpressEl = document.getElementById('priceExpress');
    const priceSameDayEl = document.getElementById('priceSameDay');

    const summaryDistanceEl = document.getElementById('summaryDistance');
    const summaryEtaEl = document.getElementById('summaryEta');
    const summaryPriceEl = document.getElementById('summaryPrice');

    let selectedService = 'Express';

    // Exact same multipliers as cms-home.html
    const SERVICE_CONFIG = {
        'Standard': { multiplier: 1.0, eta: '2 – 3 business days', priceEl: priceStandardEl },
        'Express':  { multiplier: 1.5, eta: 'Next business day',   priceEl: priceExpressEl },
        'Same Day': { multiplier: 2.2, eta: '4 – 6 hours',         priceEl: priceSameDayEl }
    };

    function hasValidInputsForPricing() {
        const oLat = parseFloat(originLatInput.value);
        const oLng = parseFloat(originLongInput.value);
        const dLat = parseFloat(destLatInput.value);
        const dLng = parseFloat(destLongInput.value);
        return orderItems.length > 0 && !isNaN(oLat) && !isNaN(oLng) && !isNaN(dLat) && !isNaN(dLng);
    }

    function updateServicePricing() {
        if (!hasValidInputsForPricing()) {
            if (serviceOptionsGrid) serviceOptionsGrid.classList.add('is-disabled');
            if (serviceLockedHint) serviceLockedHint.hidden = false;
            if (summaryDistanceEl) summaryDistanceEl.textContent = '-- km';
            if (summaryPriceEl) summaryPriceEl.textContent = '€--.--';
            return;
        }

        if (serviceOptionsGrid) serviceOptionsGrid.classList.remove('is-disabled');
        if (serviceLockedHint) serviceLockedHint.hidden = true;

        const { totalWeight } = getCargoTotals();

        // Exact same pricing formula as cms-home.html
        const distanceFee =
            currentRouteKm > 300 ? 10 :
            currentRouteKm > 100 ? 6 :
            currentRouteKm > 0 ? 3 : 0;

        const standardPrice = 4.50 + (0.90 * totalWeight) + distanceFee;

        const prices = {};
        Object.keys(SERVICE_CONFIG).forEach(name => {
            const calculated = standardPrice * SERVICE_CONFIG[name].multiplier;
            prices[name] = calculated;
            if (SERVICE_CONFIG[name].priceEl) {
                SERVICE_CONFIG[name].priceEl.textContent = `€${calculated.toFixed(2)}`;
            }
        });

        if (summaryDistanceEl) summaryDistanceEl.textContent = `${currentRouteKm} km`;
        if (selectedService && SERVICE_CONFIG[selectedService]) {
            if (summaryEtaEl) summaryEtaEl.textContent = SERVICE_CONFIG[selectedService].eta;
            if (summaryPriceEl) summaryPriceEl.textContent = `€${prices[selectedService].toFixed(2)}`;
        }
    }

    function selectDeliveryService(serviceName) {
        selectedService = serviceName;
        clearFieldError('serviceError', null);

        serviceCards.forEach(card => {
            const isMatch = card.getAttribute('data-service') === serviceName;
            card.classList.toggle('selected', isMatch);
        });

        serviceButtons.forEach(btn => {
            const isMatch = btn.getAttribute('data-service') === serviceName;
            btn.textContent = isMatch ? '✓ Selected' : 'Select';
            btn.classList.toggle('is-selected', isMatch);
        });

        updateServicePricing();
    }

    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            selectDeliveryService(card.getAttribute('data-service'));
        });
    });


    /* =========================================================
       4. FORM SUBMISSION & INLINE VALIDATIONS (NO ALERTS)
       ========================================================= */
    const orderForm = document.getElementById('orderForm');

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        clearFieldError('productError', productSelect);
        clearFieldError('originLatError', originLatInput);
        clearFieldError('originLongError', originLongInput);
        clearFieldError('destLatError', destLatInput);
        clearFieldError('destLongError', destLongInput);
        clearFieldError('serviceError', null);

        if (orderItems.length === 0) {
            showFieldError('productError', productSelect, 'Please add at least one product to the order.');
            isValid = false;
        }

        const originLat = originLatInput.value.trim();
        const originLong = originLongInput.value.trim();
        const destLat = destLatInput.value.trim();
        const destLong = destLongInput.value.trim();

        const latRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
        const longRegex = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

        if (!originLat) {
            showFieldError('originLatError', originLatInput, 'Origin latitude is required.');
            isValid = false;
        } else if (!latRegex.test(originLat)) {
            showFieldError('originLatError', originLatInput, 'Latitude must be between -90 and 90.');
            isValid = false;
        }

        if (!originLong) {
            showFieldError('originLongError', originLongInput, 'Origin longitude is required.');
            isValid = false;
        } else if (!longRegex.test(originLong)) {
            showFieldError('originLongError', originLongInput, 'Longitude must be between -180 and 180.');
            isValid = false;
        }

        if (!destLat) {
            showFieldError('destLatError', destLatInput, 'Destination latitude is required.');
            isValid = false;
        } else if (!latRegex.test(destLat)) {
            showFieldError('destLatError', destLatInput, 'Latitude must be between -90 and 90.');
            isValid = false;
        }

        if (!destLong) {
            showFieldError('destLongError', destLongInput, 'Destination longitude is required.');
            isValid = false;
        } else if (!longRegex.test(destLong)) {
            showFieldError('destLongError', destLongInput, 'Longitude must be between -180 and 180.');
            isValid = false;
        }

        if (!selectedService) {
            showFieldError('serviceError', null, 'Please select a delivery service (Standard, Express, or Same Day).');
            isValid = false;
        }

        if (!isValid) return;

        /* Guardar a encomenda (js/orders.js): fica "Initiated" e aparece
           logo em My Orders e nas Available Orders dos couriers,
           com o serviço escolhido (Standard / Express / Same Day) e o preço */
        if (typeof createOrder === 'function') {
            const placeName = (inputId, lat, long) => {
                const input = document.getElementById(inputId);
                const text = input ? input.value.trim() : '';
                return text !== '' ? text.split(',')[0] : lat + ', ' + long;
            };
            const { totalWeight } = getCargoTotals();
            const distanceFee =
                currentRouteKm > 300 ? 10 :
                currentRouteKm > 100 ? 6 :
                currentRouteKm > 0 ? 3 : 0;
            const price = (4.50 + 0.90 * totalWeight + distanceFee) * SERVICE_CONFIG[selectedService].multiplier;

            createOrder({
                client: 'Marta Ferreira',
                origin: placeName('originAddress', originLat, originLong),
                originCoords: [Number(originLat), Number(originLong)],
                destination: placeName('destAddress', destLat, destLong),
                destinationCoords: [Number(destLat), Number(destLong)],
                distanceKm: Math.round(calcStraightDistanceKm(
                    Number(originLat), Number(originLong), Number(destLat), Number(destLong))),
                service: selectedService,
                price: Math.round(price * 100) / 100,
                products: orderItems.map((item) => [item.name, item.quantity, item.weight, item.vol])
            });
        }

        window.location.href = 'my-orders.html';
    });

    // Initial render
    renderProductList();
    updateRouteAndMarkers(true);
});