// Controller for viewerController
exports.getData = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Response from viewerController' });
  } catch (error) {
    next(error);
  }
};