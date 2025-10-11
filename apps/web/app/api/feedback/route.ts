import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { FeedbackPayload, ApiResponse } from '@pulseai/shared';

/**
 * POST /api/feedback
 * Public endpoint to receive feedback from the embedded widget
 * 
 * This endpoint accepts feedback from the PulseAI widget SDK and stores it
 * in the database. It validates the projectId and creates feedback entries.
 * 
 * Request body from widget: FeedbackPayload from @pulseai/shared
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FeedbackPayload;
    const { projectId, type, content, rating, metadata, userAgent, url } = body;

    // Validate required fields
    if (!projectId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required field: projectId',
        },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing or invalid required field: content',
        },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid rating: must be a number between 1 and 5',
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verify project exists and get default flow
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, org_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project not found:', projectId, projectError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid projectId',
        },
        { status: 404 }
      );
    }

    // Get or create a default flow for this project
    let { data: flow } = await supabase
      .from('flows')
      .select('id')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .limit(1)
      .single();

    // If no flow exists, create a default one
    if (!flow) {
      const { data: newFlow, error: flowError } = await supabase
        .from('flows')
        .insert({
          project_id: projectId,
          name: 'Default Flow',
          description: 'Auto-created flow for widget feedback',
          is_active: true,
        })
        .select('id')
        .single();

      if (flowError || !newFlow) {
        console.error('Error creating default flow:', flowError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to initialize feedback flow',
          },
          { status: 500 }
        );
      }

      flow = newFlow;
    }

    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     null;

    // Prepare metadata
    const fullMetadata = {
      ...(metadata || {}),
      type: type || 'text',
      url: url || null,
      timestamp: new Date().toISOString(),
    };

    // Insert feedback into database
    const { data: feedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        flow_id: flow.id,
        content: content.trim(),
        rating: rating || null,
        metadata: fullMetadata,
        user_agent: userAgent || request.headers.get('user-agent') || null,
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save feedback',
        },
        { status: 500 }
      );
    }

    // TODO: Queue feedback for AI analysis
    // This would typically trigger a background job to analyze the feedback
    // For now, we could call the AI summarization in the background

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: feedback.id,
          message: 'Feedback received successfully',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Get feedback for a specific project or flow
 * Requires authentication via Supabase (RLS will filter results)
 * 
 * Query params:
 * - projectId: UUID (required)
 * - flowId: UUID (optional, filters to specific flow)
 * - page: number (default: 1)
 * - pageSize: number (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const flowId = searchParams.get('flowId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: projectId',
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated (RLS will handle authorization)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from('feedback')
      .select(`
        *,
        flows!inner (
          id,
          name,
          project_id,
          projects!inner (
            id,
            name,
            org_id
          )
        )
      `, { count: 'exact' })
      .eq('flows.project_id', projectId);

    // Filter by specific flow if provided
    if (flowId) {
      query = query.eq('flow_id', flowId);
    }

    // Get total count and paginated data
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch feedback',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasMore: (count || 0) > page * pageSize,
      },
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
