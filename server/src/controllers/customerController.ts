import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService.js';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(3),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await CustomerService.listCustomers();
      return res.json({ customers });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      return res.json({ customer });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = customerSchema.parse(req.body);
      const customer = await CustomerService.findOrCreateCustomer(data);
      return res.status(201).json({ customer });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await CustomerService.updateCustomer(req.params.id, req.body);
      return res.json({ customer: updated });
    } catch (err) {
      next(err);
    }
  }
}
