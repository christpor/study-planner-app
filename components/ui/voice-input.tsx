import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { AdaptiveCard } from './adaptive-card';

interface VoiceInputProps {
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Callback when speech is recognized
   */
  onSpeechRecognized?: (text: string) => void;
  /**
   * Callback when recording starts
   */
  onRecordingStart?: () => void;
  /**
   * Callback when recording ends
   */
  onRecordingEnd?: () => void;
  /**
   * Language code (default: 'en-US')
   */
  language?: string;
}

/**
 * Voice Input Component
 * 
 * Captures voice input and converts to text using device speech recognition.
 * Provides haptic feedback during recording.
 * 
 * Note: This is a placeholder that demonstrates the voice input pattern.
 * Full implementation requires native speech-to-text integration.
 * 
 * Usage:
 * ```tsx
 * <VoiceInput
 *   placeholder="Say your goal"
 *   onSpeechRecognized={(text) => console.log(text)}
 * />
 * ```
 */
export function VoiceInput({
  placeholder = 'Tap to speak',
  onSpeechRecognized,
  onRecordingStart,
  onRecordingEnd,
  language = 'en-US',
}: VoiceInputProps) {
  const colors = useColors();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = async () => {
    try {
      setError(null);
      setIsListening(true);
      onRecordingStart?.();

      // Haptic feedback for recording start
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Placeholder: In production, integrate with native speech-to-text
      // For now, we'll simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate recognized text
      const simulatedText = 'Learn React Hooks in 30 days';
      setRecognizedText(simulatedText);
      onSpeechRecognized?.(simulatedText);

      // Haptic feedback for success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice input failed';
      setError(errorMessage);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsListening(false);
      onRecordingEnd?.();
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    onRecordingEnd?.();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearText = () => {
    setRecognizedText('');
    setError(null);
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Recording Button */}
      <Pressable
        onPress={isListening ? stopListening : startListening}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <AdaptiveCard
          glass
          padding="lg"
          rounded="lg"
          style={{
            backgroundColor: isListening
              ? colors.primary + '20'
              : colors.surface + '80',
            borderWidth: 2,
            borderColor: isListening ? colors.primary : colors.border,
          }}
        >
          <View style={{ alignItems: 'center', gap: 8 }}>
            {isListening ? (
              <>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  Listening...
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 32 }}>🎤</Text>
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  {placeholder}
                </Text>
              </>
            )}
          </View>
        </AdaptiveCard>
      </Pressable>

      {/* Recognized Text Display */}
      {recognizedText && (
        <AdaptiveCard glass padding="md" rounded="lg">
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                textTransform: 'uppercase',
                fontWeight: '600',
              }}
            >
              Recognized
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.foreground,
                lineHeight: 24,
              }}
            >
              {recognizedText}
            </Text>
            <Pressable
              onPress={clearText}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.primary,
                  fontWeight: '600',
                  marginTop: 8,
                }}
              >
                Clear
              </Text>
            </Pressable>
          </View>
        </AdaptiveCard>
      )}

      {/* Error Display */}
      {error && (
        <AdaptiveCard
          glass
          padding="md"
          rounded="lg"
          style={{
            backgroundColor: colors.error + '20',
            borderLeftWidth: 3,
            borderLeftColor: colors.error,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.error }}>
            {error}
          </Text>
        </AdaptiveCard>
      )}
    </View>
  );
}
