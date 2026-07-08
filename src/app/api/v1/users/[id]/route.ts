import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/core/services/UserService';
import { withApiAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';

/**
 * GET /api/v1/users/:id — Export user data (LGPD Art. 15, 20)
 */
export const GET = withApiAuth(
  async (req, { params }, session) => {
    try {
      const data = await UserService.exportData(params.id, session.user);
      return NextResponse.json(data);
    } catch (error: any) {
      const { error: msg, status, code } = handleApiError(error);
      return NextResponse.json({ error: msg, code }, { status });
    }
  }
);

/**
 * DELETE /api/v1/users/:id — Delete user account (LGPD Art. 17)
 */
export const DELETE = withApiAuth(
  async (req, { params }, session) => {
    try {
      await UserService.deleteAccount(params.id, session.user);
      return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
      const { error: msg, status, code } = handleApiError(error);
      return NextResponse.json({ error: msg, code }, { status });
    }
  }
);
