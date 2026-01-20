import { Router } from "express";
import { namespaceController } from "../controllers/namespace.controller.js";

const router = Router();

// List namespaces
router.get("/", (req, res, next) =>
  namespaceController.listNamespaces(req, res, next),
);

// Get specific namespace
router.get("/:name", (req, res, next) =>
  namespaceController.getNamespace(req, res, next),
);

export default router;
