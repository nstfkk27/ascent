import { UserRole } from '@prisma/client';

// Premium feature definitions
export const PREMIUM_FEATURES = {
  PRICE_ALERTS: {
    name: 'PRICE_ALERTS',
    displayName: 'Price Alert Notifications',
    description: 'Get notified when property prices change',
    allowedRoles: ['SUPER_ADMIN', 'PLATFORM_AGENT'] as UserRole[],
  },
  ADVANCED_ANALYTICS: {
    name: 'ADVANCED_ANALYTICS',
    displayName: 'Advanced Analytics',
    description: 'Access detailed market analytics and insights',
    allowedRoles: ['SUPER_ADMIN', 'PLATFORM_AGENT'] as UserRole[],
  },
  BULK_EXPORT: {
    name: 'BULK_EXPORT',
    displayName: 'Bulk Data Export',
    description: 'Export property data in bulk',
    allowedRoles: ['SUPER_ADMIN', 'PLATFORM_AGENT'] as UserRole[],
  },
  PRIORITY_SUPPORT: {
    name: 'PRIORITY_SUPPORT',
    displayName: 'Priority Support',
    description: 'Get priority customer support',
    allowedRoles: ['SUPER_ADMIN', 'PLATFORM_AGENT'] as UserRole[],
  },
} as const;

export type PremiumFeatureName = keyof typeof PREMIUM_FEATURES;

/**
 * Check if a user role has access to a premium feature
 */
export function hasFeatureAccess(
  userRole: UserRole | null | undefined,
  featureName: PremiumFeatureName
): boolean {
  if (!userRole) return false;
  
  const feature = PREMIUM_FEATURES[featureName];
  return feature.allowedRoles.includes(userRole);
}

/**
 * Get all features accessible by a role
 */
export function getAccessibleFeatures(userRole: UserRole | null | undefined): PremiumFeatureName[] {
  if (!userRole) return [];
  
  return Object.keys(PREMIUM_FEATURES).filter(featureName =>
    hasFeatureAccess(userRole, featureName as PremiumFeatureName)
  ) as PremiumFeatureName[];
}

/**
 * Get feature upgrade message for users without access
 */
export function getUpgradeMessage(featureName: PremiumFeatureName): string {
  const feature = PREMIUM_FEATURES[featureName];
  const requiredRoles = feature.allowedRoles
    .map(role => role.replace('_', ' '))
    .join(' or ');
  
  return `${feature.displayName} is a premium feature available for ${requiredRoles} accounts. Upgrade your account to access this feature.`;
}
