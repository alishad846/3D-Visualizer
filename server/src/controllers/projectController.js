// Controller for projectController
exports.getData = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Response from projectController' });
  } catch (error) {
    next(error);
  }
};