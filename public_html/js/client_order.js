document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZAR O MAPA COM A NOVA FUNÇÃO DA EQUIPA
    let orderMap = null;

    function updateOrderMap() {
        const originLat = parseFloat(document.getElementById('originLat').value);
        const originLong = parseFloat(document.getElementById('originLong').value);
        const destLat = parseFloat(document.getElementById('destLat').value);
        const destLong = parseFloat(document.getElementById('destLong').value);

        // Só atualiza o mapa quando todas as coordenadas são válidas
        if (
            isNaN(originLat) ||
            isNaN(originLong) ||
            isNaN(destLat) ||
            isNaN(destLong)
        ) {
            return;
        }

        const originCoords = [originLat, originLong];
        const destCoords = [destLat, destLong];

        // Remove o mapa anterior antes de criar um novo
        if (orderMap) {
            orderMap.remove();
        }

        if (typeof createRouteMap === 'function' && document.getElementById('map')) {
            orderMap = createRouteMap(
                'map',
                originCoords,
                destCoords,
                'Origin',
                'Destination'
            );
        }
    }

    // Atualiza a rota sempre que uma coordenada é alterada
    ['originLat', 'originLong', 'destLat', 'destLong'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateOrderMap);
    });

    // Criar o mapa inicial
    updateOrderMap();

    // 2. GESTÃO DOS PRODUTOS DA ENCOMENDA
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
                    <button type="button" class="btn-remove-item" data-index="${index}" title="Remover">✕</button>
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
            alert('Por favor, selecione um produto da lista.');
            return;
        }

        if (isNaN(qty) || qty <= 0) {
            alert('A quantidade deve ser de pelo menos 1 unidade.');
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

    // 3. SUBMISSÃO COM AS VALIDAÇÕES OBRIGATÓRIAS DO SPRINT 1
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const originLat = document.getElementById('originLat').value.trim();
        const originLong = document.getElementById('originLong').value.trim();
        const destLat = document.getElementById('destLat').value.trim();
        const destLong = document.getElementById('destLong').value.trim();

        if (orderItems.length === 0) {
            alert('Erro: Deve adicionar pelo menos um produto à encomenda.');
            return;
        }

        if (!originLat || !originLong || !destLat || !destLong) {
            alert('Erro: Todas as coordenadas de Latitude e Longitude devem ser preenchidas.');
            return;
        }

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

        alert('Encomenda submetida com sucesso! (Estado: Initiated)');
        window.location.href = 'my-orders.html';   // back to the list of orders
    });

    renderProductList();
});