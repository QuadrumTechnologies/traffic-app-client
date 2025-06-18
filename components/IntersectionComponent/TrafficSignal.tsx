import { emitToastMessage } from "@/utils/toastFunc";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Signal } from "./Intersection";
import { checkForConflicts } from "@/utils/conflictChecker";
import { useAppSelector } from "@/hooks/reduxHook";

type Direction = "N" | "E" | "S" | "W";
type LightColor = "R" | "A" | "G" | "X";
type PedestrianLightColor = "R" | "G" | "X";

interface TrafficSignalProps {
  direction: Direction;
  left: LightColor;
  straight: LightColor;
  right: LightColor;
  bike: LightColor;
  pedestrian: PedestrianLightColor;
  position: { top: number; left: number };
  orientation: "horizontal" | "vertical";
  pedestrianPosition: {
    first: { top: number; left: number };
    second: { top: number; left: number };
  };
  editable: boolean;
  manualMode: boolean;
  onSignalClick: (
    direction: Direction,
    signalType: string,
    currentColor: LightColor
  ) => void;
  signals: Signal[];
}

const SignalWrapper = styled.div<{
  orientation: "horizontal" | "vertical";
  $position: { top: number; left: number };
}>`
  position: absolute;
  top: ${({ $position }) => `${$position.top}%`};
  left: ${({ $position }) => `${$position.left}%`};
  display: flex;
  flex-direction: ${({ orientation }) =>
    orientation === "horizontal" ? "row" : "column"};
  align-items: center;
  justify-content: center;
`;

const SignalLight = styled.div<{
  color: LightColor;
  $editable: boolean;
  $manualMode: boolean;
}>`
  width: 1.45rem;
  height: 1.45rem;
  background-color: ${({ color }) =>
    color === "R"
      ? "red"
      : color === "A"
      ? "orange"
      : color === "G"
      ? "green"
      : "rgb(83,92,91)"};
  margin: 1.7px;
  border-radius: 50%;
  cursor: ${({ $editable, $manualMode }) =>
    $editable || $manualMode ? "pointer" : "default"};
  @media screen and (max-width: 1300px) {
    margin: 1.5px;
  }
  @media screen and (max-width: 1100px) {
    margin: 1.5px;
    width: 1.6rem;
    height: 1.6rem;
  }
  @media screen and (max-width: 900px) {
    margin: 1.1px;
    width: 1.5rem;
    height: 1.5rem;
  }
  @media screen and (max-width: 600px) {
    margin: 1.3px;
    width: 1.3rem;
    height: 1.3rem;
  }
  @media screen and (max-width: 500px) {
    margin: 1.2px;
    width: 1.25rem;
    height: 1.25rem;
  }
  @media screen and (max-width: 400px) {
    margin: 1.6px;
    width: 1.2rem;
    height: 1.2rem;
  }
  @media screen and (max-width: 300px) {
    margin: 0.8px;
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const PedestrianSignalLight = styled.div<{
  orientation: "horizontal" | "vertical";
  color: PedestrianLightColor;
  $editable: boolean;
  $manualMode: boolean;
}>`
  width: 0.9rem;
  height: 0.9rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: "white";
  transform: ${({ orientation }) =>
    orientation === "horizontal" ? "rotate(0deg)" : "rotate(0deg)"};
  cursor: ${({ $editable, $manualMode }) =>
    $editable || $manualMode ? "pointer" : "default"};

  @media screen and (max-width: 1100px) {
    width: 1.2rem;
    height: 1.2rem;
  }
  @media screen and (max-width: 900px) {
    width: 0.9rem;
    height: 0.9rem;
  }
  @media screen and (max-width: 700px) {
    width: 0.85rem;
    height: 0.85rem;
  }
  @media screen and (max-width: 500px) {
    width: 0.8rem;
    height: 0.8rem;
  }
  @media screen and (max-width: 400px) {
    width: 0.7rem;
    height: 0.7rem;
    font-size: 0.8rem;
  }
`;

const SignalGroup = styled.div<{ orientation: "horizontal" | "vertical" }>`
  display: flex;
  flex-direction: ${({ orientation }) =>
    orientation === "horizontal" ? "column" : "row"};
  margin: 0 2px;
