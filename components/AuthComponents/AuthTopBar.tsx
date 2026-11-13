import Link from "next/link";

// Top of the sign-in, sign-up and request pages: a way home to the company
// site, and the page's next step (Sign in, Create account…). On phones the
// photo panel sits below the form, so the bar also carries the logo.

export const HOME_URL = "https://quadrumtechnologies.com";

export default function AuthTopBar({ link }: { link?: { href: string; label: string } }) {
  return (
    <nav className="loginScreen__bar" aria-label="Quadrum Technologies">
      <a className="loginScreen__barBrand" href={HOME_URL}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="" width={30} height={28} />
        <span className="loginScreen__barName">Quadrum Technologies</span>
        <span className="loginScreen__barHome">&larr; Home</span>
      </a>
      {link ? (
        <Link className="loginScreen__barLink" href={link.href}>
          {link.label}
        </Link>
      ) : null}
    </nav>
  );
}
