// index.js - Home page booking functionality
let stations = [];
let trains = [];

// Inline station data (fallback if stations.json doesn't exist)
const defaultStations = [
    { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
    { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
    { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
    { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
    { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
    { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
    { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam' },
    { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
    { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu & Kashmir' },
    { code: 'DBRG', name: 'Dibrugarh', city: 'Dibrugarh', state: 'Assam' },
    { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
    { code: 'LKO', name: 'Lucknow', city: 'Lucknow', state: 'Uttar Pradesh' },
    { code: 'HYB', name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana' },
    { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
    { code: 'VSKP', name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { code: 'CDG', name: 'Chandigarh', city: 'Chandigarh', state: 'Chandigarh' },
    { code: 'BGP', name: 'Bhagalpur', city: 'Bhagalpur', state: 'Bihar' },
    { code: 'RNC', name: 'Ranchi', city: 'Ranchi', state: 'Jharkhand' },
    { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
    { code: 'ALD', name: 'Allahabad', city: 'Prayagraj', state: 'Uttar Pradesh' },
    { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
    { code: 'KOAA', name: 'Kolkata', city: 'Kolkata', state: 'West Bengal' },
    { code: 'CBE', name: 'Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu' },
    { code: 'MYS', name: 'Mysuru Junction', city: 'Mysuru', state: 'Karnataka' },
    { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat' }
];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Home page loaded - Initializing...');
    
    try {
        // Load data
        await loadPageData();
        
        // Initialize form
        initializeForm();
        
        // Update navigation
        updateNavigation();
        
        // Add user greeting if logged in
        addUserGreeting();
        
        console.log('Page initialized successfully');
    } catch (error) {
        console.error('Error initializing page:', error);
        // Use fallback data
        initializeWithFallback();
    }
});

// Load page data
async function loadPageData() {
    try {
        // Try to load stations from JSON
        const stationsResponse = await fetch('data/stations.json');
        if (stationsResponse.ok) {
            stations = await stationsResponse.json();
            console.log('Stations loaded from JSON:', stations.length);
        } else {
            stations = defaultStations;
            console.log('Using default stations:', stations.length);
        }
        
        // Try to load trains from JSON
        const trainsResponse = await fetch('data/trains.json');
        if (trainsResponse.ok) {
            trains = await trainsResponse.json();
            console.log('Trains loaded from JSON:', trains.length);
        } else {
            // If trains.json doesn't exist, use empty array
            trains = [];
            console.log('No trains data found');
        }
        
    } catch (error) {
        console.log('Error loading data, using defaults:', error);
        stations = defaultStations;
        trains = [];
    }
}

// Initialize with fallback data
function initializeWithFallback() {
    stations = defaultStations;
    trains = [];
    initializeForm();
    updateNavigation();
    addUserGreeting();
}

// Initialize form
function initializeForm() {
    console.log('Initializing form...');
    
    // Set minimum date
    setMinDate();
    
    // Initialize station autocomplete
    initializeStationAutocomplete();
    
    // Setup event listeners
    setupEventListeners();
}

// Set minimum date to today
function setMinDate() {
    const journeyDate = document.getElementById('journeyDate');
    if (journeyDate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const minDate = `${year}-${month}-${day}`;
        
        journeyDate.min = minDate;
        
        // Set default to tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        journeyDate.value = tomorrowStr;
        
        console.log('Date set - Min:', minDate, 'Default:', tomorrowStr);
    }
}

// Initialize station autocomplete
function initializeStationAutocomplete() {
    console.log('Initializing station autocomplete...');
    
    const fromInput = document.getElementById('fromStation');
    const toInput = document.getElementById('toStation');
    
    if (!fromInput || !toInput) {
        console.error('Station inputs not found');
        return;
    }
    
    console.log('Available stations:', stations.length);
    
    // Create suggestion containers if they don't exist
    createSuggestionContainers();
    
    // Setup autocomplete for both inputs
    setupAutocomplete(fromInput, 'fromSuggestions');
    setupAutocomplete(toInput, 'toSuggestions');
    
    // Add swap button
    addSwapButton();
    
    console.log('Autocomplete initialized');
}

// Create suggestion containers
function createSuggestionContainers() {
    const fromWrapper = document.getElementById('fromStation')?.closest('.autocomplete-wrapper');
    const toWrapper = document.getElementById('toStation')?.closest('.autocomplete-wrapper');
    
    if (fromWrapper && !document.getElementById('fromSuggestions')) {
        const fromSuggestions = document.createElement('div');
        fromSuggestions.id = 'fromSuggestions';
        fromSuggestions.className = 'autocomplete-suggestions';
        fromWrapper.appendChild(fromSuggestions);
    }
    
    if (toWrapper && !document.getElementById('toSuggestions')) {
        const toSuggestions = document.createElement('div');
        toSuggestions.id = 'toSuggestions';
        toSuggestions.className = 'autocomplete-suggestions';
        toWrapper.appendChild(toSuggestions);
    }
}

// Setup autocomplete for an input
function setupAutocomplete(input, suggestionsId) {
    if (!input) return;
    
    const suggestionsContainer = document.getElementById(suggestionsId);
    if (!suggestionsContainer) return;
    
    let selectedIndex = -1;
    let filteredStations = [];
    
    // Input event handler
    input.addEventListener('input', function(e) {
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            suggestionsContainer.classList.remove('show');
            return;
        }
        
        // Filter stations
        filteredStations = stations.filter(station => {
            if (!station.name) return false;
            
            const name = station.name.toLowerCase();
            const code = station.code.toLowerCase();
            const city = (station.city || '').toLowerCase();
            const state = (station.state || '').toLowerCase();
            
            // Check if query matches any part
            return name.includes(query) ||
                   code.includes(query) ||
                   city.includes(query) ||
                   state.includes(query) ||
                   name.split(' ').some(word => word.startsWith(query));
        }).slice(0, 8); // Limit to 8 suggestions
        
        // Display suggestions
        displaySuggestions(suggestionsContainer, filteredStations, query, input);
        selectedIndex = -1;
    });
    
    // Focus event handler
    input.addEventListener('focus', function() {
        const query = this.value.trim().toLowerCase();
        if (query.length >= 2) {
            filteredStations = stations.filter(station => {
                if (!station.name) return false;
                return station.name.toLowerCase().includes(query) ||
                       station.code.toLowerCase().includes(query);
            }).slice(0, 8);
            displaySuggestions(suggestionsContainer, filteredStations, query, input);
        }
    });
    
    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                highlightItem(items, selectedIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                highlightItem(items, selectedIndex);
                break;
                
            case 'Enter':
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    e.preventDefault();
                    items[selectedIndex].click();
                }
                break;
                
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                suggestionsContainer.classList.remove('show');
                break;
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
            suggestionsContainer.classList.remove('show');
        }
    });
}

// Display suggestions
function displaySuggestions(container, stationsList, query, input) {
    if (stationsList.length === 0) {
        container.style.display = 'none';
        container.classList.remove('show');
        return;
    }
    
    container.innerHTML = '';
    
    stationsList.forEach((station, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.dataset.index = index;
        
        // Highlight matching text in name
        let highlightedName = station.name;
        const nameLower = station.name.toLowerCase();
        const queryIndex = nameLower.indexOf(query);
        
        if (queryIndex !== -1) {
            highlightedName = 
                station.name.substring(0, queryIndex) +
                '<strong>' + station.name.substring(queryIndex, queryIndex + query.length) + '</strong>' +
                station.name.substring(queryIndex + query.length);
        }
        
        item.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <div class="suggestion-content">
                <div class="suggestion-name">${highlightedName}</div>
                <div class="suggestion-code">${station.code}${station.city ? ' • ' + station.city : ''}</div>
            </div>
        `;
        
        item.addEventListener('click', function() {
            input.value = station.name;
            input.dataset.stationCode = station.code;
            container.style.display = 'none';
            container.classList.remove('show');
        });
        
        // Highlight on hover
        item.addEventListener('mouseenter', function() {
            container.querySelectorAll('.suggestion-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
        
        container.appendChild(item);
    });
    
    container.style.display = 'block';
    container.classList.add('show');
}

// Highlight suggestion item
function highlightItem(items, index) {
    items.forEach(item => item.classList.remove('active'));
    if (items[index]) {
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
    }
}

// Add swap button
function addSwapButton() {
    const fromGroup = document.getElementById('fromStation')?.closest('.form-group');
    const toGroup = document.getElementById('toStation')?.closest('.form-group');
    
    if (!fromGroup || !toGroup) return;
    
    // Check if swap button already exists
    if (document.querySelector('.swap-btn-container')) return;
    
    const swapContainer = document.createElement('div');
    swapContainer.className = 'swap-btn-container';
    
    const swapButton = document.createElement('button');
    swapButton.type = 'button';
    swapButton.className = 'swap-btn';
    swapButton.id = 'swapStations';
    swapButton.innerHTML = '<i class="fas fa-exchange-alt"></i>';
    swapButton.title = 'Swap stations';
    
    swapContainer.appendChild(swapButton);
    
    // Insert between the station inputs
    fromGroup.parentNode.insertBefore(swapContainer, fromGroup.nextSibling);
    
    // Add event listener
    swapButton.addEventListener('click', swapStations);
}

// Swap stations
function swapStations(e) {
    if (e) e.preventDefault();
    
    const fromInput = document.getElementById('fromStation');
    const toInput = document.getElementById('toStation');
    const fromSuggestions = document.getElementById('fromSuggestions');
    const toSuggestions = document.getElementById('toSuggestions');
    
    if (!fromInput || !toInput) return;
    
    // Close suggestions
    if (fromSuggestions) {
        fromSuggestions.style.display = 'none';
        fromSuggestions.classList.remove('show');
    }
    if (toSuggestions) {
        toSuggestions.style.display = 'none';
        toSuggestions.classList.remove('show');
    }
    
    // Swap values
    const tempValue = fromInput.value;
    const tempCode = fromInput.dataset.stationCode;
    
    fromInput.value = toInput.value;
    fromInput.dataset.stationCode = toInput.dataset.stationCode;
    
    toInput.value = tempValue;
    toInput.dataset.stationCode = tempCode;
    
    // Add animation
    const swapBtn = document.getElementById('swapStations');
    if (swapBtn) {
        swapBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            swapBtn.style.transform = '';
        }, 300);
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Search form submission
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
        console.log('Search form listener added');
    } else {
        console.error('Search form not found');
    }
}

// Handle search
function handleSearch(e) {
    e.preventDefault();
    console.log('Search form submitted');
    
    const fromInput = document.getElementById('fromStation');
    const toInput = document.getElementById('toStation');
    const journeyDate = document.getElementById('journeyDate').value;
    const quota = document.getElementById('quota').value;
    
    // Validate stations
    const fromCode = fromInput.dataset.stationCode || extractStationCode(fromInput.value);
    const toCode = toInput.dataset.stationCode || extractStationCode(toInput.value);
    
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
        return;
    }
    
    // Clear errors
    clearErrors();
    
    // Get station names
    const fromStation = stations.find(s => s.code === fromCode);
    const toStation = stations.find(s => s.code === toCode);
    
    if (!fromStation || !toStation) {
        alert('Invalid station selected');
        return;
    }
    
    // Find available trains
    const availableTrains = findTrains(fromCode, toCode, journeyDate);
    
    // Save booking data
    const bookingData = {
        journey: {
            from: fromCode,
            to: toCode,
            fromName: fromStation.name,
            toName: toStation.name,
            date: journeyDate,
            quota: quota
        },
        availableTrains: availableTrains
    };
    
    console.log('Booking data:', bookingData);
    
    // Save to storage
    saveBookingData(bookingData);
    
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

// Extract station code from input
function extractStationCode(inputText) {
    if (!inputText) return null;
    
    // Check if input contains station code in parentheses
    const match = inputText.match(/\(([A-Z]{3,5})\)/);
    if (match) return match[1];
    
    // Find station by name
    const station = stations.find(s => 
        s.name.toLowerCase() === inputText.toLowerCase().trim() ||
        s.code.toLowerCase() === inputText.toLowerCase().trim()
    );
    
    return station ? station.code : null;
}

// Find trains between stations
function findTrains(fromCode, toCode, date) {
    const dayOfWeek = getDayOfWeek(date);
    
    return trains.filter(train => {
        // Check route
        if (train.from !== fromCode || train.to !== toCode) {
            return false;
        }
        
        // Check if train runs on selected day
        if (!train.days || train.days.length === 0) {
            return true; // Assume daily if no days specified
        }
        
        if (train.days.includes('Daily')) {
            return true;
        }
        
        return train.days.includes(dayOfWeek);
    }).map(train => ({
        ...train,
        classes: train.classes || [] // Ensure classes exist
    }));
}

// Get day of week from date
function getDayOfWeek(dateString) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

// Show error
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    let errorDiv = formGroup.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        formGroup.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    input.style.borderColor = 'var(--danger-color)';
    input.focus();
}

// Clear errors
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
    });
    
    document.querySelectorAll('.form-control').forEach(input => {
        input.style.borderColor = '#e2e8f0';
    });
}

// Add user greeting
function addUserGreeting() {
    const user = getCurrentUser();
    if (user) {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const greeting = document.createElement('p');
            greeting.className = 'user-greeting';
            greeting.innerHTML = `<i class="fas fa-user-circle"></i> Welcome back, ${user.name}!`;
            heroContent.appendChild(greeting);
        }
    }
}

// Utility functions
function saveBookingData(data) {
    localStorage.setItem('bookingData', JSON.stringify(data));
}

function navigateTo(page) {
    window.location.href = page;
}

// Debug function
window.debugStations = function() {
    console.log('Stations:', stations);
    console.log('Trains:', trains);
    console.log('From input:', document.getElementById('fromStation')?.value);
    console.log('To input:', document.getElementById('toStation')?.value);
};