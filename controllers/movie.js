const { sendError, formatActor, averageRatingPipeline, relatedMoviesAggregation, getAverageRatings, toRatedMoviesPipeline } = require("../utils/helper");
const cloudinary = require("../cloud");
const Movie = require("../models/movie");
const { isValidObjectId } = require("mongoose");
const Review = require("../models/review");

exports.uploadTrailer = async (req, res) => {
    const { file } = req;

    if (!file) return sendError(res, "Video file is missing");

    const { secure_url: url, public_id } = await cloudinary.uploader.upload(file.path, {
        resource_type: 'video'
    })

    res.status(201).json({
        url, public_id
    });

}

exports.createMovie = async (req, res) => {

    const { file, body } = req;

    const {
        title,
        storyLine,
        director,
        releaseDate,
        status,
        type,
        genres,
        tags,
        cast,
        writers,
        trailer,
        language,
    } = body;


    const newMovie = new Movie({
        title,
        storyLine,
        releaseDate,
        status,
        type,
        genres,
        tags,
        cast,
        trailer,
        language,
    })

    if (director) {
        if (!isValidObjectId(director)) return sendError(res, 'Invalid director id');
        newMovie.director = director;
    }

    if (writers) {
        for (let writerId of writers) {
            if (!isValidObjectId(writerId)) return sendError(res, 'Invalid writer id');
        }
        newMovie.writers = writers;
    }


    // uploading poster
    if (file) {

        const { secure_url: url, public_id, responsive_breakpoints } = await cloudinary.uploader.upload(file.path, {
            transformation: {
                width: 1280,
                height: 720
            },
            responsive_breakpoints: {
                create_derived: true,
                max_width: 640,
                max_images: 3
            }
        });


        const posterObj = {
            url,
            public_id,
            responsive: []
        }

        const { breakpoints } = responsive_breakpoints[0];
        if (breakpoints.length) {
            for (let imgObj of breakpoints) {
                const { secure_url } = imgObj;
                posterObj.responsive.push(secure_url);
            }
        }

        newMovie.poster = posterObj;
    }

    await newMovie.save();

    res.status(201).json({
        movie: {
            id: newMovie._id,
            title
        }
    });
}

exports.updateMovieWithoutPoster = async (req, res) => {

    const { movieId } = req.params;

    if (!isValidObjectId(movieId)) return sendError(res, 'Invalid Movie Id!');

    const movie = await Movie.findById(movieId);
    if (!movie) return sendError(res, 'Movie not found!', 404);


    const {
        title,
        storyLine,
        director,
        releaseDate,
        status,
        type,
        genres,
        tags,
        cast,
        writers,
        trailer,
        language,
    } = req.body;

    movie.title = title
    movie.storyLine = storyLine
    movie.releaseDate = releaseDate
    movie.status = status
    movie.type = type
    movie.genres = genres
    movie.tags = tags
    movie.cast = cast
    movie.trailer = trailer
    movie.language = language


    if (director) {
        if (!isValidObjectId(director)) return sendError(res, 'Invalid director id');
        movie.director = director;
    }

    if (writers) {
        for (let writerId of writers) {
            if (!isValidObjectId(writerId)) return sendError(res, 'Invalid writer id');
        }
        movie.writers = writers;
    }


    await movie.save()


    res.json({
        message: 'Movie updated',
        movie
    })

}


