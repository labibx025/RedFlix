// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9kpvmJ1ATPGu8_7yxHB3kAMs3k0wdBRs",
    authDomain: "redflix-f0e95.firebaseapp.com",
    projectId: "redflix-f0e95",
    storageBucket: "redflix-f0e95.appspot.com",
    messagingSenderId: "949672737950",
    appId: "1:949672737950:web:79fbd06112b3115b2e0f8f",
    measurementId: "G-VNGWEZJEVR"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// DOM Elements
const submitLogin = document.getElementById('submitLogin');
const submitRegister = document.getElementById('submitRegister');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const favoriteBtn = document.getElementById('favoriteBtn');

// Login function
submitLogin.addEventListener('click', (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    // Validate email
    if (!validateEmail(email)) {
        loginError.textContent = "Please enter a valid email address";
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User logged in:", user);
            document.getElementById('authModal').style.display = 'none';
            updateAuthUI(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            loginError.textContent = errorMessage;
        });
});

// Register function
submitRegister.addEventListener('click', (e) => {
    e.preventDefault();
    const name = registerName.value;
    const email = registerEmail.value;
    const password = registerPassword.value;
    
    // Validate email
    if (!validateEmail(email)) {
        registerError.textContent = "Please enter a valid email address";
        return;
    }
    
    if (password.length < 6) {
        registerError.textContent = "Password should be at least 6 characters";
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User registered:", user);
            
            // Update user profile with display name
            return user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            // Create user document in Firestore
            return db.collection('users').doc(auth.currentUser.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                favorites: []
            });
        })
        .then(() => {
            document.getElementById('authModal').style.display = 'none';
            updateAuthUI(auth.currentUser);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            registerError.textContent = errorMessage;
        });
});

// Google Sign-In function
googleLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log("Google user logged in:", user);
            document.getElementById('authModal').style.display = 'none';
            updateAuthUI(user);
            
            // Check if user exists in Firestore
            return db.collection('users').doc(user.uid).get();
        })
        .then((doc) => {
            if (!doc.exists) {
                // Create user document if it doesn't exist
                return db.collection('users').doc(auth.currentUser.uid).set({
                    name: auth.currentUser.displayName,
                    email: auth.currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    favorites: []
                });
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            loginError.textContent = errorMessage;
        });
});

// Add to favorites function
function addToFavorites(movieId) {
    if (!auth.currentUser) {
        alert("Please login to add to favorites");
        document.getElementById('authModal').style.display = 'block';
        return;
    }
    
    const userId = auth.currentUser.uid;
    const userRef = db.collection('users').doc(userId);
    
    userRef.update({
        favorites: firebase.firestore.FieldValue.arrayUnion(movieId)
    })
    .then(() => {
        console.log("Added to favorites");
        const favoriteBtn = document.getElementById('favoriteBtn');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Added to Favorites';
        favoriteBtn.classList.add('favorited');
    })
    .catch((error) => {
        console.error("Error adding to favorites:", error);
    });
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Update UI based on auth state
function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (user) {
        // User is logged in
        authButtons.innerHTML = `
            <span>Welcome, ${user.displayName || user.email}</span>
            <button id="logoutBtn">Logout</button>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            auth.signOut();
        });
    } else {
        // User is logged out
        authButtons.innerHTML = `
            <button id="loginBtn">Login</button>
            <button id="registerBtn">Register</button>
        `;
        
        // Re-attach event listeners
        document.getElementById('loginBtn').addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'block';
            document.getElementById('loginForm').style.display = 'flex';
            document.getElementById('registerForm').style.display = 'none';
        });
        
        document.getElementById('registerBtn').addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'block';
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'flex';
        });
    }
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    updateAuthUI(user);
});

// Favorite button event listener
if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
        const movieId = document.getElementById('movieTitle').getAttribute('data-movie-id');
        if (movieId) {
            addToFavorites(movieId);
        }
    });
}