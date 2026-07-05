"use server";

import { pluginDataService } from "@/core/services/PluginDataService";
import { pluginManager } from "@/core/services/PluginManager";
import { revalidatePath } from "next/cache";
import { handleApiError } from "@/lib/errors";

export async function approvePermissionAction(permissionId: string) {
  try {
    await pluginDataService.updatePermissionStatus(permissionId, "approved");
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function denyPermissionAction(permissionId: string) {
  try {
    await pluginDataService.updatePermissionStatus(permissionId, "denied");
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function activatePluginAction(pluginId: string) {
  try {
    await pluginManager.activate(pluginId);
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deactivatePluginAction(pluginId: string) {
  try {
    await pluginService.deactivate(pluginId);
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function importPluginAction(formData: FormData) {
  try {
    const file = formData.get("pluginZip") as File;
    if (!file) throw new Error("Nenhum arquivo enviado");

    const buffer = Buffer.from(await file.arrayBuffer());
    await pluginManager.installPlugin(buffer, file.name);
    
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}
