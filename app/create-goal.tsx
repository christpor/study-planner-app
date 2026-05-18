import { ScrollView, Text, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useStudyPlanner } from '@/lib/study-planner-context';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateGoalScreen() {
  const router = useRouter();
  const { createGoal } = useStudyPlanner();
  const colors = useColors();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  const handleCreateGoal = async () => {
    if (!title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    setIsLoading(true);
    try {
      await createGoal(title, description, targetDate.getTime(), priority);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  const PriorityButton = ({ value, label }: { value: 'low' | 'medium' | 'high'; label: string }) => (
    <TouchableOpacity
      onPress={() => {
        setPriority(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: priority === value ? colors.primary : colors.border,
        backgroundColor: priority === value ? colors.primary + '15' : 'transparent',
        marginHorizontal: 4,
      }}
      activeOpacity={0.7}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: priority === value ? colors.primary : colors.muted,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
            Create Goal
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Set a new learning goal and break it into tasks
          </Text>
        </View>

        {/* Goal Title */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Goal Title *
          </Text>
          <TextInput
            placeholder="e.g., Learn React Hooks"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: colors.foreground,
              backgroundColor: colors.surface,
            }}
          />
        </View>

        {/* Goal Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Description
          </Text>
          <TextInput
            placeholder="What do you want to learn?"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: colors.foreground,
              backgroundColor: colors.surface,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Target Date */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Target Completion Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>
              {targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              style={{
                marginTop: 8,
                paddingVertical: 10,
                backgroundColor: colors.primary,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center' }}>
                Done
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Priority */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Priority
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <PriorityButton value="low" label="Low" />
            <PriorityButton value="medium" label="Medium" />
            <PriorityButton value="high" label="High" />
          </View>
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, textAlign: 'center' }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreateGoal}
            disabled={isLoading || !title.trim()}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: isLoading || !title.trim() ? colors.muted : colors.primary,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center' }}>
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
