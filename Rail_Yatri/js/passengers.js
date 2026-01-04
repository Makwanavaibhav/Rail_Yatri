// Passenger details page script
let stations = [];
let bookingData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    stations = data.stations;
    
    bookingData = getBookingData();
    
    if (!bookingData || !bookingData.train) {
        alert('No train selected. Redirecting to home page.');
        navigateTo('index.html');
        return;
    }
    
    displayBookingSummary();
    addPassengerForm(1);
    setupEventListeners();
});

// Display booking summary
function displayBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const journey = bookingData.journey;
    const train = bookingData.train;
    const fromName = getStationName(journey.from);
    const toName = getStationName(journey.to);
    
    summary.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> Booking Summary</h3>
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
            <span>Fare per person:</span>
            <span>₹${train.selectedClass.fare}</span>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addPassenger').addEventListener('click', () => {
        const passengerCount = document.querySelectorAll('.passenger-form').length;
        addPassengerForm(passengerCount + 1);
    });
    document.getElementById('proceedToPayment').addEventListener('click', proceedToPayment);
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
            const checkbox = document.getElementById(`concessionCheck${index}`);
            if (checkbox) checkbox.checked = false;
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
    const passengers = [];
    
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
        
        passengers.push({
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
    
    // Update booking data
    bookingData.passengers = passengers;
    bookingData.contact = { mobile, email };
    
    saveBookingData(bookingData);
    
    // Navigate to food selection page
    navigateTo('food.html');
}

