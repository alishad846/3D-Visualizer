const db = require('../db');

// POST /api/projects
exports.createProject = async (req, res, next) => {
  const { name, description } = req.body;
  const { userId } = req.user;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO projects (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, name, description, created_at, updated_at`,
      [userId, name.trim(), description ? description.trim() : null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    next(error);
  }
};

// GET /api/projects/my
exports.getMyProjects = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM projects
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    next(error);
  }
};