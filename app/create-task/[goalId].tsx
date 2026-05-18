import { ScrollView, Text, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useStudyPlanner } from '@/lib/study-planner-context';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateTaskScreen() {
  const { goalId } = useLocalSearchParams();
  const router = useRouter();
  const { createTask } = useStudyPlanner();
  const colors = useColors();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const minutes = parseInt(estimatedMinutes) || 30;

    setIsLoading(true);
    try {
      await createTask(
        goalId as string,
        title,
        description,
        dueDate.getTime(),
        difficulty,
        minutes
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const DifficultyButton = ({ value, label }: { value: 'easy' | 'medium' | 'hard'; label: string }) => (
    <TouchableOpacity
      onPress={() => {
        setDifficulty(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: difficulty === value ? '#' + getDifficultyColorHex(value) : colors.border,
        backgroundColor: difficulty === value ? '#' + getDifficultyColorHex(value) + '15' : 'transparent',
        marginHorizontal: 4,
      }}
      activeOpacity={0.7}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: difficulty === value ? '#' + getDifficultyColorHex(value) : colors.muted,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getDifficultyColorHex = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '22C55E';
      case 'medium':
        return 'F59E0B';
      case 'hard':
        return 'EF4444';
      default:
        return '687076';
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: colors.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
            Create Task
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Break down your goal into actionable steps
          </Text>
        </View>

        {/* Task Title */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Task Title *
          </Text>
          <TextInput
            placeholder="e.g., Watch React Hooks tutorial"
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

        {/* Task Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Description
          </Text>
          <TextInput
            placeholder="Add more details about this task"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
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

        {/* Due Date */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Due Date
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
              {dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
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

        {/* Difficulty */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Difficulty
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <DifficultyButton value="easy" label="Easy" />
            <DifficultyButton value="medium" label="Medium" />
            <DifficultyButton value="hard" label="Hard" />
          </View>
        </View>

        {/* Estimated Time */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            Estimated Time (minutes)
          </Text>
          <TextInput
            placeholder="30"
            placeholderTextColor={colors.muted}
            value={estimatedMinutes}
            onChangeText={setEstimatedMinutes}
            keyboardType="number-pad"
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
            onPress={handleCreateTask}
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
              {isLoading ? 'Creating...' : 'Create Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
