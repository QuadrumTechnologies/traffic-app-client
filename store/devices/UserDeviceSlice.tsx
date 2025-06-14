import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import HttpRequest from "../services/HttpRequest";
import { emitToastMessage } from "@/utils/toastFunc";

interface DirectionData {
  Bat: string;
  Temp: string;
}

interface InitialStateTypes {
  devices: any[];
  phases: any[];
  patterns: any[];
  plans: any[];
  configuredPatterns: any[];
  configuredPhases: any[];
  isFetchingDevices: boolean;
  isFetchingPhases: boolean;
  isFetchingPatterns: boolean;
  isFetchingPlans: boolean;
  currentDeviceInfoData: {
    North: DirectionData;
    East: DirectionData;
    West: DirectionData;
    South: DirectionData;
    Rtc: string;
    Plan: string;
    Period: string;
    JunctionId: string;
    JunctionPassword: string;
    DeviceID: string;
    CommunicationFrequency: string;
    CommunicationChannel: string;
  };
  activePhaseSignal: {
    Countdown: string;
    Phase: string;
    DeviceID: string;
  };
  deviceAvailability: {
    DeviceID: string;
    Status: boolean;
  };
  deviceActiveStateData: {
    DeviceID: string;
    Auto: boolean;
    Power: boolean;
    Next: boolean;
    Hold: boolean;
    Reset: boolean;
    Restart: boolean;
    SignalLevel: number;
    ErrorFlash: boolean;
    SignalConfig: string;
  };
  wsFeedback: { event: string; message: string } | null;
}

const initialState: InitialStateTypes = {
  devices: [],
  phases: [],
  patterns: [],
  plans: [],
  configuredPatterns: [],
  configuredPhases: [],
  isFetchingDevices: false,
  isFetchingPhases: false,
  isFetchingPatterns: false,
  isFetchingPlans: false,
  currentDeviceInfoData: {
    North: { Bat: "", Temp: "" },
    East: { Bat: "", Temp: "" },
    West: { Bat: "", Temp: "" },
    South: { Bat: "", Temp: "" },
    Rtc: "",
    Plan: "",
    Period: "",
    JunctionId: "",
    JunctionPassword: "",
    DeviceID: "",
    CommunicationFrequency: "",
    CommunicationChannel: "",
  },
  activePhaseSignal: {
    Countdown: "",
    Phase: "",
    DeviceID: "",
  },
  deviceAvailability: {
    DeviceID: "",
    Status: false,
  },
  deviceActiveStateData: {
    DeviceID: "",
    Auto: false,
    Power: false,
    Next: false,
    Hold: false,
    Reset: false,
    Restart: false,
    SignalLevel: 20,
    ErrorFlash: false,
    SignalConfig: "",
  },
  wsFeedback: null,
};

export const getUserDevice = createAsyncThunk(
  "userDevice/getUserDevice",
  async (_: string | undefined, { rejectWithValue }) => {
    try {
      const { data } = await HttpRequest.get(`/devices`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch devices"
      );
    }
  }
);

export const getUserPhase = createAsyncThunk(
  "userDevice/getUserPhase",
  async (_: string | undefined, { rejectWithValue }) => {
    try {
      const { data } = await HttpRequest.get(`/phases`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch phases"
      );
    }
  }
);

export const getUserPattern = createAsyncThunk(
  "userDevice/getUserPattern",
  async (_: string | undefined, { rejectWithValue }) => {
    try {
      const { data } = await HttpRequest.get(`/patterns`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch patterns"
      );
    }
  }
);

export const getUserPlan = createAsyncThunk(
  "userDevice/getUserPlan",
  async (_: string | undefined, { rejectWithValue }) => {
    try {
      const { data } = await HttpRequest.get(`/plans`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch plans"
      );
    }
  }
);

