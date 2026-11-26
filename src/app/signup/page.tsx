import Link from "next/link";
import { signUpParent } from "@/app/actions/auth";
import { ActionForm, Submit } from "@/components/Forms";

export const metadata = { title: "Create a parent account" };

export default function SignUp() {
  return (
    <div className="wrap narrow stack-lg">
      <div className="stack">
        <h1>Create a parent account</h1>
        <p className="muted">
          You create the account, then add your children from your dashboard. We only ask for what we need: your name and email, and each
          child&apos;s first name and a username.
        </p>
      </div>
      <div className="panel">
        <ActionForm action={signUpParent}>
          <div className="field">
            <label htmlFor="displayName">Your name</label>
            <input id="displayName" name="displayName" className="input" autoComplete="name" required maxLength={60} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={10} required />
            <span className="hint">At least 10 characters.</span>
          </div>
          <label className="row" style={{ alignItems: "flex-start", gap: 10 }}>
            <input type="checkbox" name="consent" className="switch" required />
            <span>
              I&apos;m the parent or guardian, and I&apos;ve read the <Link href="/privacy">privacy notice</Link>. I agree to my children&apos;s
              learning being recorded so it can be shown to them and to me.
            </span>
          </label>
          <div>
            <Submit>Create account</Submit>
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
