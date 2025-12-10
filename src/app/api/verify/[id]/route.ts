import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'AVAILABLE') {
      await prisma.property.update({
        where: { id: params.id },
        data: {
          lastVerifiedAt: new Date(),
          verificationSource: 'OWNER',
          status: 'AVAILABLE', // Ensure it's active
        },
      });
      
      return new NextResponse(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f0fdf4;">
            <div style="text-align:center;">
              <h1 style="color:#166534;">Updated Successfully!</h1>
              <p>The listing is now marked as <strong>Fresh</strong>.</p>
            </div>
          </body>
        </html>
      `, { headers: { 'content-type': 'text/html' } });
    } 
    
    if (action === 'SOLD') {
      await prisma.property.update({
        where: { id: params.id },
        data: {
          status: 'SOLD', // Or RENTED, logic could be refined
          lastVerifiedAt: new Date(),
          verificationSource: 'OWNER',
        },
      });

      return new NextResponse(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f9fafb;">
            <div style="text-align:center;">
              <h1 style="color:#374151;">Listing Closed</h1>
              <p>We have removed this listing from our active inventory.</p>
            </div>
          </body>
        </html>
      `, { headers: { 'content-type': 'text/html' } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
