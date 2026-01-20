import { Request, Response, NextFunction } from "express";
import { namespaceService } from "../services/namespace.service.js";

export class NamespaceController {
  /**
   * GET /api/namespaces
   * List all namespaces
   */
  async listNamespaces(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const namespaces = await namespaceService.listNamespaces();

      res.json({
        success: true,
        data: namespaces,
        count: namespaces.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/namespaces/:name
   * Get a specific namespace
   */
  async getNamespace(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name } = req.params;
      const namespace = await namespaceService.getNamespace(name);

      res.json({
        success: true,
        data: namespace,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const namespaceController = new NamespaceController();
