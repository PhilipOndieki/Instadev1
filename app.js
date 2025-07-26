// ===== APPLICATION STATE =====
let currentUser = null;
let onlineUsers = [];
let projects = [];
let stories = [];
let friendRequests = [];
let friends = [];
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
        lastSeen: new Date(),
        friends: [2],
        projects: [],
        stories: []
    },
    {
        id: 2,
        username: "code_ninja",
        email: "ninja@example.com",
        password: "ninja123",
        skillLevel: "advanced",
        primaryStack: "django",
        isOnline: true,
        lastSeen: new Date(),
        friends: [1],
        projects: [],
        stories: []
    },
    {
        id: 3,
        username: "react_dev",
        email: "react@example.com",
        password: "react123",
        skillLevel: "expert",
        primaryStack: "mern",
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
        friends: [],
        projects: [],
        stories: []
    }
];

// Sample projects
projects = [
    {
        id: 1,
        title: "E-commerce Platform",
        description: "Full-stack e-commerce solution with React frontend and Node.js backend",
        technologies: ["React", "Node.js", "MongoDB", "Express"],
        author: "dev_sarah",
        authorId: 1,
        projectLink: "https://github.com/dev_sarah/ecommerce",
        demoLink: "https://myecommerce.netlify.app",
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
        id: 2,
        title: "Task Management App",
        description: "Django-based task management system with real-time updates",
        technologies: ["Django", "Python", "PostgreSQL", "WebSocket"],
        author: "code_ninja",
        authorId: 2,
        projectLink: "https://github.com/code_ninja/taskmanager",
        demoLink: "",
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
    }
];

