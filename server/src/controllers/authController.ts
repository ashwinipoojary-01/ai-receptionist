import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new AppError('An account with this email already exists', 400);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      if (!user) throw new AppError('User not found', 404);
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  }
}
