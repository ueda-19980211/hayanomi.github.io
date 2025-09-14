// Supabase設定ファイル
// 実際のプロジェクトではこれらの値を環境変数から取得することを推奨します

// 環境変数からSupabase設定を取得する関数
function getSupabaseConfig() {
    // 環境変数またはローカル設定から値を取得
    const url = process?.env?.SUPABASE_URL || 
                window?.SUPABASE_URL || 
                localStorage.getItem('SUPABASE_URL');
    
    const anonKey = process?.env?.SUPABASE_ANON_KEY || 
                    window?.SUPABASE_ANON_KEY || 
                    localStorage.getItem('SUPABASE_ANON_KEY');
    
    return {
        url,
        anonKey,
        tableName: 'votes'
    };
}

// Supabaseプロジェクトの設定
const SUPABASE_CONFIG = getSupabaseConfig();

// 設定の検証
function validateSupabaseConfig() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('❌ Supabaseの設定が見つかりません。以下のいずれかの方法で設定してください:');
        console.error('1. 環境変数: SUPABASE_URL, SUPABASE_ANON_KEY');
        console.error('2. ローカルストレージ: localStorage.setItem("SUPABASE_URL", "your-url")');
        console.error('3. ヘルパー関数: setSupabaseEnvVars("your-url", "your-key")');
        throw new Error('Supabase設定が必要です');
    }
    
    console.log('✅ Supabase設定を環境変数から取得しました');
    return true;
}

// 環境変数をローカルストレージに設定するヘルパー関数（開発用）
function setSupabaseEnvVars(url, anonKey) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('SUPABASE_URL', url);
        localStorage.setItem('SUPABASE_ANON_KEY', anonKey);
        console.log('✅ Supabase環境変数をローカルストレージに保存しました');
        
        // 設定を再読み込み
        Object.assign(SUPABASE_CONFIG, getSupabaseConfig());
    }
}

// 環境変数をクリアするヘルパー関数
function clearSupabaseEnvVars() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('SUPABASE_URL');
        localStorage.removeItem('SUPABASE_ANON_KEY');
        console.log('✅ Supabase環境変数をクリアしました');
    }
}

// Supabaseクライアントを初期化
let supabase = null;

function initializeSupabase() {
    // 設定を再読み込み（動的に変更された場合に対応）
    Object.assign(SUPABASE_CONFIG, getSupabaseConfig());
    
    if (validateSupabaseConfig() && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabaseクライアントが初期化されました');
        console.log(`📡 接続先: ${SUPABASE_CONFIG.url.substring(0, 30)}...`);
        return true;
    } else if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase JSライブラリが読み込まれていません');
        return false;
    }
    return false;
}