// E-Ticket page script
let stations = [];
let bookingData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    stations = data.stations;
    
    bookingData = getBookingData();
    
    if (!bookingData || !bookingData.pnr) {
        alert('No ticket data found. Redirecting to home page.');
        navigateTo('index.html');
        return;
    }
    
    // Initialize foodItems if not present
    if (!bookingData.foodItems) {
        bookingData.foodItems = [];
    }
    
    displayTicket();
    setupEventListeners();
});

// Display ticket
function displayTicket() {
    const ticketBody = document.getElementById('ticketBody');
    const pnrNumber = document.getElementById('pnrNumber');
    
    pnrNumber.textContent = bookingData.pnr;
    
    const fromStationName = getStationName(bookingData.journey.from);
    const toStationName = getStationName(bookingData.journey.to);
    
    let passengersHtml = '';
    bookingData.passengers.forEach((passenger, index) => {
        passengersHtml += `
            <div class="passenger-item">
                <div class="ticket-info-grid">
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Name</span>
                        <span class="ticket-info-value">${passenger.name}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Age</span>
                        <span class="ticket-info-value">${passenger.age} years</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Gender</span>
                        <span class="ticket-info-value">${passenger.gender}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-info-label">Berth Preference</span>
                        <span class="ticket-info-value">${passenger.berth}</span>
                    </div>
                    ${passenger.concession ? '<div class="ticket-info-item"><span class="ticket-info-label">Concession</span><span class="ticket-info-value">Applied</span></div>' : ''}
                </div>
            </div>
        `;
    });
    
    ticketBody.innerHTML = `
        <div class="ticket-section">
            <h4><i class="fas fa-route"></i> Journey Details</h4>
            <div class="ticket-info-grid">
                <div class="ticket-info-item">
                    <span class="ticket-info-label">From</span>
                    <span class="ticket-info-value">${fromStationName}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">To</span>
                    <span class="ticket-info-value">${toStationName}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Date</span>
                    <span class="ticket-info-value">${formatDate(bookingData.journey.date)}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Quota</span>
                    <span class="ticket-info-value">${bookingData.journey.quota}</span>
                </div>
            </div>
        </div>
        <div class="ticket-section">
            <h4><i class="fas fa-train"></i> Train Details</h4>
            <div class="ticket-info-grid">
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Train Name</span>
                    <span class="ticket-info-value">${bookingData.train.trainName}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Train Number</span>
                    <span class="ticket-info-value">${bookingData.train.trainNumber}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Class</span>
                    <span class="ticket-info-value">${bookingData.train.selectedClass.name}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Departure</span>
                    <span class="ticket-info-value">${bookingData.train.departureTime}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Arrival</span>
                    <span class="ticket-info-value">${bookingData.train.arrivalTime}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Duration</span>
                    <span class="ticket-info-value">${bookingData.train.duration}</span>
                </div>
            </div>
        </div>
        <div class="ticket-section">
            <h4><i class="fas fa-users"></i> Passenger Details</h4>
            <div class="passenger-list">
                ${passengersHtml}
            </div>
        </div>
        <div class="ticket-section">
            <h4><i class="fas fa-phone"></i> Contact Information</h4>
            <div class="ticket-info-grid">
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Mobile</span>
                    <span class="ticket-info-value">${bookingData.contact.mobile}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Email</span>
                    <span class="ticket-info-value">${bookingData.contact.email}</span>
                </div>
            </div>
        </div>
        <div class="ticket-section">
            <h4><i class="fas fa-utensils"></i> Food Items</h4>
            ${bookingData.foodItems && bookingData.foodItems.length > 0 && bookingData.foodItems.some(item => item.quantity > 0) ? 
                `<div class="food-items-ticket">
                    ${bookingData.foodItems.filter(item => item.quantity > 0).map(item => `
                        <div class="food-item-ticket">
                            <span>${item.name} × ${item.quantity}</span>
                            <span>₹${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                    <div class="food-total-ticket">
                        <span>Food Total: ₹${bookingData.foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                    </div>
                </div>` : 
                '<p>No food items ordered.</p>'
            }
        </div>
        <div class="ticket-section">
            <h4><i class="fas fa-rupee-sign"></i> Payment Details</h4>
            <div class="ticket-info-grid">
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Payment Method</span>
                    <span class="ticket-info-value">${bookingData.payment.method}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Ticket Amount</span>
                    <span class="ticket-info-value">₹${bookingData.train.selectedClass.fare * bookingData.passengers.length}</span>
                </div>
                ${bookingData.foodItems && bookingData.foodItems.length > 0 && bookingData.foodItems.some(item => item.quantity > 0) ? 
                    `<div class="ticket-info-item">
                        <span class="ticket-info-label">Food Amount</span>
                        <span class="ticket-info-value">₹${bookingData.foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                    </div>` : ''
                }
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Total Amount</span>
                    <span class="ticket-info-value">₹${bookingData.train.selectedClass.fare * bookingData.passengers.length + (bookingData.foodItems && bookingData.foodItems.length > 0 ? bookingData.foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0)}</span>
                </div>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('downloadTicket').addEventListener('click', downloadTicket);
    document.getElementById('newBooking').addEventListener('click', resetBooking);
}

// Download ticket
function downloadTicket() {
    const ticket = document.getElementById('eTicket');
    const printWindow = window.open('', '', 'height=800,width=1200');
    printWindow.document.write(`
        <html>
            <head>
                <title>E-Ticket - ${bookingData.pnr}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .ticket-header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; border-radius: 10px; }
                    .ticket-body { padding: 20px; }
                    .ticket-section { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #ccc; }
                    .ticket-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px; }
                </style>
            </head>
            <body>
                ${ticket.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Reset booking
function resetBooking() {
    clearBookingData();
    navigateTo('index.html');
}

