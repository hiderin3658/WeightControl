import { NextResponse } from 'next/server';
import { weightDb } from '@/app/lib/db-wrapper';

export async function POST() {
  console.error('[API] データベーステストを実行します');
  
  const testRecord = {
    id: 'test1',
    userId: 'user1',
    date: new Date().toISOString(),
    weight: 65.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // テストデータを保存
    await weightDb.createWeightRecord(testRecord);
    console.error('[API] テストデータを保存しました');

    // 保存されたデータを取得
    const records = await weightDb.getUserWeightRecords('user1');
    console.error(`[API] 取得したレコード数: ${records.length}`);

    if (records.length > 0 && records[0].id === 'test1') {
      return NextResponse.json({ success: true, message: 'OK: データが正しく保存されました。' });
    } else {
      return NextResponse.json({ success: false, message: 'NG: データが保存されていません。' });
    }
  } catch (error) {
    console.error('[API] データ保存エラー:', error);
    let errorMessage = '不明なエラーが発生しました。';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[API] エラーメッセージ:', errorMessage);
    }
    
    return NextResponse.json({ 
      success: false, 
      message: `NG: エラーが発生しました - ${errorMessage}` 
    }, { status: 500 });
  }
}
