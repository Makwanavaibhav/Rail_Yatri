// search.js - Search form functionality
let stations = [];
let trains = [];

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    stations = data.stations;
    trains = data.trains;
    
    // Initialize autocomplete
    initializeAutocomplete();
    
    // Set default date (tomorrow)
    setDefaultDate();
    
    // Handle form submission
    document.getElementById('searchForm').addEventListener('submit', handleSearchForm);
});

// Set default date to tomorrow
function setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('journeyDate').value = formattedDate;
    document.getElementById('journeyDate').min = formattedDate;
}

// Initialize autocomplete for station inputs
function initializeAutocomplete() {
    const fromInput = document.getElementById('fromStation');
    const toInput = document.getElementById('toStation');
    const fromSuggestions = document.getElementById('fromSuggestions');
    const toSuggestions = document.getElementById('toSuggestions');
    
    // Setup autocomplete for both inputs
    setupStationAutocomplete(fromInput, fromSuggestions);
    setupStationAutocomplete(toInput, toSuggestions);
    
    // Add swap stations button
    addSwapButton(fromInput, toInput);
}

// Setup autocomplete for a station input
function setupStationAutocomplete(input, suggestionsContainer) {
    input.addEventListener('input', function(e) {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        // Filter stations
        const filteredStations = stations.filter(station => 
            station.name.toLowerCase().includes(query) || 
            station.code.toLowerCase().includes(query)
        ).slice(0, 8); // Limit to 8 suggestions
        
        displaySuggestions(filteredStations, suggestionsContainer, input);
    });
    
    // Handle focus
    input.addEventListener('focus', function() {
        if (this.value.length >= 2) {
            const query = this.value.trim().toLowerCase();
            const filteredStations = stations.filter(station => 
                station.name.toLowerCase().includes(query) || 
                station.code.toLowerCase().includes(query)
            ).slice(0, 8);
            displaySuggestions(filteredStations, suggestionsContainer, input);
        }
    });
    
    // Hide suggestions when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Handle keyboard navigation
    input.addEventListener('keydown', function(e) {
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;
        
        let currentIndex = -1;
        items.forEach((item, index) => {
            if (item.classList.contains('highlighted')) {
                currentIndex = index;
                item.classList.remove('highlighted');
            }
        });
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % items.length;
                items[currentIndex].classList.add('highlighted');
                items[currentIndex].scrollIntoView({ block: 'nearest' });
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                items[currentIndex].classList.add('highlighted');
                items[currentIndex].scrollIntoView({ block: 'nearest' });
                break;
                
            case 'Enter':
                if (currentIndex >= 0) {
                    e.preventDefault();
                    items[currentIndex].click();
                }
                break;
                
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
        }
    });
}

// Display suggestions
function displaySuggestions(stations, container, input) {
    if (stations.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = stations.map(station => `
        <div class="suggestion-item" data-code="${station.code}">
            <span class="suggestion-code">${station.code}</span>
            <span class="suggestion-name">${station.name}</span>
        </div>
    `).join('');
    
    container.style.display = 'block';
    
    // Handle suggestion selection
    container.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            input.value = `${this.querySelector('.suggestion-name').textContent}`;
            input.dataset.stationCode = this.dataset.code;
            container.style.display = 'none';
        });
        
        // Highlight on hover
        item.addEventListener('mouseenter', function() {
            container.querySelectorAll('.suggestion-item').forEach(i => i.classList.remove('highlighted'));
            this.classList.add('highlighted');
        });
    });
}

// Add swap button between station inputs
function addSwapButton(fromInput, toInput) {
    const fromGroup = fromInput.parentElement.parentElement;
    const swapButton = document.createElement('button');
    swapButton.type = 'button';
    swapButton.className = 'swap-button';
    swapButton.innerHTML = '<i class="fas fa-exchange-alt"></i>';
    swapButton.title = 'Swap stations';
    
    fromGroup.parentElement.insertBefore(swapButton, fromGroup.nextSibling);
    
    swapButton.addEventListener('click', function() {
        const fromValue = fromInput.value;
        const fromCode = fromInput.dataset.stationCode;
        const toValue = toInput.value;
        const toCode = toInput.dataset.stationCode;
        
        fromInput.value = toValue;
        fromInput.dataset.stationCode = toCode;
        toInput.value = fromValue;
        toInput.dataset.stationCode = fromCode;
        
        // Hide suggestions
        document.getElementById('fromSuggestions').style.display = 'none';
        document.getElementById('toSuggestions').style.display = 'none';
    });
}

