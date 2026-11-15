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

// The order comes from the link (?order=1003, sent by Active Route)
// or, if the page was opened from the menu, from the active order (orders.js)
const activeForProof =
    typeof getActiveOrder === "function"
        ? getActiveOrder()
        : null;

const orderId =
    urlParams.get("order") ||
    (activeForProof !== null ? String(activeForProof.id) : "");


/* Obter dados completos da encomenda */
const order =
    orderId && typeof getOrder === "function"
        ? getOrder(orderId)
        : null;

const proofContainer = document.querySelector(".proof-container");
const noDelivery = document.getElementById("noDelivery");

/* A encomenda do POD tem de ser a única encomenda ativa do Courier */
const validActiveOrder =
    activeForProof &&
    order &&
    String(order.id) === String(activeForProof.id) &&
    isMyCourierOrder(order);                     // orders.js

/* Sem encomenda ativa */
if (!activeForProof) {
    proofContainer.hidden = true;

    noDelivery.hidden = false;
    noDelivery.className = "card";

    noDelivery.append(
        createEmptyState(
            "ti-route-off",
            "No active order",
            "Accept an order on Available Orders to see its route, choose a vehicle and start the delivery.",
            {
                text: "See available orders",
                href: "courier-available-orders.html"
            }
        )
    );
}

/* URL inválido ou encomenda diferente da active order */
else if (!validActiveOrder) {
    window.location.href = "courier-active-route.html";
}

/* Existe encomenda ativa, mas falta selecionar veículo */
else if (!order.vehicle) {
    proofContainer.hidden = true;

    noDelivery.hidden = false;
    noDelivery.className = "card";

    noDelivery.append(
        createEmptyState(
            "ti-truck",
            "Vehicle required",
            "Select and confirm a vehicle on Active Route before registering Proof of Delivery.",
            {
                text: "Go to Active Route",
                href: "courier-active-route.html"
            }
        )
    );
}

/* O veículo foi selecionado, mas a entrega ainda não começou */
else if (order.status !== "In Progress") {
    proofContainer.hidden = true;

    noDelivery.hidden = false;
    noDelivery.className = "card";

    noDelivery.append(
        createEmptyState(
            "ti-player-play",
            "Delivery not started",
            "Start the delivery on Active Route before registering Proof of Delivery.",
            {
                text: "Go to Active Route",
                href: "courier-active-route.html"
            }
        )
    );
}

/* Preencher o resumo da encomenda no Proof of Delivery */
else {
    const podOrderNumber = document.getElementById("podOrderNumber");
    const podStatus = document.getElementById("podStatus");
    const podRoute = document.getElementById("podRoute");
    const podPackages = document.getElementById("podPackages");
    const podWeight = document.getElementById("podWeight");
    const podClient = document.getElementById("podClient");
    const podVehicle = document.getElementById("podVehicle");
    const podProducts = document.getElementById("podProducts");

    if (podOrderNumber) {
        podOrderNumber.textContent = "#" + order.id;
    }

    if (podStatus) {
        podStatus.textContent = order.status;
    }

    if (podRoute) {
        podRoute.textContent = order.origin + " → " + order.destination;
    }

    if (podPackages && typeof orderPackages === "function") {
        const packageCount = orderPackages(order);

        podPackages.textContent =
            packageCount +
            (packageCount === 1 ? " package" : " packages");
    }

    if (podWeight && typeof orderWeight === "function") {
        podWeight.textContent = orderWeight(order) + " kg";
    }

    if (podClient) {
        podClient.textContent = order.client || "Not available";
    }

    if (podVehicle) {
        podVehicle.textContent = order.vehicle || "Not assigned";
    }

    if (podProducts) {
        podProducts.innerHTML = "";

        order.products.forEach(function (product) {
            const item = document.createElement("li");

            item.textContent =
                product[0] + " × " + product[1];

            podProducts.appendChild(item);
        });
    }
}


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
    updateConfirmButton();
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

    updateConfirmButton();
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
    updateConfirmButton();

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
        updateConfirmButton();

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


/* Ativar confirmação quando existe uma prova válida */
function updateConfirmButton() {
    if (proofType === "signature") {
        confirmButton.disabled = signatureIsEmpty();
    } else {
        confirmButton.disabled = !capturedPhoto;
    }
}


/* Atualizar botão depois de desenhar a assinatura */
signatureCanvas.addEventListener("mouseup", updateConfirmButton);
signatureCanvas.addEventListener("mouseleave", updateConfirmButton);
signatureCanvas.addEventListener("touchend", updateConfirmButton);


/* Desativar confirmação depois de limpar a assinatura */
clearSignatureButton.addEventListener("click", function () {
    confirmButton.disabled = true;
});


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

    /* A encomenda passa a "Completed" (orders.js): aparece em
       Completed Orders e o cliente vê o novo estado e a prova */
    if (typeof completeOrder === "function") {
        completeOrder(orderId, proofType);
    }

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
if (closeButton) {
    closeButton.addEventListener("click", returnToActiveRoute);
}


/* Desligar a câmara se a página for fechada */
window.addEventListener("beforeunload", function () {
    stopCamera();
});