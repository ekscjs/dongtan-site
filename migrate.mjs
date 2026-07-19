import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// posts 테이블에 누락된 컬럼 추가
const sqls = [
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS tag text`,
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt text`,
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS gbp_posted_at timestamptz`,
];

for (const sql of sqls) {
  const { error } = await supabase.rpc('exec_sql', { sql }).then(r => r).catch(() => ({ error: { message: 'rpc not found' } }));
  if (error?.message === 'rpc not found') {
    // RPC 없으면 직접 REST API 통해 실행
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql })
    });
    const result = await res.json();
    if (res.ok) {
      console.log('✓', sql);
    } else {
      // RPC 없으면 supabase-js postgres extension 시도
      console.log('⚠ RPC 없음, 수동으로 Supabase SQL 에디터에서 실행 필요:');
      console.log('  ', sql);
    }
  } else if (error) {
    console.error('✗', sql, error.message);
  } else {
    console.log('✓', sql);
  }
}

// 테이블 컬럼 확인
const { data } = await supabase
  .from('posts')
  .select('id, tag, excerpt, gbp_posted_at')
  .limit(1);

if (data) {
  console.log('\n✅ tag, excerpt, gbp_posted_at 컬럼 정상 확인됨');
} else {
  console.log('\n아직 컬럼이 없음. Supabase SQL 에디터에서 직접 실행하세요:');
  console.log('ALTER TABLE posts ADD COLUMN IF NOT EXISTS tag text;');
  console.log('ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt text;');
  console.log('ALTER TABLE posts ADD COLUMN IF NOT EXISTS gbp_posted_at timestamptz;');
}
