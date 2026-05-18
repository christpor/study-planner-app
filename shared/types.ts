// Goal and Task types for the Study Planner App

export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: number; // timestamp
  priority: Priority;
  createdAt: number; // timestamp
  completedAt?: number; // timestamp
  tasks: Task[];
}

export interface Task {
  id: string;
  goalId: string;
  title: string;
  description: string;
  dueDate: number; // timestamp
  difficulty: Difficulty;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: number; // timestamp
  createdAt: number; // timestamp
}

export interface ProgressMetrics {
  totalGoals: number;
  completedGoals: number;
  totalTasks: number;
  completedTasks: number;
  streak: number; // consecutive days with completed tasks
  lastActivityDate?: number; // timestamp
  completedThisWeek: number;
  completedThisMonth: number;
}

export interface GoalWithProgress extends Goal {
  completedTasksCount: number;
  totalTasksCount: number;
  progressPercentage: number;
}
