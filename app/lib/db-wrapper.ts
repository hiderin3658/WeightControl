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

// デバッグ用：Redisの利用可否を確認
console.error(`[DB-WRAPPER] Redis利用可否: ${isRedisAvailable ? '利用可能' : '利用不可'}`);
console.error(`[DB-WRAPPER] 環境変数チェック:`, {
  process_defined: typeof process !== 'undefined',
  KV_REST_API_URL: !!process.env.KV_REST_API_URL,
  NEXT_PUBLIC_KV_REST_API_URL: !!process.env.NEXT_PUBLIC_KV_REST_API_URL,
  KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
  NEXT_PUBLIC_KV_REST_API_TOKEN: !!process.env.NEXT_PUBLIC_KV_REST_API_TOKEN
});

// 詳細な接続情報
console.error(`[DB-WRAPPER] Redis接続情報:`, {
  URL: process.env.KV_REST_API_URL || process.env.NEXT_PUBLIC_KV_REST_API_URL,
  TOKEN_EXISTS: !!(process.env.KV_REST_API_TOKEN || process.env.NEXT_PUBLIC_KV_REST_API_TOKEN)
});

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
    try {
      console.error(`[DB] 体重記録の保存を試みます: ${record.id}`);
      if (isRedisAvailable) {
        const key = weightOperations.generateWeightKey(record.userId, record.id);
        console.error(`[DB-DETAIL] 体重記録保存キー: ${key}`);
        await weightOperations.createWeightRecord(record);
        console.error(`[DB] 体重記録の保存に成功しました: ${record.id}`);
      } else {
        console.error(`[MockDB] モック体重記録の保存を試みます: ${record.id}`);
        await mockDb.saveWeightRecord(record);
        console.error(`[MockDB] モック体重記録の保存に成功しました: ${record.id}`);
      }
    } catch (error) {
      console.error(`[DB] 体重記録の保存に失敗しました: ${record.id}`, error);
      throw error;
    }
  },

  // 体重記録を取得する
  async getWeightRecord(userId: string, recordId: string): Promise<WeightRecord | null> {
    try {
      console.error(`[DB] 体重記録の取得を試みます: ${userId}/${recordId}`);
      let record;
      if (isRedisAvailable) {
        const key = weightOperations.generateWeightKey(userId, recordId);
        console.error(`[DB-DETAIL] 体重記録取得キー: ${key}`);
        record = await weightOperations.getWeightRecord(userId, recordId);
      } else {
        console.error(`[MockDB] モック体重記録の取得を試みます: ${userId}/${recordId}`);
        record = await mockDb.getWeightRecord(userId, recordId);
      }
      console.error(`[DB] 体重記録の取得結果: ${record ? '成功' : '記録なし'}`);
      return record;
    } catch (error) {
      console.error(`[DB] 体重記録の取得に失敗しました: ${userId}/${recordId}`, error);
      return null;
    }
  },

  // ユーザーの全記録を取得する
  async getUserWeightRecords(userId: string): Promise<WeightRecord[]> {
    try {
      console.error(`[DB] ユーザーの全体重記録の取得を試みます: ${userId}`);
      let records;
      if (isRedisAvailable) {
        const pattern = weightOperations.generateWeightPattern(userId);
        console.error(`[DB-DETAIL] 体重記録検索パターン: ${pattern}`);
        
        // キーの一覧を取得してログに出力
        const keys = await redis.keys(pattern);
        console.error(`[DB-DETAIL] 一致した体重記録キー: ${keys.length}件`, keys);
        
        records = await weightOperations.getUserWeightRecords(userId);
        
        // 取得したデータのIDリストをログに出力
        if (records.length > 0) {
          console.error(`[DB-DETAIL] 取得した体重記録のID: ${records.map(r => r.id).join(', ')}`);
        }
      } else {
        console.error(`[MockDB] モックユーザーの全体重記録の取得を試みます: ${userId}`);
        records = await mockDb.getWeightRecords(userId);
      }
      console.error(`[DB] ユーザーの全体重記録の取得結果: ${records.length}件`);
      return records;
    } catch (error) {
      console.error(`[DB] ユーザーの全体重記録の取得に失敗しました: ${userId}`, error);
      return [];
    }
  },

  // 体重記録を更新する
  async updateWeightRecord(record: WeightRecord): Promise<void> {
    try {
      console.error(`[DB] 体重記録の更新を試みます: ${record.id}`);
      if (isRedisAvailable) {
        await weightOperations.updateWeightRecord(record);
        console.error(`[DB] 体重記録の更新に成功しました: ${record.id}`);
      } else {
        console.error(`[MockDB] モック体重記録の更新を試みます: ${record.id}`);
        const updatedRecord = {
          ...record,
          updatedAt: new Date().toISOString()
        };
        await mockDb.saveWeightRecord(updatedRecord);
        console.error(`[MockDB] モック体重記録の更新に成功しました: ${record.id}`);
      }
    } catch (error) {
      console.error(`[DB] 体重記録の更新に失敗しました: ${record.id}`, error);
      throw error;
    }
  },

  // 体重記録を削除する
  async deleteWeightRecord(userId: string, recordId: string): Promise<void> {
    try {
      console.error(`[DB] 体重記録の削除を試みます: ${userId}/${recordId}`);
      if (isRedisAvailable) {
        await weightOperations.deleteWeightRecord(userId, recordId);
        console.error(`[DB] 体重記録の削除に成功しました: ${userId}/${recordId}`);
      } else {
        console.error(`[MockDB] モック体重記録の削除を試みます: ${userId}/${recordId}`);
        await mockDb.deleteWeightRecord(userId, recordId);
        console.error(`[MockDB] モック体重記録の削除に成功しました: ${userId}/${recordId}`);
      }
    } catch (error) {
      console.error(`[DB] 体重記録の削除に失敗しました: ${userId}/${recordId}`, error);
      throw error;
    }
  }
};

