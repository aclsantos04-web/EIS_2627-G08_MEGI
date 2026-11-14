/* Elementos dos separadores */
const signatureTab = document.getElementById("signatureTab");
const photoTab = document.getElementById("photoTab");
const signaturePanel = document.getElementById("signaturePanel");
const photoPanel = document.getElementById("photoPanel");

/* Elementos da assinatura */
const signatureCanvas = document.getElementById("signatureCanvas");
const clearSignatureButton = document.getElementById("btnClearSignature");

/* Elementos da fotografia */
const openCameraButton = document.getElementById("openCamera");
const captureButton = document.getElementById("capturePhoto");
const cameraPreview = document.getElementById("cameraPreview");
const photoCanvas = document.getElementById("photoCanvas");
const photoInput = document.getElementById("deliveryPhoto");
const photoPreview = document.getElementById("photoPreview");
const photoText = document.getElementById("photoText");

/* Outros botões */
const confirmButton = document.getElementById("confirmDelivery");
const cancelButton = document.getElementById("cancelProof");
const closeButton = document.getElementById("closeProof");
const proofError = document.getElementById("proofError");

/* Tipo de prova selecionado */
let proofType = "signature";

/* Câmara ativa */
let cameraStream = null;

/* Fotografia capturada ou escolhida */
let capturedPhoto = null;


/* ID da encomenda recebido no URL */
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("order") || "1001";


/* Mostrar assinatura */
signatureTab.addEventListener("click", function () {
    proofType = "signature";

    signatureTab.classList.add("active");
    photoTab.classList.remove("active");

    signaturePanel.hidden = false;
    photoPanel.hidden = true;

    clearSignatureButton.hidden = false;
    proofError.textContent = "";

    stopCamera();
});


/* Mostrar fotografia */
photoTab.addEventListener("click", function () {
    proofType = "photo";

    photoTab.classList.add("active");
    signatureTab.classList.remove("active");

    signaturePanel.hidden = true;
    photoPanel.hidden = false;

    clearSignatureButton.hidden = true;
    proofError.textContent = "";
});


/* Abrir a câmara */
openCameraButton.addEventListener("click", async function () {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment"
            },
            audio: false
        });

        cameraPreview.srcObject = cameraStream;
        cameraPreview.hidden = false;

        captureButton.hidden = false;
        openCameraButton.hidden = true;

        photoPreview.style.display = "none";

        photoText.textContent =
                "Position the camera and capture the delivery photo.";

        proofError.textContent = "";

    } catch (error) {
        console.error(error);

        proofError.textContent =
                "Camera access is not available or permission was denied.";
    }
});


/* Tirar fotografia */
captureButton.addEventListener("click", function () {
    if (!cameraStream) {
        return;
    }

    photoCanvas.width = cameraPreview.videoWidth;
    photoCanvas.height = cameraPreview.videoHeight;

    const context = photoCanvas.getContext("2d");

    context.drawImage(
            cameraPreview,
            0,
            0,
            photoCanvas.width,
            photoCanvas.height
    );

    capturedPhoto = photoCanvas.toDataURL("image/jpeg", 0.8);

    photoPreview.src = capturedPhoto;
    photoPreview.style.display = "block";

    photoText.textContent = "Photo captured successfully.";

    stopCamera();

    captureButton.hidden = true;
    openCameraButton.hidden = false;
});


/* Escolher fotografia do computador */
photoInput.addEventListener("change", function () {
    const file = photoInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        proofError.textContent = "Please select a valid image.";
        photoInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", function () {
        capturedPhoto = reader.result;

        photoPreview.src = capturedPhoto;
        photoPreview.style.display = "block";

        photoText.textContent = file.name;
        proofError.textContent = "";

        stopCamera();

        cameraPreview.hidden = true;
        captureButton.hidden = true;
        openCameraButton.hidden = false;
    });

    reader.readAsDataURL(file);
});


/* Desligar a câmara */
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;
    }

    cameraPreview.srcObject = null;
    cameraPreview.hidden = true;
}


/* Verificar se existe assinatura */
function signatureIsEmpty() {
    const emptyCanvas = document.createElement("canvas");

    emptyCanvas.width = signatureCanvas.width;
    emptyCanvas.height = signatureCanvas.height;

    return signatureCanvas.toDataURL() === emptyCanvas.toDataURL();
}


/* Confirmar entrega */
confirmButton.addEventListener("click", function () {
    proofError.textContent = "";

    /* Entrega comprovada com assinatura */
    if (proofType === "signature") {
        if (signatureIsEmpty()) {
            proofError.textContent =
                    "Please provide a signature before confirming the delivery.";
            return;
        }

        const signatureImage = window.getSignatureImage();

        try {
            /* Compatibilidade com Completed Orders atual */
            localStorage.setItem("savedSignature", signatureImage);

            /* Assinatura associada à encomenda */
            localStorage.setItem(
                    "signature_" + orderId,
                    signatureImage
            );

            localStorage.setItem(
                    "podType_" + orderId,
                    "signature"
            );

        } catch (error) {
            console.error(error);

            proofError.textContent =
                    "The signature could not be saved.";
            return;
        }
    }

    /* Entrega comprovada com fotografia */
    if (proofType === "photo") {
        if (!capturedPhoto) {
            proofError.textContent =
                    "Please take or choose a photo before confirming the delivery.";
            return;
        }

        try {
            /* Fotografia associada à encomenda */
            localStorage.setItem(
                    "photo_" + orderId,
                    capturedPhoto
            );

            localStorage.setItem(
                    "savedDeliveryPhoto",
                    capturedPhoto
            );

            localStorage.setItem(
                    "podType_" + orderId,
                    "photo"
            );

        } catch (error) {
            console.error(error);

            proofError.textContent =
                    "The photo could not be saved. Try using a smaller image.";
            return;
        }
    }

    localStorage.setItem("savedPodOrder", orderId);

    stopCamera();

    alert(
            "Order #" +
            orderId +
            " completed successfully."
    );

    window.location.href =
            "courier-completed-orders.html";
});


/* Voltar à rota ativa */
function returnToActiveRoute() {
    stopCamera();

    window.location.href =
            "courier-active-route.html?order=" +
            orderId;
}


/* Cancelar */
cancelButton.addEventListener("click", returnToActiveRoute);


/* Fechar no X */
closeButton.addEventListener("click", returnToActiveRoute);


/* Desligar a câmara se a página for fechada */
window.addEventListener("beforeunload", function () {
    stopCamera();
});
