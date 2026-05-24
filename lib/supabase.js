// lib/supabase.js
// GANTI DENGAN CREDENTIALS LENGKAP DARI TEMAN ANDA
const SUPABASE_URL = 'https://jlagwghdwyrejsapourt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qjTC0cTyjCMaqAHvXLlI6g_EhU3_caa'; // ISI DENGAN KEY LENGKAP

// Tunggu hingga Supabase siap
window.addEventListener('load', function() {
    console.log('Window loaded, checking Supabase...');
});

// Inisialisasi Supabase
let supabase = null;

// Coba ambil dari window
if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized from window');
} else if (typeof supabaseJs !== 'undefined') {
    supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized from supabaseJs');
} else {
    console.error('Supabase library not found!');
}

// Ekspose ke global
window.supabaseClient = supabase;