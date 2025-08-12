import { MdOutlineClose } from "react-icons/md";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { useAppDispatch } from "@/hooks/reduxHook";

interface ConfigurePatternModalProps {
  closeModal: () => void;
  pattern: any;
}

const ConfigurePatternModal: React.FC<ConfigurePatternModalProps> = ({
  closeModal,
  pattern,
}) => {
  const dispatch = useAppDispatch();
  const user = GetItemFromLocalStorage("user");

  return (
    <div className="addDeviceOverlay">
      <div className="" onClick={closeModal}>
        <MdOutlineClose className="addDeviceOverlay-icon" />
      </div>
      <h3>Configure {pattern?.name} Pattern</h3>
      <ul className="addDeviceOverlay__device--options">
        {pattern?.phases.map((opt: any, index: number) => (
          <li key={index}>{opt.name}</li>
        ))}
      </ul>
    </div>
  );
};
export default ConfigurePatternModal;
