import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useStudyPlanner } from '@/lib/study-planner-context';
import { useColors } from '@/hooks/use-colors';
import { useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '#22C55E';
    case 'medium':
      return '#F59E0B';
    case 'hard':
      return '#EF4444';
    default:
      return '#687076';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#22C55E';
    default:
      return '#687076';
  }
};

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { goals, completeTask, deleteTask, completeGoal } = useStudyPlanner();
  const colors = useColors();
  const [isCompleting, setIsCompleting] = useState(false);

  const goal = useMemo(() => goals.find(g => g.id === id), [goals, id]);

  if (!goal) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text style={{ fontSize: 16, color: colors.foreground }}>Goal not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const completedTasks = goal.tasks.filter(t => t.completed);
  const pendingTasks = goal.tasks.filter(t => !t.completed);

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await deleteTask(taskId);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        style: 'destructive',
      },
    ]);
  };

  const handleCompleteGoal = async () => {
    if (goal.completedAt) {
      alert('This goal is already completed');
      return;
    }

    if (pendingTasks.length > 0) {
      Alert.alert(
        'Complete Goal?',
        `You still have ${pendingTasks.length} pending task(s). Mark this goal as complete anyway?`,
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          {
            text: 'Complete',
            onPress: async () => {
              try {
                setIsCompleting(true);
                await completeGoal(goal.id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimeout(() => router.back(), 500);
              } catch (error) {
                console.error('Error completing goal:', error);
                alert('Failed to complete goal. Please try again.');
              } finally {
                setIsCompleting(false);
              }
            },
          },
        ]
      );
    } else {
      try {
        setIsCompleting(true);
        await completeGoal(goal.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => router.back(), 500);
      } catch (error) {
        console.error('Error completing goal:', error);
        alert('Failed to complete goal. Please try again.');
      } finally {
        setIsCompleting(false);
      }
    }
  };

  const renderTaskItem = ({ item: task }: { item: typeof goal.tasks[0] }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: getDifficultyColor(task.difficulty),
        opacity: task.completed ? 0.6 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <TouchableOpacity
          onPress={() => handleCompleteTask(task.id)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: task.completed ? colors.primary : colors.border,
            backgroundColor: task.completed ? colors.primary : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 2,
          }}
        >
          {task.completed && <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Text>}
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.foreground,
              textDecorationLine: task.completed ? 'line-through' : 'none',
              marginBottom: 4,
            }}
          >
            {task.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: getDifficultyColor(task.difficulty),
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text style={{ fontSize: 10, color: '#fff', fontWeight: '500', textTransform: 'capitalize' }}>
                {task.difficulty}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.muted }}>
              {task.estimatedMinutes} min
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteTask(task.id)}
          style={{ padding: 4 }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 16, color: colors.error }}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Build flat list data
  const listData = [
    { id: 'header', type: 'header' },
    { id: 'progress', type: 'progress' },
  ];

  if (pendingTasks.length > 0) {
    listData.push({ id: 'pending-header', type: 'pending-header' } as any);
    pendingTasks.forEach(task => {
      listData.push({ id: task.id, type: 'task', task } as any);
    });
  }

  if (completedTasks.length > 0) {
    listData.push({ id: 'completed-header', type: 'completed-header' } as any);
    completedTasks.forEach(task => {
      listData.push({ id: `completed-${task.id}`, type: 'task', task } as any);
    });
  }

  if (goal.tasks.length === 0) {
    listData.push({ id: 'empty', type: 'empty' });
  }

  const renderItem = ({ item }: any) => {
    if (item.type === 'header') {
      return (
        <View style={{ paddingHorizontal: 16, marginBottom: 20, marginTop: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: colors.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
            {goal.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                backgroundColor: getPriorityColor(goal.priority),
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600', textTransform: 'capitalize' }}>
                {goal.priority} Priority
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Due {new Date(goal.targetDate).toLocaleDateString()}
            </Text>
          </View>
          {goal.description && (
            <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
              {goal.description}
            </Text>
          )}
        </View>
      );
    }

    if (item.type === 'progress') {
      return (
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24, marginHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
              Progress
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>
              {goal.progressPercentage}%
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, marginBottom: 12, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${goal.progressPercentage}%`,
                backgroundColor: colors.primary,
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 12 }}>
            {goal.completedTasksCount} of {goal.totalTasksCount} tasks completed
          </Text>
          <TouchableOpacity
            onPress={handleCompleteGoal}
            disabled={goal.completedAt !== undefined || isCompleting}
            style={{
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: goal.completedAt ? colors.success : colors.primary,
              opacity: isCompleting ? 0.7 : 1,
            }}
            activeOpacity={0.8}
          >
            {isCompleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff', textAlign: 'center' }}>
                {goal.completedAt ? '✓ Goal Completed' : 'Mark Goal Complete'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'pending-header') {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginHorizontal: 16, marginTop: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
            Pending Tasks ({pendingTasks.length})
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/create-task/${goal.id}`)}
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'completed-header') {
      return (
        <View style={{ marginBottom: 12, marginHorizontal: 16, marginTop: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
            Completed Tasks ({completedTasks.length})
          </Text>
        </View>
      );
    }

    if (item.type === 'task') {
      return (
        <View style={{ paddingHorizontal: 16, marginBottom: 0 }}>
          {renderTaskItem({ item: item.task })}
        </View>
      );
    }

    if (item.type === 'empty') {
      return (
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24, marginHorizontal: 16, marginTop: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            No Tasks Yet
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginBottom: 16 }}>
            Break down this goal into smaller tasks to track your progress
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/create-task/${goal.id}`)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: colors.primary,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Add First Task</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </ScreenContainer>
  );
}
