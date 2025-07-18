// ===== APPLICATION STATE =====
let currentUser = null;
let onlineUsers = [];
let scene, camera, renderer, particles;

// ===== MOCK DATABASE (In real MERN app, this would be MongoDB) =====
let users = [
    {
        id: 1,
        username: "dev_sarah",
        email: "sarah@example.com",
        password: "password123", // In real app, this would be hashed
        skillLevel: "intermediate",
        primaryStack: "mern",
        isOnline: true,
        lastSeen: new Date()
    },
    {
        id: 2,
        username: "code_ninja",
        email: "ninja@example.com",
        password: "ninja123",
        skillLevel: "advanced",
        primaryStack: "django",
        isOnline: true,
        lastSeen: new Date()
    }
];

// ===== UTILITY FUNCTIONS =====
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function showError(message) {
    // Simple error handling - in real app, you'd have better UI
    alert(message);
}

function showSuccess(message) {
    // Simple success handling - in real app, you'd have better UI
    alert(message);
}

// ===== AUTHENTICATION FUNCTIONS =====
function register(userData) {
    // Check if username already exists
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
        showError("Username already exists!");
        return false;
    }

    // Check if email already exists
    const existingEmail = users.find(user => user.email === userData.email);
    if (existingEmail) {
        showError("Email already registered!");
        return false;
    }

    // Create new user
    const newUser = {
        id: users.length + 1,
        username: userData.username,
        email: userData.email,
        password: userData.password, // In real app, hash this!
        skillLevel: userData.skillLevel,
        primaryStack: userData.primaryStack,
        isOnline: true,
        lastSeen: new Date()
    };

    users.push(newUser);
    showSuccess("Account created successfully!");
    return true;
}

function login(username, password) {
    // Find user by username
    const user = users.find(user => user.username === username);
    
    if (!user) {
        showError("Username not found!");
        return false;
    }
    
    if (user.password !== password) {
        showError("Invalid password!");
        return false;
    }
    
    // Set user as online
    user.isOnline = true;
    user.lastSeen = new Date();
    
    // Set current user
    currentUser = user;
    
    showSuccess("Welcome back, " + user.username + "!");
    return true;
}

function logout() {
    if (currentUser) {
        // Set user as offline
        const user = users.find(u => u.id === currentUser.id);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
        }
        
        currentUser = null;
        showLandingPage();
    }
}

// ===== UI FUNCTIONS =====
function showLandingPage() {
    document.getElementById('landing').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    hideModal('loginModal');
    hideModal('registerModal');
}

function showDashboard() {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // Update user info in dashboard
    document.getElementById('currentUser').textContent = currentUser.username;
    document.getElementById('profileName').textContent = currentUser.username;
    document.getElementById('profileStack').textContent = getStackName(currentUser.primaryStack);
    document.getElementById('profileLevel').textContent = capitalizeFirst(currentUser.skillLevel);
    
    // Load online developers
    loadOnlineDevelopers();
}

function getStackName(stack) {
    const stackNames = {
        'mern': 'MERN Stack',
        'mean': 'MEAN Stack',
        'django': 'Django/Python',
        'rails': 'Ruby on Rails',
        'php': 'PHP/Laravel',
        'dotnet': '.NET',
        'java': 'Java/Spring',
        'other': 'Other'
    };
    return stackNames[stack] || 'Other';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function loadOnlineDevelopers() {
    const container = document.getElementById('onlineDevelopers');
    container.innerHTML = '';
    
    // Get online users (excluding current user)
    const onlineDevs = users.filter(user => 
        user.isOnline && user.id !== currentUser.id
    );
    
    if (onlineDevs.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No other developers online right now.</p>';
        return;
    }
    
    onlineDevs.forEach(user => {
        const devCard = document.createElement('div');
        devCard.className = 'dev-card';
        
        // Generate random gradient for avatar
        const gradients = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a8edea, #fed6e3)'
        ];
        
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        devCard.innerHTML = `
            <div class="dev-avatar" style="background: ${randomGradient};"></div>
            <h3 class="dev-name">${user.username}</h3>
            <p class="dev-stack">${getStackName(user.primaryStack)}</p>
            <p class="dev-level">${capitalizeFirst(user.skillLevel)} Developer</p>
            <button class="cta-button" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="connectWithDeveloper('${user.username}')">
                Connect
            </button>
        `;
        
        container.appendChild(devCard);
    });
}

function connectWithDeveloper(username) {
    // In real app, this would open a chat or collaboration interface
    showSuccess(`Connecting with ${username}...`);
}

// ===== MAIN EVENT HANDLERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Login button - show login modal
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('loginModal');
        });
    }

    // Register button - show register modal
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('registerModal');
        });
    }

    // Close modal buttons
    const closeLogin = document.getElementById('closeLogin');
    if (closeLogin) {
        closeLogin.addEventListener('click', function() {
            hideModal('loginModal');
        });
    }

    const closeRegister = document.getElementById('closeRegister');
    if (closeRegister) {
        closeRegister.addEventListener('click', function() {
            hideModal('registerModal');
        });
    }

    // Switch between login and register
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function() {
            hideModal('loginModal');
            showModal('registerModal');
        });
    }

    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function() {
            hideModal('registerModal');
            showModal('loginModal');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (login(username, password)) {
                hideModal('loginModal');
                showDashboard();
            }
        });
    }

    // Register form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const skillLevel = document.getElementById('skillLevel').value;
            const primaryStack = document.getElementById('primaryStack').value;

            // Validate password confirmation
            if (password !== confirmPassword) {
                showError("Passwords don't match!");
                return;
            }

            // Validate password length
            if (password.length < 6) {
                showError("Password must be at least 6 characters!");
                return;
            }

            const userData = {
                username,
                email,
                password,
                skillLevel,
                primaryStack
            };

            if (register(userData)) {
                hideModal('registerModal');
                currentUser = users.find(user => user.username === username);
                showDashboard();
            }
        });
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            hideModal('loginModal');
            hideModal('registerModal');
        }
    });
});