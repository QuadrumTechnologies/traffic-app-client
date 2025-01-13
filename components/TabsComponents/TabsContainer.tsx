"use client";
import { useState } from "react";
import Tabs from "./Tabs";
import TabBox from "./TabBox";

const TabsContainer = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const updateStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="tabs__container">
      <Tabs currentStep={currentStep} onChangeTab={updateStep} />
      <TabBox currentStep={currentStep} />
    </div>
  );
};
export default TabsContainer;
