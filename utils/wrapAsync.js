// way to handle async errors in express routes

/* function wrapAsync(fn) {
     return function (req, res, next) {
         fn(req, res, next).catch(next);
     };
 } */

// OR

// custom middleware to handle async errors in express routes
module.exports = (fn) => {
  // by module.exports we can import this function in other files
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// wrapAsync is a higher-order function that takes an asynchronous function (fn) as an argument and returns a new function. This new function is designed to handle any errors that may occur during the execution of the asynchronous function by catching them and passing them to the next middleware in the Express.js request-response cycle.
