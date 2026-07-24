import { db } from "./src/lib/db";

async function main() {
  const email = "khamkard4000@gmail.com";
  console.log(`Promoting ${email} to ADMIN...`);
  
  const count = await db.$executeRawUnsafe(`
    UPDATE auth.users 
    SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "ADMIN"}'::jsonb 
    WHERE email = $1
  `, email);

  console.log(`Successfully updated ${count} user(s).`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => db.$disconnect());
