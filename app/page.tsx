import Image from "next/image";
import Link from "next/link";

const LandingPage = () => {
  return (
    <section
      className="landingPage"
      style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.45)), url("/images/tra.avif")`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100%",
      }}
    >
      <nav>
        <figure>
          <Image
            src="/images/logo.png"
            alt="Traffic App Logo"
            width={80}
            height={80}
          />
        </figure>
      </nav>
      <h1 className="landingPage-title">
        <span>Traffic</span> Monitoring System
      </h1>
      <p className="landingPage-text">
        Manage all your devices effectively, efficiently, and at ease!
      </p>
      <div className="landingPage-link">
        <Link className="landingPage-login" href="/login">
          Login
        </Link>
        <Link className="landingPage-signup" href="/signup">
          Get Started
        </Link>
      </div>
    </section>
  );
};
export default LandingPage;
