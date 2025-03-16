import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const targetUrl = `http://localhost:8000${url.pathname.replace('/api/proxy', '')}${url.search}`;
  
  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  const targetUrl = `http://localhost:8000${url.pathname.replace('/api/proxy', '')}${url.search}`;
  
  try {
    const body = await request.json();
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}
