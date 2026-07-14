'use client';

import { formatPrice } from '@/lib/utils';

interface PriceTier {
  minQuantity: number;
  maxQuantity?: number | null;
  unitPrice: number;
}

interface PriceDisplayProps {
  basePrice: number;
  tiers?: PriceTier[];
  quantity?: number;
  currency?: string;
  showTiers?: boolean;
}

export default function PriceDisplay({
  basePrice,
  tiers,
  quantity = 1,
  currency = 'UZS',
  showTiers = true,
}: PriceDisplayProps) {
  // Find the applicable tier price
  const getApplicablePrice = () => {
    if (!tiers || tiers.length === 0) return basePrice;

    for (const tier of tiers) {
      if (quantity >= tier.minQuantity) {
        if (tier.maxQuantity === null || tier.maxQuantity === undefined || quantity <= tier.maxQuantity) {
          return tier.unitPrice;
        }
      }
    }
    return basePrice;
  };

  const currentPrice = getApplicablePrice();
  const savings = basePrice - currentPrice;
  const savingsPercentage = savings > 0 ? Math.round((savings / basePrice) * 100) : 0;

  return (
    <div className="space-y-2">
      {/* Current Price */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-blue-600">
          {formatPrice(currentPrice, currency)}
        </span>
        {savings > 0 && (
          <span className="text-sm text-green-600 font-medium">
            -{savingsPercentage}% tejamkorlik
          </span>
        )}
      </div>

      {/* Savings Info */}
      {savings > 0 && (
        <p className="text-sm text-gray-500">
          Adadiy narx: <span className="line-through">{formatPrice(basePrice, currency)}</span>
        </p>
      )}

      {/* Price Tiers */}
      {showTiers && tiers && tiers.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Miqdorga qarab narx:</p>
          <div className="space-y-2">
            {tiers.map((tier, index) => {
              const isApplicable =
                quantity >= tier.minQuantity &&
                (tier.maxQuantity === null || tier.maxQuantity === undefined || quantity <= tier.maxQuantity);

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isApplicable
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <span className="text-sm text-gray-600">
                    {tier.minQuantity} - {tier.maxQuantity || '∞'} dona
                  </span>
                  <span
                    className={`font-semibold ${
                      isApplicable ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {formatPrice(tier.unitPrice, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}