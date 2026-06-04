const recommendService = require('../services/recommendService');

exports.getRecommendations = async (req, res, next) => {
  const { productId } = req.params;
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 12);

  if (!productId) {
    return res.status(400).json({ error: 'Product ID or slug is required' });
  }

  try {
    const result = await recommendService.getSimilarProducts(productId, limit);

    if (!result.productId) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({
      products: result.products,
      recommendationSource: result.recommendationSource,
    });
  } catch (error) {
    next(error);
  }
};
