class ExpressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}
module.exports = ExpressError;

// OR -----

// const errorHandler = (err, req, res, next) => {
//     // Log the error for debugging purposes (optional but recommended)
//     console.error(err.stack); //

//     // Determine the status code (default to 500 if not set)
//     const statusCode = err.statusCode || 500;

//     // Set a default error message or use the one from the ExpressError
//     const message = err.message || "Something went wrong!";

//     // Send a JSON response with the error details
//     res.status(statusCode).json({
//         error: statusCode,
//         message: message,
//     });
// };
// module.exports = ExpressError;
