// DOM Elements
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginContent = document.getElementById('login-content');
const registerContent = document.getElementById('register-content');
const loginBtn = document.getElementById('login-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const registerBtn = document.getElementById('register-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirmPassword = document.getElementById('register-confirm-password');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const profileDropdown = document.getElementById('profile-dropdown');
const profilePic = document.getElementById('profile-pic');
const profileName = document.getElementById('profile-name');
const logoutBtn = document.getElementById('logout-btn');
const viewProfile = document.getElementById('view-profile');
const profileModal = document.getElementById('profile-modal');
const closeProfile = document.getElementById('close-profile');
const profileModalPic = document.getElementById('profile-modal-pic');
const profileModalName = document.getElementById('profile-modal-name');
const profileModalEmail = document.getElementById('profile-modal-email');
const saveProfileBtn = document.getElementById('save-profile-btn');
const profileUpload = document.getElementById('profile-upload');
const moviesWatched = document.getElementById('movies-watched');
const moviesInList = document.getElementById('movies-in-list');
const profileIcon = document.getElementById('profile-icon');
const forgotPassword = document.getElementById('forgot-password');

let currentUser = null;

// Initialize Firebase Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        profileName.textContent = user.displayName || 'User';
        profilePic.src = user.photoURL || 'assets/images/default-profile.png';
        profileIcon.style.backgroundImage = user.photoURL ? `url(${user.photoURL})` : '';
        
        // Load user stats
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                moviesWatched.textContent = data.moviesWatched || 0;
                moviesInList.textContent = data.moviesInList || 0;
            }
        });
    } else {
        // User is signed out
        currentUser = null;
        profileName.textContent = 'Guest';
        profilePic.src = 'assets/images/default-profile.png';
        profileIcon.style.backgroundImage = '';
    }
});

// Event Listeners
function setupAuthListeners() {
    // Auth modal tabs
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));
    
    // Close buttons
    closeAuth.addEventListener('click', closeAuthModal);
    closeProfile.addEventListener('click', closeProfileModal);
    
    // Auth buttons
    loginBtn.addEventListener('click', loginWithEmail);
    googleLoginBtn.addEventListener('click', () => loginWithProvider(googleProvider));
    registerBtn.addEventListener('click', registerWithEmail);
    forgotPassword.addEventListener('click', resetPassword);
    
    // Profile buttons
    logoutBtn.addEventListener('click', logout);
    viewProfile.addEventListener('click', openProfileModal);
    saveProfileBtn.addEventListener('click', saveProfile);
    profileUpload.addEventListener('change', uploadProfilePicture);
    
    // Profile icon click
    profileIcon.addEventListener('click', (e) => {
        if (auth.currentUser) {
            profileDropdown.classList.toggle('show');
        } else {
            openAuthModal();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile') && !e.target.closest('.profile-dropdown')) {
            profileDropdown.classList.remove('show');
        }
    });
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginContent.style.display = 'flex';
        registerContent.style.display = 'none';
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginContent.style.display = 'none';
        registerContent.style.display = 'flex';
    }
}

function openAuthModal() {
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    switchAuthTab('login');
}

function closeAuthModal() {
    authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    loginError.textContent = '';
    registerError.textContent = '';
}

function openProfileModal() {
    if (auth.currentUser) {
        profileModalName.value = auth.currentUser.displayName || '';
        profileModalEmail.value = auth.currentUser.email || '';
        profileModalPic.src = auth.currentUser.photoURL || 'assets/images/default-profile.png';
        profileDropdown.classList.remove('show');
        profileModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeProfileModal() {
    profileModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Auth Functions
async function loginWithEmail() {
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeAuthModal();
    } catch (error) {
        loginError.textContent = getAuthErrorMessage(error.code);
    }
}

async function loginWithProvider(provider) {
    try {
        await auth.signInWithPopup(provider);
        closeAuthModal();
    } catch (error) {
        loginError.textContent = getAuthErrorMessage(error.code);
    }
}

async function registerWithEmail() {
    const name = registerName.value;
    const email = registerEmail.value;
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;
    
    if (!name || !email || !password || !confirmPassword) {
        registerError.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        registerError.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        // Create user document in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            moviesWatched: 0,
            moviesInList: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeAuthModal();
    } catch (error) {
        registerError.textContent = getAuthErrorMessage(error.code);
    }
}

async function resetPassword() {
    const email = loginEmail.value;
    
    if (!email) {
        loginError.textContent = 'Please enter your email address';
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        loginError.textContent = 'Password reset email sent. Check your inbox.';
        loginError.style.color = '#4CAF50';
    } catch (error) {
        loginError.textContent = getAuthErrorMessage(error.code);
        loginError.style.color = '#E50914';
    }
}

function getAuthErrorMessage(code) {
    switch(code) {
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/user-disabled':
            return 'This account has been disabled';
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/email-already-in-use':
            return 'Email already in use';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/operation-not-allowed':
            return 'This operation is not allowed';
        case 'auth/too-many-requests':
            return 'Too many requests. Try again later.';
        default:
            return 'Authentication failed. Please try again.';
    }
}

function logout() {
    auth.signOut()
        .then(() => {
            profileDropdown.classList.remove('show');
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
}

async function saveProfile() {
    const newName = profileModalName.value;
    const file = profileUpload.files[0];
    
    if (!newName) {
        alert('Please enter a name');
        return;
    }
    
    const updates = { displayName: newName };
    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = 'Saving...';
    
    try {
        // Upload new profile picture if selected
        if (file) {
            const storageRef = firebase.storage().ref(`profile_pictures/${auth.currentUser.uid}`);
            const uploadTask = await storageRef.put(file);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            updates.photoURL = downloadURL;
        }
        
        // Update profile in Firebase Auth
        await auth.currentUser.updateProfile(updates);
        
        // Update user document in Firestore
        await db.collection('users').doc(auth.currentUser.uid).update({
            name: newName
        });
        
        // Update UI
        profileName.textContent = newName;
        if (updates.photoURL) {
            profilePic.src = updates.photoURL;
            profileModalPic.src = updates.photoURL;
            profileIcon.style.backgroundImage = `url(${updates.photoURL})`;
        }
        
        closeProfileModal();
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = 'Save Changes';
    }
}

function uploadProfilePicture() {
    const file = this.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        profileModalPic.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Initialize auth listeners
setupAuthListeners();