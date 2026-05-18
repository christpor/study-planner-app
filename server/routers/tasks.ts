import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { tasks, goals } from "../db";
import { eq, and, desc } from "drizzle-orm";

export const tasksRouter = router({
  /**
   * Get all tasks for a goal
   */
  listByGoal: protectedProcedure
    .input(z.object({ goalId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      // Verify goal ownership
      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, input.goalId), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Goal not found or unauthorized");
      }

      const goalTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.goalId, input.goalId))
        .orderBy(desc(tasks.dueDate));

      return goalTasks;
    }),

  /**
   * Create a new task
   */
  create: protectedProcedure
    .input(
      z.object({
        goalId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        dueDate: z.number(),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        estimatedMinutes: z.number().default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      // Verify goal ownership
      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, input.goalId), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Goal not found or unauthorized");
      }

      const result = await db.insert(tasks).values({
        goalId: input.goalId,
        title: input.title,
        description: input.description,
        dueDate: new Date(input.dueDate),
        difficulty: input.difficulty,
        estimatedMinutes: input.estimatedMinutes,
      });

      return {
        id: (result as any).insertId || 0,
        ...input,
      };
    }),

  /**
   * Update a task
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        dueDate: z.number().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        estimatedMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;

      // Get task and verify goal ownership
      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .then((rows) => rows[0]);

      if (!task) {
        throw new Error("Task not found");
      }

      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, task.goalId), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Unauthorized");
      }

      const updateValues: any = {};
      if (updateData.title) updateValues.title = updateData.title;
      if (updateData.description) updateValues.description = updateData.description;
      if (updateData.dueDate) updateValues.dueDate = new Date(updateData.dueDate);
      if (updateData.difficulty) updateValues.difficulty = updateData.difficulty;
      if (updateData.estimatedMinutes)
        updateValues.estimatedMinutes = updateData.estimatedMinutes;

      await db.update(tasks).set(updateValues).where(eq(tasks.id, id));

      return { success: true };
    }),

  /**
   * Mark a task as complete
   */
  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      // Get task and verify goal ownership
      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .then((rows) => rows[0]);

      if (!task) {
        throw new Error("Task not found");
      }

      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, task.goalId), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Unauthorized");
      }

      await db
        .update(tasks)
        .set({ completedAt: new Date() })
        .where(eq(tasks.id, input.id));

      return { success: true };
    }),

  /**
   * Mark a task as incomplete
   */
  uncomplete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .then((rows) => rows[0]);

      if (!task) {
        throw new Error("Task not found");
      }

      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, task.goalId), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Unauthorized");
      }

      await db
        .update(tasks)
        .set({ completedAt: null })
        .where(eq(tasks.id, input.id));

      return { success: true };
    }),

  /**
   * Delete a task
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .then((rows) => rows[0]);

      if (!task) {
        throw new Error("Task not found");
      }

      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, task.goalId), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Unauthorized");
      }

      await db.delete(tasks).where(eq(tasks.id, input.id));

      return { success: true };
    }),
});
