import webpush from "web-push";
import { prisma } from "@/lib/prisma";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

type PushTarget = {
  userId?: string;
  dashboardUserId?: string;
};

let vapidInitialized = false;

function ensureVapidConfigured() {
  if (vapidInitialized) return;

  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_SUBJECT || "mailto:support@tenx.local";

  if (!publicKey || !privateKey) {
    throw new Error("Missing web push VAPID keys in environment");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidInitialized = true;
}

async function pruneInvalidSubscriptions(endpoints: string[]) {
  if (!endpoints.length) return;

  await prisma.pushSubscription.deleteMany({
    where: {
      endpoint: {
        in: endpoints,
      },
    },
  });
}

export async function sendPushNotification(
  target: PushTarget,
  payload: PushPayload,
) {
  ensureVapidConfigured();
  const filters = [
    target.userId ? { userId: target.userId } : undefined,
    target.dashboardUserId ? { dashboardUserId: target.dashboardUserId } : undefined,
  ].filter(Boolean) as Array<{ userId?: string; dashboardUserId?: string }>;

  if (!filters.length) {
    return { sent: 0, removed: 0 };
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      OR: filters,
    },
  });

  if (!subscriptions.length) {
    return { sent: 0, removed: 0 };
  }

  const invalidEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload),
        );

        await prisma.pushSubscription.update({
          where: { endpoint: subscription.endpoint },
          data: { lastUsedAt: new Date() },
        });
      } catch (error: unknown) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof (error as { statusCode?: unknown }).statusCode === "number"
            ? (error as { statusCode: number }).statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          invalidEndpoints.push(subscription.endpoint);
          return;
        }

        throw error;
      }
    }),
  );

  await pruneInvalidSubscriptions(invalidEndpoints);

  return {
    sent: subscriptions.length - invalidEndpoints.length,
    removed: invalidEndpoints.length,
  };
}
