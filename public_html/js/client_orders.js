document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================
       1. INICIALIZAÇÃO DO MAPA COM A ROTA REAL (OSRM / Leaflet)
       ========================================================= */
    const mapElement = document.getElementById('map');

    if (mapElement && typeof createRouteMap === 'function') {
        const originCoords = [41.1780, -8.5980];       // FEUP
        const destCoords = [41.1496, -8.6109];         // Baixa / Porto Centro

        createRouteMap(
            'map',
            originCoords,
            destCoords,
            'Location 1 (FEUP)',
            'Location 2 (Porto)'
        );
    }

    /* =========================================================
       2. CONTROLO DO POP-UP DE PROOF OF DELIVERY (<dialog>)
       ========================================================= */
    const btnViewPod = document.getElementById('btnViewPod');
    const btnClosePod = document.getElementById('btnClosePod');
    const podDialog = document.getElementById('podDialog');
    const signatureContainer = document.getElementById('signaturePlaceholder');

    if (btnViewPod && podDialog) {
        btnViewPod.addEventListener('click', () => {
            const savedSignature = localStorage.getItem('savedSignature');

            if (savedSignature && signatureContainer) {
                signatureContainer.innerHTML = `
                    <img src="${savedSignature}" 
                         alt="Proof of Delivery" 
                         style="max-width: 100%; max-height: 140px; object-fit: contain;" />
                `;
            } else if (signatureContainer) {
                signatureContainer.innerHTML = `
                    <span class="text-muted">✍️ Nenhuma assinatura ou foto registada ainda.</span>
                `;
            }

            if (typeof podDialog.showModal === 'function') {
                podDialog.showModal();
            } else {
                podDialog.setAttribute('open', '');
            }
        });
    }

    if (btnClosePod && podDialog) {
        btnClosePod.addEventListener('click', () => {
            if (typeof podDialog.close === 'function') {
                podDialog.close();
            } else {
                podDialog.removeAttribute('open');
            }
        });
    }

    // Fechar ao clicar fora da caixa do modal (<dialog>)
    if (podDialog) {
        podDialog.addEventListener('click', (event) => {
            const rect = podDialog.getBoundingClientRect();
            const isInDialog = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );

            if (!isInDialog) {
                if (typeof podDialog.close === 'function') {
                    podDialog.close();
                } else {
                    podDialog.removeAttribute('open');
                }
            }
        });
    }
});