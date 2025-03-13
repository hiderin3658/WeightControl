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

// 環境変数が設定されているかチェック
const isRedisAvailable = typeof process !== 'undefined' && 
  process.env.KV_REST_API_URL && 
  process.env.KV_REST_API_TOKEN;

// ユーザー関連の操作
export const userDb = {
  // ユーザーを取得する
  async getUser(userId: string): Promise<User | null> {
    if (isRedisAvailable) {
      return await userOperations.getUser(userId);
    } else {
      console.log('Using mock data for getUser');
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
      console.log('Using mock data for setUser');
      console.log('Saved user:', user);
    }
  },

  // ユーザーを削除する
  async deleteUser(userId: string): Promise<void> {
    if (isRedisAvailable) {
      await userOperations.deleteUser(userId);
    } else {
      console.log('Using mock data for deleteUser');
      console.log('Deleted user:', userId);
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
      console.log('Using mock data for createWeightRecord');
      await mockDb.saveWeightRecord(record);
    }
  },

  // 体重記録を取得する
  async getWeightRecord(userId: string, recordId: string): Promise<WeightRecord | null> {
    if (isRedisAvailable) {
      return await weightOperations.getWeightRecord(userId, recordId);
    } else {
      console.log('Using mock data for getWeightRecord');
      return await mockDb.getWeightRecord(userId, recordId);
    }
  },

  // ユーザーの全記録を取得する
  async getUserWeightRecords(userId: string): Promise<WeightRecord[]> {
    if (isRedisAvailable) {
      return await weightOperations.getUserWeightRecords(userId);
    } else {
      console.log('Using mock data for getUserWeightRecords');
      return await mockDb.getWeightRecords(userId);
    }
  },

  // 体重記録を更新する
  async updateWeightRecord(record: WeightRecord): Promise<void> {
    if (isRedisAvailable) {
      await weightOperations.updateWeightRecord(record);
    } else {
      console.log('Using mock data for updateWeightRecord');
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
      console.log('Using mock data for deleteWeightRecord');
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
      console.log('Using mock data for createGoal');
      await mockDb.saveGoal(goal);
    }
  },

  // 目標を取得する
  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    if (isRedisAvailable) {
      return await goalOperations.getGoal(userId, goalId);
    } else {
      console.log('Using mock data for getGoal');
      return await mockDb.getGoal(userId, goalId);
    }
  },

  // ユーザーの全目標を取得する
  async getUserGoals(userId: string): Promise<Goal[]> {
    if (isRedisAvailable) {
      return await goalOperations.getUserGoals(userId);
    } else {
      console.log('Using mock data for getUserGoals');
      return await mockDb.getGoals(userId);
    }
  },

  // 目標を更新する
  async updateGoal(goal: Goal): Promise<void> {
    if (isRedisAvailable) {
      await goalOperations.updateGoal(goal);
    } else {
      console.log('Using mock data for updateGoal');
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
      console.log('Using mock data for deleteGoal');
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
      console.log('Using mock data for getUserSettings');
      return await mockDb.getSettings(userId);
    }
  },

  // 設定を作成/更新する
  async setUserSettings(settings: UserSettings): Promise<void> {
    if (isRedisAvailable) {
      await settingsOperations.setUserSettings(settings);
    } else {
      console.log('Using mock data for setUserSettings');
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };
      await mockDb.saveSettings(updatedSettings);
    }
  },

  // デフォルト設定を作成する
  createDefaultSettings(userId: string): UserSettings {
    return settingsOperations.createDefaultSettings(userId);
  }
};
