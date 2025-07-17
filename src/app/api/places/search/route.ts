import { NextRequest, NextResponse } from 'next/server';

// 検索クエリに基づいてデモデータを生成
function generateDemoResults(searchQuery: string) {
  const lowerQuery = searchQuery.toLowerCase();
  
  // 検索クエリに基づいた異なる結果を返す
  if (lowerQuery.includes('カフェ') || lowerQuery.includes('cafe')) {
    return [
      { name: 'スターバックス 渋谷店', address: '東京都渋谷区道玄坂1-12-1', lat: 35.6580, lng: 139.7016, place_id: 'cafe-1' },
      { name: 'タリーズコーヒー 新宿店', address: '東京都新宿区新宿3-14-1', lat: 35.6896, lng: 139.7006, place_id: 'cafe-2' },
      { name: 'ドトールコーヒー 東京駅店', address: '東京都千代田区丸の内1-9-1', lat: 35.6812, lng: 139.7671, place_id: 'cafe-3' }
    ];
  }
  
  if (lowerQuery.includes('レストラン') || lowerQuery.includes('restaurant')) {
    return [
      { name: 'イタリアンレストラン 銀座', address: '東京都中央区銀座5-4-1', lat: 35.6719, lng: 139.7658, place_id: 'restaurant-1' },
      { name: 'フレンチレストラン 表参道', address: '東京都港区南青山3-5-1', lat: 35.6659, lng: 139.7131, place_id: 'restaurant-2' },
      { name: '和食レストラン 六本木', address: '東京都港区六本木6-1-1', lat: 35.6627, lng: 139.7314, place_id: 'restaurant-3' }
    ];
  }
  
  if (lowerQuery.includes('駅') || lowerQuery.includes('station')) {
    return [
      { name: searchQuery, address: '東京都千代田区丸の内1-1-1', lat: 35.6812, lng: 139.7671, place_id: 'station-1' },
      { name: searchQuery + '東口', address: '東京都千代田区丸の内1-2-1', lat: 35.6822, lng: 139.7681, place_id: 'station-2' },
      { name: searchQuery + '西口', address: '東京都千代田区丸の内1-3-1', lat: 35.6802, lng: 139.7661, place_id: 'station-3' }
    ];
  }
  
  if (lowerQuery.includes('公園') || lowerQuery.includes('park')) {
    return [
      { name: '上野公園', address: '東京都台東区上野公園5-20', lat: 35.7148, lng: 139.7744, place_id: 'park-1' },
      { name: '代々木公園', address: '東京都渋谷区代々木神園町2-1', lat: 35.6732, lng: 139.6950, place_id: 'park-2' },
      { name: '新宿御苑', address: '東京都新宿区内藤町11', lat: 35.6851, lng: 139.7100, place_id: 'park-3' }
    ];
  }
  
  // その他の検索語に対してはより汎用的な結果
  return [
    { name: searchQuery + ' - 関連スポット1', address: '東京都渋谷区道玄坂1-1-1', lat: 35.6580, lng: 139.7016, place_id: searchQuery + '-1' },
    { name: searchQuery + ' - 関連スポット2', address: '東京都新宿区新宿3-1-1', lat: 35.6896, lng: 139.7006, place_id: searchQuery + '-2' },
    { name: searchQuery + ' - 関連スポット3', address: '東京都千代田区丸の内1-1-1', lat: 35.6812, lng: 139.7671, place_id: searchQuery + '-3' }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const results = generateDemoResults(query);
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
