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
const videoModal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('movie-player');
const videoTitle = document.getElementById('video-title');
const videoDescription = document.getElementById('video-description');
const closeVideo = document.getElementById('close-video');
const watchTrailerBtn = document.getElementById('watch-trailer-btn');
const watchFullMovieBtn = document.getElementById('watch-full-movie-btn');
const addToListBtn = document.getElementById('add-to-list-btn');
const videoError = document.getElementById('video-error');
const loadingSpinner = document.getElementById('loading-spinner');
const notificationBtn = document.getElementById('notification-btn');
const notificationModal = document.getElementById('notification-modal');
const closeNotification = document.getElementById('close-notification');
const notificationList = document.getElementById('notification-list');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const scrollLeftBtns = document.querySelectorAll('.scroll-left');
const scrollRightBtns = document.querySelectorAll('.scroll-right');

// State
let myList = JSON.parse(localStorage.getItem('myList')) || [];
let currentVideo = null;
let currentHeroMovie = null;

// Initialize the page
async function init() {
    showLoading();
    
    try {
        // Setup event listeners
        setupEventListeners();
        
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
            currentHeroMovie = randomMovie;
            showMovieDetails(randomMovie);
        }
        
        // Check if user is logged in
        if (auth.currentUser) {
            loadNotifications();
        }
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
                <img src="${movie.poster_path ? IMG_BASE_URL + movie.poster_path : 'https://via.placeholder.com/300x450?text=Poster+Not+Available'}" 
                     onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Not+Available'"
                     alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.release_date?.substring(0, 4) || ''}</p>
                </div>
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
        `).join('');

        // Add click event to movie cards
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                // Don't trigger if clicking on play button
                if (e.target.closest('.play-overlay')) return;
                
                const movieId = card.dataset.movieId;
                await handleMovieSelection(movieId);
            });
        });

        // Add play button functionality
        document.querySelectorAll('.play-overlay').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const card = e.target.closest('.movie-card');
                const movieId = card.dataset.movieId;
                await handleMovieSelection(movieId);
            });
        });
    } catch (error) {
        console.error('Error displaying movies:', error);
        element.innerHTML = '<p class="error">Error displaying movies</p>';
    }
}

async function handleMovieSelection(movieId) {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Failed to fetch movie');
        const movie = await response.json();
        playMovie(movie);
    } catch (error) {
        console.error('Error loading movie:', error);
        alert('Failed to load movie details. Please try again.');
    } finally {
        hideLoading();
    }
}

// Show movie details in hero section
function showMovieDetails(movie) {
    if (movie.backdrop_path) {
        heroSection.style.backgroundImage = `linear-gradient(to right, rgba(20, 20, 20, 1) 0%, rgba(20, 20, 20, 0) 50%, rgba(20, 20, 20, 0) 100%), url(${IMG_BASE_URL}${movie.backdrop_path})`;
    } else {
        heroSection.style.backgroundImage = 'linear-gradient(to right, #141414, #333)';
    }
    heroTitle.textContent = movie.title;
    heroOverview.textContent = movie.overview || 'No overview available';
    
    // Update buttons
    const playBtn = document.querySelector('.play-btn');
    const infoBtn = document.querySelector('.info-btn');
    const heroAddToListBtn = document.querySelector('.hero-buttons .add-to-list-btn');
    
    playBtn.onclick = () => playMovie(movie);
    infoBtn.onclick = () => showMovieModal(movie);
    
    // Update add to list button in hero
    const isInList = myList.some(item => item.id === movie.id);
    heroAddToListBtn.innerHTML = isInList ? '<i class="fas fa-check"></i> In My List' : '<i class="fas fa-plus"></i> My List';
    heroAddToListBtn.onclick = () => {
        toggleMyList(movie);
        const isNowInList = myList.some(item => item.id === movie.id);
        heroAddToListBtn.innerHTML = isNowInList ? '<i class="fas fa-check"></i> In My List' : '<i class="fas fa-plus"></i> My List';
    };
}

// Play movie with trailer/full movie options
function playMovie(movie, playFullMovie = false) {
    currentVideo = movie;
    videoTitle.textContent = movie.title;
    videoDescription.textContent = movie.overview || 'No description available';
    videoError.style.display = 'none';
    
    // Show both buttons but highlight the selected one
    watchTrailerBtn.classList.toggle('active', !playFullMovie);
    watchFullMovieBtn.classList.toggle('active', playFullMovie);
    
    // Update add to list button in video modal
    const isInList = myList.some(item => item.id === movie.id);
    addToListBtn.innerHTML = isInList ? '<i class="fas fa-check"></i> In My List' : '<i class="fas fa-plus"></i> My List';
    addToListBtn.onclick = () => {
        toggleMyList(movie);
        const isNowInList = myList.some(item => item.id === movie.id);
        addToListBtn.innerHTML = isNowInList ? '<i class="fas fa-check"></i> In My List' : '<i class="fas fa-plus"></i> My List';
    };
    
    // Try to play the selected content
    if (playFullMovie) {
        playFullMovieContent(movie);
    } else {
        playTrailerContent(movie);
    }
}

function playTrailerContent(movie) {
    // Try local trailer first
    if (window.movies && window.movies.length > 0) {
        const localMovie = window.movies.find(m => m.title === movie.title);
        if (localMovie && localMovie.trailerUrl) {
            playVideo(localMovie.trailerUrl);
            return;
        }
    }
    
    // Fallback to YouTube trailer
    fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`)
        .then(res => {
            if (!res.ok) throw new Error('Trailer API failed');
            return res.json();
        })
        .then(data => {
            const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
            if (trailer) {
                playVideo(`https://www.youtube.com/embed/${trailer.key}?autoplay=1&enablejsapi=1`);
            } else {
                throw new Error('No trailer found');
            }
        })
        .catch(error => {
            console.error('Error getting trailer:', error);
            showVideoError('No trailer available for this movie');
            videoModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
}

function playFullMovieContent(movie) {
    // Try local full movie first
    if (window.movies && window.movies.length > 0) {
        const localMovie = window.movies.find(m => m.title === movie.title);
        if (localMovie && localMovie.videoUrl) {
            playVideo(localMovie.videoUrl);
            return;
        }
    }
    
    // Fallback - try to find a streaming source
    fetchMovieStreamingSources(movie.id)
        .then(sources => {
            if (sources && sources.length > 0) {
                playVideo(sources[0].url);
            } else {
                throw new Error('No streaming source found');
            }
        })
        .catch(error => {
            console.error('Error getting streaming sources:', error);
            showVideoError('Full movie not available at this time');
            videoModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
}

async function fetchMovieStreamingSources(movieId) {
    // In a real app, you would call your backend service or a streaming API
    // This is a placeholder for demonstration
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                // These would be actual streaming URLs from your service
                { url: `https://example.com/stream/${movieId}`, quality: 'HD' }
            ]);
        }, 500);
    });
}

