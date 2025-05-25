// setCustomClaims.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

// 環境変数からサービスアカウント読み込み
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.SERVICE_ACCOUNT_PATH as string, 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();

async function setClaims() {
  const uid = process.env.FIREBASE_ADMIN_UID; // 👈 対象ユーザーの UID をここに
  const claims = {
    admin: true, // 👈 設定したいカスタムクレーム
  };

  await auth.setCustomUserClaims(uid, claims);
  console.log(`✅ Custom claims set for UID: ${uid}`);
}

setClaims().catch((e) => {
  console.error('❌ Failed to set claims:', e);
});
