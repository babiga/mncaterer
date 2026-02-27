import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendPushNotification } from "@/lib/push";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const result = await sendPushNotification(
      session.userType === "dashboard"
        ? { dashboardUserId: session.userId }
        : { userId: session.userId },
      {
        title: "Push notification enabled",
        body: "Your device is ready to receive notifications.",
        url: "/",
      },
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Push test send failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send push notification" },
      { status: 500 },
    );
  }
}

