'use client';

import { useState } from 'react';
import { Bell, BellOff, Crown } from 'lucide-react';
import { hasFeatureAccess } from '@/lib/premiumFeatures';

interface PriceAlertButtonProps {
  propertyId: string;
  currentPrice: string | null;
  userRole?: string | null;
  hasAlert?: boolean;
  onAlertToggle?: () => void;
}

export default function PriceAlertButton({ 
  propertyId, 
  currentPrice,
  userRole,
  hasAlert = false,
  onAlertToggle
}: PriceAlertButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertType, setAlertType] = useState('PRICE_DROP');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentageChange, setPercentageChange] = useState('5');

  const hasAccess = hasFeatureAccess(userRole as any, 'PRICE_ALERTS');

  const handleCreateAlert = async () => {
    if (!hasAccess) {
      alert('Price alerts are a premium feature available for SUPER_ADMIN and PLATFORM_AGENT accounts. Upgrade your account to access this feature.');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          alertType,
          targetPrice: alertType === 'TARGET_PRICE' ? targetPrice : null,
          percentageChange: alertType === 'PERCENTAGE_DROP' ? parseInt(percentageChange) : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Price alert created successfully!');
        setShowModal(false);
        onAlertToggle?.();
      } else {
        if (data.upgradeRequired) {
          alert(data.message || 'This is a premium feature. Please upgrade your account.');
        } else {
          alert(data.error || 'Failed to create price alert');
        }
      }
    } catch (error) {
      console.error('Error creating price alert:', error);
      alert('Failed to create price alert');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveAlert = async () => {
    if (!hasAlert) return;

    try {
      const response = await fetch(`/api/price-alerts?propertyId=${propertyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Price alert removed');
        onAlertToggle?.();
      }
    } catch (error) {
      console.error('Error removing price alert:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => hasAlert ? handleRemoveAlert() : setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          hasAlert
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : hasAccess
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
        }`}
        title={hasAccess ? (hasAlert ? 'Remove price alert' : 'Set price alert') : 'Premium feature'}
      >
        {hasAlert ? (
          <>
            <Bell className="w-3.5 h-3.5" />
            Alert Active
          </>
        ) : hasAccess ? (
          <>
            <BellOff className="w-3.5 h-3.5" />
            Set Alert
          </>
        ) : (
          <>
            <Crown className="w-3.5 h-3.5" />
            Premium
          </>
        )}
      </button>

      {/* Alert Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Set Price Alert</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ANY_CHANGE">Any Price Change</option>
                  <option value="PRICE_DROP">Price Drop Only</option>
                  <option value="PRICE_INCREASE">Price Increase Only</option>
                  <option value="TARGET_PRICE">Specific Target Price</option>
                  <option value="PERCENTAGE_DROP">Percentage Drop</option>
                </select>
              </div>

              {alertType === 'TARGET_PRICE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price (฿)
                  </label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder={currentPrice || '0'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {currentPrice && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current price: ฿{Number(currentPrice).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {alertType === 'PERCENTAGE_DROP' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentage Drop (%)
                  </label>
                  <input
                    type="number"
                    value={percentageChange}
                    onChange={(e) => setPercentageChange(e.target.value)}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when price drops by {percentageChange}% or more
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> You&apos;ll receive notifications when the price changes according to your alert settings.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
