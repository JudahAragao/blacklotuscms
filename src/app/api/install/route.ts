import { NextRequest, NextResponse } from 'next/server';
import { installService } from '@/core/services/InstallService';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Check if already installed
    const isInstalled = await InstallService.isInstalled();
    if (isInstalled) {
      return NextResponse.json(
        { error: 'System is already installed' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Complete installation
    await InstallService.completeInstallation(data);

    return NextResponse.json({
      success: true,
      message: 'Installation completed successfully',
    });
  } catch (error) {
    logger.error('Installation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Installation error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isInstalled = await InstallService.isInstalled();

    return NextResponse.json({
      installed: isInstalled,
    });
  } catch (error) {
    logger.error('Check installation error:', error);
    return NextResponse.json(
      { error: 'Error checking installation status' },
      { status: 500 }
    );
  }
}
