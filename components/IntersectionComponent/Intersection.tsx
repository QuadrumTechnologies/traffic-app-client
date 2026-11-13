import React, { useEffect, useRef, useState } from "react";
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
import { useRealParams } from "@/hooks/useRealParams";

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

const DRAWING_WIDTH = 550;

const Background = styled.div<{ $backgroundImage: string }>`
  position: relative;
  width: ${DRAWING_WIDTH}px;
  height: 500px;
  flex: none;
  border: none;
  background-image: url(${({ $backgroundImage }) => $backgroundImage});
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 0 auto;

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

  // Scale the fixed-size drawing to the width of its column (never above 1),
  // so heads and lamps keep their places on every screen.
  const fitRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = fitRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || DRAWING_WIDTH;
      setZoom(Math.min(1, width / DRAWING_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const dispatch = useAppDispatch();
  const params = useRealParams(useParams<{ deviceId: string }>());

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
    <div ref={fitRef} className="qtDrawingFit">
    <Background $backgroundImage={backgroundImage} style={{ zoom }}>
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
    </div>
  );
};

export default IntersectionDisplay;