function playVideo(url) {
    videoPlayer.src = url;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showVideoError(message) {
    videoError.textContent = message;
    videoError.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Navigation tabs
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
            
            // Update active class
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Video player close button
    closeVideo.addEventListener('click', closeVideoModal);
    
    // Video mode buttons
    watchTrailerBtn.addEventListener('click', () => {
        if (currentVideo) playMovie(currentVideo, false);
    });
    
    watchFullMovieBtn.addEventListener('click', () => {
        if (currentVideo) playMovie(currentVideo, true);
    });
    
    // Search functionality
    searchBtn.addEventListener('click', openSearchModal);
    closeSearch.addEventListener('click', closeSearchModal);
    searchInput.addEventListener('input', handleSearchInput);
    
    // Notification functionality
    notificationBtn.addEventListener('click', toggleNotificationModal);
    closeNotification.addEventListener('click', closeNotificationModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
        if (e.target === searchModal) closeSearchModal();
        if (e.target === notificationModal) closeNotificationModal();
    });
    
    // Setup scroll buttons
    setupScrollButtons();
}

function setupScrollButtons() {
    scrollLeftBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('.movie-row-container').querySelector('.movie-row');
            row.scrollBy({ left: -300, behavior: 'smooth' });
        });
    });

    scrollRightBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('.movie-row-container').querySelector('.movie-row');
            row.scrollBy({ left: 300, behavior: 'smooth' });
        });
    });
}

