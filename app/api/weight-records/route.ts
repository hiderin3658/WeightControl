import { NextRequest, NextResponse } from 'next/server';
import { weightDb } from '@/app/lib/db-wrapper';
import { WeightRecord } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';

// 体重記録を取得するAPI
export async function GET(request: NextRequest) {
  console.error('[API] 体重記録取得APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    const userId = session.user.email;
    console.error(`[API] ユーザー ${userId} の体重記録を取得します`);
    
    // 体重記録を取得
    const records = await weightDb.getUserWeightRecords(userId);
    
    console.error(`[API] ${records.length}件の体重記録を取得しました`);
    
    return NextResponse.json(records);
  } catch (error) {
    console.error('[API] 体重記録取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '体重記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 体重記録を作成するAPI
export async function POST(request: NextRequest) {
  console.error('[API] 体重記録の作成APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを取得
    const record: WeightRecord = await request.json();
    
    // ユーザーIDを確認
    if (record.userId !== session.user.email) {
      return NextResponse.json({ error: '不正なユーザーIDです' }, { status: 403 });
    }
    
    console.error(`[API] 体重記録の保存を開始します: ${record.id}`);
    
    // 体重記録を保存
    await weightDb.createWeightRecord(record);
    
    console.error(`[API] 体重記録の保存が完了しました: ${record.id}`);
    
    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('[API] 体重記録の保存中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '体重記録の保存に失敗しました' },
      { status: 500 }
    );
  }
}

// 体重記録を更新するAPI
export async function PUT(request: NextRequest) {
  console.error('[API] 体重記録の更新APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを取得
    const record: WeightRecord = await request.json();
    
    // ユーザーIDを確認
    if (record.userId !== session.user.email) {
      return NextResponse.json({ error: '不正なユーザーIDです' }, { status: 403 });
    }
    
    console.error(`[API] 体重記録の更新を開始します: ${record.id}`);
    
    // 体重記録を更新
    await weightDb.updateWeightRecord(record);
    
    console.error(`[API] 体重記録の更新が完了しました: ${record.id}`);
    
    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('[API] 体重記録の更新中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '体重記録の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 体重記録を削除するAPI
export async function DELETE(request: NextRequest) {
  console.error('[API] 体重記録の削除APIが呼び出されました');
  
  try {
    // セッションを取得して認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // URLからパラメータを取得
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('id');
    
    if (!recordId) {
      return NextResponse.json({ error: '記録IDが指定されていません' }, { status: 400 });
    }
    
    console.error(`[API] 体重記録の削除を開始します: ${session.user.email}/${recordId}`);
    
    // 体重記録を削除
    await weightDb.deleteWeightRecord(session.user.email, recordId);
    
    console.error(`[API] 体重記録の削除が完了しました: ${session.user.email}/${recordId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] 体重記録の削除中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '体重記録の削除に失敗しました' },
      { status: 500 }
    );
  }
}
