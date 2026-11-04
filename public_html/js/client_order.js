document.addEventListener('DOMContentLoaded', () => {
    const btnAddProduct = document.getElementById('btnAddProduct');
    const productSelect = document.getElementById('productSelect');
    const productQty = document.getElementById('productQty');
    const selectedProductsList = document.getElementById('selectedProductsList');
    const orderForm = document.getElementById('orderForm');

    // Array com os itens da encomenda
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
                    <button type="button" class="btn-remove-item" data-index="${index}" title="Remover">✕</button>
                </div>
            `;
            selectedProductsList.appendChild(chip);
        });

        // Configurar botões de eliminação
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                orderItems.splice(idx, 1);
                renderProductList();
            });
        });
    }

    // Adicionar novo produto à lista
    btnAddProduct.addEventListener('click', () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productName = selectedOption.value;
        const qty = parseInt(productQty.value, 10);

        if (!productName) {
            alert('Por favor, selecione um produto da lista.');
            return;
        }

        if (isNaN(qty) || qty <= 0) {
            alert('A quantidade deve ser de pelo menos 1 unidade.');
            return;
        }

        const weight = selectedOption.getAttribute('data-weight');
        const vol = selectedOption.getAttribute('data-vol');

        orderItems.push({
            name: productName,
            weight: weight,
            vol: vol,
            quantity: qty
        });

        renderProductList();

        productSelect.selectedIndex = 0;
        productQty.value = 1;
    });

    // Submissão com Validações do Enunciado
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const originLat = document.getElementById('originLat').value.trim();
        const originLong = document.getElementById('originLong').value.trim();
        const destLat = document.getElementById('destLat').value.trim();
        const destLong = document.getElementById('destLong').value.trim();

        // 1. Validar se há produtos associados
        if (orderItems.length === 0) {
            alert('Erro: Deve adicionar pelo menos um produto à encomenda.');
            return;
        }

        // 2. Validar preenchimento dos campos de coordenadas
        if (!originLat || !originLong || !destLat || !destLong) {
            alert('Erro: Todas as coordenadas de Latitude e Longitude (Origem e Destino) são obrigatórias.');
            return;
        }

        // 3. Validação numérica das coordenadas GPS
        const latRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
        const longRegex = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

        if (!latRegex.test(originLat) || !latRegex.test(destLat)) {
            alert('Erro: Latitude inválida (deve estar entre -90 e 90).');
            return;
        }

        if (!longRegex.test(originLong) || !longRegex.test(destLong)) {
            alert('Erro: Longitude inválida (deve estar entre -180 e 180).');
            return;
        }

        // Sucesso na submissão
        alert('Encomenda submetida com sucesso! Estado atribuído: Initiated.');
        orderForm.reset();
        orderItems = [];
        renderProductList();
    });

    // Renderizar o estado inicial
    renderProductList();
});
