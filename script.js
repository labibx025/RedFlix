// API Configuration
const API_KEY = 'd84c53c756716ce278e2ecb12c64fb8a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/original';

// DOM Elements
const heroSection = document.getElementById('hero');
const heroTitle = document.getElementById('hero-title');
const heroOverview = document.getElementById('hero-overview');
const popularMoviesSection = document.getElementById('popular-movies');
const trendingMoviesSection = document.getElementById('trending-movies');
const topRatedMoviesSection = document.getElementById('top-rated-movies');
const upcomingMoviesSection = document.getElementById('upcoming-movies');
const myListMoviesSection = document.getElementById('my-list-movies');
const navbar = document.querySelector('.navbar');
const searchBtn = document.getElementById('search-btn');
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const closeSearch = document.getElementById('close-search');
const movieModal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');
const themeToggle = document.getElementById('toggle-theme');
const myListLink = document.getElementById('my-list-link');
const videoModal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('movie-player');
const videoTitle = document.getElementById('video-title');
const videoDescription = document.getElementById('video-description');
const closeVideo = document.getElementById('close-video');
const loadingSpinner = document.getElementById('loading-spinner');

// State
let myList = JSON.parse(localStorage.getItem('myList')) || [];
let currentVideo = null;

// Initialize the page
async function init() {
    showLoading();
    
    try {
        // Fetch different categories of movies
        const popularMovies = await fetchMovies(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
            popularMoviesSection
        );
        
        await fetchMovies(
            `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
            trendingMoviesSection
        );
        
        await fetchMovies(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
            topRatedMoviesSection
        );
        
        await fetchMovies(
            `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`,
            upcomingMoviesSection
        );
        
        // Load My List
        loadMyList();
        
        // Set a random popular movie as the hero
        if (popularMovies && popularMovies.length > 0) {
            const randomMovie = popularMovies[Math.floor(Math.random() * popularMovies.length)];
            showMovieDetails(randomMovie);
        }
        
        // Load saved theme
        loadTheme();
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        popularMoviesSection.innerHTML = '<p class="error">Failed to load movies. Please try again later.</p>';
    } finally {
        hideLoading();
    }
}

function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Fetch data from TMDb API
async function fetchMovies(url, element) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayMovies(data.results, element);
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        element.innerHTML = '<p class="error">Failed to load movies. Please check your connection.</p>';
        throw error;
    }
}

// Display movies in a section
function displayMovies(movies, element) {
    if (!element) {
        console.error('Target element not found');
        return;
    }
    
    try {
        element.innerHTML = movies.map(movie => `
            <div class="movie-card" data-movie-id="${movie.id}">
                <img src="${IMG_BASE_URL}${movie.poster_path}" 
                     onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Not+Available'"
                     alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.release_date?.substring(0, 4) || ''}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error displaying movies:', error);
        element.innerHTML = '<p class="error">Error displaying movies</p>';
    }
}

// Show movie details in hero section
function showMovieDetails(movie) {
    if (movie.backdrop_path) {
        heroSection.style.backgroundImage = `url(${IMG_BASE_URL}${movie.backdrop_path})`;
    } else {
        heroSection.style.backgroundImage = 'linear-gradient(to right, #141414, #333)';
    }
    heroTitle.textContent = movie.title;
    heroOverview.textContent = movie.overview || 'No overview available';
    
    // Update buttons
    const playBtn = document.querySelector('.play-btn');
    const infoBtn = document.querySelector('.info-btn');
    playBtn.onclick = () => playMovie(movie);
    infoBtn.onclick = () => showMovieModal(movie);
}

// Play movie (sample implementation)
function playMovie(movie) {
    currentVideo = movie;
    videoTitle.textContent = movie.title;
    videoDescription.textContent = movie.overview || 'No description available';
    
    // In a real app, you would fetch the actual video URL
    videoPlayer.src = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
    
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Play the video
    setTimeout(() => {
        videoPlayer.play().catch(e => console.log('Autoplay prevented:', e));
    }, 300);
}

