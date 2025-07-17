import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Places API key not found. Using demo data.');
      
      // デモデータを返す（異なる場所）
      const demoResults = [
        {
          name: `${query}に関連する場所1`,
          address: '東京都千代田区丸の内1丁目',
          lat: 35.6812,
          lng: 139.7671,
          place_id: 'demo-1'
        },
        {
          name: `${query}に関連する場所2`,
          address: '東京都新宿区新宿3丁目',
          lat: 35.6896,
          lng: 139.7006,
          place_id: 'demo-2'
        },
        {
          name: `${query}に関連する場所3`,
          address: '東京都渋谷区道玄坂1丁目',
          lat: 35.6580,
          lng: 139.7016,
          place_id: 'demo-3'
        },
        {
          name: `${query}に関連する場所4`,
          address: '東京都港区六本木6丁目',
          lat: 35.6627,
          lng: 139.7314,
          place_id: 'demo-4'
        },
        {
          name: `${query}に関連する場所5`,
          address: '東京都台東区浅草2丁目',
          lat: 35.7148,
          lng: 139.7967,
          place_id: 'demo-5'
        }
      ];
      
      return NextResponse.json({ results: demoResults });
    }

    // Google Places APIを呼び出し
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=ja&region=jp`
    );

    if (!response.ok) {
      throw new Error(`Google Places API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results) {
      const places = data.results.slice(0, 5).map((place: any) => ({
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        place_id: place.place_id,
        types: place.types || []
      }));
      
      return NextResponse.json({ results: places });
    } else {
      console.error('Places API error:', data.status, data.error_message);
      return NextResponse.json({ 
        error: 'Places API error', 
        status: data.status,
        message: data.error_message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
