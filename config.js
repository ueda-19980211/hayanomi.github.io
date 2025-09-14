// Supabase設定ファイル
// 実際のプロジェクトではこれらの値を環境変数から取得することを推奨します

// 環境変数からSupabase設定を取得する関数
function getSupabaseConfig() {
    // ブラウザ環境での設定取得（優先順位：ローカルストレージ > windowオブジェクト > デフォルト値）
    let url = localStorage.getItem('SUPABASE_URL') || 
              window?.SUPABASE_URL;
    
    let anonKey = localStorage.getItem('SUPABASE_ANON_KEY') || 
                  window?.SUPABASE_ANON_KEY;
    
    // .envファイルからの値を自動設定（開発用）
    if (!url && !anonKey) {
        // 開発環境用のデフォルト設定
        console.warn('⚠️ 設定が見つかりません。setSupabaseEnvVars()を使用して設定してください。');
    }
    
    return {
        url,
        anonKey,
        tableName: 'votes'
    };
}

// Supabaseプロジェクトの設定（遅延初期化）
let SUPABASE_CONFIG = null;

// 設定を取得する関数
function getSupabaseConfiguration() {
    if (!SUPABASE_CONFIG) {
        SUPABASE_CONFIG = getSupabaseConfig();
    }
    return SUPABASE_CONFIG;
}

// 設定の検証
function validateSupabaseConfig() {
    const config = getSupabaseConfiguration();
    
    if (!config.url || !config.anonKey) {
        console.error('❌ Supabaseの設定が見つかりません。以下のいずれかの方法で設定してください:');
        console.error('1. 環境変数: SUPABASE_URL, SUPABASE_ANON_KEY');
        console.error('2. ローカルストレージ: localStorage.setItem("SUPABASE_URL", "your-url")');
        console.error('3. ヘルパー関数: setSupabaseEnvVars("your-url", "your-key")');
        throw new Error('Supabase設定が必要です');
    }
    
    console.log('✅ Supabase設定を環境変数から取得しました');
    return true;
}

// .envファイルから自動設定する関数（開発用）
function autoSetupFromEnv() {
    // .envファイルの値（開発環境用）
    const envValues = {
        url: 'https://khchxqlkflnfrjfmidtt.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoY2h4cWxrZmxuZnJqZm1pZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NjQxMjMsImV4cCI6MjA3MzI0MDEyM30.Uvw4bGpER36lSjYUhwu6bnPE7TvL835uQ-6tJkKwIpg'
    };
    
    // ローカルストレージに既存の設定がない場合のみ自動設定
    if (!localStorage.getItem('SUPABASE_URL') || !localStorage.getItem('SUPABASE_ANON_KEY')) {
        localStorage.setItem('SUPABASE_URL', envValues.url);
        localStorage.setItem('SUPABASE_ANON_KEY', envValues.anonKey);
        console.log('🔧 .envファイルの値を自動設定しました');
        return true;
    }
    return false;
}

// 環境変数をローカルストレージに設定するヘルパー関数（開発用）
function setSupabaseEnvVars(url, anonKey) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('SUPABASE_URL', url);
        localStorage.setItem('SUPABASE_ANON_KEY', anonKey);
        console.log('✅ Supabase環境変数をローカルストレージに保存しました');
        
        // 設定を再読み込み
        SUPABASE_CONFIG = null; // キャッシュをクリア
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
    try {
        // .envファイルから自動設定を試行
        autoSetupFromEnv();
        
        // 設定を再読み込み（動的に変更された場合に対応）
        SUPABASE_CONFIG = null; // キャッシュをクリア
        const config = getSupabaseConfiguration();
        
        if (validateSupabaseConfig() && typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(config.url, config.anonKey);
            console.log('✅ Supabaseクライアントが初期化されました');
            console.log(`📡 接続先: ${config.url.substring(0, 30)}...`);
            return true;
        } else if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase JSライブラリが読み込まれていません');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase初期化エラー:', error.message);
        console.log('💡 解決方법: setSupabaseEnvVars("your-url", "your-key") を実行してください');
    }
    return false;
}