/** Environment variables, read lazily so a missing one gives a clear message. */
function need(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable ${name}. See README "Setting up".`);
  return value;
}

export const env = {
  supabaseUrl: () => need("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () => need("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceKey: () => need("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Children sign in with a username; Supabase needs an email, so we map it to this private domain. */
  studentEmailDomain: () => process.env.STUDENT_EMAIL_DOMAIN ?? "students.homeschool-app.local",
  configured: () =>
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const studentEmail = (username: string) => `${username.toLowerCase()}@${env.studentEmailDomain()}`;
