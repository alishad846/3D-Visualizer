const db = require('../db');

// GET /api/projects/trash
exports.getDeletedProjects = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const result = await db.query(
      `SELECT
         p.id,
         p.name,
         p.description,
         p.deleted_at,
         p.purge_at,
         u.name AS deleted_by_name
       FROM projects p
       LEFT JOIN users u ON u.id = p.deleted_by
       WHERE p.user_id = $1 AND p.status = 'deleted'
       ORDER BY p.deleted_at DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deleted projects:', error);
    next(error);
  }
};

// GET /api/projects/:id/restore-preflight
// Returns deleted product counts under this project — used by frontend to decide
// whether to show the "Restore project and all products" modal before executing restore.
exports.getRestorePreflight = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // Verify the project is deleted and belongs to this user
    const projectCheck = await db.query(
      `SELECT id, name FROM projects WHERE id = $1 AND user_id = $2 AND status = 'deleted'`,
      [id, userId]
    );

    if (projectCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Deleted project not found or access denied' });
    }

    // Count deleted products and how many are expiring within 48 hours
    const countResult = await db.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE purge_at <= NOW() + INTERVAL '48 hours') AS expiring_soon
       FROM products
       WHERE project_id = $1 AND status = 'deleted'`,
      [id]
    );

    const { total, expiring_soon } = countResult.rows[0];

    return res.json({
      projectId: id,
      projectName: projectCheck.rows[0].name,
      deletedProductCount: parseInt(total, 10),
      expiringSoonCount: parseInt(expiring_soon, 10),
    });
  } catch (error) {
    console.error('Error fetching restore preflight:', error);
    next(error);
  }
};

// POST /api/projects/:id/restore
// Supports two paths via query param:
//   ?includeProducts=true  → Path B: restore project + all deleted products + QR codes (single transaction)
//   (default)              → Path A: restore project only (existing behaviour, unchanged)
exports.restoreProject = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;
  const includeProducts = req.query.includeProducts === 'true';

  try {
    // 1. Fetch the deleted project (must belong to this user)
    const projectCheck = await db.query(
      `SELECT id, name FROM projects WHERE id = $1 AND user_id = $2 AND status = 'deleted'`,
      [id, userId]
    );

    if (projectCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Deleted project not found or access denied' });
    }

    const project = projectCheck.rows[0];

    // 2. Check for naming conflict against currently active projects (both paths)
    const conflict = await db.query(
      `SELECT id FROM projects WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND status = 'active'`,
      [userId, project.name]
    );

    if (conflict.rowCount > 0) {
      return res.status(409).json({
        error: `An active project named "${project.name}" already exists. Rename or delete that project first before restoring this one.`,
      });
    }

    if (includeProducts) {
      // ── PATH B: restore project + all deleted products + QR codes in one transaction ──
      await db.query('BEGIN');

      // 3B-a. Restore the project row
      const projectResult = await db.query(
        `UPDATE projects
         SET status     = 'active',
             deleted_at = NULL,
             deleted_by = NULL,
             purge_at   = NULL,
             updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, name, description, created_at, updated_at`,
        [id, userId]
      );

      // 3B-b. Restore all deleted products under this project owned by this user
      const productsResult = await db.query(
        `UPDATE products
         SET status     = 'active',
             deleted_at = NULL,
             deleted_by = NULL,
             purge_at   = NULL,
             updated_at = NOW()
         WHERE project_id = $1 AND user_id = $2 AND status = 'deleted'
         RETURNING id`,
        [id, userId]
      );

      const restoredProductIds = productsResult.rows.map((r) => r.id);

      // 3B-c. Re-activate QR codes for all restored products
      if (restoredProductIds.length > 0) {
        await db.query(
          `UPDATE qr_codes
           SET is_active   = true,
               updated_at  = NOW()
           WHERE product_id = ANY($1::uuid[])`,
          [restoredProductIds]
        );
      }

      await db.query('COMMIT');

      return res.json({
        success: true,
        message: `Project "${project.name}" and ${restoredProductIds.length} product(s) have been restored successfully.`,
        project: projectResult.rows[0],
        restoredProductCount: restoredProductIds.length,
        includeProducts: true,
      });
    } else {
      // ── PATH A: restore project only (original behaviour — unchanged) ──
      const result = await db.query(
        `UPDATE projects
         SET status     = 'active',
             deleted_at = NULL,
             deleted_by = NULL,
             purge_at   = NULL,
             updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, name, description, created_at, updated_at`,
        [id, userId]
      );

      return res.json({
        success: true,
        message: `Project "${project.name}" has been restored successfully.`,
        project: result.rows[0],
        restoredProductCount: 0,
        includeProducts: false,
      });
    }
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error restoring project:', error);
    next(error);
  }
};

// POST /api/projects
exports.createProject = async (req, res, next) => {
  const { name, description } = req.body;
  const { userId } = req.user;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    // Enforce: one user cannot have two active projects with the same name
    const duplicateCheck = await db.query(
      `SELECT id FROM projects WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND status = 'active'`,
      [userId, name.trim()]
    );
    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        error: `You already have an active project named "${name.trim()}". Please choose a different name.`,
      });
    }

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
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    next(error);
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // 1. Verify project ownership and active status
    const projectCheck = await db.query(
      "SELECT id, name FROM projects WHERE id = $1 AND user_id = $2 AND status = 'active'",
      [id, userId]
    );

    if (projectCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found or already deleted' });
    }

    const project = projectCheck.rows[0];

    // Begin transaction for tenant safety and multi-table cascading update
    await db.query('BEGIN');

    // 2. Soft-delete the project (enforces user ownership safety)
    await db.query(
      `UPDATE projects
       SET status = 'deleted',
           deleted_at = NOW(),
           deleted_by = $1,
           purge_at = NOW() + INTERVAL '7 days',
           updated_at = NOW()
       WHERE id = $2 AND user_id = $1`,
      [userId, id]
    );

    // 3. Soft-delete all products associated with the project (enforces ownership safety)
    await db.query(
      `UPDATE products
       SET status = 'deleted',
           deleted_at = NOW(),
           deleted_by = $1,
           purge_at = NOW() + INTERVAL '7 days',
           updated_at = NOW()
       WHERE project_id = $2 AND user_id = $1 AND status = 'active'`,
      [userId, id]
    );

    await db.query('COMMIT');

    return res.json({
      success: true,
      message: `Project "${project.name}" and all its products have been successfully deleted.`,
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error soft-deleting project:', error);
    next(error);
  }
};
