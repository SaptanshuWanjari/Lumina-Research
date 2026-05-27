import { NextRequest, NextResponse } from "next/server";

import { requireAccessToken } from "@/lib/server/auth";
import { ServicesApiError, servicesApiFetch } from "@/lib/server/services-api";

export async function GET() {
  const { accessToken } = await requireAccessToken();
  
  try {
    const notifications = await servicesApiFetch("/notifications", accessToken!, {
      method: "GET",
    });
    return NextResponse.json(notifications);
  } catch (error) {
    if (error instanceof ServicesApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH() {
  const { accessToken } = await requireAccessToken();
  
  try {
    // We send a PATCH request to the read_all endpoint
    const updated = await servicesApiFetch("/notifications/read_all", accessToken!, {
      method: "PATCH",
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ServicesApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Failed to mark notifications as read" }, { status: 500 });
  }
}
