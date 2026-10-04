import { Request, Response, NextFunction } from 'express';
import { ServiceManager } from '../services/serviceManager.js';

export class ServiceController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.active === 'true';
      const services = await ServiceManager.listServices(onlyActive);
      return res.json({ services });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await ServiceManager.createService(req.body);
      return res.status(201).json({ service });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ServiceManager.updateService(req.params.id, req.body);
      return res.json({ service: updated });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ServiceManager.deleteService(req.params.id);
      return res.json({ success: true, message: 'Service deleted' });
    } catch (err) {
      next(err);
    }
  }
}
