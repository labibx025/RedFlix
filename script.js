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
const startPlaybackBtn = document.getElementById('start-playback');
const videoError = document.querySelector('.video-error');
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

// Play movie with improved error handling
function playMovie(movie) {
    console.log('Attempting to play movie:', movie.title);
    currentVideo = movie;
    videoTitle.textContent = movie.title;
    videoDescription.textContent = movie.overview || 'No description available';
    startPlaybackBtn.style.display = 'none';
    videoError.style.display = 'none';
    videoPlayer.controls = true;

    // Reset the video player
    videoPlayer.pause();
    videoPlayer.src = '';
    videoPlayer.load();

    // Try local files first
    if (window.movies && window.movies.length > 0) {
        const localMovie = window.movies.find(m => m.title === movie.title);
        if (localMovie && localMovie.videoUrl) {
            console.log('Found local movie file:', localMovie.videoUrl);
            videoPlayer.src = localMovie.videoUrl;
            
            videoPlayer.oncanplay = () => {
                console.log('Local video can play');
                attemptPlayback();
            };
            
            videoPlayer.onerror = () => {
                console.error('Error loading local video');
                showVideoError('Error loading video file. Trying fallback...');
                tryFallbackVideo(movie);
            };
            
            return;
        }
    }
    
    // If no local file, try YouTube trailer
    tryFallbackVideo(movie);
}

function tryFallbackVideo(movie) {
    console.log('Trying fallback video for:', movie.title);
    fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`)
        .then(res => {
            if (!res.ok) throw new Error('Trailer API failed');
            return res.json();
        })
        .then(data => {
            const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
            if (trailer) {
                console.log('Found YouTube trailer:', trailer.key);
                videoPlayer.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&enablejsapi=1`;
                attemptPlayback();
            } else {
                throw new Error('No trailer found');
            }
        })
        .catch(error => {
            console.error('Error getting trailer:', error);
            // Final fallback to sample video
            videoPlayer.src = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
            attemptPlayback();
        });
}

function attemptPlayback() {
    console.log('Attempting playback');
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    const playPromise = videoPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Playback started successfully');
            startPlaybackBtn.style.display = 'none';
        })
        .catch(error => {
            console.log('Autoplay blocked, showing manual play button');
            startPlaybackBtn.style.display = 'block';
            startPlaybackBtn.onclick = () => {
                videoPlayer.play()
                    .then(() => startPlaybackBtn.style.display = 'none')
                    .catch(e => {
                        console.error('Manual play failed:', e);
                        showVideoError('Failed to play video. Please try another movie.');
                    });
            };
        });
    }
}

function showVideoError(message) {
    videoError.textContent = message;
    videoError.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    // Video player close button
    closeVideo.addEventListener('click', closeVideoModal);
    
    // Search functionality
    searchBtn.addEventListener('click', openSearchModal);
    closeSearch.addEventListener('click', closeSearchModal);
    searchInput.addEventListener('input', handleSearchInput);
    
    // Video player events
    videoPlayer.addEventListener('ended', () => {
        if (currentVideo && auth.currentUser) {
            db.collection('users').doc(auth.currentUser.uid).update({
                moviesWatched: firebase.firestore.FieldValue.increment(1)
            });
        }
    });
    
    videoPlayer.addEventListener('error', (e) => {
        console.error('Video error:', videoPlayer.error);
        showVideoError('Error playing video. Please try another movie.');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
        if (e.target === searchModal) closeSearchModal();
    });
}

// Search functionality
async function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
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
    
    searchResults.innerHTML = results.map(movie => `
        <div class="search-result" data-movie-id="${movie.id}">
            <img src="${movie.poster_path ? IMG_BASE_URL + movie.poster_path : 'https://via.placeholder.com/150x225?text=No+Poster'}" 
                 alt="${movie.title}">
            <div class="search-result-info">
                <h3>${movie.title}</h3>
                <p>${movie.release_date ? movie.release_date.substring(0, 4) : ''}</p>
            </div>
        </div>
    `).join('');
    
    // Add click handlers to search results
    document.querySelectorAll('.search-result').forEach(result => {
        result.addEventListener('click', async () => {
            const movieId = result.dataset.movieId;
            await handleMovieSelection(movieId);
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
    
    // Reload My List section
    loadMyList();
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
    videoPlayer.pause();
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Start the application
init();