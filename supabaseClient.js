"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
// Substitua pelos dados do seu projeto Supabase
var supabaseUrl = 'https://emvnzzkqvyczawwrwkhl.supabase.co';
var supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdm56emtxdnljemF3d3J3a2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzE5MDQsImV4cCI6MjA4MDk0NzkwNH0.3bRsk0j7PDlnQ9euXSZigH88Qm3deE4DSGBImYyVLRY';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
