import { Router } from "express";
import { serviceController } from "../controllers/service.controller.js";

const router = Router();

// List services (optional namespace filter via query param)
router.get("/", (req, res, next) =>
  serviceController.listServices(req, res, next),
);

// Get specific service
router.get("/:namespace/:name", (req, res, next) =>
  serviceController.getService(req, res, next),
);

// Create service
router.post("/", (req, res, next) =>
  serviceController.createService(req, res, next),
);

// Delete service
router.delete("/:namespace/:name", (req, res, next) =>
  serviceController.deleteService(req, res, next),
);

export default router;
