import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Task, ProgressMetrics, GoalWithProgress, Priority, Difficulty } from '@/shared/types';

interface StudyPlannerContextType {
  goals: GoalWithProgress[];
  metrics: ProgressMetrics;
  isLoading: boolean;
  
  // Goal operations
  createGoal: (title: string, description: string, targetDate: number, priority: Priority) => Promise<Goal>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  
  // Task operations
  createTask: (goalId: string, title: string, description: string, dueDate: number, difficulty: Difficulty, estimatedMinutes: number) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  
  // Refresh
  refreshData: () => Promise<void>;
}

const StudyPlannerContext = createContext<StudyPlannerContextType | undefined>(undefined);

const STORAGE_KEY = 'study_planner_data';
const METRICS_KEY = 'study_planner_metrics';

export function StudyPlannerProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    totalGoals: 0,
    completedGoals: 0,
    totalTasks: 0,
    completedTasks: 0,
    streak: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage
  const loadData = useCallback(async () => {
    try {
      const storedGoals = await AsyncStorage.getItem(STORAGE_KEY);
      const storedMetrics = await AsyncStorage.getItem(METRICS_KEY);
      
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals) as Goal[];
        const goalsWithProgress = parsedGoals.map(goal => enrichGoalWithProgress(goal));
        setGoals(goalsWithProgress);
      }
      
      if (storedMetrics) {
        setMetrics(JSON.parse(storedMetrics));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save goals to AsyncStorage
  const saveGoals = useCallback(async (goalsToSave: GoalWithProgress[]) => {
    try {
      // Remove progress fields before saving
      const goalsWithoutProgress = goalsToSave.map(({ completedTasksCount, totalTasksCount, progressPercentage, ...goal }) => goal);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goalsWithoutProgress));
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  }, []);

  // Save metrics to AsyncStorage
  const saveMetrics = useCallback(async (metricsToSave: ProgressMetrics) => {
    try {
      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(metricsToSave));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }, []);

  // Enrich goal with progress information
  const enrichGoalWithProgress = (goal: Goal): GoalWithProgress => {
    const completedTasksCount = goal.tasks.filter(t => t.completed).length;
    const totalTasksCount = goal.tasks.length;
    const progressPercentage = totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100);
    
    return {
      ...goal,
      completedTasksCount,
      totalTasksCount,
      progressPercentage,
    };
  };

  // Calculate metrics from goals
  const calculateMetrics = useCallback((goalsData: Goal[]): ProgressMetrics => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    let completedThisWeek = 0;
    let completedThisMonth = 0;
    let lastActivityDate: number | undefined;

    goalsData.forEach(goal => {
      goal.tasks.forEach(task => {
        if (task.completed && task.completedAt) {
          if (task.completedAt >= weekAgo) completedThisWeek++;
          if (task.completedAt >= monthAgo) completedThisMonth++;
          if (!lastActivityDate || task.completedAt > lastActivityDate) {
            lastActivityDate = task.completedAt;
          }
        }
      });
    });

    // Calculate streak
    let streak = 0;
    if (lastActivityDate) {
      const lastActivityDateOnly = new Date(lastActivityDate).setHours(0, 0, 0, 0);
      const todayDateOnly = new Date(now).setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((todayDateOnly - lastActivityDateOnly) / (24 * 60 * 60 * 1000));
      
      if (daysDiff <= 1) {
        // Count consecutive days with activity
        let currentDate = new Date(todayDateOnly);
        streak = 0;
        
        for (let i = 0; i < 365; i++) {
          const dateToCheck = currentDate.getTime();
          const hasActivity = goalsData.some(goal =>
            goal.tasks.some(task => {
              if (!task.completed || !task.completedAt) return false;
              const taskDateOnly = new Date(task.completedAt).setHours(0, 0, 0, 0);
              return taskDateOnly === dateToCheck;
            })
          );
          
          if (hasActivity) {
            streak++;
            currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
          } else {
            break;
          }
        }
      }
    }

    const totalTasks = goalsData.reduce((sum, goal) => sum + goal.tasks.length, 0);
    const completedTasks = goalsData.reduce((sum, goal) => sum + goal.tasks.filter(t => t.completed).length, 0);
    const completedGoals = goalsData.filter(goal => goal.completedAt).length;

    return {
      totalGoals: goalsData.length,
      completedGoals,
      totalTasks,
      completedTasks,
      streak,
      lastActivityDate,
      completedThisWeek,
      completedThisMonth,
    };
  }, []);

  // Create goal
  const createGoal = useCallback(async (title: string, description: string, targetDate: number, priority: Priority): Promise<Goal> => {
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title,
      description,
      targetDate,
      priority,
      createdAt: Date.now(),
      tasks: [],
    };

    const updatedGoals = [...goals, enrichGoalWithProgress(newGoal)];
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);

    const newMetrics = calculateMetrics(updatedGoals.map(({ completedTasksCount, totalTasksCount, progressPercentage, ...goal }) => goal));
    setMetrics(newMetrics);
    await saveMetrics(newMetrics);

    return newGoal;
  }, [goals, saveGoals, saveMetrics, calculateMetrics]);

  // Update goal
  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updated = { ...goal, ...updates };
        return enrichGoalWithProgress(updated);
      }
      return goal;
    });

    setGoals(updatedGoals);
    await saveGoals(updatedGoals);

    const goalsWithoutProgress = updatedGoals.map(({ completedTasksCount, totalTasksCount, progressPercentage, ...goal }) => goal);
    const newMetrics = calculateMetrics(goalsWithoutProgress);
    setMetrics(newMetrics);
    await saveMetrics(newMetrics);
  }, [goals, saveGoals, saveMetrics, calculateMetrics]);

  // Delete goal
  const deleteGoal = useCallback(async (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);

    const goalsWithoutProgress = updatedGoals.map(({ completedTasksCount, totalTasksCount, progressPercentage, ...goal }) => goal);
    const newMetrics = calculateMetrics(goalsWithoutProgress);
    setMetrics(newMetrics);
    await saveMetrics(newMetrics);
  }, [goals, saveGoals, saveMetrics, calculateMetrics]);

  // Complete goal
  const completeGoal = useCallback(async (goalId: string) => {
    await updateGoal(goalId, { completedAt: Date.now() });
  }, [updateGoal]);

  // Create task
  const createTask = useCallback(async (goalId: string, title: string, description: string, dueDate: number, difficulty: Difficulty, estimatedMinutes: number): Promise<Task> => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      goalId,
      title,
      description,
      dueDate,
      difficulty,
      estimatedMinutes,
      completed: false,
      createdAt: Date.now(),
    };

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updated = { ...goal, tasks: [...goal.tasks, newTask] };
        return enrichGoalWithProgress(updated);
      }
      return goal;
    });

    setGoals(updatedGoals);
    await saveGoals(updatedGoals);

    const goalsWithoutProgress = updatedGoals.map(({ completedTasksCount, totalTasksCount, progressPercentage, ...goal }) => goal);
    const newMetrics = calculateMetrics(goalsWithoutProgress);
    setMetrics(newMetrics);
    await saveMetrics(newMetrics);

    return newTask;
  }, [goals, saveGoals, saveMetrics, calculateMetrics]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updatedGoals = goals.map(goal => {
      const updatedTasks = goal.tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        return task;
      });
      return enrichGoalWithProgress({ ...goal, tasks: updatedTasks });
    });

    setGoals(updatedGoals);
    await saveGoals(updatedGoals);

    const goalsWithoutProgress = updatedGoals.map(({ completedTasksCount, totalTasksCount, progressPercentage, ...goal }) => goal);
    const newMetrics = calculateMetrics(goalsWithoutProgress);
    setMetrics(newMetrics);
    await saveMetrics(newMetrics);
  }, [goals, saveGoals, saveMetrics, calculateMetrics]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    const updatedGoals = goals.map(goal => {
      const updatedTasks = goal.tasks.filter(task => task.id !== taskId);
      return enrichGoalWithProgress({ ...goal, tasks: updatedTasks });
    });

    setGoals(updatedGoals);
    await saveGoals(updatedGoals);

    const goalsWithoutProgress = updatedGoals.map(({ completedTasksCount, totalTasksCount, progressPercentage, ...goal }) => goal);
    const newMetrics = calculateMetrics(goalsWithoutProgress);
    setMetrics(newMetrics);
    await saveMetrics(newMetrics);
  }, [goals, saveGoals, saveMetrics, calculateMetrics]);

  // Complete task
  const completeTask = useCallback(async (taskId: string) => {
    await updateTask(taskId, { completed: true, completedAt: Date.now() });
  }, [updateTask]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const value: StudyPlannerContextType = {
    goals,
    metrics,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refreshData,
  };

  return (
    <StudyPlannerContext.Provider value={value}>
      {children}
    </StudyPlannerContext.Provider>
  );
}

export function useStudyPlanner() {
  const context = useContext(StudyPlannerContext);
  if (!context) {
    throw new Error('useStudyPlanner must be used within StudyPlannerProvider');
  }
  return context;
}
