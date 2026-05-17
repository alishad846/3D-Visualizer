// Controller for authController
exports.getData = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Response from authController' });
  } catch (error) {
    next(error);
  }
};