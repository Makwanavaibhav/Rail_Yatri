// auth.js - Authentication functionality
let users = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Load users data
    try {
        const response = await fetch('data/users.json');
        if (response.ok) {
            users = await response.json();
            console.log('Loaded users from JSON:', users);
        } else {
            // If file doesn't exist, create empty array
            users = [];
            console.warn('Could not load users.json, starting with empty user list');
        }
    } catch (error) {
        // If fetch fails, use localStorage or empty array
        users = JSON.parse(localStorage.getItem('users')) || [];
        console.error('Error loading users from JSON, using localStorage:', error);
    }
    
    // Check current page and initialize accordingly
    const currentPage = window.location.pathname;
    console.log('Current page:', currentPage);
    
    if (currentPage.includes('login.html')) {
        console.log('Initializing login page');
        initializeLoginPage();
    } else if (currentPage.includes('signup.html')) {
        console.log('Initializing signup page');
        initializeSignupPage();
    }
    
    // Update navigation based on login status
    updateNavigation();
});

// Initialize login page
function initializeLoginPage() {
    console.log('Setting up login form...');
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('toggleLoginPassword');
    
    if (loginForm) {
        console.log('Login form found, adding submit handler');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!');
    }
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility('loginPassword', togglePasswordBtn);
        });
    }
    
    // Handle social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', handleSocialLogin);
    });
    
    // Check for remember me
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && document.getElementById('loginEmail')) {
        document.getElementById('loginEmail').value = rememberedEmail;
        if (document.getElementById('rememberMe')) {
            document.getElementById('rememberMe').checked = true;
        }
    }
}

// Initialize signup page
function initializeSignupPage() {
    console.log('Setting up signup form...');
    const signupForm = document.getElementById('signupForm');
    const togglePasswordBtn = document.getElementById('toggleSignupPassword');
    const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
    
    if (signupForm) {
        console.log('Signup form found, adding submit handler');
        signupForm.addEventListener('submit', handleSignup);
    } else {
        console.error('Signup form not found!');
    }
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            togglePasswordVisibility('signupPassword', togglePasswordBtn);
        });
    }
    
    if (toggleConfirmBtn) {
        toggleConfirmBtn.addEventListener('click', () => {
            togglePasswordVisibility('confirmPassword', toggleConfirmBtn);
        });
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
}