// 目標設定の操作
export const goalDb = {
  // 目標を作成する
  async createGoal(goal: Goal): Promise<void> {
    try {
      console.error(`[DB] 目標の保存を試みます: ${goal.id}`);
      if (isRedisAvailable) {
        const key = goalOperations.generateGoalKey(goal.userId, goal.id);
        console.error(`[DB-DETAIL] 目標保存キー: ${key}`);
        await goalOperations.createGoal(goal);
        console.error(`[DB] 目標の保存に成功しました: ${goal.id}`);
      } else {
        console.error(`[MockDB] モック目標の保存を試みます: ${goal.id}`);
        await mockDb.saveGoal(goal);
        console.error(`[MockDB] モック目標の保存に成功しました: ${goal.id}`);
      }
    } catch (error) {
      console.error(`[DB] 目標の保存に失敗しました: ${goal.id}`, error);
      throw error;
    }
  },

  // 目標を取得する
  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    try {
      console.error(`[DB] 目標の取得を試みます: ${userId}/${goalId}`);
      let goal;
      if (isRedisAvailable) {
        const key = goalOperations.generateGoalKey(userId, goalId);
        console.error(`[DB-DETAIL] 目標取得キー: ${key}`);
        goal = await goalOperations.getGoal(userId, goalId);
      } else {
        console.error(`[MockDB] モック目標の取得を試みます: ${userId}/${goalId}`);
        goal = await mockDb.getGoal(userId, goalId);
      }
      console.error(`[DB] 目標の取得結果: ${goal ? '成功' : '目標なし'}`);
      return goal;
    } catch (error) {
      console.error(`[DB] 目標の取得に失敗しました: ${userId}/${goalId}`, error);
      return null;
    }
  },

  // ユーザーの全目標を取得する
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      console.error(`[DB] ユーザーの全目標の取得を試みます: ${userId}`);
      let goals;
      if (isRedisAvailable) {
        const pattern = goalOperations.generateGoalPattern(userId);
        console.error(`[DB-DETAIL] 目標検索パターン: ${pattern}`);
        
        // キーの一覧を取得してログに出力
        const keys = await redis.keys(pattern);
        console.error(`[DB-DETAIL] 一致した目標キー: ${keys.length}件`, keys);
        
        goals = await goalOperations.getUserGoals(userId);
        
        // 取得したデータのIDリストをログに出力
        if (goals.length > 0) {
          console.error(`[DB-DETAIL] 取得した目標のID: ${goals.map(g => g.id).join(', ')}`);
        }
      } else {
        console.error(`[MockDB] モックユーザーの全目標の取得を試みます: ${userId}`);
        goals = await mockDb.getGoals(userId);
      }
      console.error(`[DB] ユーザーの全目標の取得結果: ${goals.length}件`);
      return goals;
    } catch (error) {
      console.error(`[DB] ユーザーの全目標の取得に失敗しました: ${userId}`, error);
      return [];
    }
  },

  // 目標を更新する
  async updateGoal(goal: Goal): Promise<void> {
    try {
      console.error(`[DB] 目標の更新を試みます: ${goal.id}`);
      if (isRedisAvailable) {
        await goalOperations.updateGoal(goal);
        console.error(`[DB] 目標の更新に成功しました: ${goal.id}`);
      } else {
        console.error(`[MockDB] モック目標の更新を試みます: ${goal.id}`);
        const updatedGoal = {
          ...goal,
          updatedAt: new Date().toISOString()
        };
        await mockDb.saveGoal(updatedGoal);
        console.error(`[MockDB] モック目標の更新に成功しました: ${goal.id}`);
      }
    } catch (error) {
      console.error(`[DB] 目標の更新に失敗しました: ${goal.id}`, error);
      throw error;
    }
  },

  // 目標を削除する
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    try {
      console.error(`[DB] 目標の削除を試みます: ${userId}/${goalId}`);
      if (isRedisAvailable) {
        await goalOperations.deleteGoal(userId, goalId);
        console.error(`[DB] 目標の削除に成功しました: ${userId}/${goalId}`);
      } else {
        console.error(`[MockDB] モック目標の削除を試みます: ${userId}/${goalId}`);
        await mockDb.deleteGoal(userId, goalId);
        console.error(`[MockDB] モック目標の削除に成功しました: ${userId}/${goalId}`);
      }
    } catch (error) {
      console.error(`[DB] 目標の削除に失敗しました: ${userId}/${goalId}`, error);
      throw error;
    }
  }
};

