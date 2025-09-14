// Supabase設定ファイル
// 実際のプロジェクトではこれらの値を環境変数から取得することを推奨します

// Supabaseプロジェクトの設定
const SUPABASE_CONFIG = {
    // ここにあなたのSupabaseプロジェクトURLを入力してください
    url: 'https://khchxqlkflnfrjfmidtt.supabase.co', // 例: 'https://xxxxxxxxxxxxx.supabase.co'
    
    // ここにあなたのSupabase Anon Keyを入力してください
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2h4cWxrZmxuZnJqZm1pZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NjQxMjMsImV4cCI6MjA3MzI0MDEyM30.Uvw4bGpER36lSjYUhwu6bnPE7TvL835uQ-6tJkKwIpg',
    
    // テーブル名
    tableName: 'votes'
};

// 設定の検証
function validateSupabaseConfig() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabaseの設定が必要です。config.js ファイルでURLとAnon Keyを設定してください。');
        return false;
    }
    return true;
}

// Supabaseクライアントを初期化
let supabase = null;

function initializeSupabase() {
    if (validateSupabaseConfig() && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabaseクライアントが初期化されました');
        return true;
    } else if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase JSライブラリが読み込まれていません');
        return false;
    }
    return false;
}