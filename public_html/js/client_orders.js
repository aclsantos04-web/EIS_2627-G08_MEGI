document.addEventListener('DOMContentLoaded', () => {
    const btnViewPod = document.getElementById('btnViewPod');
    const btnClosePod = document.getElementById('btnClosePod');
    const podModal = document.getElementById('podModal');
    const signatureContainer = document.querySelector('.signature-placeholder');

    if (!btnViewPod || !podModal) {
        return;
    }

    // Abre o pop-up e carrega a assinatura se existir no localStorage
    btnViewPod.addEventListener('click', () => {
        const savedSignature = localStorage.getItem('savedSignature');

        if (savedSignature && signatureContainer) {
            signatureContainer.innerHTML = `
                <img src="${savedSignature}" 
                     alt="Proof of Delivery Signature" 
                     style="max-width: 100%; max-height: 110px; object-fit: contain;" />
            `;
        } else if (signatureContainer) {
            signatureContainer.innerHTML = '<span>✍️ Assinatura Digital / Foto de Entrega</span>';
        }

        podModal.classList.add('open');
    });

    // Fecha ao carregar no botão Fechar
    if (btnClosePod) {
        btnClosePod.addEventListener('click', () => {
            podModal.classList.remove('open');
        });
    }

    // Fecha ao carregar fora da caixa (no overlay escuro)
    podModal.addEventListener('click', (e) => {
        if (e.target === podModal) {
            podModal.classList.remove('open');
        }
    });
});

