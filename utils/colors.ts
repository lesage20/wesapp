// Color mapping from Tailwind CSS classes to hex values
// This allows us to use Tailwind color names while still being able to pass hex values to native components

export const tailwindColors = {
  // Gray
  'gray-50': '#F9FAFB',
  'gray-100': '#F3F4F6',
  'gray-200': '#E5E7EB',
  'gray-300': '#D1D5DB',
  'gray-400': '#9CA3AF',
  'gray-500': '#6B7280',
  'gray-600': '#4B5563',
  'gray-700': '#374151',
  'gray-800': '#1F2937',
  'gray-900': '#111827',
  
  // Red
  'red-50': '#FEF2F2',
  'red-100': '#FEE2E2',
  'red-200': '#FECACA',
  'red-300': '#FCA5A5',
  'red-400': '#F87171',
  'red-500': '#EF4444',
  'red-600': '#DC2626',
  'red-700': '#B91C1C',
  'red-800': '#991B1B',
  'red-900': '#7F1D1D',
  
  // Blue
  'blue-50': '#EFF6FF',
  'blue-100': '#DBEAFE',
  'blue-200': '#BFDBFE',  
  'blue-300': '#93C5FD',
  'blue-400': '#60A5FA',
  'blue-500': '#3B82F6',
  'blue-600': '#2563EB',
  'blue-700': '#1D4ED8',
  'blue-800': '#1E40AF',
  'blue-900': '#1E3A8A',
  
  // Green
  'green-50': '#F0FDF4',
  'green-100': '#DCFCE7',
  'green-200': '#BBF7D0',
  'green-300': '#86EFAC',
  'green-400': '#4ADE80',
  'green-500': '#22C55E',
  'green-600': '#16A34A',
  'green-700': '#15803D',
  'green-800': '#166534',
  'green-900': '#14532D',
  
  // Teal
  'teal-50': '#F0FDFA',
  'teal-100': '#CCFBF1',
  'teal-200': '#99F6E4',
  'teal-300': '#5EEAD4',
  'teal-400': '#2DD4BF',
  'teal-500': '#14B8A6',
  'teal-600': '#0D9488',
  'teal-700': '#0F766E',
  'teal-800': '#115E59',
  'teal-900': '#134E4A',
  
  // Purple
  'purple-50': '#FAF5FF',
  'purple-100': '#F3E8FF',
  'purple-200': '#E9D5FF',
  'purple-300': '#D8B4FE',
  'purple-400': '#C084FC',
  'purple-500': '#A855F7',
  'purple-600': '#9333EA',
  'purple-700': '#7C3AED',
  'purple-800': '#6B21A8',
  'purple-900': '#581C87',
  
  // Pink
  'pink-50': '#FDF2F8',
  'pink-100': '#FCE7F3',
  'pink-200': '#FBCFE8',
  'pink-300': '#F9A8D4',
  'pink-400': '#F472B6',
  'pink-500': '#EC4899',
  'pink-600': '#DB2777',
  'pink-700': '#BE185D',
  'pink-800': '#9D174D',
  'pink-900': '#831843',
  
  // Indigo
  'indigo-50': '#EEF2FF',
  'indigo-100': '#E0E7FF',
  'indigo-200': '#C7D2FE',
  'indigo-300': '#A5B4FC',
  'indigo-400': '#818CF8',
  'indigo-500': '#6366F1',
  'indigo-600': '#4F46E5',
  'indigo-700': '#4338CA',
  'indigo-800': '#3730A3',
  'indigo-900': '#312E81',
  
  // Orange
  'orange-50': '#FFF7ED',
  'orange-100': '#FFEDD5',
  'orange-200': '#FED7AA',
  'orange-300': '#FDBA74',
  'orange-400': '#FB923C',
  'orange-500': '#F97316',
  'orange-600': '#EA580C',
  'orange-700': '#C2410C',
  'orange-800': '#9A3412',
  'orange-900': '#7C2D12',
  
  // Yellow
  'yellow-50': '#FEFCE8',
  'yellow-100': '#FEF3C7',
  'yellow-200': '#FDE68A',
  'yellow-300': '#FCD34D',
  'yellow-400': '#FBBF24',
  'yellow-500': '#F59E0B',
  'yellow-600': '#D97706',
  'yellow-700': '#B45309',
  'yellow-800': '#92400E',
  'yellow-900': '#78350F',
} as const;

export type TailwindColorName = keyof typeof tailwindColors;

// Helper function to get hex color from Tailwind color name
export const getTailwindColor = (colorName: TailwindColorName): string => {
  return tailwindColors[colorName] || colorName;
};

// Helper function to check if a string is a valid Tailwind color name
export const isTailwindColor = (color: string): color is TailwindColorName => {
  return color in tailwindColors;
};

// Default color palette for the app
export const appColors = {
  primary: 'teal-500',
  secondary: 'blue-500', 
  accent: 'purple-500',
  success: 'green-500',
  warning: 'orange-500',
  error: 'red-500',
  neutral: 'gray-500',
} as const;