exports.updateMovie = async (req, res) => {

    const { movieId } = req.params;
    const { file } = req;

    if (!isValidObjectId(movieId)) return sendError(res, 'Invalid Movie Id!');


    // if (!req.file) return sendError(res, 'Movie poster is missing!')

    const movie = await Movie.findById(movieId);
    if (!movie) return sendError(res, 'Movie not found!', 404);


    const {
        title,
        storyLine,
        director,
        releaseDate,
        status,
        type,
        genres,
        tags,
        cast,
        writers,
        trailer,
        language,
    } = req.body;

    movie.title = title
    movie.storyLine = storyLine
    movie.releaseDate = releaseDate
    movie.status = status
    movie.type = type
    movie.genres = genres
    movie.tags = tags
    movie.cast = cast
    // movie.trailer = trailer
    movie.language = language


    if (director) {
        if (!isValidObjectId(director)) return sendError(res, 'Invalid director id');
        movie.director = director;
    }

    if (writers) {
        for (let writerId of writers) {
            if (!isValidObjectId(writerId)) return sendError(res, 'Invalid writer id');
        }
        movie.writers = writers;
    }


    if (file) {
        const posterPublicId = movie.poster?.public_id;
        if (posterPublicId) {
            const { result } = await cloudinary.uploader.destroy(posterPublicId);
            if (result !== 'ok') {
                return sendError(res, 'Could not update poster at the moment')
            }
        }

        const { secure_url: url, public_id, responsive_breakpoints } = await cloudinary.uploader.upload(req.file.path, {
            transformation: {
                width: 1280,
                height: 720
            },
            responsive_breakpoints: {
                create_derived: true,
                max_width: 640,
                max_images: 3
            }
        });

        const posterObj = {
            url,
            public_id,
            responsive: []
        }

        const { breakpoints } = responsive_breakpoints[0];
        if (breakpoints.length) {
            for (let imgObj of breakpoints) {
                const { secure_url } = imgObj;
                posterObj.responsive.push(secure_url);
            }
        }

        movie.poster = posterObj;
    }





    await movie.save()

    res.json({
        message: 'Movie updated',
        movie: {
            id: movie._id,
            title: movie.title,
            poster: movie.poster?.url,
            genres: movie.genres,
            status: movie.status
        }
    })

}


exports.removeMovie = async (req, res) => {

    const { movieId } = req.params;

    if (!isValidObjectId(movieId)) return sendError(res, 'Invalid Movie Id!');

    const movie = await Movie.findById(movieId);
    if (!movie) return sendError(res, 'Movie not found!', 404);

    const posterId = movie.poster?.public_id
    if (posterId) {
        const { result } = await cloudinary.uploader.destroy(posterId);
        if (result !== 'ok') {
            return sendError(res, 'Could not remove poster at the moment')
        }
    }

    // remove trailer
    const trailerId = movie.trailer?.public_id;
    console.log(trailerId)
    if (!trailerId) return sendError(res, 'Could not find trailer in the cloud', 404);

    const { result: resultTrailer } = await cloudinary.uploader.destroy(trailerId, { resource_type: 'video' });
    console.log(resultTrailer)
    if (resultTrailer !== 'ok') {
        return sendError(res, 'Could not remove trailer at the moment');
    }


    await Movie.findByIdAndDelete(movieId);

    res.json({
        message: 'Move removed successfully'
    })
}


exports.getMovies = async (req, res) => {
    const { pageNo = 0, limit = 10 } = req.query;

    const movies = await Movie.find({})
        .sort({ createdAt: -1 })
        .skip(parseInt(pageNo) * parseInt(limit))
        .limit(parseInt(limit));


    const results = movies.map(m => ({
        id: m._id,
        title: m.title,
        poster: m.poster?.url,
        genres: m.genres,
        status: m.status,
        responsivePosters: m.poster?.responsive
    }))

    res.json({
        movies: results
    })
}



exports.getMovieForUpdate = async (req, res) => {
    const { movieId } = req.params;

    if (!isValidObjectId(movieId)) return sendError(res, 'Id is invalid!');

    const movie = await Movie.findById(movieId).populate('director writers cast.actor');

    res.json({
        movie: {
            id: movie._id,
            title: movie.title,
            storyLine: movie.storyLine,
            poster: movie.poster?.url,
            releaseDate: movie.releaseDate,
            status: movie.status,
            type: movie.type,
            language: movie.language,
            genres: movie.genres,
            tags: movie.tags,
            director: movie.director ? formatActor(movie.director) : "",
            writers: movie.writers.map((w) => formatActor(w)),
            cast: movie.cast.map((c) => {
                return {
                    id: c.id,
                    profile: formatActor(c.actor),
                    roleAs: c.roleAs,
                    leadActor: c.leadActor,
                };
            }),
        },
    });
}


