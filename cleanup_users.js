const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupOrphanedUsers() {
  console.log("Fetching all users...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Failed to list users:", listError);
    return;
  }

  console.log(`Found ${users.length} users. Checking for orphaned accounts...`);
  
  for (const user of users) {
    const { data: shopUser } = await supabase
      .from('shop_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
      
    if (!shopUser) {
      console.log(`Deleting orphaned user: ${user.email} (ID: ${user.id})`);
      await supabase.auth.admin.deleteUser(user.id);
    }
  }
  
  console.log("Cleanup complete!");
}

cleanupOrphanedUsers();
