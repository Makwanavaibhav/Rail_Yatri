// Payment page script
let stations = [];
let bookingData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    stations = data.stations;
    
    bookingData = getBookingData();
    
    if (!bookingData || !bookingData.passengers || bookingData.passengers.length === 0) {
        alert('No passenger data found. Redirecting to home page.');
        navigateTo('index.html');
        return;
    }
    
    // Initialize foodItems if not present
    if (!bookingData.foodItems) {
        bookingData.foodItems = [];
    }
    
    displayBookingSummary();
    setupPaymentMethods();
});

// Display booking summary
function displayBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const journey = bookingData.journey;
    const train = bookingData.train;
    const fromName = getStationName(journey.from);
    const toName = getStationName(journey.to);
    const fare = train.selectedClass.fare;
    const ticketFare = fare * bookingData.passengers.length;
    
    // Calculate food total
    let foodTotal = 0;
    if (bookingData.foodItems && bookingData.foodItems.length > 0) {
        foodTotal = bookingData.foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    const grandTotal = ticketFare + foodTotal;
    
    let foodItemsHtml = '';
    if (bookingData.foodItems && bookingData.foodItems.length > 0) {
        const itemsWithQuantity = bookingData.foodItems.filter(item => item.quantity > 0);
        if (itemsWithQuantity.length > 0) {
            foodItemsHtml = '<div class="summary-item"><span>Food Items:</span><span>';
            itemsWithQuantity.forEach((item, index) => {
                foodItemsHtml += `${item.name} (${item.quantity})`;
                if (index < itemsWithQuantity.length - 1) foodItemsHtml += ', ';
            });
            foodItemsHtml += '</span></div>';
            foodItemsHtml += `<div class="summary-item"><span>Food Total:</span><span>₹${foodTotal}</span></div>`;
        }
    }
    
    summary.innerHTML = `
        <h3><i class="fas fa-receipt"></i> Booking Summary</h3>
        <div class="summary-item">
            <span>Route:</span>
            <span>${fromName} → ${toName}</span>
        </div>
        <div class="summary-item">
            <span>Train:</span>
            <span>${train.trainName} (${train.trainNumber})</span>
        </div>
        <div class="summary-item">
            <span>Class:</span>
            <span>${train.selectedClass.name}</span>
        </div>
        <div class="summary-item">
            <span>Date:</span>
            <span>${formatDate(journey.date)}</span>
        </div>
        <div class="summary-item">
            <span>Quota:</span>
            <span>${journey.quota}</span>
        </div>
        <div class="summary-item">
            <span>Passengers:</span>
            <span>${bookingData.passengers.length}</span>
        </div>
        <div class="summary-item">
            <span>Fare per person:</span>
            <span>₹${fare}</span>
        </div>
        <div class="summary-item">
            <span>Ticket Total:</span>
            <span>₹${ticketFare}</span>
        </div>
        ${foodItemsHtml}
        <div class="summary-item">
            <span>Grand Total:</span>
            <span>₹${grandTotal}</span>
        </div>
    `;
}

// Setup payment methods
function setupPaymentMethods() {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            bookingData.payment = { method: option.dataset.method };
            document.getElementById('paymentDetails').classList.remove('hidden');
        });
    });
    
    document.getElementById('confirmPayment').addEventListener('click', confirmPayment);
}

// Confirm payment
function confirmPayment() {
    if (!bookingData.payment) {
        alert('Please select a payment method');
        return;
    }
    
    const paymentInfo = document.getElementById('paymentInfo').value;
    if (!paymentInfo) {
        alert('Please enter payment information');
        return;
    }
    
    // Simulate payment processing
    const btn = document.getElementById('confirmPayment');
    btn.innerHTML = '<span class="loading"></span> Processing...';
    btn.disabled = true;
    
    setTimeout(() => {
        // Generate PNR
        bookingData.pnr = generatePNR();
        bookingData.payment.info = paymentInfo;
        
        saveBookingData(bookingData);
        
        // Navigate to ticket page
        navigateTo('ticket.html');
    }, 2000);
}

