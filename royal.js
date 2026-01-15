// Elanicia JavaScript with Beige Theme

// Initialize main website animations
document.addEventListener('DOMContentLoaded', () => {
    initializeWelcomeScreen();
});

// Initialize welcome screen
function initializeWelcomeScreen() {
    console.log('Starting Elanicia luxury welcome experience...');
    
    // Always show welcome screen for 7 seconds (no blur, clean aesthetic)
    const displayDelay = 7000; // Exactly 7 seconds
    
    // Ensure welcome screen is visible with no blur
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');
    
    // Set initial states
    welcomeScreen.style.display = 'flex';
    welcomeScreen.style.opacity = '1';
    welcomeScreen.style.filter = 'none';
    welcomeScreen.style.backdropFilter = 'none';
    mainContent.style.display = 'none';
    
    // Show main content after exactly 4 seconds
    setTimeout(() => {
        // Fade out welcome screen elegantly
        welcomeScreen.style.transition = 'all 0.8s ease-out';
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.transform = 'scale(1.05)';
        
        // Show main content with smooth fade-in
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            mainContent.style.display = 'block';
            mainContent.style.opacity = '0';
            mainContent.style.transition = 'all 0.6s ease-in';
            
            setTimeout(() => {
                mainContent.style.opacity = '1';
                initializeMainAnimations();
                initializeAuth();
                console.log('Welcome to Elanicia - Royal Swiss Heritage!');
            }, 100);
        }, 800);
    }, displayDelay);
}

// Initialize authentication system
function initializeAuth() {
    console.log('Initializing authentication system...');
    const currentUser = JSON.parse(localStorage.getItem('elaniciaCurrentUser') || 'null');
    const userAction = document.getElementById('userAction');
    const userActionText = document.getElementById('userActionText');
    
    console.log('Current user:', currentUser);
    console.log('User action element:', userAction);
    
    if (currentUser) {
        // User is logged in
        userActionText.textContent = currentUser.name;
        userAction.onclick = showUserMenu;
        
        // Show welcome message
        setTimeout(() => {
            showBeigeNotification('Welcome back, ' + currentUser.name + '!');
        }, 1000);
        
        console.log('User logged in:', currentUser.name);
    } else {
        // User is not logged in - show modal
        userActionText.textContent = 'Login';
        userAction.onclick = (e) => {
            console.log('Login button clicked!');
            e.preventDefault();
            showAuthModal();
        };
        console.log('Login button event listener added');
    }
    
    // Initialize modal functionality
    initializeAuthModal();
}

// Show authentication modal
function showAuthModal() {
    console.log('showAuthModal called');
    const modal = document.getElementById('authModal');
    console.log('Modal element:', modal);
    
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        console.log('Modal should be visible now');
    } else {
        console.error('Modal element not found!');
    }
}

// Hide authentication modal
function hideAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    clearModalMessages();
}

// Switch to signup form in modal
function switchToSignupModal() {
    document.getElementById('loginFormMain').classList.remove('active');
    document.getElementById('signupFormMain').classList.add('active');
    clearModalMessages();
}

// Switch to login form in modal
function switchToLoginModal() {
    document.getElementById('signupFormMain').classList.remove('active');
    document.getElementById('loginFormMain').classList.add('active');
    clearModalMessages();
}

// Clear modal messages
function clearModalMessages() {
    document.getElementById('loginMessageModal').innerHTML = '';
    document.getElementById('signupMessageModal').innerHTML = '';
}

// Show message in modal
function showModalMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        element.innerHTML = '';
    }, 5000);
}

