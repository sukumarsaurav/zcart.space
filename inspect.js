const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  console.log("Users:", users.map(u => u.email));
  
  const { data: shops } = await supabase.from('shops').select('*');
  console.log("Shops:", shops);

  const { data: shopUsers } = await supabase.from('shop_users').select('*');
  console.log("Shop Users:", shopUsers);
}
inspect();