`;

const TrafficSignal: React.FC<TrafficSignalProps> = ({
  left,
  straight,
  right,
  bike,
  pedestrian,
  position,
  orientation,
  direction,
  pedestrianPosition,
  editable,
  manualMode,
  onSignalClick,
  signals,
}) => {
  const { allowConflictingConfig } = useAppSelector(
    (state) => state.signalConfig
  );
  const [signalColors, setSignalColors] = useState({
    left,
    straight,
    right,
    bike,
    pedestrian,
  });

  useEffect(() => {
    setSignalColors({
      left,
      straight,
      right,
      bike,
      pedestrian,
    });
  }, [left, straight, right, bike, pedestrian]);

  // Toggle only between Red and Green on click
  const handleSignalClick = (signalType: string) => {
    if (!editable && !manualMode) return;

    const currentColor = signalColors[signalType as keyof typeof signalColors];
    const newColor = currentColor === "R" ? "G" : "R";

    // Check for conflicts
    let conflicts: string[] = [];
    if (allowConflictingConfig === false) {
      conflicts = checkForConflicts(direction, signalType, newColor, signals);
    }

    if (conflicts.length > 0) {
      emitToastMessage(conflicts.join(" "), "error");
      return;
    }

    // No conflicts, update the signal color
    onSignalClick(direction, signalType, newColor);

    setSignalColors((prevColors) => ({
      ...prevColors,
      [signalType]: newColor,
    }));
  };

  return (
    <SignalWrapper orientation={orientation} $position={position}>
      <SignalGroup orientation={orientation}>
        {direction === "N" || direction === "E" ? (
          <>
            <div
              style={{
                position: "absolute",
                top: pedestrianPosition.first.top,
                left: pedestrianPosition.first.left,
                color: "white",
                backgroundColor:
                  pedestrian === "R"
                    ? "red"
                    : pedestrian === "G"
                    ? "green"
                    : "rgb(83,92,91)",
                padding: ".4rem",
                borderRadius: "50%",
              }}
            >
              <PedestrianSignalLight
                color={signalColors.pedestrian}
                orientation={orientation}
                $editable={editable}
                $manualMode={manualMode}
                onClick={() => handleSignalClick("pedestrian")}
              >
                {/* <ImManWoman fontSize={20} /> */}
                {direction}
              </PedestrianSignalLight>
            </div>
            <div
              style={{
                position: "absolute",
                top: pedestrianPosition.second.top,
                left: pedestrianPosition.second.left,
                color: "white",
                backgroundColor:
                  pedestrian === "R"
                    ? "red"
                    : pedestrian === "G"
                    ? "green"
                    : "rgb(83,92,91)",
                padding: ".4rem",
                borderRadius: "50%",
              }}
            >
              <PedestrianSignalLight
                color={signalColors.pedestrian}
                orientation={orientation}
                $editable={editable}
                $manualMode={manualMode}
                onClick={() => handleSignalClick("pedestrian")}
              >
                {/* <ImManWoman fontSize={20} /> */}
                {direction}
              </PedestrianSignalLight>
            </div>
            <SignalLight
              color={signalColors.bike}
              $editable={editable}
              $manualMode={manualMode}
              onClick={() => handleSignalClick("bike")}
            />
            <SignalLight
              color={signalColors.right}
              $manualMode={manualMode}
              $editable={editable}
              onClick={() => handleSignalClick("right")}
            />
            <SignalLight
              color={signalColors.straight}
              $manualMode={manualMode}
              $editable={editable}
              onClick={() => handleSignalClick("straight")}
            />
            <SignalLight
              color={signalColors.left}
              $manualMode={manualMode}
              $editable={editable}
              onClick={() => handleSignalClick("left")}
            />
          </>
        ) : (
          <>
            <SignalLight
              color={signalColors.left}
              $manualMode={manualMode}
              $editable={editable}
              onClick={() => handleSignalClick("left")}
            />
            <SignalLight
              color={signalColors.straight}
              $manualMode={manualMode}
              $editable={editable}
              onClick={() => handleSignalClick("straight")}
            />
            <SignalLight
              color={signalColors.right}
              $manualMode={manualMode}
              $editable={editable}
              onClick={() => handleSignalClick("right")}
            />
            <SignalLight
              color={signalColors.bike}
              $manualMode={manualMode}
              $editable={editable}
              onClick={() => handleSignalClick("bike")}
            />
            <div
              style={{
                position: "absolute",
                top: pedestrianPosition.first.top,
                left: pedestrianPosition.first.left,
                color: "white",
                backgroundColor:
                  pedestrian === "R"
                    ? "red"
                    : pedestrian === "G"
                    ? "green"
                    : "rgb(83,92,91)",
                padding: ".4rem",
                borderRadius: "50%",
              }}
            >
              <PedestrianSignalLight
                color={signalColors.pedestrian}
                orientation={orientation}
                $manualMode={manualMode}
                $editable={editable}
                onClick={() => handleSignalClick("pedestrian")}
              >
                {/* <ImManWoman size={20} /> */}
                {direction}
              </PedestrianSignalLight>
            </div>
            <div
              style={{
                position: "absolute",
                top: pedestrianPosition.second.top,
                left: pedestrianPosition.second.left,
                color: "white",
                backgroundColor:
                  pedestrian === "R"
                    ? "red"
                    : pedestrian === "G"
                    ? "green"
                    : "rgb(83,92,91)",
                padding: ".4rem",
                borderRadius: "50%",
              }}
            >
              <PedestrianSignalLight
                color={signalColors.pedestrian}
                orientation={orientation}
                $manualMode={manualMode}
                $editable={editable}
                onClick={() => handleSignalClick("pedestrian")}
              >
                {/* <ImManWoman size={20} /> */}
                {direction}
              </PedestrianSignalLight>
            </div>
          </>
        )}
      </SignalGroup>
    </SignalWrapper>
  );
};

export default TrafficSignal;
