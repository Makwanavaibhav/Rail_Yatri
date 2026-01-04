// Global state
let bookingData = {
    journey: null,
    train: null,
    passengers: [],
    contact: null,
    payment: null,
    pnr: null
};

let stations = [];
let trains = [];
let selectedTrain = null;
let selectedClass = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeForm();
    setupEventListeners();
    setMinDate();
});

// Load JSON data
async function loadData() {
    try {
        const [stationsRes, trainsRes] = await Promise.all([
            fetch('assets/data/stations.json'),
            fetch('assets/data/trains.json')
        ]);
        
        stations = await stationsRes.json();
        trains = await trainsRes.json();
        
        populateStations();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Please refresh the page.');
    }
}

// Populate station dropdowns
function populateStations() {
    const fromSelect = document.getElementById('fromStation');
    const toSelect = document.getElementById('toStation');
    
    stations.forEach(station => {
        const option1 = new Option(`${station.name} (${station.code})`, station.code);
        const option2 = new Option(`${station.name} (${station.code})`, station.code);
        fromSelect.add(option1);
        toSelect.add(option2);
    });
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('journeyDate').setAttribute('min', today);
}

// Initialize form
function initializeForm() {
    // Add first passenger form
    addPassengerForm(1);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('swapStations').addEventListener('click', swapStations);
    document.getElementById('searchTrains').addEventListener('click', searchTrains);
    document.getElementById('addPassenger').addEventListener('click', () => {
        const passengerCount = document.querySelectorAll('.passenger-form').length;
        addPassengerForm(passengerCount + 1);
    });
    document.getElementById('proceedToPayment').addEventListener('click', proceedToPayment);
    document.getElementById('confirmPayment').addEventListener('click', confirmPayment);
    document.getElementById('downloadTicket').addEventListener('click', downloadTicket);
    document.getElementById('newBooking').addEventListener('click', resetBooking);
}

// Swap stations
function swapStations() {
    const fromStation = document.getElementById('fromStation');
    const toStation = document.getElementById('toStation');
    const temp = fromStation.value;
    fromStation.value = toStation.value;
    toStation.value = temp;
}

// Search trains
function searchTrains() {
    const fromStation = document.getElementById('fromStation').value;
    const toStation = document.getElementById('toStation').value;
    const journeyDate = document.getElementById('journeyDate').value;
    const quota = document.getElementById('quota').value;
    
    if (!fromStation || !toStation || !journeyDate) {
        alert('Please fill in all journey details');
        return;
    }
    
    if (fromStation === toStation) {
        alert('From and To stations cannot be the same');
        return;
    }
    
    // Store journey data
    bookingData.journey = {
        from: fromStation,
        to: toStation,
        date: journeyDate,
        quota: quota
    };
    
    // Filter trains
    const availableTrains = trains.filter(train => 
        train.from === fromStation && train.to === toStation
    );
    
    if (availableTrains.length === 0) {
        alert('No trains available for this route');
        return;
    }
    
    displayTrains(availableTrains);
}

// Display trains
function displayTrains(availableTrains) {
    const trainResults = document.getElementById('trainResults');
    const trainList = document.getElementById('trainList');
    
    trainList.innerHTML = '';
    
    availableTrains.forEach(train => {
        const trainCard = createTrainCard(train);
        trainList.appendChild(trainCard);
    });
    
    trainResults.style.display = 'block';
    trainResults.scrollIntoView({ behavior: 'smooth' });
}

// Create train card
function createTrainCard(train) {
    const card = document.createElement('div');
    card.className = 'train-card';
    card.dataset.trainNumber = train.trainNumber;
    
    const fromStationName = stations.find(s => s.code === train.from)?.name || train.from;
    const toStationName = stations.find(s => s.code === train.to)?.name || train.to;
    
    card.innerHTML = `
        <div class="train-header">
            <div>
                <div class="train-name">${train.trainName}</div>
                <div class="train-number">Train No: ${train.trainNumber}</div>
            </div>
            <div class="train-type">${train.type}</div>
        </div>
        <div class="train-info">
            <div class="info-item">
                <span class="info-label">From</span>
                <span class="info-value">${fromStationName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">To</span>
                <span class="info-value">${toStationName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Departure</span>
                <span class="info-value">${train.departureTime}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Arrival</span>
                <span class="info-value">${train.arrivalTime}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Duration</span>
                <span class="info-value">${train.duration}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Distance</span>
                <span class="info-value">${train.distance}</span>
            </div>
        </div>
        <div class="class-selection" id="classes-${train.trainNumber}"></div>
    `;
    
    // Add class options
    const classSelection = card.querySelector(`#classes-${train.trainNumber}`);
    train.classes.forEach(classInfo => {
        const classOption = document.createElement('div');
        classOption.className = 'class-option';
        classOption.dataset.class = classInfo.class;
        classOption.innerHTML = `
            <div class="class-name">${classInfo.name}</div>
            <div class="class-fare">₹${classInfo.fare}</div>
            <div class="class-available">${classInfo.available} seats</div>
        `;
        
        classOption.addEventListener('click', () => selectTrainAndClass(train, classInfo, card));
        classSelection.appendChild(classOption);
    });
    
    return card;
}

