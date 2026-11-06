import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export interface AppUserSession {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
}

/**
 * Retrieves the currently authenticated user from Clerk and syncs with Prisma DB.
 * Supports graceful fallback in dev/testing mode when Clerk keys are placeholders.
 */
export async function getAuthenticatedUser(): Promise<AppUserSession | null> {
  try {
    const hasValidClerkKey =
      process.env.CLERK_SECRET_KEY &&
      !process.env.CLERK_SECRET_KEY.includes("placeholder");

    if (!hasValidClerkKey) {
      // Dev mode fallback when Clerk keys are not configured yet
      let devUser = await prisma.user.findFirst({
        where: { role: Role.ADMIN },
      });

      if (!devUser) {
        devUser = await prisma.user.create({
          data: {
            clerkId: "dev_admin_clerk_id",
            name: "Library Administrator",
            email: "admin@apex.edu",
            role: Role.ADMIN,
          },
        });
      }

      return {
        id: devUser.id,
        clerkId: devUser.clerkId,
        name: devUser.name,
        email: devUser.email,
        role: devUser.role,
        avatar: devUser.avatar,
      };
    }

    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "unknown@apex.edu";

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      "University User";

    const metadataRole = (clerkUser.publicMetadata?.role as Role) || Role.STUDENT;

    // Upsert into local database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        name: fullName,
        email: primaryEmail,
        avatar: clerkUser.imageUrl,
      },
      create: {
        clerkId: userId,
        name: fullName,
        email: primaryEmail,
        role: metadataRole,
        avatar: clerkUser.imageUrl,
      },
    });

    return {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatar: dbUser.avatar,
    };
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

/**
 * Checks if the user is authorized for specific roles.
 */
export async function requireUserWithRoles(allowedRoles: Role[]): Promise<{
  user: AppUserSession | null;
  authorized: boolean;
  errorResponse?: Response;
}> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({ error: "Unauthorized: Please log in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user,
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          error: "Forbidden: You do not have permission to perform this action.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return { user, authorized: true };
}
