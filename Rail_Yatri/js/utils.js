// utils.js - Common utility functions

// Save booking data
function saveBookingData(data) {
    localStorage.setItem('bookingData', JSON.stringify(data));
}

// Get booking data
function getBookingData() {
    return JSON.parse(localStorage.getItem('bookingData'));
}

// Clear booking data
function clearBookingData() {
    localStorage.removeItem('bookingData');
}

// Get station name from code
function getStationName(code) {
    const stations = JSON.parse(localStorage.getItem('stations')) || [];
    const station = stations.find(s => s.code === code);
    return station ? `${station.name} (${station.code})` : code;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Navigate to page
function navigateTo(page) {
    window.location.href = page;
}

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${suffix}`;
}

// Calculate duration between two times
function calculateDuration(departure, arrival) {
    const [depHour, depMin] = departure.split(':').map(Number);
    const [arrHour, arrMin] = arrival.split(':').map(Number);
    
    let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Next day arrival
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
}

// Generate random seat availability
function generateRandomAvailability(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Auth Utilities (add to existing utils.js)

// Check if user is logged in
function isLoggedIn() {
    const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return user !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    updateNavigation();
    navigateTo('index.html');
}

// Update navigation based on login status
function updateNavigation() {
    const currentUser = getCurrentUser();
    const navLinks = document.querySelector('.nav');
    
    if (!navLinks) return;
    
    if (currentUser) {
        navLinks.innerHTML = `
            <a href="index.html" class="nav-link">Book Ticket</a>
            <a href="profile.html" class="nav-link">Profile</a>
            <a href="my-bookings.html" class="nav-link">My Bookings</a>
            <a href="#" id="logoutBtn" class="nav-link">Logout</a>
        `;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    } else {
        // Only update on pages where navigation should show login/signup
        const currentPage = window.location.pathname;
        if (currentPage.includes('login.html') || currentPage.includes('signup.html') || currentPage.includes('index.html')) {
            navLinks.innerHTML = `
                <a href="index.html" class="nav-link">Book Ticket</a>
                <a href="login.html" class="nav-link">Login</a>
                <a href="signup.html" class="nav-link">Sign Up</a>
            `;
        }
    }
}

// Protect pages that require authentication
function requireAuth() {
    if (!isLoggedIn()) {
        alert('Please login to access this page');
        navigateTo('login.html');
        return false;
    }
    return true;
}

// Show user greeting
function showUserGreeting() {
    const user = getCurrentUser();
    if (user) {
        const greetingElement = document.getElementById('userGreeting');
        if (greetingElement) {
            greetingElement.textContent = `Welcome, ${user.name}!`;
            greetingElement.style.display = 'block';
        }
    }
}

// Initialize auth on pages that need it
document.addEventListener('DOMContentLoaded', () => {
    // Update navigation on all pages
    updateNavigation();
    
    // Show user greeting if element exists
    showUserGreeting();
});