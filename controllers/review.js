const { isValidObjectId } = require("mongoose");
const Movie = require("../models/movie");
const Review = require("../models/review");
const { sendError } = require("../utils/helper");


exports.addReview = async (req, res) => {

    const { movieId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user._id;

    if(!req.user.isVerified) return sendError(res, "Please verify your user first!");

    if (!isValidObjectId(movieId)) return sendError(res, "Invalid Movie!");

    const movie = await Movie.findOne({ _id: movieId, status: 'public' });

    if (!movie) return sendError(res, "Movie not found!", 404);

    const isAlreadyReviewd = await Review.find({ owner: userId, parentMovie: movie._id });

    if (isAlreadyReviewd.length > 0) return sendError(res, "Invalid request, review already created!");

    const newReview = new Review({
        owner: userId,
        parentMovie: movie._id,
        content,
        rating
    })

    movie.reviews.push(newReview._id);
    await movie.save();

    await newReview.save();

    res.json({
        message: "Your Review has been added"
    })
}


exports.updateReview = async (req, res) => {

    const { reviewId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(reviewId)) return sendError(res, "Invalid Review!");

    const review = await Review.findOne({ _id: reviewId, owner: userId });
    if (!review) return sendError(res, "Review not found!", 404);

    review.content = content;
    review.rating = rating;

    await review.save();

    res.json({ message: "Your review has been updated." })
}






exports.removeReview = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(reviewId)) return sendError(res, "Invalid Review!");
    const review = await Review.findOne({ _id: reviewId, owner: userId });
    if (!review) return sendError(res, "Review not found!", 404);

    const movie = await Movie.findById(review.parentMovie).select('reviews')

    movie.reviews = movie.reviews.filter((rId) => rId.toString() !== reviewId);

    await Review.findByIdAndDelete(reviewId);
    await movie.save();
    res.json({
        message: "Review removed successfully"
    })

}

exports.getReviewsByMovie = async (req, res) => {
    const { movieId } = req.params;
    if (!isValidObjectId(movieId)) return sendError(res, "Invalid Movie!");
    const movie = await Movie.findOne({ _id: movieId, status: 'public' }).populate({
        path: 'reviews',
        populate: {
            path: 'owner',
            select: 'name'
        }
    }).select('reviews title');
    if (!movie) return sendError(res, "Movie not found!", 404);

    const reviews = movie.reviews.map(r => {
        const { owner, content, rating, _id: reviewId } = r;
        const { name, _id: ownerId } = owner;
        return {
            id: reviewId,
            owner: {
                id: ownerId,
                name
            },
            content,
            rating
        }
    })

    res.json({
        movie: {
            title: movie.title,
            reviews
        }
    })
}