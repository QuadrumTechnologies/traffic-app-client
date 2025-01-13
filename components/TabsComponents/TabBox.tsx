import BoxOne from "./BoxOne";
import BoxThree from "./BoxThree";
import BoxTwo from "./BoxTwo";

interface TabBoxProps {
  currentStep: number;
}
const TabBox: React.FC<TabBoxProps> = ({ currentStep }) => {
  return (
    <div>
      {currentStep === 1 && <BoxOne />}
      {currentStep === 2 && <BoxTwo />}
      {currentStep === 3 && <BoxThree />}
    </div>
  );
};
export default TabBox;
