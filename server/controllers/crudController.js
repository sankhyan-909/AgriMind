function createCrudController(Model, options = {}) {
  const ownerField = options.ownerField || "owner";
  const role = options.role;

  function baseFilter(req) {
    if (ownerField === null) return {};

    return {
      [ownerField]: req.user.id
    };
  }

  function applyRole(req, res) {
    if (
      role &&
      req.user.role !== role
    ) {
      res.status(403).json({
        success: false,
        message: "You are not authorized for this resource."
      });
      return false;
    }

    return true;
  }

  async function list(req, res) {
    try {
      if (!applyRole(req, res)) return;

      const filter = baseFilter(req);

      const items = await Model.find(filter).sort({
        createdAt: -1
      });

      res.json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (error) {
      console.error("List error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to fetch records."
      });
    }
  }

  async function getOne(req, res) {
    try {
      if (!applyRole(req, res)) return;

      const filter = {
        ...baseFilter(req),
        _id: req.params.id
      };

      const item = await Model.findOne(filter);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Record not found."
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error("Get error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to fetch record."
      });
    }
  }

  async function create(req, res) {
    try {
      if (!applyRole(req, res)) return;

      const data = {
        ...req.body
      };

      if (ownerField !== null) {
        data[ownerField] = req.user.id;
      }

      const item = await Model.create(data);

      res.status(201).json({
        success: true,
        message: "Record created successfully.",
        data: item
      });
    } catch (error) {
      console.error("Create error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Unable to create record."
      });
    }
  }

  async function update(req, res) {
    try {
      if (!applyRole(req, res)) return;

      const filter = {
        ...baseFilter(req),
        _id: req.params.id
      };

      const item = await Model.findOneAndUpdate(
        filter,
        { $set: req.body },
        {
          new: true,
          runValidators: true
        }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Record not found."
        });
      }

      res.json({
        success: true,
        message: "Record updated successfully.",
        data: item
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Unable to update record."
      });
    }
  }

  async function remove(req, res) {
    try {
      if (!applyRole(req, res)) return;

      const filter = {
        ...baseFilter(req),
        _id: req.params.id
      };

      const item = await Model.findOneAndDelete(
        filter
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Record not found."
        });
      }

      res.json({
        success: true,
        message: "Record deleted successfully."
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to delete record."
      });
    }
  }

  return {
    list,
    getOne,
    create,
    update,
    remove
  };
}

module.exports = createCrudController;
