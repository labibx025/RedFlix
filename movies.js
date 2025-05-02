// Sample movie data - in a real app, this would come from Firestore
const movies = [
    {
        id: "movie1",
        title: "CLEANER",
        thumbnail: "assets/movies/cleaner.jpg",
        videoUrl: "assets/movies/cleaner.mp4",
        trailerUrl: "https://www.youtube.com/embed/example1",
        description: "A professional cleaner gets involved in a dangerous conspiracy after finding mysterious contents in a client's home.",
        year: "2025",
        duration: "1h 58m",
        genre: "Action, Thriller",
        trending: true,
        popular: true
    },
    {
        id: "movie2",
        title: "WATCH WHAT HAPPENS LIVE",
        thumbnail: "assets/movies/wwhl.jpg",
        videoUrl: "assets/movies/wwhl.mp4",
        trailerUrl: "https://www.youtube.com/embed/example2",
        description: "Late night talk show with celebrity interviews and pop culture discussions.",
        year: "2020",
        duration: "45m",
        genre: "Talk Show",
        trending: true,
        popular: false
    },
    {
        id: "movie3",
        title: "COLD WITHDALK MORNING PARK",
        thumbnail: "assets/movies/coldpark.jpg",
        videoUrl: "assets/movies/coldpark.mp4",
        trailerUrl: "https://www.youtube.com/embed/example3",
        description: "Morning show with news, weather, and entertainment segments.",
        year: "2021",
        duration: "30m",
        genre: "News",
        trending: true,
        popular: false
    },
    {
        id: "movie4",
        title: "GOOD MYTHICAL MORNING PARK",
        thumbnail: "assets/movies/gmm.jpg",
        videoUrl: "assets/movies/gmm.mp4",
        trailerUrl: "https://www.youtube.com/embed/example4",
        description: "Fun morning show with challenges, taste tests, and comedy sketches.",
        year: "2022",
        duration: "1h",
        genre: "Entertainment",
        trending: false,
        popular: true
    },
    {
        id: "movie5",
        title: "DAILYSHOW",
        thumbnail: "assets/movies/dailyshow.jpg",
        videoUrl: "assets/movies/dailyshow.mp4",
        trailerUrl: "https://www.youtube.com/embed/example5",
        description: "Political satire and comedy news show with insightful commentary.",
        year: "2023",
        duration: "45m",
        genre: "Comedy",
        trending: false,
        popular: true
    },
    {
        id: "movie6",
        title: "LAW & ORDINARY",
        thumbnail: "assets/movies/lawordinary.jpg",
        videoUrl: "assets/movies/lawordinary.mp4",
        trailerUrl: "https://www.youtube.com/embed/example6",
        description: "Drama series about ordinary people caught in extraordinary legal situations.",
        year: "2024",
        duration: "50m",
        genre: "Drama",
        trending: true,
        popular: true
    }
];

// When DOM is loaded, add movies to the global movies array
document.addEventListener('DOMContentLoaded', () => {
    window.movies = movies;
    
    // Dispatch event that movies are loaded
    const moviesLoadedEvent = new Event('moviesLoaded');
    window.dispatchEvent(moviesLoadedEvent);
});