// Show movie modal with details
async function showMovieModal(movie) {
    showLoading();
    
    try {
        // Fetch additional movie details
        const [movieDetails, credits] = await Promise.all([
            fetchMovieDetails(movie.id),
            fetchMovieCredits(movie.id)
        ]);
        
        // Create modal content
        modalBody.innerHTML = `
            <div class="modal-top" style="background-image: url(${IMG_BASE_URL}${movie.backdrop_path || movie.poster_path})"></div>
            <div class="modal-info">
                <h2 class="modal-title">${movie.title}</h2>
                <div class="modal-meta">
                    <span class="modal-rating">${Math.round(movie.vote_average * 10)}% Match</span>
                    <span>${movie.release_date ? movie.release_date.substring(0, 4) : ''}</span>
                    ${movieDetails.runtime ? `<span>${Math.floor(movieDetails.runtime / 60)}h ${movieDetails.runtime % 60}m</span>` : ''}
                </div>
                <div class="modal-genres">
                    ${movieDetails.genres?.map(genre => `<span class="modal-genre">${genre.name}</span>`).join('') || ''}
                </div>
                <p class="modal-overview">${movie.overview || 'No overview available.'}</p>
                <div class="modal-buttons">
                    <button class="modal-play-btn"><i class="fas fa-play"></i> Play</button>
                    <button class="modal-add-btn" data-movie-id="${movie.id}">
                        <i class="fas ${isInMyList(movie.id) ? 'fa-check' : 'fa-plus'}"></i> My List
                    </button>
                </div>
                ${credits.cast?.length > 0 ? `
                <div class="modal-cast">
                    <h3>Cast</h3>
                    <div class="cast-list">
                        ${credits.cast.slice(0, 10).map(actor => `
                            <div class="cast-item">
                                <img src="${actor.profile_path ? IMG_BASE_URL + actor.profile_path : 'https://via.placeholder.com/150'}" alt="${actor.name}">
                                <h4>${actor.name}</h4>
                                <p>${actor.character}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Add event listeners to modal buttons
        const playBtn = modalBody.querySelector('.modal-play-btn');
        const addToListBtn = modalBody.querySelector('.modal-add-btn');
        
        playBtn.addEventListener('click', () => {
            closeMovieModal();
            playMovie(movie);
        });
        
        addToListBtn.addEventListener('click', () => toggleMyList(movie));
        
        // Show modal
        movieModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error showing movie modal:', error);
        modalBody.innerHTML = '<p class="error">Failed to load movie details. Please try again.</p>';
    } finally {
        hideLoading();
    }
}

// Fetch additional movie details
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
    }
}

// Fetch movie credits (cast)
async function fetchMovieCredits(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie credits:', error);
        return { cast: [] };
    }
}

// My List functionality
function toggleMyList(movie) {
    const index = myList.findIndex(item => item.id === movie.id);
    
    if (index === -1) {
        myList.push(movie);
    } else {
        myList.splice(index, 1);
    }
    
    // Update localStorage
    localStorage.setItem('myList', JSON.stringify(myList));
    
    // Update button in modal
    const addBtn = document.querySelector(`.modal-add-btn[data-movie-id="${movie.id}"]`);
    if (addBtn) {
        addBtn.innerHTML = `<i class="fas ${isInMyList(movie.id) ? 'fa-check' : 'fa-plus'}"></i> My List`;
    }
    
    // Update user's movie count in Firestore if logged in
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).update({
            moviesInList: myList.length
        });
    }
    
    // Reload My List section
    loadMyList();
}

function isInMyList(movieId) {
    return myList.some(movie => movie.id === movieId);
}

function loadMyList() {
    myListMoviesSection.innerHTML = '';
    
    if (myList.length === 0) {
        myListMoviesSection.innerHTML = '<p>Your list is empty. Add movies to watch later.</p>';
        return;
    }
    
    displayMovies(myList, myListMoviesSection);
}

// Theme functionality
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function toggleTheme() {
    if (document.body.classList.toggle('light-mode')) {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // My List link
    myListLink.addEventListener('click', (e) => {
        e.preventDefault();
        myListMoviesSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Video player events
    videoPlayer.addEventListener('ended', () => {
        if (currentVideo && auth.currentUser) {
            db.collection('users').doc(auth.currentUser.uid).update({
                moviesWatched: firebase.firestore.FieldValue.increment(1)
            });
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === movieModal) closeMovieModal();
        if (e.target === videoModal) closeVideoModal();
    });
}

// Modal functions
function closeMovieModal() {
    movieModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeVideoModal() {
    videoPlayer.pause();
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Start the application
init();