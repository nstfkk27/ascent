'use client';

import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';

interface EnquiryButtonsProps {
  propertyId: string;
  propertyTitle: string;
  agentPhone?: string;
  agentLine?: string;
  agentWhatsapp?: string;
}

export default function EnquiryButtons({ 
  propertyId, 
  propertyTitle,
  agentPhone,
  agentLine,
  agentWhatsapp 
}: EnquiryButtonsProps) {
  const [tracking, setTracking] = useState(false);

  const trackEnquiry = async (channel: 'LINE' | 'WHATSAPP' | 'PHONE') => {
    if (tracking) return;
    setTracking(true);
    
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          channel,
        }),
      });
    } catch (error) {
      console.error('Failed to track enquiry:', error);
    } finally {
      setTracking(false);
    }
  };

  const handleLine = () => {
    trackEnquiry('LINE');
    const lineId = agentLine || 'ascentrealestate';
    const message = encodeURIComponent(`Hi, I'm interested in: ${propertyTitle}`);
    window.open(`https://line.me/R/ti/p/${lineId}?text=${message}`, '_blank');
  };

  const handleWhatsApp = () => {
    trackEnquiry('WHATSAPP');
    const phone = agentWhatsapp || agentPhone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in: ${propertyTitle}`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handlePhone = () => {
    trackEnquiry('PHONE');
    const phone = agentPhone || '';
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-600 mb-1">Contact Agent</p>
      
      <div className="flex gap-2">
        {/* Line Button */}
        <button
          onClick={handleLine}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00B900] text-white rounded-xl hover:bg-[#00a000] transition-colors font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          Line
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] transition-colors font-medium"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </button>

        {/* Phone Button */}
        <button
          onClick={handlePhone}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#496f5d] text-white rounded-xl hover:bg-[#3d5c4d] transition-colors font-medium"
        >
          <Phone className="w-5 h-5" />
          Call
        </button>
      </div>
    </div>
  );
}