export const getUserDeviceInfoData = createAsyncThunk(
  "userDevice/getUserDeviceInfoData",
  async (deviceId: string, { rejectWithValue }) => {
    try {
      const { data } = await HttpRequest.get(`/info/${deviceId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch device info"
      );
    }
  }
);

export const getUserDeviceStateData = createAsyncThunk(
  "userDevice/getUserDeviceStateData",
  async (deviceId: string, { rejectWithValue }) => {
    try {
      const { data } = await HttpRequest.get(`/state/${deviceId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch device state"
      );
    }
  }
);

const UserDeviceSlice = createSlice({
  name: "userDevice",
  initialState,
  reducers: {
    addOrUpdatePhaseConfig: (state, action) => {
      const { id, name, signalString, duration } = action.payload;
      const existingPhase = state.configuredPhases.find(
        (phase) => phase.id === id
      );
      if (existingPhase) {
        existingPhase.name = name;
        existingPhase.duration = duration;
      } else {
        state.configuredPhases.push({
          id,
          name,
          duration,
          signalString,
        });
      }
    },
    removePhaseConfig: (state, action) => {
      const phaseIdToRemove = action.payload;
      state.configuredPhases = state.configuredPhases.filter(
        (phase) => phase.id !== phaseIdToRemove
      );
      emitToastMessage(
        "Phase configuration has been removed successfully.",
        "success"
      );
    },
    clearPhaseConfig: (state) => {
      state.configuredPhases = [];
    },
    addCurrentDeviceInfoData: (state, action) => {
      state.currentDeviceInfoData = action.payload;
    },
    addCurrentDeviceSignalData: (state, action) => {
      state.activePhaseSignal = action.payload;
    },
    addCurrentDeviceStateData: (state, action) => {
      state.deviceActiveStateData = action.payload;
    },
    updateDeviceAvailability: (state, action) => {
      console.log("Updating device availability:", action.payload);

      state.deviceAvailability = action.payload;
    },
    handleWsFeedback: (state, action) => {
      state.wsFeedback = action.payload;
      emitToastMessage(
        action.payload.message,
        action.payload.event === "error" ? "error" : "success"
      );
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getUserDevice.pending, (state) => {
        state.isFetchingDevices = true;
      })
      .addCase(getUserDevice.fulfilled, (state, action) => {
        state.devices = action.payload?.data?.devices || [];
        state.isFetchingDevices = false;
      })
      .addCase(getUserDevice.rejected, (state, action) => {
        state.isFetchingDevices = false;
        emitToastMessage(action.payload as string, "error");
      })
      .addCase(getUserPhase.pending, (state) => {
        state.isFetchingPhases = true;
      })
      .addCase(getUserPhase.fulfilled, (state, action) => {
        state.phases = action.payload?.data?.phases?.reverse() || [];
        state.isFetchingPhases = false;
      })
      .addCase(getUserPhase.rejected, (state, action) => {
        state.isFetchingPhases = false;
        emitToastMessage(action.payload as string, "error");
      })
      .addCase(getUserPattern.pending, (state) => {
        state.isFetchingPatterns = true;
      })
      .addCase(getUserPattern.fulfilled, (state, action) => {
        state.patterns = action.payload?.data?.patterns?.reverse() || [];
        state.isFetchingPatterns = false;
      })
      .addCase(getUserPattern.rejected, (state, action) => {
        state.isFetchingPatterns = false;
        emitToastMessage(action.payload as string, "error");
      })
      .addCase(getUserPlan.pending, (state) => {
        state.isFetchingPlans = true;
      })
      .addCase(getUserPlan.fulfilled, (state, action) => {
        state.plans = action.payload?.data?.plans?.reverse() || [];
        state.isFetchingPlans = false;
      })
      .addCase(getUserPlan.rejected, (state, action) => {
        state.isFetchingPlans = false;
        emitToastMessage(action.payload as string, "error");
      })
      .addCase(getUserDeviceInfoData.fulfilled, (state, action) => {
        state.currentDeviceInfoData =
          action.payload?.data || state.currentDeviceInfoData;
      })
      .addCase(getUserDeviceInfoData.rejected, (state, action) => {
        emitToastMessage(action.payload as string, "error");
      })
      .addCase(getUserDeviceStateData.fulfilled, (state, action) => {
        state.deviceActiveStateData =
          action.payload?.data || state.deviceActiveStateData;
      })
      .addCase(getUserDeviceStateData.rejected, (state, action) => {
        emitToastMessage(action.payload as string, "error");
      });
  },
});

export const {
  addOrUpdatePhaseConfig,
  removePhaseConfig,
  clearPhaseConfig,
  addCurrentDeviceInfoData,
  addCurrentDeviceSignalData,
  updateDeviceAvailability,
  addCurrentDeviceStateData,
  handleWsFeedback,
} = UserDeviceSlice.actions;
export default UserDeviceSlice.reducer;
