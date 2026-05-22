# 就活管理アプリ

インターン・就活の応募状況をカレンダーで管理できるWebアプリです。

## 機能

- **ダッシュボード** — 企業一覧・締切日・ステータス管理
- **カレンダー** — 応募締切をカレンダーで可視化
- **リマインド** — 締切1日前・3日前にブラウザ通知
- **メモ** — 企業ごとに自由メモ
- **リアルタイム同期** — FirebaseでスマホとPC間で自動同期
- **Googleログイン** — Googleアカウントで認証

## 技術スタック

- React + TypeScript + Vite
- Tailwind CSS
- FullCalendar
- Firebase (Authentication / Firestore / Hosting)

## セットアップ

### 1. Firebase プロジェクトを作成

- [Firebase Console](https://console.firebase.google.com) でプロジェクトを作成
- **Authentication** → Google を有効化
- **Firestore** → データベースを作成（本番モード）
- **Hosting** → 有効化

### 2. Firestore セキュリティルール

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/companies/{companyId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### 3. 環境変数を設定

`.env.local` をプロジェクトルートに作成：

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 4. インストール & デプロイ

```bash
npm install
npm run build
firebase deploy
```
