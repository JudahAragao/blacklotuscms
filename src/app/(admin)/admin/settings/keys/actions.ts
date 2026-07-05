"use server";

import { apiKeyService } from "@/core/services/ApiKeyService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { handleApiError } from "@/lib/errors";

export async function createApiKeyAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const name = formData.get("name") as string;
    const expiresDays = parseInt(formData.get("expiresDays") as string) || 0;
    const rateLimit = parseInt(formData.get("rateLimit") as string) || 60;

    const plainKey = await apiKeyService.createKey((session?.user as any)?.id, name, session?.user, expiresDays, rateLimit);
    
    revalidatePath("/admin/settings/keys");
    return { plainKey };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function revokeApiKeyAction(id: string) {
  try {
    const session = await getServerSession(authOptions);
    await apiKeyService.revokeKey(id, (session?.user as any)?.id, session?.user);
    
    revalidatePath("/admin/settings/keys");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getApiKeysAction() {
  try {
    const session = await getServerSession(authOptions);
    return await apiKeyService.listKeys((session?.user as any)?.id, session?.user);
  } catch (error) {
    return handleApiError(error);
  }
}
