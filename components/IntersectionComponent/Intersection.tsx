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
import { useAppDispatch } from "@/hooks/reduxHook";
import {
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
  @media screen and (max-width: 500px) {
    width: 450px;
  }
  @media screen and (max-width: 400px) {
    width: 330px;
  }
  @media screen and (max-width: 300px) {
    width: 100%;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1px);
  z-index: 1000;
  pointer-events: auto;
`;

const PhaseContainer = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20%;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  z-index: 1001;
  pointer-events: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PhaseNameInput = styled.input`
  padding: 0.5rem;
  border: 0.1rem solid #ccc;
  border-radius: 0.4rem;
  font-size: 1.4rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #514604;
  }

  &:hover {
    border-color: #2a2a29;
  }
`;

const AddPhaseButton = styled.button<{ disabled: boolean }>`
  padding: 0.8rem 1rem;
  background-color: ${({ disabled }) => (disabled ? "#cccccc" : "#514604")};
  color: white;
  border: none;
  border-radius: 0.4rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: 1.4rem;
  width: 100%;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background-color: #2a2a29;
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
    left: 47%;
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
    top: 43.3%;
    left: 45%;
  }
  @media screen and (max-width: 900px) {
    top: 42.9%;
    left: 47%;
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

const IntersectionDisplay: React.FC<IntersectionDisplayProps> = ({
  initialSignals,
  backgroundImage,
  editable,
  manualMode,
  countDownColor,
  createdPatternPhasePreviewing,
}) => {
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [showInputModal, setShowInputModal] = useState<boolean>(false);
  const [isCreatingPhase, setIsCreatingPhase] = useState<boolean>(false);
  const [phaseName, setPhaseName] = useState<string>("");
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

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseName) {
      alert("Please enter a name for the phase.");
      return;
    }
    setIsCreatingPhase(true);
    const user = GetItemFromLocalStorage("user");

    const getAdjacentPedestrianSignal = (
      signals: Signal[],
      direction: "N" | "E" | "S" | "W"
    ): "R" | "G" | "X" => {
      let adjacentDirection: "N" | "E" | "S" | "W";
      switch (direction) {
        case "S":
          adjacentDirection = "E";
          break;
        case "E":
          adjacentDirection = "N";
          break;
        case "N":
          adjacentDirection = "W";
          break;
        case "W":
          adjacentDirection = "S";
          break;
        default:
          adjacentDirection = "N";
      }
      const adjacentSignal = signals.find(
        (signal) => signal.direction === adjacentDirection
      );
      return adjacentSignal ? adjacentSignal.pedestrian : "X";
    };

    try {
      const encodeSignals = () => {
        return (
          "*" +
          signals
            .map((signal) => {
              const adjacentPedestrian = getAdjacentPedestrianSignal(
                signals,
                signal.direction
              );
              return `${signal.direction}${signal.left}${signal.straight}${signal.right}${signal.bike}${signal.pedestrian}${adjacentPedestrian}`;
            })
            .join("") +
          "#"
        );
      };
      const encodedSignals = encodeSignals();
      const { data } = await HttpRequest.post("/phases", {
        email: user.email,
        phaseName,
        phaseData: encodedSignals,
        deviceId: params.deviceId,
      });
      dispatch(getUserPhase(user.email));
      emitToastMessage(data.message, "success");
      setIsCreatingPhase(false);
      setPhaseName("");
      setShowInputModal(false);
    } catch (error: any) {
      console.error("Error adding phase:", error);
      emitToastMessage(error?.response.data.message, "error");
      setIsCreatingPhase(false);
    }
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
          onClick={() => setShowInputModal((prev) => !prev)}
        >
          {!showInputModal ? (
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
      {showInputModal && (
        <ModalBackdrop onClick={() => setShowInputModal(false)}>
          <PhaseContainer
            onSubmit={handleAddPhase}
            onClick={(e) => e.stopPropagation()}
          >
            <PhaseNameInput
              type="text"
              placeholder="Enter phase name"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              autoFocus={true}
            />
            <AddPhaseButton type="submit" disabled={isCreatingPhase}>
              {isCreatingPhase ? "Creating..." : "Create"}
            </AddPhaseButton>
          </PhaseContainer>
        </ModalBackdrop>
      )}
    </Background>
  );
};

export default IntersectionDisplay;
