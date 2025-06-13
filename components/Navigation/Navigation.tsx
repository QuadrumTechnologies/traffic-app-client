import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OverlayModal from "../Modals/OverlayModal";
import LogoutModal from "../Modals/LogoutModal";
import { GiExitDoor } from "react-icons/gi";
import { getItemFromCookie } from "@/utils/cookiesFunc";

const Navigation = () => {
  const router = useRouter();
  const [showLogoutVerificationModal, setShowLogoutVerificationModal] =
    useState<boolean>(false);
  const [showLogoutText, setShowLogoutText] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 700);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Get Logged in user details from cookies
    const userToken = getItemFromCookie("token");
    const adminToken = getItemFromCookie("adminToken");

    setIsLoggedIn(!!(userToken || adminToken));
  }, []);

  return (
    <nav className="navigation">
      <figure
        style={{
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => router.push("/dashboard")}
      >
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={isSmallScreen ? 40 : 60}
          height={isSmallScreen ? 40 : 60}
          style={{ objectFit: "cover" }}
        />
      </figure>

      {isLoggedIn && (
        <div>
          <button
            type="button"
            className="navigation-logout"
            onClick={() => setShowLogoutVerificationModal(true)}
            onMouseEnter={() => setShowLogoutText(true)}
            onMouseLeave={() => setShowLogoutText(false)}
          >
            <GiExitDoor className="icon" />
            {showLogoutText && <p className="navigation-title">Logout</p>}
          </button>
        </div>
      )}

      {showLogoutVerificationModal && (
        <OverlayModal onClose={() => setShowLogoutVerificationModal(false)}>
          <LogoutModal
            onClose={() => setShowLogoutVerificationModal(false)}
          ></LogoutModal>
        </OverlayModal>
      )}
    </nav>
  );
};

export default Navigation;
