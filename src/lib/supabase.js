import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase URL and Key
const supabaseUrl = 'https://xyz.supabase.co'
const supabaseKey = 'abc-123'

export const supabase = createClient(supabaseUrl, supabaseKey)