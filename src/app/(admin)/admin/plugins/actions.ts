"use server";

import { pluginDataService } from "@/core/services/PluginDataService";
import { pluginService } from "@/core/services/PluginService";
import { revalidatePath } from "next/cache";
import { handleApiError } from "@/lib/errors";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function approvePermissionAction(permissionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await pluginDataService.updatePermissionStatus(permissionId, "approved");
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function denyPermissionAction(permissionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await pluginDataService.updatePermissionStatus(permissionId, "denied");
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function activatePluginAction(pluginId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await pluginService.activate(pluginId, session.user);
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deactivatePluginAction(pluginId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await pluginService.deactivate(pluginId, session.user);
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function importPluginAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  const file = formData.get("pluginZip") as File;
  if (!file) throw new Error("Nenhum arquivo enviado");

  const buffer = Buffer.from(await file.arrayBuffer());
  await pluginService.installPlugin(buffer, file.name, session.user);
  
  revalidatePath("/admin/plugins");
  return { success: true };
}

export async function activateCompiledPluginAction(pluginName: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await pluginService.activateCompiled(pluginName, session.user);
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deactivateCompiledPluginAction(pluginName: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await pluginService.deactivateCompiled(pluginName, session.user);
    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}
