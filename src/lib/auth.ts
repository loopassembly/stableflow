import { redirect } from "next/navigation";

import { OrganizationRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getFirebaseSessionUser } from "@/lib/firebase/server";

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type ViewerContext = {
  authUser: {
    id: string;
    email: string;
    fullName: string | null;
  };
  appUser: {
    id: string;
    email: string;
    fullName: string | null;
  };
  membership: {
    id: string;
    role: OrganizationRole;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  } | null;
};

export type WorkspaceViewerContext = ViewerContext & {
  membership: NonNullable<ViewerContext["membership"]>;
};

function preferredName(input: { fullName: string | null; email: string }) {
  if (input.fullName) {
    return input.fullName;
  }

  const [localPart] = input.email.split("@");
  return localPart.replace(/[._-]+/g, " ").trim();
}

export async function getViewerContext(): Promise<ViewerContext | null> {
  const authUser = await getFirebaseSessionUser();

  if (!authUser?.id || !authUser.email) {
    return null;
  }

  const fullName = authUser.fullName;

  const appUser = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      email: authUser.email,
      fullName: fullName ?? undefined,
    },
    create: {
      id: authUser.id,
      email: authUser.email,
      fullName: fullName ?? preferredName({ fullName, email: authUser.email }),
    },
  });

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: authUser.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    authUser: {
      id: authUser.id,
      email: authUser.email,
      fullName,
    },
    appUser: {
      id: appUser.id,
      email: appUser.email,
      fullName: appUser.fullName,
    },
    membership: membership
      ? {
          id: membership.id,
          role: membership.role,
          organization: membership.organization,
        }
      : null,
  };
}

export async function requireViewerContext(input?: { next?: string }) {
  const viewer = await getViewerContext();

  if (!viewer) {
    const next = input?.next ?? "/workspace";
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }

  return viewer;
}

export async function requireWorkspaceContext(
  input?: { next?: string },
): Promise<WorkspaceViewerContext> {
  const viewer = await requireViewerContext(input);

  if (!viewer.membership) {
    redirect("/welcome");
  }

  return viewer as WorkspaceViewerContext;
}

export async function requireApiViewerContext() {
  const viewer = await getViewerContext();

  if (!viewer) {
    throw new AuthError(401, "UNAUTHENTICATED", "You need to sign in first.");
  }

  return viewer;
}

export async function requireApiWorkspaceContext(): Promise<WorkspaceViewerContext> {
  const viewer = await requireApiViewerContext();

  if (!viewer.membership) {
    throw new AuthError(403, "ONBOARDING_REQUIRED", "Finish workspace setup first.");
  }

  return viewer as WorkspaceViewerContext;
}