// Initialize modal functionality with backend integration
function initializeAuthModal() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.auth-close');
    
    // Close modal when clicking X
    closeBtn.onclick = hideAuthModal;
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            hideAuthModal();
        }
    };
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            hideAuthModal();
        }
    });
    
    // Login form handler with backend integration
    document.getElementById('loginFormMain').addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🔐 Modal login form submitted');
        
        const email = document.getElementById('loginEmailModal').value;
        const password = document.getElementById('loginPasswordModal').value;
        
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password ? '***' : 'empty');

        if (!email || !password) {
            showModalMessage('loginMessageModal', 'Please enter both email and password!', 'error');
            return;
        }

        try {
            // Try backend first
            const response = await fetch('http://localhost:8001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend login successful');
                
                // Save current user
                localStorage.setItem('elaniciaCurrentUser', JSON.stringify(data.user));
                
                showModalMessage('loginMessageModal', 'Login successful! Welcome!', 'success');
                
                // Update UI and close modal after 1 second
                setTimeout(() => {
                    hideAuthModal();
                    initializeAuth(); // Refresh auth state
                    showBeigeNotification(`🎉 Welcome, ${data.user.name}!`);
                }, 1000);
            } else {
                const errorData = await response.json();
                showModalMessage('loginMessageModal', errorData.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.log('⚠️ Backend not available, using demo mode');
            // Fallback to demo mode
            if (email && password) {
                const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
                
                const user = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('elaniciaCurrentUser', JSON.stringify(user));
                
                showModalMessage('loginMessageModal', 'Login successful! Welcome!', 'success');
                
                setTimeout(() => {
                    hideAuthModal();
                    initializeAuth();
                    showBeigeNotification(`🎉 Welcome, ${user.name}!`);
                }, 1000);
            }
        }
    });
    
    // Signup form handler with backend integration
    document.getElementById('signupFormMain').addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Modal signup form submitted');
        
        const name = document.getElementById('signupNameModal').value;
        const email = document.getElementById('signupEmailModal').value;
        const password = document.getElementById('signupPasswordModal').value;
        const confirmPassword = document.getElementById('signupConfirmPasswordModal').value;

        // Basic validation
        if (!name || !email || !password) {
            showModalMessage('signupMessageModal', 'Please fill in all fields!', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showModalMessage('signupMessageModal', 'Passwords do not match!', 'error');
            return;
        }

        if (password.length < 6) {
            showModalMessage('signupMessageModal', 'Password must be at least 6 characters!', 'error');
            return;
        }

        try {
            // Try backend first
            const response = await fetch('http://localhost:8001/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend signup successful');
                showModalMessage('signupMessageModal', 'Account created successfully! You can now sign in.', 'success');
                
                // Clear form
                document.getElementById('signupFormMain').reset();
                
                // Switch to login after 2 seconds
                setTimeout(() => {
                    switchToLoginModal();
                }, 2000);
            } else {
                const errorData = await response.json();
                showModalMessage('signupMessageModal', errorData.error || 'Signup failed', 'error');
            }
        } catch (error) {
            console.log('⚠️ Backend not available, using demo mode');
            // Demo mode fallback
            showModalMessage('signupMessageModal', 'Account created successfully! You can now sign in.', 'success');
            
            document.getElementById('signupFormMain').reset();
            
            setTimeout(() => {
                switchToLoginModal();
            }, 2000);
        }
    });
}

