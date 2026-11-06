import { userRepository } from "../repositories/user.repository.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { invitationService } from "./invitation.service.js";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { BadRequestError, UnauthorizedError, ConflictError } from "../utils/errors.js";
import type { User } from "@prisma/client";

export interface AuthResult {
  user: Omit<User, "passwordHash">;
  sessionToken: string;
}

export class AuthService {
  async register(params: {
    username: string;
    email: string;
    password: string;
    invitationCode: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthResult> {
    // 1. Verify invitation code FIRST
    const code = params.invitationCode.trim().toUpperCase();
    await invitationService.verifyInvitationValid(code);

    // 2. Check duplicate email / username
    const existingEmail = await userRepository.findByEmail(params.email);
    if (existingEmail) {
      throw new ConflictError("Email is already registered");
    }

    const existingUsername = await userRepository.findByUsername(params.username);
    if (existingUsername) {
      throw new ConflictError("Username is already taken");
    }

    // 3. Create user
    const passwordHash = await hashPassword(params.password);
    const user = await userRepository.createUser({
      username: params.username,
      email: params.email,
      passwordHash,
    });

    // 4. Mark invitation as used
    await invitationService.claimInvitation(code, user.id);

    const { rawToken } = await sessionRepository.createSession(user.id, params.ipAddress, params.userAgent);
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, sessionToken: rawToken };
  }

  async login(params: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthResult> {
    const user = await userRepository.findByEmail(params.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError("Account is suspended");
    }

    const isValid = await verifyPassword(params.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { rawToken } = await sessionRepository.createSession(user.id, params.ipAddress, params.userAgent);
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, sessionToken: rawToken };
  }

  async logout(sessionToken: string): Promise<void> {
    await sessionRepository.deleteSession(sessionToken);
  }

  async getCurrentUser(sessionToken: string): Promise<Omit<User, "passwordHash">> {
    const sessionWithUser = await sessionRepository.findSessionWithUser(sessionToken);
    if (!sessionWithUser || sessionWithUser.user.status !== "ACTIVE") {
      throw new UnauthorizedError("Session is invalid or expired");
    }
    const { passwordHash: _, ...safeUser } = sessionWithUser.user;
    return safeUser;
  }

  async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    const valid = await verifyPassword(oldPass, user.passwordHash);
    if (!valid) throw new BadRequestError("Current password is incorrect");

    const newHash = await hashPassword(newPass);
    await userRepository.updatePassword(userId, newHash);
    await sessionRepository.deleteAllUserSessions(userId);
  }
}

export const authService = new AuthService();
