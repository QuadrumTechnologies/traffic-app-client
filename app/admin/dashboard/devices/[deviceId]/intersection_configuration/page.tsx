"use client";

import { useEffect } from "react";
import FourWayIntersection from "@/components/IntersectionComponent/FourWayIntersection";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import { setSignalState } from "@/store/signals/SignalConfigSlice";
import TabsContainer from "@/components/TabsComponents/TabsContainer";

interface IntersectionConfigurationPageProps {
  params: any;
}

const IntersectionConfigurationPage: React.FC<
  IntersectionConfigurationPageProps
> = ({ params }) => {
  const dispatch = useAppDispatch();
  const { signalString, isIntersectionConfigurable } = useAppSelector(
    (state) => state.signalConfig
  );
  const { currentDeviceInfoData } = useAppSelector((state) => state.userDevice);

  useEffect(() => {
    dispatch(setSignalState());
  }, [dispatch, signalString]);

  return (
    <section className="intersectionConfigPage">
      <h2 className="intersectionConfigPage__header">
        {currentDeviceInfoData?.JunctionId}
      </h2>
      <div className="intersectionConfigPage__box">
        <div className="intersectionConfigPage__box--left">
          <FourWayIntersection editable={isIntersectionConfigurable} />
        </div>
        <div className="intersectionConfigPage__box--right">
          <TabsContainer />
        </div>
      </div>
    </section>
  );
};

export default IntersectionConfigurationPage;