// Handle search form submission
function handleSearchForm(e) {
    e.preventDefault();
    console.log('Search form submitted');
    
    // Get form values
    const fromInput = document.getElementById('fromStation');
    const toInput = document.getElementById('toStation');
    const journeyDate = document.getElementById('journeyDate').value;
    const quota = document.getElementById('quota').value;
    
    console.log('Search data:', {
        from: fromInput.value,
        fromCode: fromInput.dataset.stationCode,
        to: toInput.value,
        toCode: toInput.dataset.stationCode,
        date: journeyDate,
        quota: quota
    });
    
    // Validate stations
    const fromCode = fromInput.dataset.stationCode;
    const toCode = toInput.dataset.stationCode;
    
    if (!fromCode) {
        showError(fromInput, 'Please select a "From" station from the suggestions');
        return;
    }
    
    if (!toCode) {
        showError(toInput, 'Please select a "To" station from the suggestions');
        return;
    }
    
    if (fromCode === toCode) {
        showError(fromInput, '"From" and "To" stations cannot be the same');
        return;
    }
    
    // Validate date
    const selectedDate = new Date(journeyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Please select a future date');
        return;
    }
    
    // Validate quota
    if (!quota) {
        alert('Please select a quota');
        document.getElementById('quota').focus();
        return;
    }
    
    // Clear any errors
    clearErrors();
    
    // Find available trains
    const availableTrains = findAvailableTrains(fromCode, toCode, journeyDate);
    console.log('Available trains found:', availableTrains.length);
    
    if (availableTrains.length === 0) {
        showAuthMessage('No trains available for this route on the selected date', 'error');
        return;
    }
    
    // Save booking data
    const bookingData = {
        journey: {
            from: fromCode,
            to: toCode,
            date: journeyDate,
            quota: quota
        },
        availableTrains: availableTrains
    };
    
    saveBookingData(bookingData);
    console.log('Booking data saved:', bookingData);
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Searching...';
    submitBtn.disabled = true;
    
    // Navigate to trains page
    setTimeout(() => {
        navigateTo('trains.html');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
}
// Extract station code from input text
function extractStationCode(inputText) {
    const station = stations.find(s => 
        s.name.toLowerCase() === inputText.toLowerCase().trim() ||
        s.code.toLowerCase() === inputText.toLowerCase().trim()
    );
    return station ? station.code : null;
}

// Check if station code is valid
function isValidStationCode(code) {
    return stations.some(station => station.code === code);
}

// Find available trains between stations for a specific date
function findAvailableTrains(fromCode, toCode, date) {
    const dayOfWeek = getDayOfWeek(date);
    
    const filteredTrains = trains.filter(train => {
        // Check if train runs between the stations
        if (train.from !== fromCode || train.to !== toCode) {
            return false;
        }
        
        // Check if train runs on the selected day
        if (!train.days.includes('Daily') && !train.days.includes(dayOfWeek)) {
            return false;
        }
        
        return true;
    });
    
    return filteredTrains;
}

// Get day of week from date string
function getDayOfWeek(dateString) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

// Load data from JSON files
async function loadData() {
    try {
        const [stationsResponse, trainsResponse] = await Promise.all([
            fetch('data/stations.json'),
            fetch('data/trains.json')
        ]);
        
        if (!stationsResponse.ok || !trainsResponse.ok) {
            throw new Error('Failed to load data');
        }
        
        const stations = await stationsResponse.json();
        const trains = await trainsResponse.json();
        
        // Store in localStorage for faster access
        localStorage.setItem('stations', JSON.stringify(stations));
        localStorage.setItem('trains', JSON.stringify(trains));
        
        return { stations, trains };
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Try to load from localStorage if fetch fails
        const stations = JSON.parse(localStorage.getItem('stations')) || [];
        const trains = JSON.parse(localStorage.getItem('trains')) || [];
        
        return { stations, trains };
    }
}