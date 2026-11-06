import { db } from "../config/db.js";
import type { User, Role } from "@prisma/client";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return db.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });
  }

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }): Promise<User> {
    return db.user.create({
      data: {
        username: data.username.toLowerCase().trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role ?? "USER",
      },
    });
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async listUsers(skip = 0, take = 50): Promise<{ users: Omit<User, "passwordHash">[]; total: number }> {
    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.user.count(),
    ]);

    return { users, total };
  }
}

export const userRepository = new UserRepository();

