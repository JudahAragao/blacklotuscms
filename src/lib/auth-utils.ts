import { Role } from '../../prisma/generated/prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Checks if a role has a certain capability.
 * If checkOwn is true, it also checks if the role has the '.own' version of the capability.
 */
export function hasCapability(role: Role, capability: string, checkOwn: boolean = false): boolean {
  if (role.name === 'Administrador') return true;

  const capabilities = role.capabilities as Record<string, any>;
  if (!capabilities) return false;

  // Helper function to resolve nested or flat paths
  const resolve = (cap: string) => {
    if (capabilities[cap] === true) return true;
    if (cap.includes('.')) {
      const parts = cap.split('.');
      let current: any = capabilities;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return false;
        }
      }
      return current === true;
    }
    return false;
  };

  if (resolve(capability)) return true;

  // If checkOwn is true, try to find the .own variant
  // Ex: if capability is "post.edit", try "post.own" or "post.own.edit"
  if (checkOwn) {
    const parts = capability.split('.');
    if (parts.length >= 2) {
      // Tries to insert "own" before the last part: "post.edit" -> "post.own.edit"
      const ownCap = [...parts.slice(0, -1), 'own', parts.slice(-1)[0]].join('.');
      if (resolve(ownCap)) return true;

      // Tries simple format: "post.own"
      const simpleOwn = [...parts.slice(0, -1), 'own'].join('.');
      if (resolve(simpleOwn)) return true;
    }
  }

  return false;
}

/**
 * Checks if a user can perform an action on a specific resource.
 * @param user User object with role included
 * @param capability The desired capability (ex: 'post.update')
 * @param resourceOwnerId (Optional) Resource owner ID for 'own' check
 */
export function canPerformAction(user: any, capability: string, resourceOwnerId?: string): boolean {
  if (!user || !user.role) return false;
  if (user.role.name === 'Administrador') return true;

  // 1. Checks if has the master/general permission for the resource
  if (hasCapability(user.role, capability)) return true;

  // 2. If no general permission, but is the resource owner, check if has 'own' permission
  if (resourceOwnerId && user.id === resourceOwnerId) {
    return hasCapability(user.role, capability, true);
  }

  return false;
}

/**
 * Fetches authenticated user with their role.
 */
export async function getAuthenticatedUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
}
