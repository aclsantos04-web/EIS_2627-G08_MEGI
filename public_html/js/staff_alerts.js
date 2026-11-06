document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('alertsTableBody');
    const docDialog = document.getElementById('docDialog');
    const docDialogDetails = document.getElementById('docDialogDetails');
    const btnCloseDoc = document.getElementById('btnCloseDoc');
    const btnValidateDoc = document.getElementById('btnValidateDoc');

    let currentRow = null;

    if (!tableBody) {
        return;
    }

    tableBody.addEventListener('click', (e) => {
        const btn = e.target;
        const row = btn.closest('tr');
        if (!row) return;

        const regPlate = row.querySelector('td strong').innerText;
        const courierName = row.children[1].innerText;
        const docName = row.children[2].innerText;

        // Botão Notify (envio de alerta ao condutor)
        if (btn.classList.contains('btn-notify')) {
            alert(`Notificação enviada com sucesso a ${courierName} para regularizar o documento "${docName}" do veículo ${regPlate}.`);
        }

        // Botão Review (abrir pop-up com simulação do documento)
        if (btn.classList.contains('btn-review')) {
            currentRow = row;
            docDialogDetails.textContent = `Veículo: ${regPlate} | Courier: ${courierName} | Tipo: ${docName}`;
            if (typeof docDialog.showModal === 'function') {
                docDialog.showModal();
            } else {
                docDialog.setAttribute('open', '');
            }
        }

        // Botão Validate direto na tabela
        if (btn.classList.contains('btn-approve-doc')) {
            alert(`Documento "${docName}" do veículo ${regPlate} validado com sucesso!`);
            removerLinha(row);
        }
    });

    // Validar dentro do modal de auditoria
    if (btnValidateDoc && docDialog) {
        btnValidateDoc.addEventListener('click', () => {
            if (currentRow) {
                alert('Documento auditado e aprovado com sucesso!');
                removerLinha(currentRow);
                currentRow = null;
            }
            fecharModal();
        });
    }

    // Fechar modal
    if (btnCloseDoc && docDialog) {
        btnCloseDoc.addEventListener('click', fecharModal);
    }

    function fecharModal() {
        if (typeof docDialog.close === 'function') {
            docDialog.close();
        } else {
            docDialog.removeAttribute('open');
        }
    }

    function removerLinha(row) {
        row.remove();

        if (tableBody.querySelectorAll('tr').length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table-msg">
                        Todos os documentos estão em conformidade. Não existem alertas pendentes.
                    </td>
                </tr>
            `;
        }
    }
});
