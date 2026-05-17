// Controller for analyticsController
exports.getData = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Response from analyticsController' });
  } catch (error) {
    next(error);
  }
};