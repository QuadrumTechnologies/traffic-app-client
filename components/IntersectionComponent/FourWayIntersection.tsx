"use client";

import React, { useEffect, useMemo, useState } from "react";
import IntersectionDisplay from "./Intersection";
import { useAppSelector } from "@/hooks/reduxHook";

const positions = {
  N: {
    1400: { top: 22.5, left: 35.2 },
    1300: { top: 23, left: 35.4 },
    1200: { top: 22, left: 38 },
    1100: { top: 22.5, left: 36.3 },
    1000: { top: 22.5, left: 41.2 },
    900: { top: 22, left: 43.5 },
    800: { top: 22, left: 42.8 },
    700: { top: 22, left: 41.5 },
    600: { top: 22, left: 39.8 },
    500: { top: 22, left: 39 },
    400: { top: 22, left: 36.3 },
    300: { top: 27, left: 35 },
  },
  E: {
    1400: { top: 36, left: 73.8 },
    1300: { top: 36.4, left: 73.5 },
    1200: { top: 36.4, left: 69.5 },
    1100: { top: 36, left: 72.2 },
    1000: { top: 36, left: 63.5 },
    900: { top: 36, left: 60.5 },
    800: { top: 36, left: 61.8 },
    700: { top: 36, left: 63.2 },
    600: { top: 36, left: 66 },
    500: { top: 36, left: 67.5 },
    400: { top: 36, left: 72 },
    300: { top: 39, left: 73.5 },
  },
  S: {
    1400: { top: 74, left: 49.7 },
    1300: { top: 74.5, left: 50.5 },
    1200: { top: 74.5, left: 50.5 },
    1100: { top: 73.5, left: 49.7 },
    1000: { top: 73.5, left: 49.7 },
    900: { top: 74, left: 50 },
    800: { top: 74, left: 50 },
    700: { top: 74, left: 50 },
    600: { top: 74, left: 50 },
    500: { top: 74, left: 50 },
    400: { top: 74, left: 50 },
    300: { top: 70, left: 50 },
  },
  W: {
    1400: { top: 50.3, left: 21.4 },
    1300: { top: 50.8, left: 21.7 },
    1200: { top: 50.8, left: 27 },
    1100: { top: 50.4, left: 24 },
    1000: { top: 50.4, left: 34 },
    900: { top: 50.5, left: 37.5 },
    800: { top: 50.5, left: 36 },
    700: { top: 50.5, left: 34.5 },
    600: { top: 50.5, left: 30.5 },
    500: { top: 50.5, left: 29.8 },
    400: { top: 50.5, left: 23.5 },
    300: { top: 50.5, left: 21 },
  },
};

