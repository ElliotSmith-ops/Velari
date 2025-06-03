import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOT the anon key!
  { auth: { persistSession: false } }
)

export async function DELETE(req: NextRequest) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  // Delete from auth.users (requires service_role)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Delete from custom users table
  await supabase.from('users').delete().eq('id', userId)

  return NextResponse.json({ message: 'User deleted' })
}