// Select train and class
function selectTrainAndClass(train, classInfo, card) {
    // Remove previous selections
    document.querySelectorAll('.train-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.class-option').forEach(o => o.classList.remove('selected'));
    
    // Mark as selected
    card.classList.add('selected');
    const classOption = card.querySelector(`[data-class="${classInfo.class}"]`);
    classOption.classList.add('selected');
    
    selectedTrain = train;
    selectedClass = classInfo;
    bookingData.train = {
        ...train,
        selectedClass: classInfo
    };
    
    // Show passenger section
    setTimeout(() => {
        document.getElementById('passengerSection').style.display = 'block';
        document.getElementById('passengerSection').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Add passenger form
function addPassengerForm(index) {
    const passengerForms = document.getElementById('passengerForms');
    const passengerForm = document.createElement('div');
    passengerForm.className = 'passenger-form';
    passengerForm.dataset.index = index;
    
    passengerForm.innerHTML = `
        <div class="passenger-form-header">
            <div class="passenger-form-title">Passenger ${index}</div>
            ${index > 1 ? '<button type="button" class="remove-passenger" onclick="removePassenger(this)"><i class="fas fa-times"></i></button>' : ''}
        </div>
        <div class="passenger-form-row">
            <div class="form-group">
                <label for="passengerName${index}"><i class="fas fa-user"></i> Full Name (as on ID)</label>
                <input type="text" id="passengerName${index}" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="passengerAge${index}"><i class="fas fa-birthday-cake"></i> Age</label>
                <input type="number" id="passengerAge${index}" class="form-control" min="1" max="120" required>
            </div>
            <div class="form-group">
                <label for="passengerGender${index}"><i class="fas fa-venus-mars"></i> Gender</label>
                <select id="passengerGender${index}" class="form-control" required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Berth Preference</label>
            <div class="berth-preference">
                <div class="berth-option" data-berth="Lower" onclick="selectBerth(this, ${index})">Lower</div>
                <div class="berth-option" data-berth="Middle" onclick="selectBerth(this, ${index})">Middle</div>
                <div class="berth-option" data-berth="Upper" onclick="selectBerth(this, ${index})">Upper</div>
                <div class="berth-option" data-berth="Side Lower" onclick="selectBerth(this, ${index})">Side Lower</div>
                <div class="berth-option" data-berth="Side Upper" onclick="selectBerth(this, ${index})">Side Upper</div>
                <div class="berth-option" data-berth="No Preference" onclick="selectBerth(this, ${index})">No Preference</div>
            </div>
        </div>
        <div class="concession-checkbox" id="concession${index}" style="display: none;">
            <input type="checkbox" id="concessionCheck${index}" onchange="toggleConcession(${index})">
            <label for="concessionCheck${index}">Apply Senior Citizen / Other Concession</label>
        </div>
    `;
    
    passengerForms.appendChild(passengerForm);
    
    // Show concession option if age >= 60
    const ageInput = passengerForm.querySelector(`#passengerAge${index}`);
    ageInput.addEventListener('input', () => {
        const age = parseInt(ageInput.value);
        const concessionDiv = document.getElementById(`concession${index}`);
        if (age >= 60) {
            concessionDiv.style.display = 'flex';
        } else {
            concessionDiv.style.display = 'none';
            document.getElementById(`concessionCheck${index}`).checked = false;
        }
    });
}

// Remove passenger
function removePassenger(button) {
    const passengerForm = button.closest('.passenger-form');
    passengerForm.remove();
    
    // Renumber passengers
    document.querySelectorAll('.passenger-form').forEach((form, index) => {
        form.dataset.index = index + 1;
        form.querySelector('.passenger-form-title').textContent = `Passenger ${index + 1}`;
    });
}

// Select berth
function selectBerth(element, index) {
    const berthOptions = element.parentElement.querySelectorAll('.berth-option');
    berthOptions.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
}

// Toggle concession
function toggleConcession(index) {
    // Concession logic can be added here
}

// Proceed to payment
function proceedToPayment() {
    // Validate passenger details
    const passengerForms = document.querySelectorAll('.passenger-form');
    bookingData.passengers = [];
    
    let isValid = true;
    
    passengerForms.forEach((form, index) => {
        const passengerIndex = index + 1;
        const name = document.getElementById(`passengerName${passengerIndex}`).value;
        const age = document.getElementById(`passengerAge${passengerIndex}`).value;
        const gender = document.getElementById(`passengerGender${passengerIndex}`).value;
        const berthElement = form.querySelector('.berth-option.selected');
        const berth = berthElement ? berthElement.dataset.berth : 'No Preference';
        const concession = document.getElementById(`concessionCheck${passengerIndex}`)?.checked || false;
        
        if (!name || !age || !gender) {
            isValid = false;
            return;
        }
        
        bookingData.passengers.push({
            name,
            age: parseInt(age),
            gender,
            berth,
            concession
        });
    });
    
    if (!isValid) {
        alert('Please fill in all passenger details');
        return;
    }
    
    // Validate contact
    const mobile = document.getElementById('mobileNumber').value;
    const email = document.getElementById('email').value;
    
    if (!mobile || !email) {
        alert('Please fill in contact details');
        return;
    }
    
    if (!/^[0-9]{10}$/.test(mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    bookingData.contact = { mobile, email };
    
    // Display booking summary
    displayBookingSummary();
    
    // Show payment section
    document.getElementById('paymentSection').style.display = 'block';
    document.getElementById('paymentSection').scrollIntoView({ behavior: 'smooth' });
}

// Display booking summary
function displayBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const fromStationName = stations.find(s => s.code === bookingData.journey.from)?.name || bookingData.journey.from;
    const toStationName = stations.find(s => s.code === bookingData.journey.to)?.name || bookingData.journey.to;
    const trainName = bookingData.train.trainName;
    const className = bookingData.train.selectedClass.name;
    const fare = bookingData.train.selectedClass.fare;
    const totalFare = fare * bookingData.passengers.length;
    
    summary.innerHTML = `
        <h3><i class="fas fa-receipt"></i> Booking Summary</h3>
        <div class="summary-item">
            <span>Route:</span>
            <span>${fromStationName} → ${toStationName}</span>
        </div>
        <div class="summary-item">
            <span>Train:</span>
            <span>${trainName} (${bookingData.train.trainNumber})</span>
        </div>
        <div class="summary-item">
            <span>Class:</span>
            <span>${className}</span>
        </div>
        <div class="summary-item">
            <span>Date:</span>
            <span>${new Date(bookingData.journey.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="summary-item">
            <span>Quota:</span>
            <span>${bookingData.journey.quota}</span>
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
            <span>Total Fare:</span>
            <span>₹${totalFare}</span>
        </div>
    `;
    
    // Setup payment method selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            bookingData.payment = { method: option.dataset.method };
            document.getElementById('paymentDetails').style.display = 'block';
        });
    });
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
        
        // Display ticket
        displayTicket();
        
        // Show ticket section
        document.getElementById('ticketSection').style.display = 'block';
        document.getElementById('ticketSection').scrollIntoView({ behavior: 'smooth' });
    }, 2000);
}

// Generate PNR
function generatePNR() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 10; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
}

// Display ticket
function displayTicket() {
    const ticketBody = document.getElementById('ticketBody');
    const pnrNumber = document.getElementById('pnrNumber');
    
    pnrNumber.textContent = bookingData.pnr;
    
    const fromStationName = stations.find(s => s.code === bookingData.journey.from)?.name || bookingData.journey.from;
    const toStationName = stations.find(s => s.code === bookingData.journey.to)?.name || bookingData.journey.to;
    
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
                    <span class="ticket-info-value">${new Date(bookingData.journey.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
            <h4><i class="fas fa-rupee-sign"></i> Payment Details</h4>
            <div class="ticket-info-grid">
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Payment Method</span>
                    <span class="ticket-info-value">${bookingData.payment.method}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Total Amount</span>
                    <span class="ticket-info-value">₹${bookingData.train.selectedClass.fare * bookingData.passengers.length}</span>
                </div>
            </div>
        </div>
    `;
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
    location.reload();
}