const pedestrianPositions = {
  N: {
    1400: { first: { top: 23, left: -18 }, second: { top: 23, left: 147 } },
    1300: { first: { top: 23, left: -19 }, second: { top: 23, left: 159 } },
    1200: { first: { top: 23, left: -15 }, second: { top: 23, left: 130 } },
    1100: { first: { top: 22, left: -14 }, second: { top: 22, left: 130 } },
    1000: { first: { top: 22, left: -14 }, second: { top: 22, left: 130 } },
    900: { first: { top: 18, left: -15 }, second: { top: 18, left: 110 } },
    800: { first: { top: 18, left: -15 }, second: { top: 18, left: 110 } },
    700: { first: { top: 16, left: -10 }, second: { top: 16, left: 110 } },
    600: { first: { top: 16, left: -11 }, second: { top: 16, left: 108 } },
    500: { first: { top: 16, left: -13 }, second: { top: 16, left: 100 } },
    400: { first: { top: 18, left: -10 }, second: { top: 18, left: 100 } },
    300: { first: { top: 16, left: -9 }, second: { top: 16, left: 80 } },
  },
  E: {
    1400: { first: { top: -20, left: -25 }, second: { top: 145, left: -25 } },
    1300: { first: { top: -22, left: -25 }, second: { top: 158, left: -25 } },
    1200: { first: { top: -22, left: -25 }, second: { top: 125, left: -25 } },
    1100: { first: { top: -18, left: -23 }, second: { top: 125, left: -23 } },
    1000: { first: { top: -18, left: -23 }, second: { top: 125, left: -23 } },
    900: { first: { top: -16, left: -19 }, second: { top: 109, left: -19 } },
    800: { first: { top: -16, left: -19 }, second: { top: 109, left: -19 } },
    700: { first: { top: -14, left: -20 }, second: { top: 110, left: -20 } },
    600: { first: { top: -14, left: -20 }, second: { top: 115, left: -18 } },
    500: { first: { top: -14, left: -18 }, second: { top: 97, left: -18 } },
    400: { first: { top: -13, left: -14 }, second: { top: 95, left: -14 } },
    300: { first: { top: -12, left: -14 }, second: { top: 80, left: -14 } },
  },
  S: {
    1400: {
      first: { top: -25, left: -93.5 },
      second: { top: -25, left: 72.8 },
    },
    1300: { first: { top: -25, left: -99 }, second: { top: -25, left: 78 } },
    1200: { first: { top: -25, left: -80 }, second: { top: -25, left: 60 } },
    1100: { first: { top: -23, left: -80 }, second: { top: -23, left: 68 } },
    1000: { first: { top: -23, left: -80 }, second: { top: -23, left: 68 } },
    900: { first: { top: -20, left: -70 }, second: { top: -20, left: 56 } },
    800: { first: { top: -20, left: -70 }, second: { top: -20, left: 56 } },
    700: { first: { top: -19, left: -68 }, second: { top: -19, left: 55 } },
    600: { first: { top: -19, left: -67 }, second: { top: -19, left: 54 } },
    500: { first: { top: -19, left: -63 }, second: { top: -19, left: 48 } },
    400: { first: { top: -19, left: -62 }, second: { top: -19, left: 50 } },
    300: { first: { top: -15, left: -52 }, second: { top: -15, left: 40 } },
  },
  W: {
    1400: { first: { top: 70, left: 25 }, second: { top: -95, left: 25 } },
    1300: { first: { top: 75, left: 25 }, second: { top: -100, left: 25 } },
    1200: { first: { top: 62, left: 25 }, second: { top: -82, left: 25 } },
    1100: { first: { top: 62, left: 23 }, second: { top: -80, left: 23 } },
    1000: { first: { top: 62, left: 23 }, second: { top: -80, left: 23 } },
    900: { first: { top: 53, left: 21 }, second: { top: -71, left: 21 } },
    800: { first: { top: 53, left: 21 }, second: { top: -71, left: 21 } },
    700: { first: { top: 53, left: 20 }, second: { top: -70, left: 20 } },
    600: { first: { top: 51, left: 20 }, second: { top: -68, left: 20 } },
    500: { first: { top: 49, left: 20 }, second: { top: -63, left: 20 } },
    400: { first: { top: 48, left: 21 }, second: { top: -64, left: 21 } },
    300: { first: { top: 38, left: 19 }, second: { top: -50, left: 19 } },
  },
};

const breakpoints = [
  1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600, 500, 400, 300,
];

const getResponsiveValue = <T,>(
  direction: "N" | "E" | "S" | "W",
  values: Record<"N" | "E" | "S" | "W", Record<number, T>>,
  screenWidth: number | undefined
): T => {
  const closestBreakpoint =
    breakpoints.find(
      (bp) => screenWidth && screenWidth >= bp - 99 && screenWidth <= bp + 99
    ) || 1400;

  return values[direction][closestBreakpoint];
};

const getOrientation = (
  direction: "N" | "E" | "S" | "W"
): "vertical" | "horizontal" => {
  return direction === "N" || direction === "S" ? "vertical" : "horizontal";
};

const FourWayIntersection = ({ editable }: { editable: boolean }) => {
  const {
    signals: trafficSignals,
    createdPatternPhasePreviewing,
    manualMode,
    countDownColor,
  } = useAppSelector((state) => state.signalConfig);

  const [screenWidth, setScreenWidth] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const signalsArray = useMemo(
    () =>
      Object.keys(trafficSignals).map((direction) => {
        const signalState =
          trafficSignals[direction as keyof typeof trafficSignals];
        return {
          direction: direction as "N" | "E" | "S" | "W",
          ...signalState,
          position: getResponsiveValue(
            direction as "N" | "E" | "S" | "W",
            positions,
            screenWidth
          ),
          pedestrianPosition: getResponsiveValue(
            direction as "N" | "E" | "S" | "W",
            pedestrianPositions,
            screenWidth
          ),
          orientation: getOrientation(direction as "N" | "E" | "S" | "W"),
        };
      }),
    [trafficSignals, screenWidth]
  );

  return (
    <>
      <IntersectionDisplay
        initialSignals={signalsArray}
        backgroundImage="/images/cross.png"
        editable={editable}
        countDownColor={countDownColor}
        manualMode={manualMode}
        createdPatternPhasePreviewing={createdPatternPhasePreviewing}
      />
    </>
  );
};

export default FourWayIntersection;
