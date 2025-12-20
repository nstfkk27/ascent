import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { hasFeatureAccess } from '@/lib/premiumFeatures';

export const dynamic = 'force-dynamic';

// GET - Fetch user's price alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has access to price alerts feature
    const agentProfile = await prisma.agentProfile.findFirst({
      where: { email: user.email! },
      select: { role: true }
    });

    if (!hasFeatureAccess(agentProfile?.role, 'PRICE_ALERTS')) {
      return NextResponse.json({ 
        error: 'Premium feature',
        message: 'Price alerts are available for SUPER_ADMIN and PLATFORM_AGENT accounts only'
      }, { status: 403 });
    }

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch property details for each alert
    const propertyIds = alerts.map(alert => alert.propertyId);
    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: {
        id: true,
        title: true,
        price: true,
        rentPrice: true,
        images: true,
        city: true,
        listingType: true
      }
    });

    const alertsWithProperties = alerts.map(alert => {
      const property = properties.find(p => p.id === alert.propertyId);
      return {
        ...alert,
        targetPrice: alert.targetPrice?.toString(),
        lastCheckedPrice: alert.lastCheckedPrice?.toString(),
        property: property ? {
          ...property,
          price: property.price?.toString(),
          rentPrice: property.rentPrice?.toString()
        } : null
      };
    });

    return NextResponse.json({ alerts: alertsWithProperties });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch price alerts' }, { status: 500 });
  }
}

// POST - Create a price alert
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has access to price alerts feature
    const agentProfile = await prisma.agentProfile.findFirst({
      where: { email: user.email! },
      select: { role: true }
    });

    if (!hasFeatureAccess(agentProfile?.role, 'PRICE_ALERTS')) {
      return NextResponse.json({ 
        error: 'Premium feature',
        message: 'Price alerts are available for SUPER_ADMIN and PLATFORM_AGENT accounts only',
        upgradeRequired: true
      }, { status: 403 });
    }

    const { propertyId, alertType, targetPrice, percentageChange } = await request.json();

    if (!propertyId || !alertType) {
      return NextResponse.json({ error: 'Property ID and alert type required' }, { status: 400 });
    }

    // Get current property price
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { price: true, rentPrice: true }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const currentPrice = property.price || property.rentPrice;

    // Create or update price alert
    const alert = await prisma.priceAlert.upsert({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId
        }
      },
      create: {
        userId: user.id,
        propertyId,
        alertType,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        percentageChange,
        lastCheckedPrice: currentPrice,
        isActive: true
      },
      update: {
        alertType,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        percentageChange,
        lastCheckedPrice: currentPrice,
        isActive: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Price alert created',
      alert: {
        ...alert,
        targetPrice: alert.targetPrice?.toString(),
        lastCheckedPrice: alert.lastCheckedPrice?.toString()
      }
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return NextResponse.json({ error: 'Failed to create price alert' }, { status: 500 });
  }
}

// DELETE - Remove a price alert
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    await prisma.priceAlert.delete({
      where: {
        id: alertId,
        userId: user.id // Ensure user can only delete their own alerts
      }
    });

    return NextResponse.json({ success: true, message: 'Price alert deleted' });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    return NextResponse.json({ error: 'Failed to delete price alert' }, { status: 500 });
  }
}
