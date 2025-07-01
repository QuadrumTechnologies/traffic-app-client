import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TrafficSignal from "./TrafficSignal";
import { IoMdAddCircle } from "react-icons/io";
import { motion } from "framer-motion";
import HttpRequest from "@/store/services/HttpRequest";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import { MdCancel } from "react-icons/md";
import { getUserPhase } from "@/store/devices/UserDeviceSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import {
  setInputModal,
  setLandingPageInitialSignals,
  setLandingPageSignals,
  SignalState,
} from "@/store/signals/SignalConfigSlice";
import { useParams } from "next/navigation";

export interface Signal extends SignalState {
  direction: "N" | "E" | "S" | "W";
  position: { top: number; left: number };
  pedestrianPosition: {
    first: { top: number; left: number };
    second: { top: number; left: number };
  };
  orientation: "horizontal" | "vertical";
}
interface IntersectionDisplayProps {
  initialSignals: Signal[];
  backgroundImage: string;
  editable: boolean;
  createdPatternPhasePreviewing: {
    duration: number | null;
    showDuration: boolean;
  };
  manualMode: boolean;
  countDownColor: "red" | "green" | "yellow";
}

const Background = styled.div<{ $backgroundImage: string }>`
  position: relative;
  width: 550px;
  height: 50em;
  border: none;
  background-image: url(${({ $backgroundImage }) => $backgroundImage});
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 0 auto;

  @media screen and (max-width: 1300px) {
    height: 55em;
  }
  @media screen and (max-width: 900px) {
    height: 50em;
  }
  @media screen and (max-width: 600px) {
    width: 500px;
  }
  @media screen and (max-width: 500px) {
    width: 420px;
  }
  @media screen and (max-width: 450px) {
    width: 380px;
  }
  @media screen and (max-width: 400px) {
    width: 330px;
  }
  @media screen and (max-width: 350px) {
    width: 300px;
  }
  @media screen and (max-width: 300px) {
    width: 100%;
  }
`;

const AddPhaseIcon = styled(motion.div)`
  position: absolute;
  top: 44.4%;
  left: 45.8%;
  background-color: rgb(83, 92, 91);
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 1rem;
  @media screen and (max-width: 1300px) {
    top: 44.6%;
    left: 45.5%;
  }
  @media screen and (max-width: 1200px) {
    top: 43.5%;
    left: 45.3%;
  }
  @media screen and (max-width: 1100px) {
    top: 43.3%;
    left: 45%;
  }
  @media screen and (max-width: 900px) {
    top: 42.9%;
    left: 46%;
  }
  @media screen and (max-width: 500px) {
    top: 43%;
    left: 45%;
  }
  @media screen and (max-width: 400px) {
    top: 42%;
    left: 44%;
  }
  @media screen and (max-width: 300px) {
    top: 42%;
    left: 43%;
  }
`;

const DurationDisplay = styled.div<{
  $countDownColor: "red" | "green" | "yellow";
}>`
  position: absolute;
  top: 44.4%;
  left: 45.8%;
  background-color: ${({ $countDownColor }) =>
    $countDownColor === "red" ||
    $countDownColor === "green" ||
    $countDownColor === "yellow"
      ? "white"
      : "rgb(83, 92, 91)"};
  font-weight: bolder;
  color: ${({ $countDownColor }) =>
    $countDownColor === "red"
      ? "red"
      : $countDownColor === "green"
      ? "green"
      : "rgb(207, 193, 6)"};
  width: 5.2rem;
  height: 5.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: 2rem;
  @media screen and (max-width: 1300px) {
    top: 44.6%;
    left: 45.5%;
  }
  @media screen and (max-width: 1200px) {
    top: 43.5%;
    left: 45.3%;
  }
  @media screen and (max-width: 1100px) {
    top: 44.5%;
    left: 46%;
    width: 5.4rem;
    height: 5.4rem;
  }
  @media screen and (max-width: 900px) {
    top: 44%;
    left: 46.5%;
  }
  @media screen and (max-width: 700px) {
    top: 44%;
    left: 46.5%;
  }
  @media screen and (max-width: 500px) {
    top: 44%;
    left: 46%;
  }
  @media screen and (max-width: 400px) {
    top: 45%;
    left: 45%;
  }
  @media screen and (max-width: 300px) {
    top: 44%;
    left: 45%;
  }
`;

const IntersectionDisplay: React.FC<IntersectionDisplayProps> = ({
  initialSignals,
  backgroundImage,
  editable,
  manualMode,
  countDownColor,
  createdPatternPhasePreviewing,
}) => {
  const { openInputModal } = useAppSelector((state) => state.signalConfig);

  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const dispatch = useAppDispatch();
  const params = useParams<{ deviceId: string }>();

  useEffect(() => {
    setSignals(initialSignals);
    dispatch(setLandingPageInitialSignals(initialSignals));
  }, [initialSignals]);

  const handleSignalClick = (
    direction: "N" | "E" | "S" | "W",
    signalType: string,
    color: "R" | "A" | "G" | "X"
  ) => {
    setSignals((prevSignals) =>
      prevSignals.map((signal) =>
        signal.direction === direction
          ? {
              ...signal,
              [signalType]: color,
            }
          : signal
      )
    );
    dispatch(setLandingPageSignals({ direction, signalType, color }));
  };

  return (
    <Background $backgroundImage={backgroundImage}>
      {signals.map((signal) => (
        <TrafficSignal
          key={signal.direction}
          {...signal}
          editable={editable}
          manualMode={manualMode}
          onSignalClick={(direction, signalType, color) =>
            handleSignalClick(direction, signalType, color)
          }
          signals={signals}
        />
      ))}
      {editable && !createdPatternPhasePreviewing.showDuration && (
        <AddPhaseIcon
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onClick={() => dispatch(setInputModal(true))}
        >
          {!openInputModal ? (
            <IoMdAddCircle size={56} />
          ) : (
            <MdCancel size={56} />
          )}
        </AddPhaseIcon>
      )}
      {createdPatternPhasePreviewing.showDuration &&
        createdPatternPhasePreviewing.duration !== null && (
          <DurationDisplay $countDownColor={countDownColor}>
            {createdPatternPhasePreviewing.duration}s
          </DurationDisplay>
        )}
    </Background>
  );
};

export default IntersectionDisplay;
