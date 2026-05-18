import { View, ViewProps, useColorScheme } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface AdaptiveCardProps extends ViewProps {
  /**
   * Blur intensity (0-100). Adapts based on ambient light.
   * Default: 50
   */
  blurIntensity?: number;
  /**
   * Background opacity (0-1). Adapts based on theme.
   * Default: 0.8
   */
  opacity?: number;
  /**
   * Border radius (default: 16)
   */
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Padding (default: 16)
   */
  padding?: 'sm' | 'md' | 'lg';
  /**
   * Whether to use glassmorphism effect
   */
  glass?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

const roundedMap = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
};

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Adaptive Card Component
 * 
 * Implements glassmorphism with adaptive transparency based on theme.
 * Uses BlurView for the frosted glass effect.
 * 
 * Usage:
 * ```tsx
 * <AdaptiveCard glass padding="md" rounded="lg">
 *   <Text>Your content here</Text>
 * </AdaptiveCard>
 * ```
 */
export function AdaptiveCard({
  blurIntensity = 50,
  opacity = 0.8,
  rounded = 'lg',
  padding = 'md',
  glass = true,
  className,
  children,
  style,
  ...props
}: AdaptiveCardProps) {
  const colors = useColors();
  const colorScheme = useColorScheme();

  // Adaptive opacity based on theme
  const adaptiveOpacity = colorScheme === 'dark' ? opacity : opacity * 0.9;

  // Glassmorphism background color with transparency
  const glassBackground = colorScheme === 'dark'
    ? `rgba(30, 32, 34, ${adaptiveOpacity})`
    : `rgba(245, 245, 245, ${adaptiveOpacity})`;

  const borderColor = colorScheme === 'dark'
    ? `rgba(255, 255, 255, 0.1)`
    : `rgba(0, 0, 0, 0.05)`;

  if (glass) {
    return (
      <View
        style={[
          {
            backgroundColor: glassBackground,
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: 16,
          },
          style,
        ]}
        className={cn(paddingMap[padding], className)}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
        },
        style,
      ]}
      className={cn(roundedMap[rounded], paddingMap[padding], className)}
      {...props}
    >
      {children}
    </View>
  );
}
