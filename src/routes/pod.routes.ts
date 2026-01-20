import { Router } from "express";
import { podController } from "../controllers/pod.controller.js";

const router = Router();

// List pods (optional namespace filter via query param)
router.get("/", (req, res, next) => podController.listPods(req, res, next));

// Get specific pod
router.get("/:namespace/:name", (req, res, next) =>
  podController.getPod(req, res, next),
);

// Create pod
router.post("/", (req, res, next) => podController.createPod(req, res, next));

// Update pod
router.patch("/:namespace/:name", (req, res, next) =>
  podController.updatePod(req, res, next),
);

// Delete pod
router.delete("/:namespace/:name", (req, res, next) =>
  podController.deletePod(req, res, next),
);

export default router;
