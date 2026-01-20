import { Router } from "express";
import podRoutes from "./pod.routes.js";
import namespaceRoutes from "./namespace.routes.js";
import serviceRoutes from "./service.routes.js";
import ingressRoutes from "./ingress.routes.js";

const router = Router();

router.use("/pods", podRoutes);
router.use("/namespaces", namespaceRoutes);
router.use("/services", serviceRoutes);
router.use("/ingresses", ingressRoutes);

export default router;
