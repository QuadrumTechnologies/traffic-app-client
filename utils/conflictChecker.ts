import { Signal } from "@/components/IntersectionComponent/Intersection";

export const checkForConflicts = (
  direction: "N" | "E" | "S" | "W",
  signalType: string,
  newColor: "R" | "A" | "G",
  signals: Signal[]
): string[] => {
  console.log("Checking for conflicts");
  const conflicts: string[] = [];

  // Map to get opposite direction
  const oppositeDirection: {
    [key in "N" | "E" | "S" | "W"]: "N" | "E" | "S" | "W";
  } = {
    N: "S",
    E: "W",
    S: "N",
    W: "E",
  };

  // Get the current signal state for each direction
  const northSignal = signals.find((signal) => signal.direction === "N");
  const southSignal = signals.find((signal) => signal.direction === "S");
  const eastSignal = signals.find((signal) => signal.direction === "E");
  const westSignal = signals.find((signal) => signal.direction === "W");

  // Helper function to add conflicts
  const addConflict = (message: string) => conflicts.push(message);

  ////////////////////////////////////////////
  // Lefts conflicts
  if (signalType === "left" && newColor === "G") {
    if (northSignal?.straight === "G") {
      if (direction === "S") {
        addConflict("South left conflicts with North straight movements.");
      }
      if (direction === "E") {
        addConflict("East left conflicts with North straight movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with North straight movements.");
      }
    }
    if (southSignal?.straight === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with South straight movements.");
      }
      if (direction === "E") {
        addConflict("East left conflicts with South straight movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with South straight movements.");
      }
    }
    if (eastSignal?.straight === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with East straight movements.");
      }
      if (direction === "S") {
        addConflict("South left conflicts with East straight movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with East straight movements.");
      }
    }

    if (westSignal?.straight === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with West straight movements.");
      }
      if (direction === "S") {
        addConflict("South left conflicts with West straight movements.");
      }
      if (direction === "E") {
        addConflict("East left conflicts with West straight movements.");
      }
    }
    if (northSignal?.bike === "G") {
      if (direction === "S") {
        addConflict("South left conflicts with North bicycle movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with North bicycle movements.");
      }
    }
    if (southSignal?.bike === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with South bicycle movements.");
      }
      if (direction === "E") {
        addConflict("East left conflicts with South bicycle movements.");
      }
    }
    if (eastSignal?.bike === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with East bicycle movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with East bicycle movements.");
      }
    }
    if (westSignal?.bike === "G") {
      if (direction === "E") {
        addConflict("East left conflicts with West bicycle movements.");
      }
      if (direction === "S") {
        addConflict("South left conflicts with West bicycle movements.");
      }
    }
    if (northSignal?.left === "G") {
      if (direction === "E") {
        addConflict("East left conflicts with North left movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with North left movements.");
      }
    }
    if (southSignal?.left === "G") {
      if (direction === "E") {
        addConflict("East left conflicts with South left movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with South left movements.");
      }
    }
    if (eastSignal?.left === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with East left movements.");
      }
      if (direction === "S") {
        addConflict("South left conflicts with East left movements.");
      }
    }
    if (westSignal?.left === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with West left movements.");
      }
      if (direction === "S") {
        addConflict("South left conflicts with West left movements.");
      }
    }
    if (northSignal?.pedestrian === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with North pedestrian movements.");
      }
      if (direction === "W") {
        addConflict("West left conflicts with North pedestrian movements.");
      }
    }
    if (southSignal?.pedestrian === "G") {
      if (direction === "S") {
        addConflict("South left conflicts with South pedestrian movements.");
      }
      if (direction === "E") {
        addConflict("East left conflicts with South pedestrian movements.");
      }
    }
    if (eastSignal?.pedestrian === "G") {
      if (direction === "N") {
        addConflict("North left conflicts with East pedestrian movements.");
      }
      if (direction === "E") {
        addConflict("East left conflicts with East pedestrian movements.");
      }
    }
    if (westSignal?.pedestrian === "G") {
      if (direction === "W") {
        addConflict("West left conflicts with West pedestrian movements.");
      }
      if (direction === "S") {
        addConflict("South left conflicts with West pedestrian movements.");
      }
    }

    if (northSignal?.right === "G") {
      if (direction === "S") {
        const isNLAllowedWithSR = confirm(
          "Do you want to allow continuous left turn on the South road with North right active?"
        );
        if (!isNLAllowedWithSR) {
          addConflict("South left conflicts with North right movements.");
        }
      }
    }
    if (southSignal?.right === "G") {
      if (direction === "N") {
        const isNLAllowedWithSR = confirm(
          "Do you want to allow continuous right turn on the North road with South right active?"
        );
        if (!isNLAllowedWithSR) {
          addConflict("North left conflicts with South right movements.");
        }
      }
    }
    if (eastSignal?.right === "G") {
      if (direction === "W") {
        const isWLAllowedWithER = confirm(
          "Do you want to allow continuous right turn on the West road with East right active?"
        );
        if (!isWLAllowedWithER) {
          addConflict("West left conflicts with East right movements.");
        }
      }
    }
    if (westSignal?.right === "G") {
      if (direction === "E") {
        const isELAllowedWithWR = confirm(
          "Do you want to allow continuous right turn on the East road with West right active?"
        );
        if (!isELAllowedWithWR) {
          addConflict("East left conflicts with West right movements.");
        }
      }
    }
  }

  ////////////////////////////////////////////
  // Right conflicts
  if (signalType === "right" && newColor === "G") {
    if (northSignal?.left === "G") {
      if (direction === "S") {
        const isSRAllowedWithSL = confirm(
          "Do you want to allow continuous right turn on the South road with North left active?"
        );
        if (!isSRAllowedWithSL) {
          addConflict("South right conflicts with North left movements.");
        }
      }
    }
    if (southSignal?.left === "G") {
      if (direction === "N") {
        const isNRAllowedWithSL = confirm(
          "Do you want to allow continuous right turn on the North road with South left active?"
        );
        if (!isNRAllowedWithSL) {
          addConflict("North right conflicts with South left movements.");
        }
      }
    }
    if (eastSignal?.left === "G") {
      if (direction === "W") {
        const isWRAllowedWithSL = confirm(
          "Do you want to allow continuous right turn on the West road with East left active?"
        );
        if (!isWRAllowedWithSL) {
          addConflict("West right conflicts with East left movements.");
        }
      }
    }
    if (westSignal?.left === "G") {
      if (direction === "E") {
        const isERAllowedWithSL = confirm(
          "Do you want to allow continuous right turn on the East road with West left active?"
        );
        if (!isERAllowedWithSL) {
          addConflict("East right conflicts with West left movements.");
        }
      }
    }
    if (northSignal?.pedestrian === "G") {
      if (direction === "E") {
        const isERAllowedWithNP = confirm(
          "Do you want to allow continuous right turn on the East road with North pedestrian active?"
        );
        if (!isERAllowedWithNP) {
          addConflict("East right conflicts with North pedestrian movements.");
        }
      }
      if (direction === "N") {
        addConflict("North right conflicts with North pedestrian movements.");
      }
    }
    if (southSignal?.pedestrian === "G") {
      if (direction === "W") {
        const isERAllowedWithSP = confirm(
          "Do you want to allow continuous right turn on the West road with South pedestrian active?"
        );
        if (!isERAllowedWithSP) {
          addConflict("West right conflicts with South pedestrian movements.");
        }
      }
      if (direction === "S") {
        addConflict("South right conflicts with South pedestrian movements.");
      }
    }
    if (eastSignal?.pedestrian === "G") {
      if (direction === "S") {
        const isSRAllowedWithEP = confirm(
          "Do you want to allow continuous right turn on the Soutn road with East pedestrian active?"
        );
        if (!isSRAllowedWithEP) {
          addConflict("South right conflicts with East pedestrian movements.");
        }
      }
      if (direction === "E") {
        addConflict("East right conflicts with East pedestrian movements.");
      }
    }
    if (westSignal?.pedestrian === "G") {
      if (direction === "N") {
        const isNRAllowedWithWP = confirm(
          "Do you want to allow continuous right turn on the North road with West pedestrian active?"
        );
        if (!isNRAllowedWithWP) {
          addConflict("North right conflicts with West pedestrian movements.");
        }
      }
      if (direction === "W") {
        addConflict("West right conflicts with West pedestrian movements.");
      }
    }
    if (northSignal?.bike === "G") {
      if (direction === "W") {
        addConflict("West right conflicts with North bicycle movements.");
      }
      if (direction === "N") {
        addConflict("North right conflicts with North bicycle movements.");
      }
    }
    if (southSignal?.bike === "G") {
      if (direction === "E") {
        addConflict("East right conflicts with South bicycle movements.");
      }
      if (direction === "S") {
        addConflict("South right conflicts with South bicycle movements.");
      }
    }
    if (eastSignal?.bike === "G") {
      if (direction === "N") {
        addConflict("North right conflicts with East bicycle movements.");
      }
      if (direction === "E") {
        addConflict("East right conflicts with East bicycle movements.");
      }
    }
    if (westSignal?.bike === "G") {
      if (direction === "S") {
        addConflict("South right conflicts with West bicycle movements.");
      }
      if (direction === "W") {
        addConflict("West right conflicts with West bicycle movements.");
      }
    }

    if (northSignal?.straight === "G") {
      if (direction === "W") {
        const isWRAllowedWithNS = confirm(
          "Do you want to allow continuous right turn on the West road with North straight active?"
        );
        if (!isWRAllowedWithNS) {
          addConflict("West right conflicts with North straight movements.");
        }
      }
    }
    if (southSignal?.straight === "G") {
      if (direction === "E") {
        const isERAllowedWithSS = confirm(
          "Do you want to allow continuous right turn on the East road with South straight active?"
        );
        if (!isERAllowedWithSS) {
          addConflict("East right conflicts with South straight movements.");
        }
      }
    }
    if (eastSignal?.straight === "G") {
      if (direction === "N") {
        const isNRAllowedWithES = confirm(
          "Do you want to allow continuous right turn on the North road with East straight active?"
        );
        if (!isNRAllowedWithES) {
          addConflict("North right conflicts with East straight movements.");
        }
      }
    }
    if (westSignal?.straight === "G") {
      if (direction === "S") {
        const isSRAllowedWithWS = confirm(
          "Do you want to allow continuous right turn on the South road with West straight active?"
        );
        if (!isSRAllowedWithWS) {
          addConflict("South right conflicts with West straight movements.");
        }
      }
    }
  }

  ////////////////////////////////////////////////////////
  // All Straight Movement Conflicts
  if (signalType === "straight" && newColor === "G") {
    if (direction === "N") {
      if (eastSignal?.straight === "G") {
        addConflict("North straight conflicts with East straight movement.");
      }
      if (westSignal?.straight === "G") {
        addConflict("North straight conflicts with West straight movement.");
      }
      if (southSignal?.left === "G") {
        addConflict("North straight conflicts with South left movement.");
      }
      if (eastSignal?.left === "G") {
        addConflict("North straight conflicts with East left movement.");
      }
      if (westSignal?.left === "G") {
        addConflict("North straight conflicts with West left movement.");
      }
      if (northSignal?.pedestrian === "G") {
        addConflict("North straight conflicts with North pedestrian movement.");
      }
      if (southSignal?.pedestrian === "G") {
        addConflict("North straight conflicts with South pedestrian movement.");
      }
      if (eastSignal?.bike === "G") {
        addConflict("North straight conflicts with East bicycle movement.");
      }
      if (westSignal?.bike === "G") {
        addConflict("North straight conflicts with West bicycle movement.");
      }
      if (westSignal?.right === "G") {
        const isNSAllowedWithWR = confirm(
          "Do you want to allow continuous right turn on the North road with West right active?"
        );
        if (!isNSAllowedWithWR) {
          addConflict("North straight conflicts with West right movement.");
        }
      }
    }

    if (direction === "S") {
      if (eastSignal?.straight === "G") {
        addConflict("South straight conflicts with East straight movement.");
      }
      if (westSignal?.straight === "G") {
        addConflict("South straight conflicts with West straight movement.");
      }
      if (northSignal?.left === "G") {
        addConflict("South straight conflicts with North left movement.");
      }
      if (eastSignal?.left === "G") {
        addConflict("South straight conflicts with East left movement.");
      }
      if (westSignal?.left === "G") {
        addConflict("South straight conflicts with West left movement.");
      }
      if (northSignal?.pedestrian === "G") {
        addConflict("South straight conflicts with North pedestrian movement.");
      }
      if (southSignal?.pedestrian === "G") {
        addConflict("South straight conflicts with South pedestrian movement.");
      }
      if (eastSignal?.bike === "G") {
        addConflict("South straight conflicts with East bicycle movement.");
      }
      if (westSignal?.bike === "G") {
        addConflict("South straight conflicts with West bicycle movement.");
      }

      if (eastSignal?.right === "G") {
        const isSSAllowedWithER = confirm(
          "Do you want to allow continuous right turn on the South road with East right active?"
        );
        if (!isSSAllowedWithER) {
          addConflict("South straight conflicts with East right movement.");
        }
      }
    }

    if (direction === "E") {
      if (northSignal?.straight === "G") {
        addConflict("East straight conflicts with North straight movement.");
      }
      if (southSignal?.straight === "G") {
        addConflict("East straight conflicts with South straight movement.");
      }
      if (northSignal?.left === "G") {
        addConflict("East straight conflicts with North left movement.");
      }
      if (southSignal?.left === "G") {
        addConflict("East straight conflicts with South left movement.");
      }
      if (northSignal?.bike === "G") {
        addConflict("East straight conflicts with North bicycle movement.");
      }
      if (eastSignal?.pedestrian === "G") {
        addConflict("East straight conflicts with East pedestrian movement.");
      }
      if (westSignal?.pedestrian === "G") {
        addConflict("East straight conflicts with West pedestrian movement.");
      }
      if (southSignal?.bike === "G") {
        addConflict("East straight conflicts with South bicycle movement.");
      }
      if (northSignal?.right === "G") {
        const isESAllowedWithNR = confirm(
          "Do you want to allow continuous right turn on the East road with North right active?"
        );
        if (!isESAllowedWithNR) {
          addConflict("East straight conflicts with North right movement.");
        }
      }
    }

    if (direction === "W") {
      if (northSignal?.straight === "G") {
        addConflict("West straight conflicts with North straight movement.");
      }
      if (southSignal?.straight === "G") {
        addConflict("West straight conflicts with South straight movement.");
      }
      if (northSignal?.left === "G") {
        addConflict("West straight conflicts with North left movement.");
      }
      if (southSignal?.left === "G") {
        addConflict("West straight conflicts with South left movement.");
      }
      if (eastSignal?.pedestrian === "G") {
        addConflict("West straight conflicts with East pedestrian movement.");
      }
      if (westSignal?.pedestrian === "G") {
        addConflict("West straight conflicts with West pedestrian movement.");
      }
      if (northSignal?.bike === "G") {
        addConflict("West straight conflicts with North bicycle movement.");
      }
      if (southSignal?.bike === "G") {
        addConflict("West straight conflicts with South bicycle movement.");
      }
      if (southSignal?.right === "G") {
        const isWSAllowedWithSR = confirm(
          "Do you want to allow continuous right turn on the West road with South right active?"
        );
        if (!isWSAllowedWithSR) {
          addConflict("West straight conflicts with South right movement.");
        }
      }
    }
  }

  // All Pedestrian Crossing Conflicts
  if (signalType === "pedestrian" && newColor === "G") {
    if (direction === "E") {
      if (northSignal?.left === "G") {
        addConflict("East pedestrian conflicts with North left movement.");
      }
      if (southSignal?.right === "G") {
        addConflict("East pedestrian conflicts with South right movement.");
      }
      if (eastSignal?.straight === "G") {
        addConflict("East pedestrian conflicts with East straight movement.");
      }
      if (westSignal?.straight === "G") {
        addConflict("East pedestrian conflicts with West straight movement.");
      }
      if (eastSignal?.left === "G") {
        addConflict("East pedestrian conflicts with East left movement.");
      }
      if (eastSignal?.right === "G") {
        addConflict("East pedestrian conflicts with East right movement.");
      }
      if (eastSignal?.bike === "G") {
        addConflict("East pedestrian conflicts with East bicycle movement.");
      }
      if (westSignal?.bike === "G") {
        addConflict("East pedestrian conflicts with West bicycle movement.");
      }
    }

    if (direction === "W") {
      if (southSignal?.left === "G") {
        addConflict("West pedestrian conflicts with South left movement.");
      }
      if (northSignal?.right === "G") {
        addConflict("West pedestrian conflicts with North right movement.");
      }
      if (westSignal?.right === "G") {
        addConflict("West pedestrian conflicts with West right movements.");
      }
      if (eastSignal?.straight === "G") {
        addConflict("West pedestrian conflicts with East straight movement.");
      }
      if (westSignal?.straight === "G") {
        addConflict("West pedestrian conflicts with West straight movement.");
      }
      if (westSignal?.left === "G") {
        addConflict("West pedestrian conflicts with West left movement.");
      }
      if (eastSignal?.bike === "G") {
        addConflict("West pedestrian conflicts with East bicycle movement.");
      }
      if (westSignal?.bike === "G") {
        addConflict("West pedestrian conflicts with West bicycle movement.");
      }
    }

    if (direction === "N") {
      if (northSignal?.straight === "G") {
        addConflict(
          "North pedestrian conflicts with North straight movements."
        );
      }
      if (southSignal?.straight === "G") {
        addConflict("North pedestrian conflicts with South right movements.");
      }

      if (westSignal?.left === "G") {
        addConflict("North pedestrian conflicts with West left movements.");
      }
      if (eastSignal?.right === "G") {
        addConflict("North pedestrian conflicts with East right movements.");
      }
      if (northSignal?.left === "G") {
        addConflict("North pedestrian conflicts with North left movements.");
      }
      if (northSignal?.right === "G") {
        addConflict("North pedestrian conflicts with North right movements.");
      }
      if (northSignal?.bike === "G") {
        addConflict("North pedestrian conflicts with North bicycle movements.");
      }
      if (southSignal?.bike === "G") {
        addConflict("North pedestrian conflicts with North bicycle movements.");
      }
    }

    if (direction === "S") {
      if (northSignal?.straight === "G") {
        addConflict("South pedestrian conflicts with North right movements.");
      }
      if (southSignal?.straight === "G") {
        addConflict("South pedestrian conflicts with South right movements.");
      }

      if (eastSignal?.left === "G") {
        addConflict("South pedestrian conflicts with East left movements.");
      }
      if (westSignal?.right === "G") {
        addConflict("South pedestrian conflicts with West right movements.");
      }
      if (southSignal?.left === "G") {
        addConflict("South pedestrian conflicts with South left movements.");
      }
      if (southSignal?.right === "G") {
        addConflict("South pedestrian conflicts with South right movements.");
      }
      if (southSignal?.bike === "G") {
        addConflict("South pedestrian conflicts with South bicycle movements.");
      }
      if (northSignal?.bike === "G") {
        addConflict("South pedestrian conflicts with South bicycle movements.");
      }
    }
  }

  // All Bicycle Lane Conflicts
  if (signalType === "bike" && newColor === "G") {
    if (direction === "E") {
      if (eastSignal?.right === "G") {
        addConflict("East bicycle conflicts with East right movement.");
      }
      if (eastSignal?.pedestrian === "G") {
        addConflict("East bicycle conflicts with East pedestrian movement.");
      }
      if (southSignal?.left === "G") {
        const isEBAllowedWithNS = confirm(
          "Do you want to allow East bicycle with South left active?"
        );
        if (!isEBAllowedWithNS) {
          addConflict("East bicycle conflicts with South left movement.");
        }
      }
      if (northSignal?.straight === "G") {
        const isEBAllowedWithNS = confirm(
          "Do you want to allow East bicycle with North straight active?"
        );
        if (!isEBAllowedWithNS) {
          addConflict("East bicycle conflicts with North straight movement.");
        }
      }
      if (southSignal?.straight === "G") {
        const isEBAllowedWithSS = confirm(
          "Do you want to allow East bicycle with South straight active?"
        );
        if (!isEBAllowedWithSS) {
          addConflict("East bicycle conflicts with South straight movement.");
        }
      }
      if (southSignal?.pedestrian === "G") {
        const isEBAllowedWithSS = confirm(
          "Do you want to allow East bicycle with South pedestrian active?"
        );
        if (!isEBAllowedWithSS) {
          addConflict("East bicycle conflicts with South pedestrian movement.");
        }
      }
      if (northSignal?.left === "G") {
        const isEBAllowedWithNS = confirm(
          "Do you want to allow East bicycle with North left active?"
        );
        if (!isEBAllowedWithNS) {
          addConflict("East bicycle conflicts with North left movement.");
        }
      }
      if (northSignal?.right === "G") {
        const isEBAllowedWithNS = confirm(
          "Do you want to allow East bicycle with North right active?"
        );
        if (!isEBAllowedWithNS) {
          addConflict("East bicycle conflicts with North right movement.");
        }
      }
      if (northSignal?.pedestrian === "G") {
        const isEBAllowedWithNS = confirm(
          "Do you want to allow East bicycle with North pedestrian active?"
        );
        if (!isEBAllowedWithNS) {
          addConflict("East bicycle conflicts with North pedestrian movement.");
        }
      }
      if (westSignal?.straight === "G") {
        const isEBAllowedWithWS = confirm(
          "Do you want to allow East bicycle with West straight active?"
        );
        if (!isEBAllowedWithWS) {
          addConflict("East bicycle conflicts with West straight movement.");
        }
      }
      if (westSignal?.left === "G") {
        const isEBAllowedWithWS = confirm(
          "Do you want to allow East bicycle with West left active?"
        );
        if (!isEBAllowedWithWS) {
          addConflict("East bicycle conflicts with West left movement.");
        }
      }
      if (westSignal?.pedestrian === "G") {
        const isEBAllowedWithWS = confirm(
          "Do you want to allow East bicycle with West pedestrian active?"
        );
        if (!isEBAllowedWithWS) {
          addConflict("East bicycle conflicts with West pedestrian movement.");
        }
      }
    }

    if (direction === "W") {
      if (northSignal?.straight === "G") {
        const isWBAllowedWithNS = confirm(
          "Do you want to allow West bicycle with North straight active?"
        );
        if (!isWBAllowedWithNS) {
          addConflict("West bicycle conflicts with North straight movement.");
        }
      }
      if (southSignal?.straight === "G") {
        const isWBAllowedWithSS = confirm(
          "Do you want to allow West bicycle with South straight active?"
        );
        if (!isWBAllowedWithSS) {
          addConflict("West bicycle conflicts with South straight movement.");
        }
      }
      if (southSignal?.left === "G") {
        const isWBAllowedWithSL = confirm(
          "Do you want to allow West bicycle with South left active?"
        );
        if (!isWBAllowedWithSL) {
          addConflict("West bicycle conflicts with South left movement.");
        }
      }
      if (southSignal?.right === "G") {
        const isWBAllowedWithSL = confirm(
          "Do you want to allow West bicycle with South right active?"
        );
        if (!isWBAllowedWithSL) {
          addConflict("West bicycle conflicts with South right movement.");
        }
      }
      if (southSignal?.pedestrian === "G") {
        const isWBAllowedWithSP = confirm(
          "Do you want to allow West bicycle with South pedestrian active?"
        );
        if (!isWBAllowedWithSP) {
          addConflict("West bicycle conflicts with South pedestrian movement.");
        }
      }
      if (northSignal?.left === "G") {
        const isWBAllowedWithNL = confirm(
          "Do you want to allow West bicycle with North left active?"
        );
        if (!isWBAllowedWithNL) {
          addConflict("West bicycle conflicts with North left movement.");
        }
      }
      if (northSignal?.pedestrian === "G") {
        const isWBAllowedWithNP = confirm(
          "Do you want to allow West bicycle with North pedestrian active?"
        );
        if (!isWBAllowedWithNP) {
          addConflict("West bicycle conflicts with North pedestrian movement.");
        }
      }
      if (eastSignal?.left === "G") {
        const isWBAllowedWithEL = confirm(
          "Do you want to allow West bicycle with East left active?"
        );
        if (!isWBAllowedWithEL) {
          addConflict("West bicycle conflicts with East left movement.");
        }
      }
      if (eastSignal?.pedestrian === "G") {
        const isWBAllowedWithEP = confirm(
          "Do you want to allow West bicycle with East pedestrian active?"
        );
        if (!isWBAllowedWithEP) {
          addConflict("West bicycle conflicts with East pedestrian movement.");
        }
      }
      if (westSignal?.right === "G") {
        addConflict("West bicycle conflicts with West right movement.");
      }
      if (westSignal?.pedestrian === "G") {
        addConflict("West bicycle conflicts with West pedestrian movement.");
      }
      if (northSignal?.bike === "G") {
        addConflict("North bicycle conflicts with West bike movement.");
      }
    }

    if (direction === "N") {
      if (westSignal?.straight === "G") {
        const isNBAllowedWithWS = confirm(
          "Do you want to allow North bicycle with West straight active?"
        );
        if (!isNBAllowedWithWS) {
          addConflict("North bicycle conflicts with West straight movement.");
        }
      }

      if (eastSignal?.straight === "G") {
        const isNBAllowedWithES = confirm(
          "Do you want to allow North bicycle with East straight active?"
        );
        if (!isNBAllowedWithES) {
          addConflict("North bicycle conflicts with East straight movement.");
        }
      }
      if (westSignal?.straight === "G") {
        const isNBAllowedWithWS = confirm(
          "Do you want to allow North bicycle with West straight active?"
        );
        if (!isNBAllowedWithWS) {
          addConflict("North bicycle conflicts with West straight movement.");
        }
      }
      if (southSignal?.left === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow North bicycle with South left active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict("North bicycle conflicts with South left movement.");
        }
      }
      if (northSignal?.pedestrian === "G") {
        addConflict("North bicycle conflicts with North pedestrian movement.");
      }
      if (southSignal?.pedestrian === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow North bicycle with South pedestrian active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict(
            "North bicycle conflicts with South pedestrian movement."
          );
        }
      }
      if (eastSignal?.left === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow North bicycle with East left active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict("North bicycle conflicts with East left movement.");
        }
      }
      if (eastSignal?.pedestrian === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow North bicycle with East pedestrian active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict("North bicycle conflicts with East pedestrian movement.");
        }
      }
      if (westSignal?.left === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow North bicycle with West left active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict("North bicycle conflicts with West left movement.");
        }
      }
      if (westSignal?.pedestrian === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow North bicycle with West pedestrian active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict("North bicycle conflicts with West pedestrian movement.");
        }
      }
      if (westSignal?.right === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow North bicycle with West right active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict("North bicycle conflicts with West right movement.");
        }
      }
      if (northSignal?.right === "G") {
        addConflict("North bicycle conflicts with North right movement.");
      }
      if (eastSignal?.bike === "G") {
        addConflict("North bicycle conflicts with East bike movement.");
      }
    }

    if (direction === "S") {
      if (eastSignal?.pedestrian === "G") {
        const isNBAllowedWithSL = confirm(
          "Do you want to allow South bicycle with East pedestrian active?"
        );
        if (!isNBAllowedWithSL) {
          addConflict("South bicycle conflicts with East pedestrian movement.");
        }
      }
      if (southSignal?.right === "G") {
        addConflict("South bicycle conflicts with South right movement.");
      }
      if (westSignal?.bike === "G") {
        addConflict("South bicycle conflicts with West bicycle movement.");
      }
      if (southSignal?.pedestrian === "G") {
        addConflict("South bicycle conflicts with South pedestrian movement.");
      }
      if (eastSignal?.straight === "G") {
        const isSBAllowedWithES = confirm(
          "Do you want to allow South bicycle with East straight active?"
        );
        if (!isSBAllowedWithES) {
          addConflict("South bicycle conflicts with East straight movement.");
        }
      }
      if (eastSignal?.left === "G") {
        const isSBAllowedWithES = confirm(
          "Do you want to allow South bicycle with East left active?"
        );
        if (!isSBAllowedWithES) {
          addConflict("South bicycle conflicts with East left movement.");
        }
      }
      if (eastSignal?.right === "G") {
        const isSBAllowedWithES = confirm(
          "Do you want to allow South bicycle with East right active?"
        );
        if (!isSBAllowedWithES) {
          addConflict("South bicycle conflicts with East right movement.");
        }
      }
      if (westSignal?.left === "G") {
        const isSBAllowedWithES = confirm(
          "Do you want to allow South bicycle with West left active?"
        );
        if (!isSBAllowedWithES) {
          addConflict("South bicycle conflicts with West left movement.");
        }
      }
      if (westSignal?.pedestrian === "G") {
        const isSBAllowedWithES = confirm(
          "Do you want to allow South bicycle with West pedestrian active?"
        );
        if (!isSBAllowedWithES) {
          addConflict("South bicycle conflicts with West pedestrian movement.");
        }
      }
      if (northSignal?.pedestrian === "G") {
        const isSBAllowedWithES = confirm(
          "Do you want to allow South bicycle with North pedestrian active?"
        );
        if (!isSBAllowedWithES) {
          addConflict(
            "South bicycle conflicts with North pedestrian movement."
          );
        }
      }
      if (northSignal?.left === "G") {
        const isSBAllowedWithSS = confirm(
          "Do you want to allow South bicycle with North left active?"
        );
        if (!isSBAllowedWithSS) {
          addConflict("South bicycle conflicts with North left movement.");
        }
      }
    }
  }

  return conflicts;
};
