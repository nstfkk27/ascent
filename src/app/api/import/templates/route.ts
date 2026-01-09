import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const validTypes = [
    'projects', 
    'facilities', 
    'units',
    'units_condo',
    'units_house',
    'units_land',
    'units_business'
  ];

  if (!type || !validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
  }

  try {
    const filePath = join(process.cwd(), 'public', 'templates', `${type}_template.csv`);
    const fileContent = await readFile(filePath, 'utf-8');

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_template.csv"`,
      },
    });
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
}
