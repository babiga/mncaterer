import { NextResponse, userAgent } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { device, browser, os } = userAgent(request);
    const url = new URL(request.url);
    const path = request.headers.get("x-invoke-path") || "/";

    // Create a background task or just await it
    await prisma.visitorMetric.create({
      data: {
        path,
        deviceType: device.type || "desktop",
        browser: browser.name,
        os: os.name,
        referer: request.headers.get("referer"),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
