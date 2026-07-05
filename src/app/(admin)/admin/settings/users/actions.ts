"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasCapability } from "@/lib/auth-utils";
import { userService } from "@/core/services/UserService";
import { handleApiError } from "@/lib/errors";

async function getSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Sessão expirada");
  return session;
}

export async function createUserAction(formData: FormData) {
  try {
    const session = await getSessionOrThrow();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const roleId = formData.get("roleId") as string;

    if (!email || !password || !roleId) throw new Error("Campos obrigatórios ausentes");

    const passwordHash = await bcrypt.hash(password, 12);

    await userService.create({
      email,
      passwordHash,
      roleId,
    }, session.user);

    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    const session = await getSessionOrThrow();
    
    const currentUser = await prisma.user.findUnique({ 
      where: { id },
      include: { role: true }
    });
    if (!currentUser) throw new Error("Usuário não encontrado");

    let email = formData.get("email") as string;
    let roleId = formData.get("roleId") as string;
    let currentPassword = formData.get("currentPassword") as string;
    let password = formData.get("password") as string;
    let confirmPassword = formData.get("confirmPassword") as string;
    let image = formData.get("image") as string;

    const data: any = { email, image };

    if (password) {
      if (session.user.id === id) {
        if (!currentPassword) throw new Error("Para mudar a senha, você deve informar sua senha atual.");
        const isMatch = await bcrypt.compare(currentPassword, currentUser.passwordHash);
        if (!isMatch) throw new Error("A senha atual informada está incorreta.");
      }

      if (password !== confirmPassword) {
        throw new Error("A nova senha e a confirmação não coincidem.");
      }
      
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    const isAdmin = hasCapability(session.user.role, 'user.manage');
    if (isAdmin && roleId) {
      const adminRole = await prisma.role.findFirst({ where: { name: 'Administrador' } });
      if (adminRole && currentUser.role.name === 'Administrador' && roleId !== adminRole.id) {
        const adminCount = await prisma.user.count({
          where: { role: { name: 'Administrador' } }
        });

        if (adminCount <= 1) {
          throw new Error("Segurança: Você não pode alterar a role do único Administrador do sistema.");
        }
      }
      data.roleId = roleId;
    }

    await userService.update(id, data, session.user);

    revalidatePath("/admin/settings/users");
    if (session.user.id === id) {
      revalidatePath(`/admin/settings/users/${id}`);
      return { success: true };
    }
    
    redirect("/admin/settings/users");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteUserAction(id: string) {
  try {
    const session = await getSessionOrThrow();
    await userService.delete(id, session.user);
    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateRoleCapabilitiesAction(roleId: string, capabilities: any) {
  try {
    const session = await getSessionOrThrow();
    await userService.updateRoleCapabilities(roleId, capabilities, session.user);
    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}