// Sample stories
stories = [
    {
        id: 1,
        content: "Just deployed my first full-stack application! 🚀 The feeling of seeing your code live is incredible. Thanks to this amazing community for all the support!",
        author: "dev_sarah",
        authorId: 1,
        tags: ["#milestone", "#fullstack", "#grateful"],
        likes: 5,
        retweets: 2,
        likedBy: [2],
        retweetedBy: [],
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
        id: 2,
        content: "Working on a Django project and loving the framework's philosophy. 'Don't repeat yourself' has become my coding mantra. What's your favorite programming principle?",
        author: "code_ninja",
        authorId: 2,
        tags: ["#django", "#philosophy", "#coding"],
        likes: 3,
        retweets: 1,
        likedBy: [1],
        retweetedBy: [1],
        createdAt: new Date(Date.now() - 7200000) // 2 hours ago
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
    
    // Load projects
    loadProjects();
    
    // Load stories
    loadStories();
    
    // Load friends
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

function loadOnlineDevelopers() {
    const container = document.getElementById('onlineDevelopers');
    container.innerHTML = '';
    
    // Get filter values
    const skillFilter = document.getElementById('skillFilter')?.value || '';
    const stackFilter = document.getElementById('stackFilter')?.value || '';
    
    // Get online users (excluding current user)
    let onlineDevs = users.filter(user => 
        user.isOnline && user.id !== currentUser.id &&
        (skillFilter === '' || user.skillLevel === skillFilter) &&
        (stackFilter === '' || user.primaryStack === stackFilter)
    );
    
    if (onlineDevs.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No developers found matching your filters.</p>';
        return;
    }
    
    onlineDevs.forEach(user => {
        const devCard = document.createElement('div');
        devCard.className = 'dev-card';
        
        const isFriend = currentUser.friends && currentUser.friends.includes(user.id);
        const buttonText = isFriend ? 'Message' : 'Connect';
        const buttonAction = isFriend ? `messageUser('${user.username}')` : `sendFriendRequest(${user.id})`;
        
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
            <button class="cta-button" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="${buttonAction}">
                ${buttonText}
            </button>
        `;
        
        container.appendChild(devCard);
    });
}

function loadProjects() {
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
            <p class="project-author">by ${project.author}</p>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">${techTags}</div>
            <div class="project-links">${links.join('')}</div>
        `;
        
        container.appendChild(projectCard);
    });
}

function loadStories() {
    const container = document.getElementById('storiesFeed');
    container.innerHTML = '';
    
    if (stories.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No stories yet. Share your coding journey!</p>';
        return;
    }
    
    // Sort stories by creation date (newest first)
    const sortedStories = [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    sortedStories.forEach(story => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        
        const timeAgo = getTimeAgo(story.createdAt);
        const isLiked = story.likedBy.includes(currentUser.id);
        const isRetweeted = story.retweetedBy.includes(currentUser.id);
        
        const tags = story.tags.map(tag => 
            `<span class="story-tag">${tag}</span>`
        ).join('');
        
        storyCard.innerHTML = `
            <div class="story-header">
                <div class="story-avatar"></div>
                <div>
                    <div class="story-author">${story.author}</div>
                </div>
                <div class="story-time">${timeAgo}</div>
            </div>
            <div class="story-content">${story.content}</div>
            <div class="story-tags">${tags}</div>
            <div class="story-actions">
                <button class="story-action ${isLiked ? 'liked' : ''}" onclick="toggleLike(${story.id})">
                    ❤️ ${story.likes}
                </button>
                <button class="story-action ${isRetweeted ? 'retweeted' : ''}" onclick="toggleRetweet(${story.id})">
                    🔄 ${story.retweets}
                </button>
            </div>
        `;
        
        container.appendChild(storyCard);
    });
}

function loadFriends() {
    const friendsContainer = document.getElementById('friendsList');
    const requestsContainer = document.getElementById('friendRequests');
    const friendCount = document.getElementById('friendCount');
    
    // Load friend requests
    requestsContainer.innerHTML = '';
    if (friendRequests.length === 0) {
        requestsContainer.innerHTML = '<p style="opacity: 0.7;">No pending friend requests</p>';
    } else {
        friendRequests.forEach(request => {
            const user = users.find(u => u.id === request.fromUserId);
            if (user) {
                const requestCard = document.createElement('div');
                requestCard.className = 'friend-card';
                requestCard.innerHTML = `
                    <div class="friend-avatar"></div>
                    <div class="friend-info">
                        <div class="friend-name">${user.username}</div>
                        <div class="friend-details">${capitalizeFirst(user.skillLevel)} • ${getStackName(user.primaryStack)}</div>
                    </div>
                    <div class="friend-actions">
                        <button class="friend-btn accept" onclick="acceptFriendRequest(${request.id})">Accept</button>
                        <button class="friend-btn decline" onclick="declineFriendRequest(${request.id})">Decline</button>
                    </div>
                `;
                requestsContainer.appendChild(requestCard);
            }
        });
    }
    
    // Load friends list
    friendsContainer.innerHTML = '';
    const userFriends = currentUser.friends || [];
    friendCount.textContent = `${userFriends.length} connection${userFriends.length !== 1 ? 's' : ''}`;
    
    if (userFriends.length === 0) {
        friendsContainer.innerHTML = '<p style="opacity: 0.7;">No friends yet. Start connecting with other developers!</p>';
    } else {
        userFriends.forEach(friendId => {
            const friend = users.find(u => u.id === friendId);
            if (friend) {
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
            }
        });
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
function sendFriendRequest(userId) {
    const existingRequest = friendRequests.find(req => 
        req.fromUserId === currentUser.id && req.toUserId === userId
    );
    
    if (existingRequest) {
        showError("Friend request already sent!");
        return;
    }
    
    const newRequest = {
        id: friendRequests.length + 1,
        fromUserId: currentUser.id,
        toUserId: userId,
        createdAt: new Date()
    };
    
    friendRequests.push(newRequest);
    showSuccess("Friend request sent!");
    loadOnlineDevelopers(); // Refresh to update button states
}

function acceptFriendRequest(requestId) {
    const request = friendRequests.find(req => req.id === requestId);
    if (!request) return;
    
    // Add to friends lists
    if (!currentUser.friends) currentUser.friends = [];
    if (!currentUser.friends.includes(request.fromUserId)) {
        currentUser.friends.push(request.fromUserId);
    }
    
    const fromUser = users.find(u => u.id === request.fromUserId);
    if (fromUser) {
        if (!fromUser.friends) fromUser.friends = [];
        if (!fromUser.friends.includes(currentUser.id)) {
            fromUser.friends.push(currentUser.id);
        }
    }
    
    // Remove request
    const requestIndex = friendRequests.findIndex(req => req.id === requestId);
    if (requestIndex > -1) {
        friendRequests.splice(requestIndex, 1);
    }
    
    showSuccess("Friend request accepted!");
    loadFriends();
    loadOnlineDevelopers();
}

function declineFriendRequest(requestId) {
    const requestIndex = friendRequests.findIndex(req => req.id === requestId);
    if (requestIndex > -1) {
        friendRequests.splice(requestIndex, 1);
        showSuccess("Friend request declined");
        loadFriends();
    }
}

function toggleLike(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    const isLiked = story.likedBy.includes(currentUser.id);
    
    if (isLiked) {
        story.likedBy = story.likedBy.filter(id => id !== currentUser.id);
        story.likes--;
    } else {
        story.likedBy.push(currentUser.id);
        story.likes++;
    }
    
    loadStories();
}

function toggleRetweet(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    const isRetweeted = story.retweetedBy.includes(currentUser.id);
    
    if (isRetweeted) {
        story.retweetedBy = story.retweetedBy.filter(id => id !== currentUser.id);
        story.retweets--;
    } else {
        story.retweetedBy.push(currentUser.id);
        story.retweets++;
    }
    
    loadStories();
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
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('projectTitle').value;
            const description = document.getElementById('projectDescription').value;
            const tech = document.getElementById('projectTech').value;
            const projectLink = document.getElementById('projectLink').value;
            const demoLink = document.getElementById('projectDemo').value;
            
            const newProject = {
                id: projects.length + 1,
                title,
                description,
                technologies: tech.split(',').map(t => t.trim()),
                author: currentUser.username,
                authorId: currentUser.id,
                projectLink,
                demoLink,
                createdAt: new Date()
            };
            
            projects.push(newProject);
            hideModal('projectModal');
            projectForm.reset();
            loadProjects();
            showSuccess("Project added successfully!");
        });
    }
    
    // Story form handling
    const storyForm = document.getElementById('storyForm');
    if (storyForm) {
        storyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const content = document.getElementById('storyContent').value;
            const tags = document.getElementById('storyTags').value;
            
            if (content.length > 500) {
                showError("Story must be 500 characters or less!");
                return;
            }
            
            const newStory = {
                id: stories.length + 1,
                content,
                author: currentUser.username,
                authorId: currentUser.id,
                tags: tags ? tags.split(' ').filter(tag => tag.startsWith('#')) : [],
                likes: 0,
                retweets: 0,
                likedBy: [],
                retweetedBy: [],
                createdAt: new Date()
            };
            
            stories.push(newStory);
            hideModal('storyModal');
            storyForm.reset();
            loadStories();
            showSuccess("Story shared successfully!");
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
            hideModal('projectModal');
            hideModal('storyModal');
        }
    });
});