export const PROPERTY_HIGHLIGHTS = {
  NEAR_MAIN_ROAD: { label: 'Near Main Road', icon: '🚗', category: 'Property & Area Highlights' },
  NEAR_BEACH: { label: 'Near Beach', icon: '🏖️', category: 'Property & Area Highlights' },
  NEAR_PARK: { label: 'Near Park', icon: '🌳', category: 'Property & Area Highlights' },
  NEAR_INTERNATIONAL_SCHOOL: { label: 'Near International School', icon: '🎓', category: 'Property & Area Highlights' },
  QUIET_AREA: { label: 'Quiet Area', icon: '🤫', category: 'Property & Area Highlights' },
  NEAR_HOSPITAL: { label: 'Near Hospital', icon: '🏥', category: 'Property & Area Highlights' },
  NEAR_CONVENIENCE_STORE: { label: 'Near Convenience Store', icon: '🏪', category: 'Property & Area Highlights' },
  CORNER_UNIT: { label: 'Corner Unit', icon: '📐', category: 'Property & Area Highlights' },
  JUST_RENOVATED: { label: 'Just Renovated', icon: '✨', category: 'Property & Area Highlights' },
} as const;

export type HighlightKey = keyof typeof PROPERTY_HIGHLIGHTS;

export const HIGHLIGHT_CATEGORIES = [
  'Property & Area Highlights',
] as const;

export function getHighlightsByCategory(category: string) {
  return Object.entries(PROPERTY_HIGHLIGHTS)
    .filter(([_, value]) => value.category === category)
    .map(([key, value]) => ({ key, ...value }));
}
