import redis from './redis';
import { mockDb } from './mock-db';
import {
  User,
  WeightRecord,
  Goal,
  UserSettings,
  userOperations,
  weightOperations,
  goalOperations,
  settingsOperations
} from './db';

// 環境変数が設定されているかチェック（サーバーサイドとクライアントサイドの両方に対応）
const isRedisAvailable = typeof process !== 'undefined' && 
  (process.env.KV_REST_API_URL || process.env.NEXT_PUBLIC_KV_REST_API_URL) && 
  (process.env.KV_REST_API_TOKEN || process.env.NEXT_PUBLIC_KV_REST_API_TOKEN);

// ユーザー関連の操作
export const userDb = {
  // ユーザーを取得する
  async getUser(userId: string): Promise<User | null> {
    if (isRedisAvailable) {
      return await userOperations.getUser(userId);
    } else {
      // モックデータには現在ユーザーが実装されていないため、簡易的なユーザーを返す
      if (userId === 'user1') {
        return {
          id: 'user1',
          email: 'user@example.com',
          name: 'テストユーザー',
          createdAt: new Date().toISOString()
        };
      }
      return null;
    }
  },

  // ユーザーを作成/更新する
  async setUser(user: User): Promise<void> {
    if (isRedisAvailable) {
      await userOperations.setUser(user);
    } else {
      // モックデータには保存しない
    }
  },

  // ユーザーを削除する
  async deleteUser(userId: string): Promise<void> {
    if (isRedisAvailable) {
      await userOperations.deleteUser(userId);
    } else {
      // モックデータには実装しない
    }
  }
};

// 体重記録の操作
export const weightDb = {
  // 体重記録を作成する
  async createWeightRecord(record: WeightRecord): Promise<void> {
    if (isRedisAvailable) {
      await weightOperations.createWeightRecord(record);
    } else {
      await mockDb.saveWeightRecord(record);
    }
  },

  // 体重記録を取得する
  async getWeightRecord(userId: string, recordId: string): Promise<WeightRecord | null> {
    if (isRedisAvailable) {
      return await weightOperations.getWeightRecord(userId, recordId);
    } else {
      return await mockDb.getWeightRecord(userId, recordId);
    }
  },

  // ユーザーの全記録を取得する
  async getUserWeightRecords(userId: string): Promise<WeightRecord[]> {
    if (isRedisAvailable) {
      return await weightOperations.getUserWeightRecords(userId);
    } else {
      return await mockDb.getWeightRecords(userId);
    }
  },

  // 体重記録を更新する
  async updateWeightRecord(record: WeightRecord): Promise<void> {
    if (isRedisAvailable) {
      await weightOperations.updateWeightRecord(record);
    } else {
      const updatedRecord = {
        ...record,
        updatedAt: new Date().toISOString()
      };
      await mockDb.saveWeightRecord(updatedRecord);
    }
  },

  // 体重記録を削除する
  async deleteWeightRecord(userId: string, recordId: string): Promise<void> {
    if (isRedisAvailable) {
      await weightOperations.deleteWeightRecord(userId, recordId);
    } else {
      await mockDb.deleteWeightRecord(userId, recordId);
    }
  }
};

// 目標設定の操作
export const goalDb = {
  // 目標を作成する
  async createGoal(goal: Goal): Promise<void> {
    if (isRedisAvailable) {
      await goalOperations.createGoal(goal);
    } else {
      await mockDb.saveGoal(goal);
    }
  },

  // 目標を取得する
  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    if (isRedisAvailable) {
      return await goalOperations.getGoal(userId, goalId);
    } else {
      return await mockDb.getGoal(userId, goalId);
    }
  },

  // ユーザーの全目標を取得する
  async getUserGoals(userId: string): Promise<Goal[]> {
    if (isRedisAvailable) {
      return await goalOperations.getUserGoals(userId);
    } else {
      return await mockDb.getGoals(userId);
    }
  },

  // 目標を更新する
  async updateGoal(goal: Goal): Promise<void> {
    if (isRedisAvailable) {
      await goalOperations.updateGoal(goal);
    } else {
      const updatedGoal = {
        ...goal,
        updatedAt: new Date().toISOString()
      };
      await mockDb.saveGoal(updatedGoal);
    }
  },

  // 目標を削除する
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (isRedisAvailable) {
      await goalOperations.deleteGoal(userId, goalId);
    } else {
      await mockDb.deleteGoal(userId, goalId);
    }
  }
};

// ユーザー設定の操作
export const settingsDb = {
  // 設定を取得する
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    if (isRedisAvailable) {
      return await settingsOperations.getUserSettings(userId);
    } else {
      return await mockDb.getSettings(userId);
    }
  },

  // 設定を作成/更新する
  async setUserSettings(settings: UserSettings): Promise<void> {
    if (isRedisAvailable) {
      await settingsOperations.setUserSettings(settings);
    } else {
      await mockDb.saveSettings(settings);
    }
  },

  // デフォルト設定を作成する
  createDefaultSettings(userId: string): UserSettings {
    return settingsOperations.createDefaultSettings(userId);
  }
};
