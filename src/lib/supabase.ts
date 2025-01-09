import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxwgdmhxkgwpkqzwkxpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d2dkbWh4a2d3cGtxendreHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ3OTg1ODAsImV4cCI6MjAyMDM3NDU4MH0.Wy4GBNGYMvHcYo1Mfbz__7qG-v1kTJPEy-aFGpbNO3c'

export const supabase = createClient(supabaseUrl, supabaseKey)
