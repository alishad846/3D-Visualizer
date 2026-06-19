require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
// console.log("SUPABASE_URL =", SUPABASE_URL);
// console.log("SUPABASE_SERVICE_ROLE_KEY exists =", !!SUPABASE_SERVICE_ROLE_KEY);
// console.log("SUPABASE_KEY exists =", !!SUPABASE_KEY);
let supabase = null;
const activeSupabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;
if (SUPABASE_URL && activeSupabaseKey) {
  if (!SUPABASE_SERVICE_ROLE_KEY && SUPABASE_KEY) {
    console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set; falling back to SUPABASE_KEY. Storage uploads may fail if this is an anon key.');
  }
  try {
    supabase = createClient(SUPABASE_URL, activeSupabaseKey);
  } catch (e) {
    supabase = null;
  }
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_KEY,
  supabase
};
