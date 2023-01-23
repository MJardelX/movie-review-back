exports.errorHandling = (err, req, res, next) => {
    console.log("exception")
    res.status(500).json({
        error: err.message || err,
    });
};