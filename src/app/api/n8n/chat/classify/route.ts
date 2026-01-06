/**
 * n8n API: Message Classification
 * Classify incoming messages for auto-routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateN8nApiKey } from '@/lib/n8n/auth';

export async function POST(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const data = await request.json();

    const { message, platform, userId } = data;

    if (!message) {
      return NextResponse.json(
        { error: 'Message required' },
        { status: 400 }
      );
    }

    // Simple keyword-based classification
    // In production, you'd call OpenAI API here
    const messageLower = message.toLowerCase();
    
    let intent = 'UNKNOWN';
    let confidence = 0.5;
    let suggestedAction = 'forward_to_agent';
    let extractedData: any = {};

    // ENQUIRY detection
    if (
      messageLower.includes('สนใจ') || 
      messageLower.includes('interested') ||
      messageLower.includes('ต้องการ') ||
      messageLower.includes('want to buy') ||
      messageLower.includes('looking for')
    ) {
      intent = 'ENQUIRY';
      confidence = 0.8;
      suggestedAction = 'match_properties';
      
      // Extract budget if mentioned
      const budgetMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|ล้าน|m)/i);
      if (budgetMatch) {
        extractedData.budget = parseFloat(budgetMatch[1].replace(/,/g, '')) * 1000000;
      }
    }
    
    // VIEWING request
    else if (
      messageLower.includes('ดู') ||
      messageLower.includes('view') ||
      messageLower.includes('visit') ||
      messageLower.includes('appointment')
    ) {
      intent = 'VIEWING';
      confidence = 0.85;
      suggestedAction = 'schedule_viewing';
    }
    
    // PRICE negotiation
    else if (
      messageLower.includes('ราคา') ||
      messageLower.includes('price') ||
      messageLower.includes('discount') ||
      messageLower.includes('ลด')
    ) {
      intent = 'PRICE';
      confidence = 0.75;
      suggestedAction = 'forward_to_agent';
    }
    
    // INFO request
    else if (
      messageLower.includes('?') ||
      messageLower.includes('information') ||
      messageLower.includes('details') ||
      messageLower.includes('ข้อมูล')
    ) {
      intent = 'INFO';
      confidence = 0.7;
      suggestedAction = 'search_kb';
    }
    
    // COMPLAINT
    else if (
      messageLower.includes('complaint') ||
      messageLower.includes('problem') ||
      messageLower.includes('issue') ||
      messageLower.includes('ร้องเรียน')
    ) {
      intent = 'COMPLAINT';
      confidence = 0.9;
      suggestedAction = 'escalate_to_manager';
    }

    return NextResponse.json({
      success: true,
      classification: {
        intent,
        confidence,
        suggestedAction,
        extractedData,
        originalMessage: message,
        platform,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('n8n message classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify message' },
      { status: 500 }
    );
  }
}
