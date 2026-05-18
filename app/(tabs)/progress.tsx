import { ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useStudyPlanner } from '@/lib/study-planner-context';
import { useColors } from '@/hooks/use-colors';

export default function ProgressScreen() {
  const { metrics, goals } = useStudyPlanner();
  const colors = useColors();

  const completionRate = metrics.totalTasks === 0 ? 0 : Math.round((metrics.completedTasks / metrics.totalTasks) * 100);
  const goalCompletionRate = metrics.totalGoals === 0 ? 0 : Math.round((metrics.completedGoals / metrics.totalGoals) * 100);

  const StatCard = ({ label, value, unit, color }: { label: string; value: number | string; unit?: string; color?: string }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: color || colors.primary,
      }}
    >
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: colors.foreground }}>
          {value}
        </Text>
        {unit && <Text style={{ fontSize: 14, color: colors.muted }}>{unit}</Text>}
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground }}>
            Progress
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            Track your learning journey
          </Text>
        </View>

        {/* Overall Completion Circle */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.primary + '15',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 3,
              borderColor: colors.primary,
            }}
          >
            <Text style={{ fontSize: 48, fontWeight: '700', color: colors.primary }}>
              {completionRate}%
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
            Overall Task Completion Rate
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Key Metrics
          </Text>

          <StatCard label="Goals Created" value={metrics.totalGoals} color={colors.primary} />
          <StatCard label="Goals Completed" value={metrics.completedGoals} color={colors.success} />
          <StatCard label="Total Tasks" value={metrics.totalTasks} color={colors.primary} />
          <StatCard label="Tasks Completed" value={metrics.completedTasks} color={colors.success} />
        </View>

        {/* Time Period Stats */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Recent Activity
          </Text>

          <StatCard label="Completed This Week" value={metrics.completedThisWeek} unit="tasks" color={colors.primary} />
          <StatCard label="Completed This Month" value={metrics.completedThisMonth} unit="tasks" color={colors.primary} />
        </View>

        {/* Streak */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
            Consistency
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#F59E0B',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 48, fontWeight: '700', color: '#F59E0B', marginBottom: 8 }}>
              🔥 {metrics.streak}
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
              {metrics.streak === 0
                ? 'Start completing tasks to build your streak!'
                : metrics.streak === 1
                  ? 'Day streak - Keep it up!'
                  : `Day streak - Amazing consistency!`}
            </Text>
          </View>
        </View>

        {/* Goal Breakdown */}
        {metrics.totalGoals > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
              Goal Status
            </Text>

            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16 }}>
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Completed</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                    {metrics.completedGoals} / {metrics.totalGoals}
                  </Text>
                </View>
                <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${goalCompletionRate}%`,
                      backgroundColor: colors.success,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
                {goalCompletionRate}% of goals completed
              </Text>
            </View>
          </View>
        )}

        {/* Empty State */}
        {metrics.totalGoals === 0 && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
              No Data Yet
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
              Create your first goal and start tracking your progress
            </Text>
          </View>
        )}

        {/* Tips */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            💡 Tips for Success
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
            • Break large goals into smaller, manageable tasks{'\n'}
            • Set realistic deadlines for each task{'\n'}
            • Complete tasks consistently to build your streak{'\n'}
            • Review your progress regularly to stay motivated
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
