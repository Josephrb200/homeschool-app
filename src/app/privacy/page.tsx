export const metadata = { title: "Privacy" };

/* DRAFT: needs review by someone qualified in UK data protection before launch. */
export default function Privacy() {
  return (
    <div className="wrap narrow stack-lg">
      <div className="stack">
        <h1>Privacy, in plain English</h1>
        <p className="badge badge-draft" style={{ width: "fit-content" }}>Draft: being reviewed before launch</p>
      </div>
      <section className="panel stack">
        <h2>What we collect</h2>
        <ul style={{ margin: 0 }}>
          <li>Parent: your name, email and password (stored scrambled, never readable).</li>
          <li>Child: a first name, a username and a password chosen by you.</li>
          <li>Learning: each answer your child gives, whether it was right, whether a hint was used, and when.</li>
          <li>Settings: font, colours and similar choices.</li>
        </ul>
        <p>We don&apos;t ask for dates of birth, schools, addresses, photos, or any diagnosis or medical information.</p>
      </section>
      <section className="panel stack">
        <h2>Why</h2>
        <p>Only to teach your child, show them their progress, and show you how they are getting on. We don&apos;t sell data, show adverts, or use children&apos;s data for marketing.</p>
      </section>
      <section className="panel stack">
        <h2>Where it&apos;s kept and who can see it</h2>
        <p>Data is stored in a UK data centre (London). Your child can see their own learning. You can see your own children&apos;s learning. No other family can see anything about you.</p>
      </section>
      <section className="panel stack">
        <h2>Your choices</h2>
        <p>From your dashboard you can download everything we hold about your child, or delete their account and all their data straight away.</p>
      </section>
      <section className="panel stack">
        <h2>For students</h2>
        <p>We keep a record of your answers so we can work out what to teach you next. Your parent can see it too. Nobody else can.</p>
      </section>
    </div>
  );
}
