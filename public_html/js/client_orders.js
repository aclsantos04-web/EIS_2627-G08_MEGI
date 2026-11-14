/* =========================================================
   client_orders.js — ORDER DETAILS (client_orders.html)
   The order to show comes from the link, e.g.
       client_orders.html?order=1002
   (the "View" buttons on My Orders link here).
   1. Orders: from js/orders.js (shared with the courier pages)
   2. Read which order was asked for
   3. Fill the page: title, status steps, information, map
   4. Proof of Delivery pop-up (<dialog>)
   ========================================================= */

/* ---------------------------------------------------------
   1. THE ORDERS come from js/orders.js (getOrder), the same
   data as My Orders and the courier pages.
   --------------------------------------------------------- */
const STATUS_STEPS = ["Initiated", "In Progress", "Completed"];


document.addEventListener('DOMContentLoaded', () => {

    /* ---------------------------------------------------------
       2. WHICH ORDER? ?order=1002 in the address -> "1002"
       URLSearchParams reads the part of the address after "?".
       No number in the link -> show order 1001.
       --------------------------------------------------------- */
    const parameters = new URLSearchParams(window.location.search);
    const orderId = parameters.get('order') || '1001';
    const order = getOrder(orderId);                     // orders.js

    // Unknown number: a clear message instead of a broken page
    if (order === undefined) {
        document.getElementById('orderTitle').textContent = 'Order not found';
        document.querySelector('.status-tracker-container').hidden = true;
        const details = document.getElementById('orderDetails');
        details.innerHTML = '';
        const message = document.createElement('p');
        message.className = 'text-muted';
        message.textContent = 'There is no order #' + orderId + '. Go back to My Orders and choose an order from the list.';
        details.append(message);
        return;
    }

    /* ---------------------------------------------------------
       3. FILL THE PAGE
       --------------------------------------------------------- */
    document.title = 'CMS - Order #' + orderId;
    document.getElementById('orderTitle').textContent = 'Order #' + orderId + ' · ' + orderDate(order.created);
    document.getElementById('originValue').textContent = order.origin + ' (' + order.originCoords.join(' ; ') + ')';
    document.getElementById('destinationValue').textContent = order.destination + ' (' + order.destinationCoords.join(' ; ') + ')';
    const courierText = order.courier === null
        ? (order.status === 'Cancelled' ? '—' : 'Not assigned yet')
        : order.courier + (order.vehicle ? ' (' + order.vehicle + ')' : '');
    document.getElementById('courierValue').textContent = courierText;

    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    order.products.forEach((product) => {
        const item = document.createElement('li');
        item.textContent = productText(product);         // orders.js
        productsList.append(item);
    });

    renderStatusSteps(order.status);

    // Proof of Delivery only exists for delivered orders
    const podAction = document.getElementById('podAction');
    if (order.status !== 'Completed') {
        podAction.innerHTML = '';
        const note = document.createElement('p');
        note.className = 'text-muted';
        note.textContent = order.status === 'Cancelled'
            ? 'This order was cancelled, so there is no proof of delivery.'
            : 'The proof of delivery will be available once the order is delivered.';
        podAction.append(note);
    }
    document.getElementById('podOrder').textContent = '#' + orderId;
    document.getElementById('podCourier').textContent = order.courier || '—';

    // Map with the route between the two cities (map.js)
    const mapElement = document.getElementById('map');
    if (mapElement && typeof createRouteMap === 'function') {
        createRouteMap('map', order.originCoords, order.destinationCoords, order.origin, order.destination);
    }

    /* ---------------------------------------------------------
       4. PROOF OF DELIVERY POP-UP (<dialog>)
       --------------------------------------------------------- */
    const btnViewPod = document.getElementById('btnViewPod');
    const btnClosePod = document.getElementById('btnClosePod');
    const podDialog = document.getElementById('podDialog');
    const signatureContainer = document.getElementById('signaturePlaceholder');

    if (btnViewPod && podDialog) {
        btnViewPod.addEventListener('click', () => {
            // The proof saved by the courier for THIS order
            // (courier-proof-delivery.html saves signature_ID or photo_ID)
            let savedSignature = null;
            try {
                savedSignature = localStorage.getItem('signature_' + orderId) ||
                    localStorage.getItem('photo_' + orderId);
            } catch (error) {
                savedSignature = null;
            }
            signatureContainer.innerHTML = '';

            if (savedSignature) {
                const image = document.createElement('img');
                image.src = savedSignature;
                image.alt = 'Proof of Delivery';
                image.style.maxWidth = '100%';
                image.style.maxHeight = '140px';
                image.style.objectFit = 'contain';
                signatureContainer.append(image);
            } else {
                const empty = document.createElement('span');
                empty.className = 'text-muted';
                empty.textContent = order.deliveredOn
                    ? '✍️ Signed by the recipient on ' + orderDate(order.deliveredOn) + '. (Sample order: the image is not stored.)'
                    : '✍️ No signature or photo saved yet.';
                signatureContainer.append(empty);
            }
            podDialog.showModal();
        });
    }

    if (btnClosePod && podDialog) {
        btnClosePod.addEventListener('click', () => podDialog.close());
    }

    // Close when clicking outside the box (on the dark background)
    if (podDialog) {
        podDialog.addEventListener('click', (event) => {
            if (event.target === podDialog) {
                podDialog.close();
            }
        });
    }
});


/* ---------------------------------------------------------
   Draws the status steps:
   Initiated -> In Progress -> Completed, or
   Initiated -> Cancelled (in red) for a cancelled order.
   --------------------------------------------------------- */
function renderStatusSteps(status) {
    const tracker = document.getElementById('statusTracker');
    const line = document.getElementById('trackerLine');

    // remove the old steps, keep the line
    tracker.querySelectorAll('.step').forEach((step) => step.remove());

    let steps;
    if (status === 'Cancelled') {
        steps = [
            { label: 'Initiated', state: 'completed', mark: '✓' },
            { label: 'Cancelled', state: 'cancelled', mark: '✕' }
        ];
        line.style.width = '100%';
        line.style.backgroundColor = 'var(--danger)';
    } else {
        const reached = STATUS_STEPS.indexOf(status);   // 0, 1 or 2
        steps = STATUS_STEPS.map((label, index) => {
            if (index < reached || status === 'Completed') {
                return { label: label, state: 'completed', mark: '✓' };
            }
            if (index === reached) {
                return { label: label, state: 'current', mark: String(index + 1) };
            }
            return { label: label, state: '', mark: String(index + 1) };
        });
        // the green line goes as far as the current step
        line.style.width = (reached / (STATUS_STEPS.length - 1) * 100) + '%';
    }

    steps.forEach((step) => {
        const element = document.createElement('div');
        element.className = 'step' + (step.state ? ' ' + step.state : '');

        const circle = document.createElement('div');
        circle.className = 'step-circle';
        circle.textContent = step.mark;

        const label = document.createElement('span');
        label.className = 'step-label';
        label.textContent = step.label;

        element.append(circle, label);
        tracker.append(element);
    });
}
