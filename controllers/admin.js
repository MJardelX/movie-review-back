const Movie = require("../models/movie")
const Review = require("../models/review");
const User = require("../models/user");
const { toRatedMoviesPipeline, getAverageRatings } = require("../utils/helper");



exports.getAppInfo = async (req, res) => {


    const movieCount = await Movie.countDocuments();
    const reviewCount = await Review.countDocuments();
    const userCount = await User.countDocuments();

    res.json({
        appInfo: {
            movieCount,
            reviewCount,
            userCount
        }
    })
}

exports.getMostRated = async (req, res) => {

    const movies = await Movie.aggregate(toRatedMoviesPipeline())


    const mapMovies = async (m) => {
        const reviews = await getAverageRatings(m._id);
        return {
            id: m._id,
            title: m.title,
            // poster: m.poster,
            // responsivePosters: m.responsivePosters,
            reviews: { ...reviews }
        }
    }

    const topRatedMovies = await Promise.all(
        movies.map(mapMovies)
    )


    res.json({
        movies: topRatedMovies
    })
}