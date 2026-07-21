import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';

// ponytail: minting the custom token by hand instead of firebase-admin/auth's
// getAuth().createCustomToken() — that submodule pulls in jwks-rsa -> jose
// (ESM-only build), which crashes the whole function at cold start under
// Vercel's CJS bundling (ERR_REQUIRE_ESM). This is exactly the JWT shape
// Firebase's own SDK signs, just without the unused ID-token-verification
// half of the auth module along for the ride.
const FIREBASE_CUSTOM_TOKEN_AUDIENCE =
  'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';

// ponytail: module-level singleton, same reasoning as the Upstash Redis client in
// dashboard.service.ts — serverless warm invocations reuse this instead of
// re-initializing the SDK on every request.
const firebaseApp =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_DATABASE_URL
    ? getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        })
    : null;

interface NewApplicationEvent {
  applicantId: string;
  applicationNumber: string;
  fullName: string;
  submittedAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Push a realtime "new application" event so admins currently on the
   * dashboard see it without polling. Never throws — a Firebase outage
   * must not fail an application submission.
   */
  async notifyNewApplication(event: NewApplicationEvent) {
    if (!firebaseApp) return;

    try {
      await getDatabase(firebaseApp)
        .ref('notifications')
        .push({ ...event, submittedAt: event.submittedAt.toISOString() });
    } catch (err) {
      this.logger.warn(`Failed to push realtime notification: ${err}`);
    }
  }

  /** Mints a Firebase custom auth token so the admin's browser can subscribe to RTDB. */
  createBrowserToken(adminId: string): string | null {
    if (
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !firebaseApp
    ) {
      return null;
    }

    return jwt.sign(
      { uid: adminId },
      process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      {
        algorithm: 'RS256',
        issuer: process.env.FIREBASE_CLIENT_EMAIL,
        subject: process.env.FIREBASE_CLIENT_EMAIL,
        audience: FIREBASE_CUSTOM_TOKEN_AUDIENCE,
        expiresIn: '1h',
      },
    );
  }

  async markRead(adminId: string) {
    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data: { notificationsReadAt: new Date() },
      select: { notificationsReadAt: true },
    });
    return admin.notificationsReadAt;
  }
}
