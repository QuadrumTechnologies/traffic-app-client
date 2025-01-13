interface TabsProps {
  currentStep: number;
  onChangeTab: (step: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ currentStep, onChangeTab }) => {
  const tabs = [
    { step: 1, value: "Phases" },
    { step: 2, value: "Patterns" },
    { step: 3, value: "Time Segments" },
  ];

  return (
    <ul className="tabs__list">
      {tabs.map((tab) => (
        <li
          className={`tabs__item ${
            currentStep === tab.step && "tabs__item--active"
          }`}
          key={tab.step}
          onClick={() => onChangeTab(tab.step)}
        >
          {tab.value}
        </li>
      ))}
    </ul>
  );
};
export default Tabs;
