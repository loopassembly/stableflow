"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireViewerContext } from "@/lib/auth";
import {
  createAvailableOrganizationSlug,
  createOrganizationForOwner,
  seedDemoWorkspace,
} from "@/lib/ledger";

const createWorkspaceSchema = z.object({
  organizationName: z.string().trim().min(2).max(80),
});

export async function createWorkspaceAction(formData: FormData) {
  const viewer = await requireViewerContext({ next: "/welcome" });

  if (viewer.membership) {
    redirect("/workspace");
  }

  const parsed = createWorkspaceSchema.safeParse({
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    redirect(
      `/welcome?error=${encodeURIComponent(
        "Enter a company or workspace name with at least 2 characters.",
      )}`,
    );
  }

  const slug = await createAvailableOrganizationSlug(parsed.data.organizationName);
  const organization = await createOrganizationForOwner({
    userId: viewer.appUser.id,
    name: parsed.data.organizationName,
    slug,
  });

  await seedDemoWorkspace(organization.id);

  revalidatePath("/", "layout");
  revalidatePath("/workspace");

  redirect("/workspace?onboarding=complete");
}
