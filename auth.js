// Authentication Management
const API_BASE_URL = 'http://localhost:8001/api';

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupAuthModal();
});

// Check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (token && userEmail) {
        setUserLoggedIn(userName || userEmail);
    } else {
        setUserLoggedOut();
    }
}

// Set UI for logged-in user
function setUserLoggedIn(userName) {
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const userAction = document.getElementById('userAction');
    const logoutBtn = document.getElementById('logoutBtn');
    const userActionText = document.getElementById('userActionText');
    
    if (signInBtn) signInBtn.style.display = 'none';
    if (signUpBtn) signUpBtn.style.display = 'none';
    if (userAction) userAction.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (userActionText) userActionText.textContent = userName;
    
    // Close modal if open
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}

// Set UI for logged-out user
function setUserLoggedOut() {
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const userAction = document.getElementById('userAction');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (signInBtn) signInBtn.style.display = 'flex';
    if (signUpBtn) signUpBtn.style.display = 'flex';
    if (userAction) userAction.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

// Setup Authentication Modal
function setupAuthModal() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.auth-close');
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginFormMain');
    const signupForm = document.getElementById('signupFormMain');

    // Open modal for Sign In
    if (signInBtn) {
        signInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('login');
        });
    }

    // Open modal for Sign Up
    if (signUpBtn) {
        signUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('signup');
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup Form Submit
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Open Auth Modal
function openAuthModal(type) {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginFormModal');
    const signupForm = document.getElementById('signupFormModal');

    modal.style.display = 'block';

    if (type === 'login') {
        if (loginForm) loginForm.classList.add('active');
        if (signupForm) signupForm.classList.remove('active');
    } else {
        if (loginForm) loginForm.classList.remove('active');
        if (signupForm) signupForm.classList.add('active');
    }

    // Clear messages
    const loginMessage = document.getElementById('loginMessageModal');
    const signupMessage = document.getElementById('signupMessageModal');
    if (loginMessage) loginMessage.innerHTML = '';
    if (signupMessage) signupMessage.innerHTML = '';
}

// Switch to Sign Up form
function switchToSignupModal() {
    const loginForm = document.getElementById('loginFormModal');
    const signupForm = document.getElementById('signupFormModal');
    if (loginForm) loginForm.classList.remove('active');
    if (signupForm) signupForm.classList.add('active');
}

// Switch to Login form
function switchToLoginModal() {
    const loginForm = document.getElementById('loginFormModal');
    const signupForm = document.getElementById('signupFormModal');
    if (loginForm) loginForm.classList.add('active');
    if (signupForm) signupForm.classList.remove('active');
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmailModal').value;
    const password = document.getElementById('loginPasswordModal').value;
    const messageDiv = document.getElementById('loginMessageModal');

    // Clear previous message
    if (messageDiv) messageDiv.innerHTML = '';

    try {
        // Show loading state
        const button = e.target.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = 'Signing In...';
        button.disabled = true;

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        button.textContent = originalText;
        button.disabled = false;

        if (response.ok) {
            // Save auth data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', data.name || email.split('@')[0]);

            // Show success message
            if (messageDiv) {
                messageDiv.innerHTML = '<div class="message success">✓ Login successful! Welcome back!</div>';
            }

            // Update UI
            setUserLoggedIn(data.name || email.split('@')[0]);

            // Close modal after 1 second
            setTimeout(() => {
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'none';
            }, 1000);

            // Reset form
            document.getElementById('loginFormMain').reset();
        } else {
            // Show error message
            if (messageDiv) {
                messageDiv.innerHTML = `<div class="message error">✗ ${data.message || 'Login failed. Please try again.'}</div>`;
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="message error">✗ Network error. Please check your connection.</div>';
        }
        const button = e.target.querySelector('button[type="submit"]');
        button.textContent = 'Sign In';
        button.disabled = false;
    }
}

// Handle Sign Up
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupNameModal').value;
    const email = document.getElementById('signupEmailModal').value;
    const password = document.getElementById('signupPasswordModal').value;
    const confirmPassword = document.getElementById('signupConfirmPasswordModal').value;
    const messageDiv = document.getElementById('signupMessageModal');

    // Clear previous message
    if (messageDiv) messageDiv.innerHTML = '';

    // Validate passwords match
    if (password !== confirmPassword) {
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="message error">✗ Passwords do not match!</div>';
        }
        return;
    }

    try {
        // Show loading state
        const button = e.target.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = 'Creating Account...';
        button.disabled = true;

        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        button.textContent = originalText;
        button.disabled = false;

        if (response.ok) {
            // Save auth data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);

            // Show success message
            if (messageDiv) {
                messageDiv.innerHTML = '<div class="message success">✓ Account created successfully! Welcome to Elanicia!</div>';
            }

            // Update UI
            setUserLoggedIn(name);

            // Close modal after 1 second
            setTimeout(() => {
                const modal = document.getElementById('authModal');
                if (modal) modal.style.display = 'none';
            }, 1000);

            // Reset form
            document.getElementById('signupFormMain').reset();
        } else {
            // Show error message
            if (messageDiv) {
                messageDiv.innerHTML = `<div class="message error">✗ ${data.message || 'Sign up failed. Please try again.'}</div>`;
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="message error">✗ Network error. Please check your connection.</div>';
        }
        const button = e.target.querySelector('button[type="submit"]');
        button.textContent = 'Create Account';
        button.disabled = false;
    }
}

// Handle Logout
function handleLogout(e) {
    e.preventDefault();

    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');

    // Update UI
    setUserLoggedOut();

    // Show notification
    showNotification('✓ You have been logged out successfully');
}

// Notification function (if not already defined in main script)
function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #8b6914;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(139, 105, 20, 0.3);
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Image Cycling Animation on About Section
document.addEventListener('DOMContentLoaded', () => {
    const aboutImageHover = document.querySelector('.about-image-hover');
    if (aboutImageHover) {
        const images = aboutImageHover.querySelectorAll('.about-img-cycle');
        let rotationInterval;
        
        aboutImageHover.addEventListener('mouseenter', () => {
            let currentIndex = 0;
            clearInterval(rotationInterval);
            
            rotationInterval = setInterval(() => {
                images.forEach((img, index) => {
                    img.style.opacity = index === currentIndex ? '1' : '0';
                });
                currentIndex = (currentIndex + 1) % images.length;
            }, 1200);
        });
        
        aboutImageHover.addEventListener('mouseleave', () => {
            clearInterval(rotationInterval);
            // Reset to first image
            images.forEach((img, index) => {
                img.style.opacity = index === 0 ? '1' : '0';
            });
        });
    }
});