// Toggle password visibility
function togglePasswordVisibility(passwordFieldId, toggleBtn) {
    const passwordField = document.getElementById(passwordFieldId);
    const icon = toggleBtn.querySelector('i');
    
    if (!passwordField) {
        console.error(`Password field ${passwordFieldId} not found!`);
        return;
    }
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Update password strength indicator
function updatePasswordStrength() {
    const password = document.getElementById('signupPassword').value;
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!strengthBar || !strengthText) {
        console.warn('Password strength elements not found');
        return;
    }
    
    // Calculate strength
    let strength = 0;
    let message = '';
    
    // Check length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Check for lowercase
    if (/[a-z]/.test(password)) strength++;
    
    // Check for uppercase
    if (/[A-Z]/.test(password)) strength++;
    
    // Check for numbers
    if (/\d/.test(password)) strength++;
    
    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update strength bar and text
    let strengthPercent = (strength / 6) * 100;
    strengthBar.style.width = strengthPercent + '%';
    
    // Set colors and messages
    if (password.length === 0) {
        strengthBar.style.backgroundColor = '#e2e8f0';
        message = 'None';
    } else if (strength <= 2) {
        strengthBar.style.backgroundColor = '#ef4444'; // Red
        message = 'Weak';
    } else if (strength <= 4) {
        strengthBar.style.backgroundColor = '#f59e0b'; // Orange
        message = 'Moderate';
    } else {
        strengthBar.style.backgroundColor = '#10b981'; // Green
        message = 'Strong';
    }
    
    strengthText.textContent = message;
    strengthText.style.color = strengthBar.style.backgroundColor;
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const emailOrMobile = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    console.log('Login attempt:', { emailOrMobile, passwordLength: password.length, rememberMe });
    
    // Validate inputs
    if (!validateLoginInputs(emailOrMobile, password)) return;
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        const user = authenticateUser(emailOrMobile, password);
        console.log('Authentication result:', user ? 'Success' : 'Failed');
        
        if (user) {
            // Save remembered email
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', emailOrMobile);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Login successful
            saveUserSession(user, rememberMe);
            showAuthMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to home page after delay
            setTimeout(() => {
                navigateTo('index.html');
            }, 1500);
        } else {
            // Login failed
            showAuthMessage('Invalid email/mobile or password. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
}

// Validate login inputs
function validateLoginInputs(emailOrMobile, password) {
    clearAuthMessages();
    
    if (!emailOrMobile) {
        showAuthMessage('Please enter email or mobile number', 'error');
        return false;
    }
    
    if (!password) {
        showAuthMessage('Please enter password', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return false;
    }
    
    return true;
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    console.log('Signup form submitted');
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const mobile = document.getElementById('signupMobile').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    console.log('Signup data:', { name, email, mobile, passwordLength: password.length });
    
    // Validate inputs
    if (!validateSignupInputs(name, email, mobile, password, confirmPassword, agreeTerms)) return;
    
    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Creating account...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Check if user already exists
        if (userExists(email, mobile)) {
            showAuthMessage('User with this email or mobile number already exists. Please try logging in.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Create new user
        const newUser = createUser(name, email, mobile, password);
        console.log('New user created:', newUser);
        
        if (newUser) {
            // Signup successful
            showAuthMessage('Account created successfully! Logging you in...', 'success');
            
            // Save user session
            saveUserSession(newUser, true);
            
            // Save to users array
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Updated users in localStorage:', users.length);
            
            // Redirect to home page after delay
            setTimeout(() => {
                navigateTo('index.html');
            }, 1500);
        } else {
            showAuthMessage('Error creating account. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
}

// Validate signup inputs
function validateSignupInputs(name, email, mobile, password, confirmPassword, agreeTerms) {
    clearAuthMessages();
    
    // Name validation
    if (!name) {
        showAuthMessage('Please enter your full name', 'error');
        return false;
    }
    
    if (name.length < 2) {
        showAuthMessage('Name must be at least 2 characters', 'error');
        return false;
    }
    
    // Email validation
    if (!email) {
        showAuthMessage('Please enter email address', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showAuthMessage('Please enter a valid email address (e.g., user@example.com)', 'error');
        return false;
    }
    
    // Mobile validation
    if (!mobile) {
        showAuthMessage('Please enter mobile number', 'error');
        return false;
    }
    
    if (!isValidMobile(mobile)) {
        showAuthMessage('Please enter a valid 10-digit Indian mobile number (starting with 6-9)', 'error');
        return false;
    }
    
    // Password validation
    if (!password) {
        showAuthMessage('Please enter password', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return false;
    }
    
    // Password confirmation
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match. Please re-enter your password.', 'error');
        return false;
    }
    
    // Terms agreement
    if (!agreeTerms) {
        showAuthMessage('You must agree to the terms and conditions to continue', 'error');
        return false;
    }
    
    return true;
}

// Authenticate user
function authenticateUser(emailOrMobile, password) {
    console.log('Authenticating user...');
    
    // Get users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Stored users count:', storedUsers.length);
    
    // Combine with loaded users
    const allUsers = [...users, ...storedUsers];
    console.log('Total users to check:', allUsers.length);
    
    const user = allUsers.find(user => {
        const emailMatch = user.email === emailOrMobile;
        const mobileMatch = user.mobile === emailOrMobile;
        const passwordMatch = user.password === password;
        
        return (emailMatch || mobileMatch) && passwordMatch;
    });
    
    console.log('Found user:', user ? 'Yes' : 'No');
    return user;
}

// Check if user exists
function userExists(email, mobile) {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const allUsers = [...users, ...storedUsers];
    
    return allUsers.some(user => 
        user.email === email || user.mobile === mobile
    );
}

// Create new user
function createUser(name, email, mobile, password) {
    return {
        id: generateUserId(),
        name: name,
        email: email,
        mobile: mobile,
        password: password,
        createdAt: new Date().toISOString(),
        bookings: [],
        profilePic: null
    };
}

// Generate unique user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Save user session
function saveUserSession(user, rememberMe) {
    // Remove password for security
    const { password, ...userWithoutPassword } = user;
    
    if (rememberMe) {
        // Save to localStorage (persistent)
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        console.log('User saved to localStorage');
    } else {
        // Save to sessionStorage (cleared when browser closes)
        sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        console.log('User saved to sessionStorage');
    }
    
    // Update navigation
    updateNavigation();
}

// Logout user
function logoutUser() {
    console.log('Logging out user...');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    updateNavigation();
    navigateTo('index.html');
}

// Check if user is logged in
function isLoggedIn() {
    const user = getCurrentUser();
    return user !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Update navigation based on login status
function updateNavigation() {
    const currentUser = getCurrentUser();
    const navLinks = document.querySelector('.nav');
    
    if (!navLinks) {
        console.log('Navigation not found on this page');
        return;
    }
    
    console.log('Updating navigation, user logged in:', currentUser ? 'Yes' : 'No');
    
    if (currentUser) {
        // User is logged in
        navLinks.innerHTML = `
            <a href="index.html" class="nav-link">Book Ticket</a>
            <a href="profile.html" class="nav-link">Profile</a>
            <a href="my-bookings.html" class="nav-link">My Bookings</a>
            <a href="#" id="logoutBtn" class="nav-link">Logout</a>
        `;
        
        // Add logout event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    } else {
        // User is not logged in - only update if on auth pages
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

// Handle social login
function handleSocialLogin(e) {
    const provider = e.target.classList.contains('google-btn') ? 'google' : 'facebook';
    console.log(`Social login with ${provider}`);
    
    // Show loading
    const btn = e.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> Connecting...';
    btn.disabled = true;
    
    // Simulate social login delay
    setTimeout(() => {
        // For demo, create a mock social user
        const mockUser = {
            id: provider + '_' + Date.now(),
            name: `Social ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            email: `${provider}_user_${Date.now()}@example.com`,
            provider: provider,
            createdAt: new Date().toISOString(),
            socialLogin: true
        };
        
        // Save session
        saveUserSession(mockUser, true);
        
        // Show success message
        showAuthMessage(`Logged in with ${provider.charAt(0).toUpperCase() + provider.slice(1)} successfully!`, 'success');
        
        // Redirect to home page
        setTimeout(() => {
            navigateTo('index.html');
        }, 1500);
        
    }, 1500);
}

// Show authentication message
function showAuthMessage(message, type) {
    console.log(`Auth message (${type}):`, message);
    
    // Remove existing messages
    clearAuthMessages();
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Insert after auth header or at top of form
    const authForm = document.querySelector('.auth-form');
    const authHeader = document.querySelector('.auth-header');
    
    if (authHeader) {
        authHeader.after(messageDiv);
    } else if (authForm) {
        authForm.prepend(messageDiv);
    } else {
        // If no auth form, insert at top of auth card
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.prepend(messageDiv);
        }
    }
    
    // Auto-remove after 5 seconds (except for success messages during redirect)
    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Clear all auth messages
function clearAuthMessages() {
    document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidMobile(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
}

function navigateTo(page) {
    console.log(`Navigating to: ${page}`);
    window.location.href = page;
}

// Add auth protection utility to utils.js
function requireAuth() {
    if (!isLoggedIn()) {
        showAuthMessage('Please login to access this page', 'error');
        setTimeout(() => {
            navigateTo('login.html');
        }, 1000);
        return false;
    }
    return true;
}

// Initialize on all pages
function initAuth() {
    updateNavigation();
    
    // Check for auth required pages
    const authRequiredPages = ['profile.html', 'my-bookings.html', 'passengers.html', 'payment.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (authRequiredPages.includes(currentPage)) {
        if (!requireAuth()) {
            return false;
        }
    }
    
    return true;
}

// Initialize auth on page load
initAuth();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isLoggedIn,
        getCurrentUser,
        logoutUser,
        updateNavigation,
        requireAuth,
        showAuthMessage
    };
}
// Auto-update navigation on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation after a short delay to ensure auth.js is loaded
    setTimeout(updateNavigation, 100);
    
    // Add click handler for logout if it exists
    document.addEventListener('click', function(e) {
        if (e.target.closest('#logoutBtn')) {
            e.preventDefault();
            logoutUser();
        }
    });
});