exports.searchMovies = async (req, res) => {
    const { title } = req.query;

    if (!title.trim()) return sendError(res, "Invalid request!");

    const movies = await Movie.find({ title: { $regex: title, $options: 'i' } })

    res.json({
        results: movies.map(m => {
            return {
                id: m._id,
                title: m.title,
                poster: m.poster?.url,
                genres: m.genres,
                status: m.status
            }
        })
    })
}

exports.searchPublicMovies = async (req, res) => {
    const { title } = req.query;

    if (!title.trim()) return sendError(res, "Invalid request!");

    const movies = await Movie.find({
        title: { $regex: title, $options: 'i' },
        status: 'public'
    })


    const mapMovies = async (m) => {
        const reviews = await getAverageRatings(m._id);
        return {
            id: m._id,
            title: m.title,
            poster: m.poster?.url,
            responsivePosters: m.poster?.responsive,
            reviews: { ...reviews }
        }
    }

    const results = await Promise.all(
        movies.map(mapMovies)
    )

    res.json({
        results
    })
}



exports.getLatestUploads = async (req, res) => {
    const { limit = 5 } = req.query;

    const results = await Movie.find({ status: 'public' }).sort('-createdAt').limit(parseInt(limit));

    const movies = results.map(m => {
        return {
            id: m._id,
            title: m.title,
            poster: m.poster?.url,
            trailer: m.trailer?.url,
            responsivePosters: m.poster?.responsive,
            storyLine: m.storyLine
        }
    })

    res.json({
        movies
    })
}

exports.getSingleMovie = async (req, res) => {
    const { movieId } = req.params;

    if (!isValidObjectId(movieId)) return sendError(res, 'Movie id is invalid!');

    const movie = await Movie.findById(movieId).populate('director writers cast.actor');

    if (!movie) return sendError(res, 'Movie not found!', 404);

    // const [aggregatedResponse] = await Review.aggregate(averageRatingPipeline(movie._id));

    // const reviews ={}

    // if(aggregatedResponse){
    //     const {ratingAvg, reviewCount} = aggregatedResponse;
    //     reviews.ratingAvg= parseFloat(ratingAvg).toFixed(1),
    //     reviews.reviewCount= reviewCount
    // }

    const reviews = await getAverageRatings(movie._id);
    const {
        _id: id,
        title,
        storyLine,
        cast,
        writers,
        director,
        releaseDate,
        genres,
        tags,
        language,
        poster,
        trailer,
        type,
    } = movie;

    res.json({
        movie: {
            id,
            title,
            storyLine,
            releaseDate,
            genres,
            tags,
            language,
            type,
            poster: poster?.url,
            trailer: trailer?.url,
            cast: cast.map((c) => ({
                id: c._id,
                profile: {
                    id: c.actor._id,
                    name: c.actor.name,
                    avatar: c.actor?.avatar?.url,
                },
                leadActor: c.leadActor,
                roleAs: c.roleAs,
            })),
            writers: writers.map((w) => ({
                id: w?._id || "",
                name: w?.name || "",
            })),
            director: {
                id: director?._id,
                name: director?.name,
            },
            reviews: { ...reviews }
        },
    });
}


exports.getRelatedMovies = async (req, res) => {
    const { movieId } = req.params;

    if (!isValidObjectId(movieId)) return sendError(res, "Invalid movie id!");

    const movie = await Movie.findById(movieId);

    const movies = await Movie.aggregate(relatedMoviesAggregation(movie.tags, movie._id))


    const mapMovies = async (m) => {
        const reviews = await getAverageRatings(m._id)
        return {
            id: m._id,
            title: m.title,
            poster: m.poster,
            reviews,
            tags: m.tags,
            responsivePosters: m.responsivePosters
        }
    }

    const relatedMovies = await Promise.all(movies.map(mapMovies))

    res.json({
        movies: relatedMovies
    })
}


exports.getTopRatedMovies = async (req, res) => {
    const { type = 'Film' } = req.query;

    const movies = await Movie.aggregate(toRatedMoviesPipeline(type))


    const mapMovies = async (m) => {
        const reviews = await getAverageRatings(m._id);
        return {
            id: m._id,
            title: m.title,
            poster: m.poster,
            responsivePosters: m.responsivePosters,
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