// Show user menu when logged in
function showUserMenu(e) {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('elaniciaCurrentUser'));
    
    if (confirm(`Hello ${currentUser.name}!\n\nEmail: ${currentUser.email}\nLogin Time: ${new Date(currentUser.loginTime).toLocaleString()}\n\nDo you want to logout?`)) {
        logout();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('elaniciaCurrentUser');
    showBeigeNotification('👋 Logged out successfully!');
    
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Initialize main website animations
function initializeMainAnimations() {
    // Add entrance animation to body
    document.body.style.animation = 'fadeInMain 1.5s ease-out';
    
    console.log('✨ Initializing Elanicia beige theme website...');
    
    // Initialize all animations
    initializeScrollAnimations();
    initializeProductAnimations();
    initializeNavigation();
    initializeCardShuffle();
    
    // Initialize videos with delay to ensure DOM is ready
    setTimeout(() => {
        console.log('🎥 Starting video initialization...');
        initializeVideos();
    }, 500);
}

// Initialize card shuffle animation for Swiss craftsman section
function initializeCardShuffle() {
    const aboutImage = document.querySelector('.about-image');
    const cards = document.querySelectorAll('.card');
    const overlayText = document.querySelector('.overlay-text');
    
    if (!aboutImage || !cards.length) return;
    
    let currentIndex = 0;
    let isShuffling = false;
    const cardTitles = Array.from(cards).map(card => card.getAttribute('data-title'));
    
    console.log('🃏 Card shuffle initialized with', cards.length, 'cards');
    
    // Shuffle on mouse enter (hover)
    aboutImage.addEventListener('mouseenter', () => {
        if (!isShuffling) {
            shuffleCards();
        }
    });
    
    // Optional: Also shuffle on mouse leave for extra effect
    aboutImage.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (!isShuffling) {
                shuffleCards();
            }
        }, 500);
    });
    
    function shuffleCards() {
        if (isShuffling) return;
        isShuffling = true;
        
        console.log('🃏 Card shuffle triggered on hover');
        
        // Get current active card
        const activeCard = document.querySelector('.card.active');
        if (!activeCard) {
            isShuffling = false;
            return;
        }
        
        // Remove active class and add shuffling animation
        activeCard.classList.remove('active');
        activeCard.classList.add('shuffling');
        
        // Move to next card
        currentIndex = (currentIndex + 1) % cards.length;
        const nextCard = cards[currentIndex];
        
        // Update overlay text with animation
        overlayText.style.transform = 'translateY(-20px)';
        overlayText.style.opacity = '0';
        
        setTimeout(() => {
            overlayText.textContent = cardTitles[currentIndex];
            overlayText.style.transform = 'translateY(0)';
            overlayText.style.opacity = '1';
        }, 200);
        
        // Animate next card coming forward
        setTimeout(() => {
            nextCard.classList.add('coming-forward');
            nextCard.classList.add('active');
        }, 200);
        
        // Reset shuffling card after animation
        setTimeout(() => {
            activeCard.classList.remove('shuffling');
            activeCard.classList.remove('coming-forward');
            
            // Reorder cards in DOM for proper stacking
            const cardStack = document.querySelector('.card-stack');
            cardStack.appendChild(activeCard);
            
            // Reset z-index and transforms for all cards
            cards.forEach((card, index) => {
                card.classList.remove('coming-forward');
                if (!card.classList.contains('active')) {
                    const stackIndex = (index - currentIndex + cards.length) % cards.length;
                    card.style.zIndex = cards.length - stackIndex;
                    card.style.transform = `translateZ(-${stackIndex * 15}px) rotateY(-${stackIndex * 3}deg) scale(${1 - stackIndex * 0.03})`;
                }
            });
            
            // Ensure active card is on top
            nextCard.style.zIndex = 10;
            nextCard.style.transform = 'translateZ(0px) rotateY(0deg) scale(1)';
            
            isShuffling = false;
            
        }, 800);
        
        // Add enhanced sparkle effect
        createCardSparkles(aboutImage);
    }
}

// Create enhanced sparkle effect for card shuffle
function createCardSparkles(container) {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = ['✨', '💎', '⭐', '🌟'][Math.floor(Math.random() * 4)];
            sparkle.style.cssText = `
                position: absolute;
                font-size: ${16 + Math.random() * 8}px;
                color: #d4af37;
                pointer-events: none;
                z-index: 1000;
                animation: cardSparkle 1.5s ease-out forwards;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                text-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
            `;
            
            container.style.position = 'relative';
            container.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1500);
        }, i * 80);
    }
}

// Initialize video playback
function initializeVideos() {
    const videos = document.querySelectorAll('.category-image video, .hero-bg-video');
    
    console.log(`Found ${videos.length} videos to initialize`);
    
    videos.forEach((video, index) => {
        const source = video.querySelector('source');
        const videoPath = source ? source.src : 'No source found';
        console.log(`Video ${index + 1}: ${videoPath}`);
        
        // Set video properties
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        
        // Force video to show by removing any background
        video.style.background = 'transparent';
        video.style.display = 'block';
        
        // Check if video file exists by trying to load it
        video.addEventListener('loadstart', () => {
            console.log(`Video ${index + 1}: Started loading`);
        });
        
        video.addEventListener('loadedmetadata', () => {
            console.log(`Video ${index + 1}: Metadata loaded - Duration: ${video.duration}s`);
        });
        
        video.addEventListener('loadeddata', () => {
            console.log(`Video ${index + 1}: Data loaded successfully`);
            video.style.background = 'transparent';
            // Try to play immediately when data is loaded
            video.play().then(() => {
                console.log(`Video ${index + 1}: Playing successfully`);
            }).catch(error => {
                console.log(`Video ${index + 1}: Play failed:`, error);
            });
        });
        
        video.addEventListener('canplay', () => {
            console.log(`Video ${index + 1}: Can play - attempting to start`);
            video.play().then(() => {
                console.log(`Video ${index + 1}: Playing successfully`);
            }).catch(error => {
                console.log(`Video ${index + 1}: Play failed:`, error);
            });
        });
        
        video.addEventListener('error', (e) => {
            console.log(`Video ${index + 1}: ERROR -`, e);
            console.log(`Video ${index + 1}: Error details:`, video.error);
            // Show fallback background
            video.style.background = '#ddd';
        });
        
        video.addEventListener('stalled', () => {
            console.log(`Video ${index + 1}: Stalled - network issues?`);
        });
        
        // Try to load
        video.load();
        
        // Manual attempt after delay
        setTimeout(() => {
            if (video.readyState >= 2) {
                video.play().catch(e => console.log(`Manual play failed for video ${index + 1}:`, e));
            } else {
                console.log(`Video ${index + 1}: Not ready yet, readyState: ${video.readyState}`);
            }
        }, 1000);
        
        // Additional attempt after longer delay
        setTimeout(() => {
            if (video.paused) {
                console.log(`Video ${index + 1}: Still paused, trying again...`);
                video.play().catch(e => console.log(`Final play attempt failed for video ${index + 1}:`, e));
            }
        }, 3000);
    });
}
// Initialize navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Initialize scroll animations
function initializeScrollAnimations() {
    // Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background change on scroll with beige effects
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
        header.style.background = 'rgba(245, 240, 235, 0.98)';
        header.style.boxShadow = '0 6px 30px rgba(212, 175, 55, 0.4)';
    } else {
        header.style.background = 'rgba(245, 240, 235, 0.95)';
        header.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.3)';
    }
});

