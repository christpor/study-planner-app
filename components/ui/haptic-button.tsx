import { Pressable, Text, View, ViewProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HapticButtonProps extends ViewProps {
  /**
   * Button label
   */
  label: string;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Is button disabled
   */
  disabled?: boolean;
  /**
   * Haptic feedback type
   */
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  /**
   * On press handler
   */
  onPress?: () => void | Promise<void>;
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

const variantStyles = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-border',
  danger: 'bg-error',
  success: 'bg-success',
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-foreground',
  danger: 'text-white',
  success: 'text-white',
};

const sizeStyles = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

/**
 * Haptic Button Component
 * 
 * Modern button with haptic feedback, scale animations, and accessibility.
 * Provides tactile feedback for all interactions.
 * 
 * Usage:
 * ```tsx
 * <HapticButton
 *   label="Create Goal"
 *   variant="primary"
 *   onPress={handleCreate}
 *   hapticType="success"
 * />
 * ```
 */
export function HapticButton({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  hapticType = 'light',
  onPress,
  isLoading = false,
  className,
  style,
  ...props
}: HapticButtonProps) {
  const colors = useColors();
  const [isPressed, setIsPressed] = useState(false);

  const triggerHaptic = async () => {
    if (disabled || isLoading) return;

    try {
      switch (hapticType) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      // Haptics not available on all platforms
      console.debug('Haptics unavailable:', error);
    }
  };

  const handlePress = async () => {
    if (disabled || isLoading) return;

    await triggerHaptic();
    await onPress?.();
  };

  const opacity = disabled ? 0.5 : 1;
  const scale = isPressed ? 0.97 : 1;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        {
          opacity: pressed || disabled ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      <View
        className={cn(
          'rounded-lg items-center justify-center',
          variantStyles[variant],
          sizeStyles[size],
          disabled && 'opacity-50',
          className
        )}
      >
        <Text
          className={cn(
            'font-semibold',
            textSizeStyles[size],
            variantTextStyles[variant]
          )}
        >
          {isLoading ? 'Loading...' : label}
        </Text>
      </View>
    </Pressable>
  );
}
