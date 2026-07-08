"use server";

import { themeDataService } from "@/core/services/ThemeDataService";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function saveThemeSettingAction(themeName: string, key: string, value: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await themeDataService.setForTheme(themeName, key, value, session.user);
    revalidatePath("/admin/themes/editor");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getThemeSettingsAction(themeName: string) {
  try {
    return await themeDataService.listAll(themeName);
  } catch (error) {
    return handleApiError(error);
  }
}