// Enhanced scroll animations with intersection observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('animate');
                
                // Add special effects for different elements
                if (entry.target.classList.contains('product-card')) {
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
                if (entry.target.classList.contains('category-card')) {
                    entry.target.style.animationDelay = `${index * 0.2}s`;
                }
            }, index * 100);
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.querySelectorAll('.animate-on-scroll, .product-card, .category-card, .manufacturing-card').forEach(el => {
    observer.observe(el);
});
}

// Initialize product animations
function initializeProductAnimations() {
    // Enhanced cart functionality with royal animations
    let cartCount = 0;
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart:not([disabled])');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Beige button animation with sparkle effect
            button.style.transform = 'scale(0.95)';
            button.style.background = 'linear-gradient(45deg, #d4af37, #8b6914)';
            button.style.color = '#ffffff';
            button.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.6)';
            
            // Create sparkle effect
            createSparkleEffect(button);
            
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                button.style.background = '#3d3427';
                button.style.color = '#ffffff';
                button.style.boxShadow = 'none';
            }, 300);
            
            // Update cart count with royal animation
            cartCount++;
            cartCountElement.textContent = cartCount;
            
            // Enhanced cart icon animation
            const cartIcon = document.querySelector('.cart');
            cartIcon.style.transform = 'scale(1.3) rotate(10deg)';
            cartIcon.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
            
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1) rotate(0deg)';
                cartIcon.style.filter = 'none';
            }, 400);
            
            // Show beige notification
            showBeigeNotification('✨ Added to your luxury collection!');
        });
    });
}

// Create sparkle effect function
function createSparkleEffect(element) {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: absolute;
                font-size: 16px;
                color: #ffd700;
                pointer-events: none;
                z-index: 1000;
                animation: sparkleAnimation 1s ease-out forwards;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            element.parentElement.style.position = 'relative';
            element.parentElement.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }, i * 100);
    }
}

// Add sparkle animation to CSS dynamically
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleAnimation {
        0% { 
            opacity: 0;
            transform: scale(0) rotate(0deg) translateY(0px);
        }
        50% { 
            opacity: 1;
            transform: scale(1.5) rotate(180deg) translateY(-20px);
        }
        100% { 
            opacity: 0;
            transform: scale(0) rotate(360deg) translateY(-40px);
        }
    }
