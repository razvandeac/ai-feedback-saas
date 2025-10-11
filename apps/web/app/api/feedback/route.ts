import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Feedback, ApiResponse } from '@pulseai/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, content, userId, metadata } = body;

    if (!tenantId || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: tenantId and content',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Insert feedback into database
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        tenant_id: tenantId,
        user_id: userId || null,
        content: content.trim(),
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting feedback:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save feedback',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // TODO: Queue feedback for AI analysis
    // This would typically trigger a background job to analyze the feedback

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Feedback received successfully',
      } as ApiResponse<Feedback>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: tenantId',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get total count
    const { count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get paginated data
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch feedback',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      page,
      pageSize,
      total: count || 0,
      hasMore: (count || 0) > page * pageSize,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as ApiResponse,
      { status: 500 }
    );
  }
}


