import { createClient } from '@supabase/supabase-js'

// Supabase 대시보드 Settings -> API에서 확인한 값을 넣으세요
const supabaseUrl = 'https://auleispwjviglpmllviy.supabase.co'
const supabaseKey = 'sb_publishable_FsnlFhCh4gBCibj6Q2jRwQ_gzwaI_h1'

export const supabase = createClient(supabaseUrl, supabaseKey)