`;
document.head.appendChild(sparkleStyle);

// Quick view functionality with royal effects
const quickViewButtons = document.querySelectorAll('.quick-view');

quickViewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Beige button animation
        button.style.transform = 'scale(0.95)';
        button.style.background = '#ffffff';
        button.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.8)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.background = '#d4af37';
            button.style.boxShadow = 'none';
        }, 200);
        
        showBeigeNotification('👑 Opening luxury preview...');
    });
});

// Premium consultation button
const premiumBtn = document.querySelector('.premium-btn');
if (premiumBtn) {
    premiumBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showBeigeNotification('🏆 Scheduling your exclusive consultation...');
    });
}

// Premium contact button
const premiumContact = document.querySelector('.premium-contact');
if (premiumContact) {
    premiumContact.addEventListener('click', (e) => {
        e.preventDefault();
        showBeigeNotification('💎 Arranging your private viewing experience...');
    });
}

// Beige notification system
function showBeigeNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.beige-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'beige-notification';
    notification.innerHTML = message;
    
    // Style the notification with beige theme
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #8b6914, #d4af37);
        color: #ffffff;
        padding: 18px 30px;
        border-radius: 30px;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 30px rgba(139, 105, 20, 0.4);
        border: 2px solid #d4af37;
        backdrop-filter: blur(10px);
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        animation: beigeGlow 2s ease-in-out infinite;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 4000);
}

// Add beige glow animation for notifications
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes beigeGlow {
        0%, 100% { 
            box-shadow: 0 10px 30px rgba(139, 105, 20, 0.4);
        }
        50% { 
            box-shadow: 0 10px 30px rgba(139, 105, 20, 0.4), 0 0 40px rgba(212, 175, 55, 0.3);
        }
    }
`;
document.head.appendChild(notificationStyle);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.3;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Enhanced product card hover effects
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) scale(1.02)';
        card.style.boxShadow = '0 30px 60px rgba(212, 175, 55, 0.2)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    });
});

// Category card beige hover effects
const categoryCards = document.querySelectorAll('.category-card');

categoryCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const overlay = card.querySelector('.category-overlay');
        overlay.style.background = 'linear-gradient(to bottom, rgba(139, 105, 20, 0.4), rgba(212, 175, 55, 0.8))';
    });
    
    card.addEventListener('mouseleave', () => {
        const overlay = card.querySelector('.category-overlay');
        overlay.style.background = 'linear-gradient(to bottom, rgba(139, 105, 20, 0.3), rgba(61, 52, 39, 0.8))';
    });
});

// Logo royal animation on click
const logo = document.querySelector('.logo-text');

logo.addEventListener('click', () => {
    logo.style.animation = 'none';
    setTimeout(() => {
        logo.style.animation = 'royalLogoSpin 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 10);
});

// Add royal logo spin animation
const logoStyle = document.createElement('style');
logoStyle.textContent = `
    @keyframes royalLogoSpin {
        0% { 
            transform: rotate(0deg) scale(1); 
            filter: hue-rotate(0deg) brightness(1);
        }
        25% { 
            transform: rotate(90deg) scale(1.1); 
            filter: hue-rotate(30deg) brightness(1.2);
        }
        50% { 
            transform: rotate(180deg) scale(1.2); 
            filter: hue-rotate(60deg) brightness(1.4);
        }
        75% { 
            transform: rotate(270deg) scale(1.1); 
            filter: hue-rotate(30deg) brightness(1.2);
        }
        100% { 
            transform: rotate(360deg) scale(1); 
            filter: hue-rotate(0deg) brightness(1);
        }
    }
`;
document.head.appendChild(logoStyle);

// Loading animation for page
window.addEventListener('load', () => {
    // Add fade-in animation to main content
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);
});

// Social media links with royal effects
const socialLinks = document.querySelectorAll('.social-links a');

socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Beige animation
        link.style.transform = 'scale(0.9) rotate(15deg)';
        link.style.color = '#d4af37';
        link.style.filter = 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))';
        
        setTimeout(() => {
            link.style.transform = 'scale(1) rotate(0deg)';
            link.style.filter = 'none';
        }, 300);
        
        showBeigeNotification('✨ Luxury social experience coming soon!');
    });
});

// Enhanced floating animation for hero elements
const heroElements = document.querySelectorAll('.hero-text h1, .hero-subtitle, .cta-button');
heroElements.forEach((element, index) => {
    setInterval(() => {
        element.style.transform = `translateY(${Math.sin(Date.now() * 0.001 + index) * 3}px)`;
    }, 50);
});

// Add entrance animations with delays for better visual flow
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .category-card, .manufacturing-card');
    
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
});

// Currency formatter for prices
function formatPrice(price) {
    return `د.إ ${price.toLocaleString()}`;
}

// Initialize price formatting
document.querySelectorAll('.price, .premium-price').forEach(priceElement => {
    const price = priceElement.textContent.replace('د.إ ', '').replace(',', '');
    const numericPrice = parseInt(price);
    if (!isNaN(numericPrice)) {
        priceElement.textContent = formatPrice(numericPrice);
    }
});

console.log('Elanicia luxury website loaded with elegant beige theme!');