// async try & catch
// const asyncHandeler = (fnn) => async (req, res, next) => {
//   try {
//     await fnn(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// Promises
const asyncHandler = (fnn) => {
  return (req, res, next) => {
    Promise.resolve(fnn(req, res, next)).catch((error) => next(error));
  };
};

export default asyncHandler;
