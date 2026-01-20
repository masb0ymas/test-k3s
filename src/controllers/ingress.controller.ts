import { Request, Response, NextFunction } from "express";
import { ingressService } from "../services/ingress.service.js";
import { createIngressSchema } from "../validators/ingress.validator.js";

export class IngressController {
  /**
   * GET /api/ingresses
   * List all ingresses, optionally filtered by namespace query param
   */
  async listIngresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const namespace = req.query.namespace as string | undefined;
      const ingresses = await ingressService.listIngresses(namespace);

      res.json({
        success: true,
        data: ingresses,
        count: ingresses.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ingresses/:namespace/:name
   * Get a specific ingress by namespace and name
   */
  async getIngress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { namespace, name } = req.params;
      const ingress = await ingressService.getIngress(namespace, name);

      res.json({
        success: true,
        data: ingress,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ingresses
   * Create a new ingress with domain rules
   */
  async createIngress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const input = createIngressSchema.parse(req.body);
      const ingress = await ingressService.createIngress(input);

      res.status(201).json({
        success: true,
        message: "Ingress created successfully",
        data: ingress,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/ingresses/:namespace/:name
   * Delete an ingress
   */
  async deleteIngress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { namespace, name } = req.params;
      await ingressService.deleteIngress(namespace, name);

      res.json({
        success: true,
        message: `Ingress ${name} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ingressController = new IngressController();
