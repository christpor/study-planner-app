import { ScrollView, Text, View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useStudyPlanner } from '@/lib/study-planner-context';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

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

export default function HomeScreen() {
  const router = useRouter();
  const { goals, isLoading, refreshData } = useStudyPlanner();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCreateGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/create-goal');
  };

  const handleGoalPress = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/goal-detail/${goalId}`);
  };

  const renderGoalCard = ({ item: goal }: { item: typeof goals[0] }) => (
    <TouchableOpacity
      onPress={() => handleGoalPress(goal.id)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getPriorityColor(goal.priority),
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
            {goal.title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {goal.totalTasksCount} tasks • {goal.completedTasksCount} completed
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getPriorityColor(goal.priority),
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: '#fff', fontWeight: '500', textTransform: 'capitalize' }}>
            {goal.priority}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: `${goal.progressPercentage}%`,
            backgroundColor: colors.primary,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Progress Text */}
      <Text style={{ fontSize: 12, color: colors.muted }}>
        {goal.progressPercentage}% complete • Due {new Date(goal.targetDate).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const emptyComponent = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
        No Goals Yet
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 20 }}>
        Create your first learning goal to get started
      </Text>
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground }}>
          Study Planner
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
          {goals.length} goal{goals.length !== 1 ? 's' : ''} • {goals.reduce((sum, g) => sum + g.completedTasksCount, 0)} tasks completed
        </Text>
      </View>

      {/* Goals List */}
      <FlatList
        data={goals}
        renderItem={renderGoalCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateGoal}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 28, color: '#fff', fontWeight: '300' }}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
