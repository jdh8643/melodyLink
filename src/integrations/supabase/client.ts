// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://doktkgirvqvjtybkhnnp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva3RrZ2lydnF2anR5Ymtobm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NjM2MTMsImV4cCI6MjA1MDIzOTYxM30.GWB7HpIKQdZMnSWDSA1fdtUXpL-7v4L7HDFYJFyRlFs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);