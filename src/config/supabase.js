import { createClient } from '@supabase/supabase-js';

// REPLACE THESE DIRECTLY WITH YOUR STRINGS FOR TESTING
const supabaseUrl = 'https://izrgpebyxxnbliogkvfz.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cmdwZWJ5eHhuYmxpb2drdmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzEwMDYsImV4cCI6MjA4MzgwNzAwNn0.1_VA0gD-V_Ln1vJ60eKHdVWWMbXgZnzi6N8X15aSt0I'; 

export const supabase = createClient(supabaseUrl, supabaseKey);