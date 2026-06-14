require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
// console.log("SUPABASE_URL =", SUPABASE_URL);
// console.log("SUPABASE_KEY exists =", !!SUPABASE_KEY);
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    supabase = null;
  }
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_KEY,
  supabase
};