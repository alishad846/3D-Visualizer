// Controller for productController
exports.getData = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Response from productController' });
  } catch (error) {
    next(error);
  }
};