import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in sync-user route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
