import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { ActionForm, Submit } from "@/components/Forms";

export const metadata = { title: "Log in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="wrap narrow stack-lg">
      <h1>Log in</h1>
      <div className="panel">
        <ActionForm action={signIn}>
          <input type="hidden" name="next" value={next ?? ""} />
          <div className="field">
            <label htmlFor="identifier">Email or username</label>
            <input id="identifier" name="identifier" className="input" autoComplete="username" required />
            <span className="hint">Parents use their email. Students use the username their parent made for them.</span>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
          </div>
          <div className="row">
            <Submit>Log in</Submit>
            <Link href="/reset-password">Forgotten your password?</Link>
          </div>
        </ActionForm>
      </div>
      <p>
        New here? <Link href="/signup">Create a parent account</Link>. Children&apos;s accounts are made by their parent.
      </p>
    </div>
  );
}
