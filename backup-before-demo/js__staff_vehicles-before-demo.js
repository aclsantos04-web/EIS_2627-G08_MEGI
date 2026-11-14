document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('vehicleTableBody');

    if (!tableBody) {
        return;
    }

    tableBody.addEventListener('click', (e) => {
        const btn = e.target;
        const row = btn.closest('tr');
        if (!row) return;

        const licensePlate = row.querySelector('td strong')
            ? row.querySelector('td strong').innerText
            : row.querySelector('td').innerText;

        // Aprovação do veículo
        if (btn.classList.contains('btn-approve')) {
            alert(`Veículo com a matrícula "${licensePlate}" aprovado com sucesso!`);
            removerLinha(row);
        }

        // Rejeição do veículo
        if (btn.classList.contains('btn-reject')) {
            const confirmed = confirm(`Tem a certeza de que deseja rejeitar o veículo "${licensePlate}"?`);
            if (confirmed) {
                alert(`Veículo "${licensePlate}" rejeitado.`);
                removerLinha(row);
            }
        }
    });

    function removerLinha(row) {
        row.remove();

        if (tableBody.querySelectorAll('tr').length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table-msg">
                        Não existem pedidos de aprovação de veículos pendentes.
                    </td>
                </tr>
            `;
        }
    }
});