// Show specific content section
function showSection(section) {
    contentSections.forEach(sec => sec.classList.remove('active'));
    
    switch(section) {
        case 'home':
            document.getElementById('home-section').classList.add('active');
            break;
        case 'tv-shows':
            document.getElementById('tv-shows-section').classList.add('active');
            loadTVShows();
            break;
        case 'movies':
            document.getElementById('movies-section').classList.add('active');
            loadAllMovies();
            break;
        case 'new-popular':
            document.getElementById('new-popular-section').classList.add('active');
            loadRecentMovies();
            break;
        case 'my-list':
            document.getElementById('my-list-section').classList.add('active');
            loadMyList();
            break;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Load TV shows
async function loadTVShows() {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
        const data = await response.json();
        displayTVShows(data.results, document.getElementById('popular-tv'));
    } catch (error) {
        console.error('Error loading TV shows:', error);
        document.getElementById('popular-tv').innerHTML = '<p class="error">Failed to load TV shows</p>';
    } finally {
        hideLoading();
    }
}

function displayTVShows(tvShows, element) {
    element.innerHTML = tvShows.map(show => `
        <div class="movie-card" data-tv-id="${show.id}">
            <img src="${show.poster_path ? IMG_BASE_URL + show.poster_path : 'https://via.placeholder.com/300x450?text=Poster+Not+Available'}" 
                 onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Not+Available'"
                 alt="${show.name}">
            <div class="movie-info">
                <h3>${show.name}</h3>
                <p>${show.first_air_date?.substring(0, 4) || ''}</p>
            </div>
            <div class="play-overlay">
                <i class="fas fa-play"></i>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('[data-tv-id]').forEach(card => {
        card.addEventListener('click', async () => {
            const tvId = card.dataset.tvId;
            await handleTVSelection(tvId);
        });
    });
}

async function handleTVSelection(tvId) {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
        const tvShow = await response.json();
        playTVShow(tvShow);
    } catch (error) {
        console.error('Error loading TV show:', error);
        alert('Failed to load TV show details');
    } finally {
        hideLoading();
    }
}

function playTVShow(tvShow) {
    currentVideo = tvShow;
    videoTitle.textContent = tvShow.name;
    videoDescription.textContent = tvShow.overview || 'No description available';
    
    // Hide full movie option for TV shows
    watchFullMovieBtn.style.display = 'none';
    
    // Try YouTube trailer
    fetch(`${BASE_URL}/tv/${tvShow.id}/videos?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
            if (trailer) {
                playVideo(`https://www.youtube.com/embed/${trailer.key}?autoplay=1&enablejsapi=1`);
            } else {
                throw new Error('No trailer found');
            }
        })
        .catch(error => {
            console.error('Error getting trailer:', error);
            showVideoError('No video available for this TV show');
            videoModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
}

// Load all movies
async function loadAllMovies() {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc`);
        const data = await response.json();
        displayMovies(data.results, document.getElementById('all-movies'));
    } catch (error) {
        console.error('Error loading all movies:', error);
        document.getElementById('all-movies').innerHTML = '<p class="error">Failed to load movies</p>';
    } finally {
        hideLoading();
    }
}

// Load recent movies
async function loadRecentMovies() {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=release_date.desc`);
        const data = await response.json();
        displayMovies(data.results, document.getElementById('recent-movies'));
    } catch (error) {
        console.error('Error loading recent movies:', error);
        document.getElementById('recent-movies').innerHTML = '<p class="error">Failed to load movies</p>';
    } finally {
        hideLoading();
    }
}

// Search functionality
async function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<p class="error">Failed to load search results</p>';
    }
}

function displaySearchResults(results) {
    if (!results || results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
        return;
    }
    
    searchResults.innerHTML = results.map(item => {
        const title = item.title || item.name;
        const date = item.release_date || item.first_air_date;
        const poster = item.poster_path ? IMG_BASE_URL + item.poster_path : 'https://via.placeholder.com/150x225?text=No+Poster';
        const type = item.media_type === 'tv' ? 'TV Show' : 'Movie';
        
        return `
            <div class="search-result" data-id="${item.id}" data-type="${item.media_type}">
                <img src="${poster}" alt="${title}">
                <div class="search-result-info">
                    <h3>${title}</h3>
                    <p>${date ? date.substring(0, 4) : ''} • ${type}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers to search results
    document.querySelectorAll('.search-result').forEach(result => {
        result.addEventListener('click', async () => {
            const id = result.dataset.id;
            const type = result.dataset.type;
            
            if (type === 'movie') {
                await handleMovieSelection(id);
            } else if (type === 'tv') {
                await handleTVSelection(id);
            }
            
            closeSearchModal();
        });
    });
}

function openSearchModal() {
    searchModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    searchInput.focus();
}

function closeSearchModal() {
    searchModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    searchInput.value = '';
    searchResults.innerHTML = '';
}

// Notification functionality
function toggleNotificationModal() {
    notificationModal.classList.toggle('show');
}

function closeNotificationModal() {
    notificationModal.classList.remove('show');
}

async function loadNotifications() {
    try {
        // In a real app, you would fetch notifications from your backend
        // For demo purposes, we'll use sample notifications
        const sampleNotifications = [
            { id: 1, text: "New episode of your favorite show is available", date: "2025-05-01" },
            { id: 2, text: "Check out the new releases this week", date: "2025-04-28" },
            { id: 3, text: "Your subscription will renew in 7 days", date: "2025-04-25" }
        ];
        
        notificationList.innerHTML = sampleNotifications.map(notif => `
            <div class="notification-item">
                <p>${notif.text}</p>
                <small>${notif.date}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading notifications:', error);
        notificationList.innerHTML = '<p class="error">Failed to load notifications</p>';
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
    
    // Update user's movie count in Firestore if logged in
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).update({
            moviesInList: myList.length
        });
    }
    
    // Show toast notification
    showToast(index === -1 ? 'Added to My List' : 'Removed from My List');
}

function loadMyList() {
    myListMoviesSection.innerHTML = '';
    
    if (myList.length === 0) {
        myListMoviesSection.innerHTML = '<p>Your list is empty. Add movies to watch later.</p>';
        return;
    }
    
    displayMovies(myList, myListMoviesSection);
}

// Modal functions
function closeVideoModal() {
    videoPlayer.src = '';
    watchFullMovieBtn.style.display = 'block'; // Reset for next opening
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            loadNotifications();
        }
    });
});