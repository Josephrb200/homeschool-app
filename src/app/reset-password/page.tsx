import { requestPasswordReset } from "@/app/actions/auth";
import { ActionForm, Submit } from "@/components/Forms";

export const metadata = { title: "Reset password" };

export default function Reset() {
  return (
    <div className="wrap narrow stack-lg">
      <div className="stack">
        <h1>Reset your password</h1>
        <p className="muted">For parent accounts. If you&apos;re a student, ask your parent: they can set a new password for you from their dashboard.</p>
      </div>
      <div className="panel">
        <ActionForm action={requestPasswordReset}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" required />
          </div>
          <div>
            <Submit>Send reset link</Submit>
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
