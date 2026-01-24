import { createClient } from '@supabase/supabase-js'

// Supabase 대시보드 Settings -> API에서 확인한 값을 넣으세요
const supabaseUrl = 'https://auleispwjviglpmllviy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bGVpc3B3anZpZ2xwbWxsdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMzAxMTcsImV4cCI6MjA4NDgwNjExN30.D4q5vTPLWYOVsttxtXQ7Cuokbc3PLA6lhhkPGofXdSI'

export const supabase = createClient(supabaseUrl, supabaseKey)
