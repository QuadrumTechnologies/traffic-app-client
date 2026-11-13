import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OverlayModal from "../Modals/OverlayModal";
import LogoutModal from "../Modals/LogoutModal";
import { FiLogOut } from "react-icons/fi";
import { getItemFromCookie } from "@/utils/cookiesFunc";

const Navigation = () => {
  const router = useRouter();
  const [showLogoutVerificationModal, setShowLogoutVerificationModal] =
    useState<boolean>(false);
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
    // Get Logged in user details from cookies for
    const userToken = getItemFromCookie("token");
    const adminToken = getItemFromCookie("adminToken");

    setIsLoggedIn(!!(userToken || adminToken));
  }, []);

  return (
    <nav className="navigation">
      <div
        className="qtBrand"
        style={{ cursor: "pointer" }}
        onClick={() =>
          router.push(
            typeof window !== "undefined" &&
              window.location.pathname.startsWith("/admin")
              ? "/admin/dashboard/devices"
              : "/dashboard/devices"
          )
        }
      >
        <Image
          src="/images/logo-light.png"
          alt=""
          width={isSmallScreen ? 36 : 44}
          height={isSmallScreen ? 34 : 41}
          style={{ objectFit: "contain" }}
        />
        <span>
          Traffic Monitoring System
          {!isSmallScreen && <small>Quadrum Technologies</small>}
        </span>
      </div>

      {isLoggedIn && (
        <div>
          <button
            type="button"
            className="navigation-logout"
            onClick={() => setShowLogoutVerificationModal(true)}
            aria-label="Sign out"
          >
            <FiLogOut className="icon" aria-hidden="true" />
            <span className="navigation-logout__label">Sign out</span>
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
