import { DeviceConfigItem } from "@/app/dashboard/devices/[deviceId]/page";
import { FaTemperatureHalf } from "react-icons/fa6";
import { IoMdCalendar, IoMdClock } from "react-icons/io";
import { MdBatteryFull, MdOutlineWifiProtectedSetup } from "react-icons/md";

interface DeviceConfigItemProps {
  item: DeviceConfigItem;
}

const DeviceConfigurationItem: React.FC<DeviceConfigItemProps> = ({ item }) => {
  let Icon = null;
  switch (item.iconName) {
    case "calendar":
      Icon = <IoMdCalendar />;
      break;
    case "battery-charging":
      Icon = <MdBatteryFull />;
      break;
    case "wifi":
      Icon = <MdOutlineWifiProtectedSetup />;
      break;
    case "clock":
      Icon = <IoMdClock />;
      break;
    case "temp":
      Icon = <FaTemperatureHalf />;
      break;
    default:
      break;
  }
  return (
    <li className="deviceConfiguration__item">
      <p className="deviceConfiguration__item--icon">{Icon}</p>
      <p className="deviceConfiguration__item--label">{item.label}</p>
      <p className="deviceConfiguration__item--value">{item.value}</p>
    </li>
  );
};

export default DeviceConfigurationItem;