// ユーザー設定の操作
export const settingsDb = {
  // 設定を取得する
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      console.error(`[DB] ユーザー設定の取得を試みます: ${userId}`);
      let settings;
      if (isRedisAvailable) {
        settings = await settingsOperations.getUserSettings(userId);
      } else {
        console.error(`[MockDB] モックユーザー設定の取得を試みます: ${userId}`);
        settings = await mockDb.getSettings(userId);
      }
      console.error(`[DB] ユーザー設定の取得結果: ${settings ? '成功' : '設定なし'}`);
      return settings;
    } catch (error) {
      console.error(`[DB] ユーザー設定の取得に失敗しました: ${userId}`, error);
      return null;
    }
  },

  // 設定を作成/更新する
  async setUserSettings(settings: UserSettings): Promise<void> {
    try {
      console.error(`[DB] ユーザー設定の保存を試みます: ${settings.userId}`);
      if (isRedisAvailable) {
        await settingsOperations.setUserSettings(settings);
        console.error(`[DB] ユーザー設定の保存に成功しました: ${settings.userId}`);
      } else {
        console.error(`[MockDB] モックユーザー設定の保存を試みます: ${settings.userId}`);
        const updatedSettings = {
          ...settings,
          updatedAt: new Date().toISOString()
        };
        await mockDb.saveSettings(updatedSettings);
        console.error(`[MockDB] モックユーザー設定の保存に成功しました: ${settings.userId}`);
      }
    } catch (error) {
      console.error(`[DB] ユーザー設定の保存に失敗しました: ${settings.userId}`, error);
      throw error;
    }
  },

  // デフォルト設定を作成する
  createDefaultSettings(userId: string): UserSettings {
    console.error(`[DB] デフォルトユーザー設定を作成します: ${userId}`);
    return settingsOperations.createDefaultSettings(userId);
  }
};
