document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("signatureCanvas");
    const btnClear = document.getElementById("btnClearSignature");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    // Configurações do traço (caneta preta fina)
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Obter as coordenadas exatas do rato dentro do Canvas
    function getCoordinates(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX || (event.touches && event.touches[0].clientX)) - rect.left,
            y: (event.clientY || (event.touches && event.touches[0].clientY)) - rect.top
        };
    }

    // Iniciar traço ao carregar com o rato
    function startDrawing(e) {
        isDrawing = true;
        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (e.type.startsWith('touch')) e.preventDefault();
    }

    // Desenhar a linha enquanto move o rato
    function draw(e) {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        if (e.type.startsWith('touch')) e.preventDefault();
    }

    // Parar de desenhar ao soltar o rato ou sair da área
    function stopDrawing() {
        if (isDrawing) {
            ctx.closePath();
            isDrawing = false;
        }
    }

    // Eventos do Rato
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Suporte a Ecrãs Táteis (tablets/smartphones)
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    // Botão Limpar (Clear)
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }

    // Função global utilitária para quando quiseres exportar a imagem:
    // Retorna a assinatura codificada em formato PNG (base64)
    window.getSignatureImage = function () {
        return canvas.toDataURL("image/png");
    };
});


