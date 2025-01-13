import { Signal } from "@/components/IntersectionComponent/Intersection";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SignalState {
  left: "R" | "A" | "G" | "X";
  straight: "R" | "A" | "G" | "X";
  right: "R" | "A" | "G" | "X";
  bike: "R" | "G" | "A" | "X";
  pedestrian: "R" | "G" | "X";
}

interface SignalConfigState {
  signals: Record<"N" | "E" | "S" | "W", SignalState>;
  warning: string | null;
  signalString: string;
  allowConflictingConfig: boolean;
  isIntersectionConfigurable: boolean;
  createdPatternPhasePreviewing: {
    duration: number | null;
    showDuration: boolean;
  };
  manualMode: boolean;
  landingPageSignals: Signal[];
  countDownColor: "red" | "yellow" | "green";
}

const initializeSignals = (
  signalString: string
): Record<"N" | "E" | "S" | "W", SignalState> => {
  const signals: Record<"N" | "E" | "S" | "W", SignalState> = {
    N: { left: "R", straight: "R", right: "R", bike: "R", pedestrian: "R" },
    E: { left: "R", straight: "R", right: "R", bike: "R", pedestrian: "R" },
    S: { left: "R", straight: "R", right: "R", bike: "R", pedestrian: "R" },
    W: { left: "R", straight: "R", right: "R", bike: "R", pedestrian: "R" },
  };

  const trimmedString = signalString.slice(1, -1);
  const signalBlocks = trimmedString.match(/.{7}/g);
  if (signalBlocks && signalBlocks.length === 4) {
    signalBlocks.forEach((signalBlock) => {
      const direction = signalBlock[0] as keyof typeof signals;
      signals[direction].left = signalBlock[1] as "R" | "A" | "G" | "X";
      signals[direction].straight = signalBlock[2] as "R" | "A" | "G" | "X";
      signals[direction].right = signalBlock[3] as "R" | "A" | "G" | "X";
      signals[direction].bike = signalBlock[4] as "R" | "A" | "G" | "X";
      signals[direction].pedestrian = signalBlock[5] as "R" | "G" | "X";
    });
  }

  return signals;
};

const initialConfig: SignalConfigState = {
  signals: initializeSignals("*NRRRRRRERRRRRRSRRRRRRWRRRRRR#"),
  warning: null,
  signalString: "*NRRRRRRERRRRRRSRRRRRRWRRRRRR#",
  allowConflictingConfig: false,
  isIntersectionConfigurable: false,
  createdPatternPhasePreviewing: {
    duration: null,
    showDuration: false,
  },
  manualMode: false,
  landingPageSignals: [],
  countDownColor: "green",
};

const signalConfigSlice = createSlice({
  name: "signalConfig",
  initialState: initialConfig,
  reducers: {
    setSignalString(state, action: PayloadAction<string>) {
      state.signalString = action.payload;
    },
    setSignalState(state) {
      state.signals = initializeSignals(state.signalString);
    },
    setSignalStringToAllRed(state) {
      state.signalString = "*NRRRRRRERRRRRRSRRRRRRWRRRRRR#";
    },
    setSignalStringToAllAmber(state) {
      state.signalString = "*NAAAAXXEAAAAXXSAAAAXXWAAAAXX#";
    },
    setSignalStringToAllBlank(state) {
      state.signalString = "*NXXXXXXEXXXXXXSXXXXXXWXXXXXX#";
    },
    allowConflictConfig(state, action: PayloadAction<boolean>) {
      state.allowConflictingConfig = action.payload;
    },
    setIsIntersectionConfigurable(state, action: PayloadAction<boolean>) {
      state.isIntersectionConfigurable = action.payload;
    },
    previewCreatedPatternPhase(state, action) {
      state.createdPatternPhasePreviewing.duration = action.payload.duration;
      state.signalString = action.payload.signalString;
      state.createdPatternPhasePreviewing.showDuration = true;
    },
    closePreviewCreatedPatternPhase(state) {
      state.createdPatternPhasePreviewing.duration = null;
      state.signalString = "*NRRRRRRERRRRRRSRRRRRRWRRRRRR#";
      state.createdPatternPhasePreviewing.showDuration = false;
      state.isIntersectionConfigurable = false;
    },
    setManualMode(state, action: PayloadAction<boolean>) {
      state.manualMode = action.payload;
    },
    setLandingPageInitialSignals(state, action: PayloadAction<any>) {
      state.landingPageSignals = action.payload;
    },
    setLandingPageSignals(state, action: PayloadAction<any>) {
      const { direction, signalType, color } = action.payload;
      state.landingPageSignals = state.landingPageSignals.map((signal) =>
        signal.direction === direction
          ? {
              ...signal,
              [signalType]: color,
            }
          : signal
      );
    },
    updateCountDownColor(
      state,
      action: PayloadAction<"red" | "yellow" | "green">
    ) {
      state.countDownColor = action.payload;
    },
  },
});

export const {
  setSignalState,
  setSignalString,
  setSignalStringToAllRed,
  setSignalStringToAllAmber,
  setSignalStringToAllBlank,
  allowConflictConfig,
  setIsIntersectionConfigurable,
  previewCreatedPatternPhase,
  closePreviewCreatedPatternPhase,
  setManualMode,
  setLandingPageSignals,
  setLandingPageInitialSignals,
  updateCountDownColor,
} = signalConfigSlice.actions;
export default signalConfigSlice.reducer;
