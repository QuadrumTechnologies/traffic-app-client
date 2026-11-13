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
      <p className="logout-text">Sign out of the Traffic Monitoring System?</p>

      <div className="logout-buttons">
        <button
          onClick={() => logout(pathToNavigateTo)}
          className="logout-buttons__button1"
        >
          Sign out
        </button>
        <button onClick={onClose} className="logout-buttons__button2">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LogoutModal;
