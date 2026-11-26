import { updatePassword } from "@/app/actions/auth";
import { ActionForm, Submit } from "@/components/Forms";
import { requireRole } from "@/lib/learner";

export const metadata = { title: "Choose a new password" };

export default async function UpdatePassword() {
  await requireRole("parent");
  return (
    <div className="wrap narrow stack-lg">
      <h1>Choose a new password</h1>
      <div className="panel">
        <ActionForm action={updatePassword}>
          <div className="field">
            <label htmlFor="password">New password</label>
            <input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={10} required />
            <span className="hint">At least 10 characters.</span>
          </div>
          <div>
            <Submit>Save password</Submit>
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
