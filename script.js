// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authModal = document.getElementById('authModal');
const videoModal = document.getElementById('videoModal');
const closeBtns = document.querySelectorAll('.close-btn');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const trendingCarousel = document.getElementById('trendingCarousel');
const popularCarousel = document.getElementById('popularCarousel');
const prevBtns = document.querySelectorAll('.prev-btn');
const nextBtns = document.querySelectorAll('.next-btn');
const playBtn = document.querySelector('.play-btn');
const heroTitle = document.querySelector('.hero h1');
const heroDesc = document.querySelector('.hero p');

// Initialize modals
function initModals() {
    // Auth modal buttons
    loginBtn.addEventListener('click', () => {
        authModal.style.display = 'block';
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    });
    
    registerBtn.addEventListener('click', () => {
        authModal.style.display = 'block';
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
    });
    
    // Toggle between login and register
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    });
    
    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            authModal.style.display = 'none';
            videoModal.style.display = 'none';
            const videoPlayer = document.getElementById('moviePlayer');
            videoPlayer.pause();
        });
    });
    
    // Close when clicking outside modal
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
        if (e.target === videoModal) {
            videoModal.style.display = 'none';
            const videoPlayer = document.getElementById('moviePlayer');
            videoPlayer.pause();
        }
    });
}

// Initialize carousel navigation
function initCarousels() {
    const carousels = document.querySelectorAll('.movie-carousel');
    
    carousels.forEach((carousel, index) => {
        prevBtns[index].addEventListener('click', () => {
            carousel.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });
        
        nextBtns[index].addEventListener('click', () => {
            carousel.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    });
}

// Load movies into carousels
function loadMovies() {
    // Clear existing content
    trendingCarousel.innerHTML = '';
    popularCarousel.innerHTML = '';
    
    // Filter movies - in a real app, this would come from your database
    const trendingMovies = window.movies.filter(movie => movie.trending);
    const popularMovies = window.movies.filter(movie => movie.popular);
    
    // Load trending movies
    trendingMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        trendingCarousel.appendChild(movieCard);
    });
    
    // Load popular movies
    popularMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        popularCarousel.appendChild(movieCard);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = `
        <img src="${movie.thumbnail}" alt="${movie.title}">
    `;
    
    movieCard.addEventListener('click', () => playMovie(movie));
    return movieCard;
}

// Play movie function
function playMovie(movie) {
    const videoPlayer = document.getElementById('moviePlayer');
    const movieTitle = document.getElementById('movieTitle');
    const movieMeta = document.getElementById('movieMeta');
    const movieDesc = document.getElementById('movieDesc');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    videoPlayer.src = movie.videoUrl;
    movieTitle.textContent = movie.title;
    movieMeta.textContent = `${movie.year} • ${movie.duration} • ${movie.genre}`;
    movieDesc.textContent = movie.description;
    
    // Check if movie is favorited
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).get()
            .then(doc => {
                const favorites = doc.data().favorites || [];
                if (favorites.includes(movie.id)) {
                    favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Added to Favorites';
                    favoriteBtn.classList.add('favorited');
                } else {
                    favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
                    favoriteBtn.classList.remove('favorited');
                }
            });
    }
    
    videoModal.style.display = 'block';
    videoPlayer.play();
}

// Initialize navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            document.querySelector('.navbar').classList.add('scrolled');
        } else {
            document.querySelector('.navbar').classList.remove('scrolled');
        }
    });
}

// Hero play button functionality
function initHeroButton() {
    playBtn.addEventListener('click', () => {
        // Play the featured movie (first movie in the array)
        if (window.movies.length > 0) {
            playMovie(window.movies[0]);
        }
    });
}

// Initialize the app
function initApp() {
    initModals();
    initCarousels();
    initNavbarScroll();
    initHeroButton();
    
    // Load movies when they're available
    if (window.movies) {
        loadMovies();
    } else {
        window.addEventListener('moviesLoaded', loadMovies);
    }
}

document.addEventListener('DOMContentLoaded', initApp);