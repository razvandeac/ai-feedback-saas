import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { ApiResponse, Org, CreateOrgPayload } from '@pulseai/shared';

/**
 * GET /api/orgs
 * Returns list of organizations where the current user is a member
 * RLS policies automatically filter results based on auth.uid()
 */
export async function GET() {
  try {
    // Create server-side Supabase client with auth context
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
        { status: 401 }
      );
    }

    // Query orgs with member information
    // RLS policies automatically filter to only orgs where user is a member
    const { data: orgs, error: orgsError } = await supabase
      .from('orgs')
      .select(`
        id,
        name,
        slug,
        settings,
        created_at,
        updated_at,
        members!inner (
          id,
          role,
          user_id
        )
      `)
      .eq('members.user_id', user.id)
      .order('created_at', { ascending: false });

    if (orgsError) {
      console.error('Error fetching orgs:', orgsError);
      return NextResponse.json(
        { error: 'Database error', message: orgsError.message },
        { status: 500 }
      );
    }

    // Transform the data to include the user's role in each org
    const orgsWithRole = orgs?.map((org) => {
      const member = org.members.find((m: any) => m.user_id === user.id);
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        settings: org.settings,
        created_at: org.created_at,
        updated_at: org.updated_at,
        role: member?.role || 'member',
        member_id: member?.id,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: orgsWithRole,
      count: orgsWithRole.length,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/orgs:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orgs
 * Creates a new organization and adds the current user as owner
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to create an organization' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, slug, settings } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Create the organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        settings: settings || {},
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating org:', orgError);
      
      // Check for unique constraint violation on slug
      if (orgError.code === '23505') {
        return NextResponse.json(
          { error: 'Validation error', message: 'An organization with this slug already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Database error', message: orgError.message },
        { status: 500 }
      );
    }

    // Add the current user as an owner
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: 'owner',
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating member:', memberError);
      
      // If member creation fails, we should ideally rollback the org creation
      // For now, just return an error
      return NextResponse.json(
        { error: 'Database error', message: 'Organization created but failed to add you as owner' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...org,
          role: member.role,
          member_id: member.id,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error in POST /api/orgs:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

