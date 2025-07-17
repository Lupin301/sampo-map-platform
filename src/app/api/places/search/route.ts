import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('API Route called'); // デバッグ用
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    console.log('Search query:', query); // デバッグ用
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // 常にデモデータを返す（まずはこれで動作確認）
    const demoResults = [
      {
        name: `${query}関連スポット1`,
        address: '東京都千代田区丸の内1-1-1',
        lat: 35.6812,
        lng: 139.7671,
        place_id: `demo-1-${Date.now()}`
      },
      {
        name: `${query}関連スポット2`,
        address: '東京都新宿区新宿3-1-1',
        lat: 35.6896,
        lng: 139.7006,
        place_id: `demo-2-${Date.now()}`
      },
      {
        name: `${query}関連スポット3`,
        address: '東京都渋谷区道玄坂1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        place_id: `demo-3-${Date.now()}`
      }
    ];
    
    console.log('Returning demo results:', demoResults); // デバッグ用
    
    return NextResponse.json({ results: demoResults });
    
  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
