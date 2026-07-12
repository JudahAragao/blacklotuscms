"use server";

import { themeDataService } from "@/core/services/ThemeDataService";
import { themeService } from "@/core/services/ThemeService";
import { revalidatePath, revalidateTag } from "next/cache";
import { handleApiError } from "@/lib/errors";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function approveThemePermissionAction(permissionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await themeDataService.updatePermissionStatus(permissionId, "approved", session.user);
    revalidatePath("/admin/themes");
    revalidateTag("posts", "max");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function denyThemePermissionAction(permissionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await themeDataService.updatePermissionStatus(permissionId, "denied", session.user);
    revalidatePath("/admin/themes");
    revalidateTag("posts", "max");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function setActiveThemeAction(themeName: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await themeService.setActiveTheme(themeName, session.user);
    revalidatePath("/admin/themes");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}
