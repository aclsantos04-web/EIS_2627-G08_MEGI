/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */



document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("quote-form");
    const result = document.getElementById("quote-result");

    if (!form || !result) return;

    // Approximate city coordinates for demo pricing
    
const cities = {
    "Almada": [38.68, -9.16],
    "Aveiro": [40.64, -8.65],
    "Barcelos": [41.53, -8.62],
    "Beja": [38.02, -7.86],
    "Braga": [41.55, -8.43],
    "Bragança": [41.81, -6.76],
    "Cascais": [38.70, -9.42],
    "Castelo Branco": [39.82, -7.49],
    "Coimbra": [40.21, -8.43],
    "Évora": [38.57, -7.91],
    "Faro": [37.02, -7.93],
    "Guarda": [40.54, -7.27],
    "Guimarães": [41.44, -8.30],
    "Leiria": [39.74, -8.81],
    "Lisboa": [38.72, -9.14],
    "Maia": [41.23, -8.62],
    "Matosinhos": [41.18, -8.69],
    "Portalegre": [39.30, -7.43],
    "Portimão": [37.14, -8.54],
    "Porto": [41.15, -8.61],
    "Póvoa de Varzim": [41.38, -8.76],
    "Santarém": [39.24, -8.69],
    "Setúbal": [38.52, -8.89],
    "Sintra": [38.80, -9.38],
    "Viana do Castelo": [41.69, -8.83],
    "Vila do Conde": [41.35, -8.75],
    "Vila Nova de Famalicão": [41.41, -8.52],
    "Vila Nova de Gaia": [41.13, -8.61],
    "Vila Real": [41.30, -7.74],
    "Viseu": [40.66, -7.91]
};


const originSelect =
    document.getElementById("quote-origin");

const destinationSelect =
    document.getElementById("quote-destination");

// Add all cities to both dropdowns
Object.keys(cities)
    .sort((a, b) => a.localeCompare(b, "pt-PT"))
    .forEach(function (city) {

        [originSelect, destinationSelect].forEach(function (select) {

            const option = document.createElement("option");

            option.value = city;
            option.textContent = city;

            select.appendChild(option);
        });
    });


    function getDistance(origin, destination) {
        const [lat1, lon1] = cities[origin];
        const [lat2, lon2] = cities[destination];

        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) *
            Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) ** 2;

        return 6371 * 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const origin =
            document.getElementById("quote-origin").value;

        const destination =
            document.getElementById("quote-destination").value;

        const weight =
            Number(document.getElementById("quote-weight").value);

        if (!cities[origin] || !cities[destination] ||
            !Number.isFinite(weight) || weight <= 0) {

            result.textContent =
                "Please enter valid delivery details.";
            return;
        }

        // Illustrative pricing model
        const basePrice = 4.50;
        const weightPrice = weight * 0.90;

        const distance = getDistance(origin, destination);

        let distancePrice = 0;

        if (distance > 300) {
            distancePrice = 10;
        } else if (distance > 100) {
            distancePrice = 6;
        } else if (distance > 0) {
            distancePrice = 3;
        }

        const total =
            basePrice + weightPrice + distancePrice;

        const formattedPrice = total.toLocaleString(
            "pt-PT",
            {
                style: "currency",
                currency: "EUR"
            }
        );

        result.innerHTML = "";

        const title = document.createElement("strong");
        title.textContent = "Estimated Delivery Cost";

        const amount = document.createElement("h2");
        amount.textContent = formattedPrice;

        const details = document.createElement("p");
        details.textContent =
            `${origin} → ${destination} · ${weight} kg`;

        result.append(title, amount, details);
    });

    // Hide previous quote when details change
    form.addEventListener("input", function () {
        result.textContent = "";
    });

    form.addEventListener("change", function () {
        result.textContent = "";
    });

});
