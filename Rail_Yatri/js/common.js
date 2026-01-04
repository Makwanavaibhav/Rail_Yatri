// common.js - Add these if not present

// Get stations data
function getStations() {
    return JSON.parse(localStorage.getItem('stations')) || [];
}

// Get trains data
function getTrains() {
    return JSON.parse(localStorage.getItem('trains')) || [];
}

// Save booking data
function saveBookingData(data) {
    localStorage.setItem('bookingData', JSON.stringify(data));
}

// Get booking data
function getBookingData() {
    return JSON.parse(localStorage.getItem('bookingData'));
}

// Get station name from code
function getStationName(code) {
    const stations = getStations();
    const station = stations.find(s => s.code === code);
    return station ? `${station.name} (${station.code})` : code;
}

// Format date
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Navigate to page
function navigateTo(page) {
    window.location.href = page;
}