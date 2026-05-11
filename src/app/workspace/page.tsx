import { StableflowApp } from "@/components/stableflow/stableflow-app";
import { OrganizationRole } from "@/generated/prisma/client";
import { requireWorkspaceContext } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDashboardSnapshot } from "@/lib/ledger";

type WorkspacePageProps = {
  searchParams?: Promise<{
    preview?: string;
    email?: string;
    name?: string;
  }>;
};

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const canPreview = process.env.NODE_ENV === "development" && params?.preview === "1";

  if (canPreview) {
    const organization = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const snapshot = organization
      ? await getDashboardSnapshot(organization.id)
          .then((value) => JSON.parse(JSON.stringify(value)))
          .catch(() => null)
      : null;

    return (
      <StableflowApp
        initialSnapshot={snapshot}
        previewMode
        viewer={{
          name: params?.name ?? "TEST ADMIN",
          email: params?.email ?? "test@gmail.com",
          role: OrganizationRole.OWNER,
          organizationName: organization?.name ?? "StableFlow Demo",
          organizationSlug: organization?.slug ?? "demo-workspace",
        }}
      />
    );
  }

  const viewer = await requireWorkspaceContext({ next: "/workspace" });
  const snapshot = await getDashboardSnapshot(viewer.membership.organization.id)
    .then((value) => JSON.parse(JSON.stringify(value)))
    .catch(() => null);

  return (
    <StableflowApp
      initialSnapshot={snapshot}
      viewer={{
        name: viewer.appUser.fullName ?? viewer.authUser.fullName ?? viewer.appUser.email,
        email: viewer.appUser.email,
        role: viewer.membership.role,
        organizationName: viewer.membership.organization.name,
        organizationSlug: viewer.membership.organization.slug,
      }}
    />
  );
}
