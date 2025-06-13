import { useLogoutFunc } from "@/hooks/useLogout";
import { usePathname } from "next/navigation";

type LogoutModalProps = {
  onClose: () => void;
};

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose }) => {
  const url = usePathname();

  const pathToNavigateTo = url.includes("/admin") ? "/admin/login" : "/login";

  const logout = useLogoutFunc();

  return (
    <div className="logout">
      <p className="logout-text">Are you sure you want to logout?</p>

      <div className="logout-buttons">
        <button
          onClick={() => logout(pathToNavigateTo)}
          className="logout-buttons__button1"
        >
          Yes
        </button>
        <button onClick={onClose} className="logout-buttons__button2">
          No
        </button>
      </div>
    </div>
  );
};

export default LogoutModal;
