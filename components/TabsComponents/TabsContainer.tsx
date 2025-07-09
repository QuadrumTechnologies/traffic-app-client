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

  // Initialize currentStep
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["1", "2", "3"].includes(tab)) {
      // Valid tab in URL, set currentStep to it
      setCurrentStep(parseInt(tab));
    } else {
      // No valid tab in URL, set currentStep to 1 and update URL
      setCurrentStep(1);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("tab", "1");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  }, [searchParams, router, pathname]);

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
