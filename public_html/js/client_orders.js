document.addEventListener('DOMContentLoaded', () => {
    const btnViewPod = document.getElementById('btnViewPod');
    const btnClosePod = document.getElementById('btnClosePod');
    const podModal = document.getElementById('podModal');

    // Abre o pop-up com o comprovativo de entrega
    btnViewPod.addEventListener('click', () => {
        podModal.classList.add('open');
    });

    // Fecha ao carregar no botão
    btnClosePod.addEventListener('click', () => {
        podModal.classList.remove('open');
    });

    // Fecha ao carregar fora da caixa
    podModal.addEventListener('click', (e) => {
        if (e.target === podModal) {
            podModal.classList.remove('open');
        }
    });
});


