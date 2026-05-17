// Controller for recommendController
exports.getData = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Response from recommendController' });
  } catch (error) {
    next(error);
  }
};