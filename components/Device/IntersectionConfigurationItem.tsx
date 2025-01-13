import { IntersectionConfigItem } from "@/app/dashboard/devices/[deviceId]/page";

interface IntersectionConfigItemProps {
  item: IntersectionConfigItem;
}

const IntersectionConfigurationItem: React.FC<IntersectionConfigItemProps> = ({
  item,
}) => {
  return (
    <li className="intersectionConfiguration__item">
      <label
        className="intersectionConfiguration__item--label"
        htmlFor={item.label}
      >
        {item.label}
      </label>
      <input
        className="intersectionConfiguration__item--value"
        name={item.label}
        type="text"
        placeholder={item.value}
        readOnly
      />
    </li>
  );
};

export default IntersectionConfigurationItem;
