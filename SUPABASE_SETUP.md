# Supabase設定ガイド

このプロジェクトでSupabaseを使用するための設定手順です。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト名と強力なパスワードを設定

## 2. データベーステーブルの作成

1. Supabaseダッシュボードで **SQL Editor** に移動
2. `supabase_setup.sql` ファイルの内容をコピー&ペースト
3. **Run** ボタンをクリックしてSQLを実行

## 3. プロジェクト設定の取得

1. Supabaseダッシュボードで **Settings** > **API** に移動
2. 以下の情報をコピー：
   - **Project URL** (例: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon/Public Key** (例: `eyJhbGciOiJIUzI1NiIs...`)

## 4. アプリケーションの設定

環境変数を使用してSupabase設定を行います。以下のいずれかの方法で設定してください：

### 方法1: ブラウザのコンソールで設定（推奨・開発用）

1. ブラウザでアプリケーションを開く
2. 開発者ツール (F12) のコンソールを開く
3. 以下のコマンドを実行：

```javascript
setSupabaseEnvVars(
    'https://your-project-ref.supabase.co', // あなたのProject URL
    'your-anon-key-here' // あなたのAnon Key
);
```

### 方法2: 環境変数で設定（本番用）

環境変数として以下を設定：
- `SUPABASE_URL`: あなたのProject URL
- `SUPABASE_ANON_KEY`: あなたのAnon Key

### 方法3: HTMLファイルで直接設定

HTMLファイルの`<head>`セクションに追加：

```html
<script>
    window.SUPABASE_URL = 'https://your-project-ref.supabase.co';
    window.SUPABASE_ANON_KEY = 'your-anon-key-here';
</script>
```

## 5. 動作確認

1. ブラウザでアプリケーションを開く
2. 開発者ツール (F12) のコンソールを確認
3. 「✅ Supabaseクライアントが初期化されました」メッセージを確認
4. 投票をテストして「✅ Supabaseに投票データを保存しました」メッセージを確認

## 6. トラブルシューティング

### RLSポリシーエラー（42501エラー）の場合
1. Supabaseダッシュボードで **Authentication** > **Policies** に移動
2. `votes` テーブルのポリシーを確認
3. 以下のSQLを再実行：
```sql
-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Anyone can insert votes" ON votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;

-- 新しいポリシーを作成
CREATE POLICY "Enable insert for anon users" ON votes
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable select for anon users" ON votes
    FOR SELECT TO anon USING (true);
```

### 緊急時の対処法（開発時のみ）
RLSを一時的に無効にする：
```sql
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
```

### Supabaseに接続できない場合
- URLとAnon Keyが正しいか確認
- Row Level Security (RLS) ポリシーが設定されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### 投票データが保存されない場合
- テーブルが正しく作成されているか確認
- INSERT ポリシーが設定されているか確認
- 馬番が1-8の範囲内か確認
- RLSポリシーが正しく設定されているか確認

### データが表示されない場合
- SELECT ポリシーが設定されているか確認
- テーブル名が正しいか確認
- RLSポリシーが正しく設定されているか確認

## セキュリティについて

### 🔐 環境変数の利点
- **機密情報の保護**: ソースコードに直接キーを書かない
- **環境別設定**: 開発・ステージング・本番で異なる設定を使用可能
- **バージョン管理**: 機密情報をGitリポジトリに含めない

### ⚠️ 注意事項
- 本設定は開発・デモ用です
- 本番環境では適切な認証とセキュリティ対策を実装してください
- Anon Keyは公開されても安全ですが、RLSポリシーで適切にアクセス制御してください
- ブラウザのローカルストレージに保存された値は、同じドメインで共有されます

### 🛡️ 本番環境での推奨事項
- 環境変数またはシークレット管理システムを使用
- 適切なCORSポリシーの設定
- RLSポリシーの厳密な設定
- 定期的なキーのローテーション