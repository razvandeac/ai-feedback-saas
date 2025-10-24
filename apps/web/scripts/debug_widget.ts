import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

async function debugWidget() {
  const adminSupabase = getSupabaseAdmin()
  
  console.log('🔍 Debugging widget creation...')
  
  // Test 1: Check if studio_widgets table exists and is accessible
  console.log('\n1. Testing studio_widgets table access...')
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminSupabase as any)
      .from('studio_widgets')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing studio_widgets table:', error)
    } else {
      console.log('✅ studio_widgets table accessible')
    }
  } catch (err) {
    console.error('❌ Exception accessing studio_widgets table:', err)
  }
  
  // Test 2: Check if projects table has widget_id column
  console.log('\n2. Testing projects.widget_id column...')
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminSupabase as any)
      .from('projects')
      .select('id, widget_id')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing projects.widget_id:', error)
    } else {
      console.log('✅ projects.widget_id column accessible')
    }
  } catch (err) {
    console.error('❌ Exception accessing projects.widget_id:', err)
  }
  
  // Test 3: Check if demo organization exists
  console.log('\n3. Testing demo organization...')
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminSupabase as any)
      .from('organizations')
      .select('id, name, slug')
      .eq('slug', 'demo')
      .single()
    
    if (error) {
      console.error('❌ Error finding demo organization:', error)
    } else {
      console.log('✅ Demo organization found:', data)
    }
  } catch (err) {
    console.error('❌ Exception finding demo organization:', err)
  }
  
  // Test 4: Check the specific project
  console.log('\n4. Testing specific project...')
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminSupabase as any)
      .from('projects')
      .select('id, name, org_id, widget_id')
      .eq('id', '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6')
      .single()
    
    if (error) {
      console.error('❌ Error finding project:', error)
    } else {
      console.log('✅ Project found:', data)
    }
  } catch (err) {
    console.error('❌ Exception finding project:', err)
  }
  
  // Test 5: Try to create a test widget
  console.log('\n5. Testing widget creation...')
  try {
    const testConfig = {
      theme: { variant: "light", primaryColor: "#3b82f6", backgroundColor: "#ffffff", fontFamily: "Inter", borderRadius: 12 },
      blocks: [{ id: crypto.randomUUID(), type: "text", version: 1, data: { text: "Test widget", align: "left" } }],
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminSupabase as any)
      .from('studio_widgets')
      .insert({ 
        org_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
        name: 'Test Widget', 
        widget_config: testConfig, 
        published_config: testConfig 
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('❌ Error creating test widget:', error)
    } else {
      console.log('✅ Test widget created:', data)
      
      // Clean up test widget
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminSupabase as any)
        .from('studio_widgets')
        .delete()
        .eq('id', data.id)
      console.log('🧹 Test widget cleaned up')
    }
  } catch (err) {
    console.error('❌ Exception creating test widget:', err)
  }
  
  console.log('\n🏁 Debug complete!')
}

if (require.main === module) {
  debugWidget().catch(console.error)
}

export { debugWidget }
