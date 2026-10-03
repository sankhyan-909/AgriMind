const express = require("express");
const createCrudController = require("../controllers/crudController");

function buildResourceRouter(Model, options = {}) {
  const router = express.Router();

  const controller =
    createCrudController(
      Model,
      options
    );

  router.get("/", controller.list);
  router.get("/:id", controller.getOne);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

module.exports = buildResourceRouter;
