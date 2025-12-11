import { createClient } from '@supabase/supabase-js';

// Substitua pelos dados do seu projeto Supabase
const supabaseUrl = 'https://emvnzzkqvyczawwrwkhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdm56emtxdnljemF3d3J3a2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzE5MDQsImV4cCI6MjA4MDk0NzkwNH0.3bRsk0j7PDlnQ9euXSZigH88Qm3deE4DSGBImYyVLRY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
