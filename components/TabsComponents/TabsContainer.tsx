"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Tabs from "./Tabs";
import TabBox from "./TabBox";

const TabsContainer = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Initialize currentStep from URL query parameter on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTab = tab && ["1", "2", "3"].includes(tab) ? parseInt(tab) : 1;
    setCurrentStep(validTab);
  }, [searchParams]);

  // Update URL when currentStep changes
  const updateStep = (step: number) => {
    setCurrentStep(step);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("tab", step.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className="tabs__container">
      <Tabs currentStep={currentStep} onChangeTab={updateStep} />
      <TabBox currentStep={currentStep} />
    </div>
  );
};

export default TabsContainer;
