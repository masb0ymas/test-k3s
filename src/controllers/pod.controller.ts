import { Request, Response, NextFunction } from "express";
import { podService } from "../services/pod.service.js";
import {
  createPodSchema,
  updatePodSchema,
} from "../validators/pod.validator.js";

export class PodController {
  /**
   * GET /api/pods
   * List all pods, optionally filtered by namespace query param
   */
  async listPods(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const namespace = req.query.namespace as string | undefined;
      const pods = await podService.listPods(namespace);

      res.json({
        success: true,
        data: pods,
        count: pods.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pods/:namespace/:name
   * Get a specific pod by namespace and name
   */
  async getPod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { namespace, name } = req.params;
      const pod = await podService.getPod(namespace, name);

      res.json({
        success: true,
        data: pod,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/pods
   * Create a new pod with optional resource limits
   */
  async createPod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const input = createPodSchema.parse(req.body);
      const pod = await podService.createPod(input);

      res.status(201).json({
        success: true,
        message: "Pod created successfully",
        data: pod,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/pods/:namespace/:name
   * Update pod metadata (labels)
   */
  async updatePod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { namespace, name } = req.params;
      const input = updatePodSchema.parse(req.body);
      const pod = await podService.updatePod(namespace, name, input);

      res.json({
        success: true,
        message: "Pod updated successfully",
        data: pod,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/pods/:namespace/:name
   * Delete a pod
   */
  async deletePod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { namespace, name } = req.params;
      await podService.deletePod(namespace, name);

      res.json({
        success: true,
        message: `Pod ${name} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const podController = new PodController();
