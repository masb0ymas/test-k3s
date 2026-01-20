import { Request, Response, NextFunction } from "express";
import { serviceService } from "../services/service.service.js";
import { createServiceSchema } from "../validators/service.validator.js";

export class ServiceController {
  /**
   * GET /api/services
   * List all services, optionally filtered by namespace query param
   */
  async listServices(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const namespace = req.query.namespace as string | undefined;
      const services = await serviceService.listServices(namespace);

      res.json({
        success: true,
        data: services,
        count: services.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/services/:namespace/:name
   * Get a specific service by namespace and name
   */
  async getService(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { namespace, name } = req.params;
      const service = await serviceService.getService(namespace, name);

      res.json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/services
   * Create a new service
   */
  async createService(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const input = createServiceSchema.parse(req.body);
      const service = await serviceService.createService(input);

      res.status(201).json({
        success: true,
        message: "Service created successfully",
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/services/:namespace/:name
   * Delete a service
   */
  async deleteService(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { namespace, name } = req.params;
      await serviceService.deleteService(namespace, name);

      res.json({
        success: true,
        message: `Service ${name} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();
