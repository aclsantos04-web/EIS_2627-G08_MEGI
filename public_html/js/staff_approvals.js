document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('courierTableBody');

    if (!tableBody) {
        return;
    }

    // Delegação de eventos na tabela
    tableBody.addEventListener('click', (e) => {
        const btn = e.target;
        const row = btn.closest('tr');
        if (!row) return;

        const courierName = row.querySelector('td').innerText;

        // Ação de Aprovação
        if (btn.classList.contains('btn-approve')) {
            alert(`Courier "${courierName}" foi aprovado com sucesso!`);
            removerLinha(row);
        }

        // Ação de Rejeição
        if (btn.classList.contains('btn-reject')) {
            const confirmed = confirm(`Tem a certeza de que deseja rejeitar o registo de "${courierName}"?`);
            if (confirmed) {
                alert(`Registo de "${courierName}" rejeitado.`);
                removerLinha(row);
            }
        }
    });

    function removerLinha(row) {
        row.remove();

        // Se não restarem couriers pendentes
        if (tableBody.querySelectorAll('tr').length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-table-msg">
                        Não existem pedidos de aprovação de couriers pendentes.
                    </td>
                </tr>
            `;
        }
    }
});
