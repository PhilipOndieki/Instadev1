// ===== APPLICATION STATE =====
let currentUser = null;
let authToken = null;

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

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
    // Create a better error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 4000);
}

function showSuccess(message) {
    // Create a better success notification
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #51cf66, #40c057);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(81, 207, 102, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 4000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ===== API FUNCTIONS =====
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== AUTHENTICATION FUNCTIONS =====
async function register(userData) {
    try {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showSuccess(response.message);
        return true;
    } catch (error) {
        showError(error.message);
        return false;
    }
}

async function login(username, password) {
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showSuccess(response.message);
        return true;
    } catch (error) {
        showError(error.message);
        return false;
    }
}

async function logout() {
    try {
        if (authToken) {
            await apiCall('/auth/logout', { method: 'POST' });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        showLandingPage();
    }
}

// Check for existing session on page load
function checkExistingSession() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
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
    
    // Load dashboard data
    loadOnlineDevelopers();
    loadProjects();
    loadStories();
    loadFriends();
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

async function loadOnlineDevelopers() {
    try {
        const skillFilter = document.getElementById('skillFilter')?.value || '';
        const stackFilter = document.getElementById('stackFilter')?.value || '';
        
        const queryParams = new URLSearchParams();
        if (skillFilter) queryParams.append('skillLevel', skillFilter);
        if (stackFilter) queryParams.append('primaryStack', stackFilter);
        
        const users = await apiCall(`/users/online?${queryParams}`);
        const container = document.getElementById('onlineDevelopers');
        container.innerHTML = '';
        
        if (users.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No developers found matching your filters.</p>';
            return;
        }
        
        users.forEach(user => {
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
                <button class="cta-button" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="sendFriendRequest('${user._id}')">
                    Connect
                </button>
            `;
            
            container.appendChild(devCard);
        });
    } catch (error) {
        showError('Failed to load developers');
    }
}

async function loadProjects() {
    try {
        const projects = await apiCall('/projects');
        const container = document.getElementById('projectsGrid');
        container.innerHTML = '';
        
        if (projects.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No projects shared yet. Be the first to showcase your work!</p>';
            return;
        }
        
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            const techTags = project.technologies.map(tech => 
                `<span class="tech-tag">${tech}</span>`
            ).join('');
            
            const links = [];
            if (project.projectLink) {
                links.push(`<a href="${project.projectLink}" target="_blank" class="project-link">View Code</a>`);
            }
            if (project.demoLink) {
                links.push(`<a href="${project.demoLink}" target="_blank" class="project-link">Live Demo</a>`);
            }
            
            projectCard.innerHTML = `
                <h3 class="project-title">${project.title}</h3>
                <p class="project-author">by ${project.author.username}</p>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">${techTags}</div>
                <div class="project-links">${links.join('')}</div>
            `;
            
            container.appendChild(projectCard);
        });
    } catch (error) {
        showError('Failed to load projects');
    }
}

async function loadStories() {
    try {
        const stories = await apiCall('/stories');
        const container = document.getElementById('storiesFeed');
        container.innerHTML = '';
        
        if (stories.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No stories yet. Share your coding journey!</p>';
            return;
        }
        
        stories.forEach(story => {
            const storyCard = document.createElement('div');
            storyCard.className = 'story-card';
            
            const timeAgo = getTimeAgo(story.createdAt);
            const isLiked = story.likes.includes(currentUser.id);
            const isRetweeted = story.retweets.includes(currentUser.id);
            
            const tags = story.tags.map(tag => 
                `<span class="story-tag">${tag}</span>`
            ).join('');
            
            storyCard.innerHTML = `
                <div class="story-header">
                    <div class="story-avatar"></div>
                    <div>
                        <div class="story-author">${story.author.username}</div>
                    </div>
                    <div class="story-time">${timeAgo}</div>
                </div>
                <div class="story-content">${story.content}</div>
                <div class="story-tags">${tags}</div>
                <div class="story-actions">
                    <button class="story-action ${isLiked ? 'liked' : ''}" onclick="toggleLike('${story._id}')">
                        ❤️ ${story.likes.length}
                    </button>
                    <button class="story-action ${isRetweeted ? 'retweeted' : ''}" onclick="toggleRetweet('${story._id}')">
                        🔄 ${story.retweets.length}
                    </button>
                </div>
            `;
            
            container.appendChild(storyCard);
        });
    } catch (error) {
        showError('Failed to load stories');
    }
}

async function loadFriends() {
    try {
        const [friendRequests, friends] = await Promise.all([
            apiCall('/friends/requests'),
            apiCall('/friends')
        ]);

        const friendsContainer = document.getElementById('friendsList');
        const requestsContainer = document.getElementById('friendRequests');
        const friendCount = document.getElementById('friendCount');
        
        // Load friend requests
        requestsContainer.innerHTML = '';
        if (friendRequests.length === 0) {
            requestsContainer.innerHTML = '<p style="opacity: 0.7;">No pending friend requests</p>';
        } else {
            friendRequests.forEach(request => {
                const requestCard = document.createElement('div');
                requestCard.className = 'friend-card';
                requestCard.innerHTML = `
                    <div class="friend-avatar"></div>
                    <div class="friend-info">
                        <div class="friend-name">${request.from.username}</div>
                        <div class="friend-details">${capitalizeFirst(request.from.skillLevel)} • ${getStackName(request.from.primaryStack)}</div>
                    </div>
                    <div class="friend-actions">
                        <button class="friend-btn accept" onclick="acceptFriendRequest('${request._id}')">Accept</button>
                        <button class="friend-btn decline" onclick="declineFriendRequest('${request._id}')">Decline</button>
                    </div>
                `;
                requestsContainer.appendChild(requestCard);
            });
        }
        
        // Load friends list
        friendsContainer.innerHTML = '';
        friendCount.textContent = `${friends.length} connection${friends.length !== 1 ? 's' : ''}`;
        
        if (friends.length === 0) {
            friendsContainer.innerHTML = '<p style="opacity: 0.7;">No friends yet. Start connecting with other developers!</p>';
        } else {
            friends.forEach(friend => {
                const friendCard = document.createElement('div');
                friendCard.className = 'friend-card';
                friendCard.innerHTML = `
                    <div class="friend-avatar"></div>
                    <div class="friend-info">
                        <div class="friend-name">${friend.username}</div>
                        <div class="friend-details">${capitalizeFirst(friend.skillLevel)} • ${getStackName(friend.primaryStack)}</div>
                    </div>
                    <div class="friend-actions">
                        <button class="friend-btn" onclick="messageUser('${friend.username}')">Message</button>
                    </div>
                `;
                friendsContainer.appendChild(friendCard);
            });
        }
    } catch (error) {
        showError('Failed to load friends');
    }
}

// ===== HELPER FUNCTIONS =====
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// ===== FEATURE FUNCTIONS =====
async function sendFriendRequest(userId) {
    try {
        await apiCall(`/friends/request/${userId}`, { method: 'POST' });
        showSuccess('Friend request sent!');
        loadOnlineDevelopers(); // Refresh to update button states
    } catch (error) {
        showError(error.message);
    }
}

async function acceptFriendRequest(requestId) {
    try {
        await apiCall(`/friends/accept/${requestId}`, { method: 'POST' });
        showSuccess('Friend request accepted!');
        loadFriends();
        loadOnlineDevelopers();
    } catch (error) {
        showError(error.message);
    }
}

async function declineFriendRequest(requestId) {
    try {
        await apiCall(`/friends/decline/${requestId}`, { method: 'POST' });
        showSuccess('Friend request declined');
        loadFriends();
    } catch (error) {
        showError(error.message);
    }
}

async function toggleLike(storyId) {
    try {
        await apiCall(`/stories/${storyId}/like`, { method: 'POST' });
        loadStories(); // Refresh stories to show updated likes
    } catch (error) {
        showError('Failed to update like');
    }
}

async function toggleRetweet(storyId) {
    try {
        await apiCall(`/stories/${storyId}/retweet`, { method: 'POST' });
        loadStories(); // Refresh stories to show updated retweets
    } catch (error) {
        showError('Failed to update retweet');
    }
}

function messageUser(username) {
    // In real app, this would open a chat interface
    showSuccess(`Opening chat with ${username}... (Feature coming soon!)`);
}

// ===== TAB FUNCTIONALITY =====
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to selected tab button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// ===== MAIN EVENT HANDLERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing session
    checkExistingSession();

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Filter controls
    const skillFilter = document.getElementById('skillFilter');
    const stackFilter = document.getElementById('stackFilter');
    
    if (skillFilter) {
        skillFilter.addEventListener('change', loadOnlineDevelopers);
    }
    
    if (stackFilter) {
        stackFilter.addEventListener('change', loadOnlineDevelopers);
    }
    
    // Add Project button
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', function() {
            showModal('projectModal');
        });
    }
    
    // Add Story button
    const addStoryBtn = document.getElementById('addStoryBtn');
    if (addStoryBtn) {
        addStoryBtn.addEventListener('click', function() {
            showModal('storyModal');
        });
    }
    
    // Close modal buttons
    const closeProject = document.getElementById('closeProject');
    if (closeProject) {
        closeProject.addEventListener('click', function() {
            hideModal('projectModal');
        });
    }
    
    const closeStory = document.getElementById('closeStory');
    if (closeStory) {
        closeStory.addEventListener('click', function() {
            hideModal('storyModal');
        });
    }
    
    // Project form handling
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('projectTitle').value;
            const description = document.getElementById('projectDescription').value;
            const technologies = document.getElementById('projectTech').value;
            const projectLink = document.getElementById('projectLink').value;
            const demoLink = document.getElementById('projectDemo').value;
            
            try {
                await apiCall('/projects', {
                    method: 'POST',
                    body: JSON.stringify({
                        title,
                        description,
                        technologies,
                        projectLink,
                        demoLink
                    })
                });
                
                hideModal('projectModal');
                projectForm.reset();
                loadProjects();
                showSuccess("Project added successfully!");
            } catch (error) {
                showError(error.message);
            }
        });
    }
    
    // Story form handling
    const storyForm = document.getElementById('storyForm');
    if (storyForm) {
        storyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const content = document.getElementById('storyContent').value;
            const tags = document.getElementById('storyTags').value;
            
            if (content.length > 500) {
                showError("Story must be 500 characters or less!");
                return;
            }
            
            try {
                await apiCall('/stories', {
                    method: 'POST',
                    body: JSON.stringify({
                        content,
                        tags
                    })
                });
                
                hideModal('storyModal');
                storyForm.reset();
                loadStories();
                showSuccess("Story shared successfully!");
            } catch (error) {
                showError(error.message);
            }
        });
    }
    
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
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (await login(username, password)) {
                hideModal('loginModal');
                showDashboard();
            }
        });
    }

    // Register form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
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

            if (await register(userData)) {
                hideModal('registerModal');
                showDashboard();
            }
        });
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            hideModal('loginModal');
            hideModal('registerModal');
            hideModal('projectModal');
            hideModal('storyModal');
        }
    });
});