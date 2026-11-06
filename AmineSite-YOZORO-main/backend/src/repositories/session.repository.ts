import { db } from "../config/db.js";
import { generateSessionToken, hashToken } from "../utils/crypto.js";
import { env } from "../config/env.js";
import type { Session, User } from "@prisma/client";

export class SessionRepository {
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ session: Session; rawToken: string }> {
    const rawToken = generateSessionToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);

    const session = await db.session.create({
      data: {
        userId,
        tokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return { session, rawToken };
  }

  async findSessionWithUser(rawToken: string): Promise<(Session & { user: User }) | null> {
    const tokenHash = hashToken(rawToken);
    const session = await db.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await this.deleteSession(rawToken);
      return null;
    }

    return session;
  }

  async deleteSession(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await db.session.deleteMany({
      where: { tokenHash },
    });
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await db.session.deleteMany({
      where: { userId },
    });
  }
}

export const sessionRepository = new SessionRepository();

