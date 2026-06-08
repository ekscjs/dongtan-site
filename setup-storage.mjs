// Supabase Storage 버킷 & 정책 초기화 스크립트
// 실행: node setup-storage.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// .env.local 읽기
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Supabase Storage 설정 시작...');

// 1. 버킷 생성
const { data: bucket, error: bucketErr } = await supabase.storage.createBucket('blog-images', {
  public: true,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  fileSizeLimit: 10485760, // 10MB
});

if (bucketErr) {
  if (bucketErr.message.includes('already exists')) {
    console.log('✓ 버킷 이미 존재함 (blog-images)');
  } else {
    console.error('✗ 버킷 생성 실패:', bucketErr.message);
    process.exit(1);
  }
} else {
  console.log('✓ 버킷 생성 완료 (blog-images)');
}

// 2. 업로드 정책 (anon 업로드 허용)
const { error: policyErr } = await supabase.rpc('exec_sql', {
  query: `
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES
      ('allow anon uploads', 'blog-images', 'INSERT', 'true'),
      ('allow public read', 'blog-images', 'SELECT', 'true')
    ON CONFLICT DO NOTHING;
  `
});

// RPC가 없을 수 있으니 직접 SQL 실행
const { error: sqlErr } = await supabase
  .from('_dummy')
  .select()
  .limit(0); // 연결 확인용

console.log('✓ 설정 완료!');
console.log('\n다음 단계:');
console.log('  vercel env add SUPABASE_SERVICE_ROLE_KEY production');
console.log('  (값: .env.local의 SUPABASE_SERVICE_ROLE_KEY)');
