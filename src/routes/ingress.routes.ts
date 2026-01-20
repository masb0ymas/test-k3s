import { Router } from "express";
import { ingressController } from "../controllers/ingress.controller.js";

const router = Router();

// List ingresses (optional namespace filter via query param)
router.get("/", (req, res, next) =>
  ingressController.listIngresses(req, res, next),
);

// Get specific ingress
router.get("/:namespace/:name", (req, res, next) =>
  ingressController.getIngress(req, res, next),
);

// Create ingress
router.post("/", (req, res, next) =>
  ingressController.createIngress(req, res, next),
);

// Delete ingress
router.delete("/:namespace/:name", (req, res, next) =>
  ingressController.deleteIngress(req, res, next),
);

export default router;
