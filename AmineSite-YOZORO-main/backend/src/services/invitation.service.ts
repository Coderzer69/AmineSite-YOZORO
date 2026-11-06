import { db } from "../config/db.js";
import { generateInvitationCode } from "../utils/crypto.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import type { Invitation } from "@prisma/client";

export class InvitationService {
  async createInvitation(adminId: string, daysValid = 30): Promise<Invitation> {
    const code = generateInvitationCode();
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

    return db.invitation.create({
      data: {
        code,
        createdById: adminId,
        expiresAt,
      },
    });
  }

  async verifyInvitationValid(code: string): Promise<Invitation> {
    const trimmed = code.trim().toUpperCase();
    const invitation = await db.invitation.findUnique({
      where: { code: trimmed },
    });

    if (!invitation) {
      throw new BadRequestError("Invalid invitation code");
    }

    if (invitation.usedById) {
      throw new BadRequestError("This invitation code has already been used");
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestError("This invitation code has expired");
    }

    return invitation;
  }

  async claimInvitation(code: string, newUserId: string): Promise<Invitation> {
    const trimmed = code.trim().toUpperCase();
    return db.invitation.update({
      where: { code: trimmed },
      data: {
        usedById: newUserId,
        usedAt: new Date(),
      },
    });
  }

  async listInvitations(skip = 0, take = 50) {
    const [invitations, total] = await Promise.all([
      db.invitation.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, username: true, email: true } },
          usedBy: { select: { id: true, username: true, email: true } },
        },
      }),
      db.invitation.count(),
    ]);

    return { invitations, total };
  }
}

export const invitationService = new InvitationService();
