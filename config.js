// Supabase設定ファイル
// 本設定は開発・デモ用です

// Supabaseプロジェクトの設定
const SUPABASE_CONFIG = {
    url: 'https://khchxqlkflnfrjfmidtt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2h4cWxrZmxuZnJqZm1pZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NjQxMjMsImV4cCI6MjA3MzI0MDEyM30.Uvw4bGpER36lSjYUhwu6bnPE7TvL835uQ-6tJkKwIpg',
    tableName: 'votes'
};

// Supabaseクライアントを初期化
let supabase = null;

function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabaseクライアントが初期化されました');
        console.log(`📡 接続先: ${SUPABASE_CONFIG.url.substring(0, 30)}...`);
        return true;
    } else {
        console.error('❌ Supabase JSライブラリが読み込まれていません');
        return false;
    }
}