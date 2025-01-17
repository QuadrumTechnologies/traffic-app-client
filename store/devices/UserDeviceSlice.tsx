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
    DeviceID: string;
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
  };
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
    DeviceID: "",
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
  },
};

export const getUserDevice = createAsyncThunk(
  "userDevice/getUserDevice",
  async (email: string) => {
    try {
      const { data } = await HttpRequest.get(`/devices/${email}`);
      // emitToastMessage("Your device(s) are fetched successfully", "success");
      return data;
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  }
);
export const getUserPhase = createAsyncThunk(
  "userDevice/getUserPhase",
  async (email: string) => {
    try {
      const {
        data: { data },
      } = await HttpRequest.get(`/phases/${email}`);

      // emitToastMessage("Your phase(s) are fetched successfully", "success");
      return data;
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  }
);
export const getUserPattern = createAsyncThunk(
  "userDevice/getUserPattern",
  async (email: string) => {
    try {
      const {
        data: { data },
      } = await HttpRequest.get(`/patterns/${email}`);
      // emitToastMessage("Your pattern(s) are fetched successfully", "success");
      return data;
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  }
);
export const getUserPlan = createAsyncThunk(
  "userDevice/getUserPlan",
  async (email: string) => {
    try {
      const {
        data: { data },
      } = await HttpRequest.get(`/plans/${email}`);
      // emitToastMessage("Your pattern(s) are fetched successfully", "success");
      return data;
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  }
);
export const getUserDeviceInfoData = createAsyncThunk(
  "userDevice/getUserDeviceInfoData",
  async (deviceId: string) => {
    try {
      const {
        data: { data },
      } = await HttpRequest.get(`/info/${deviceId}`);
      return data;
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  }
);
export const getUserDeviceStateData = createAsyncThunk(
  "userDevice/getUserDeviceStateData",
  async (deviceId: string) => {
    try {
      const {
        data: { data },
      } = await HttpRequest.get(`/state/${deviceId}`);
      return data;
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  }
);

const UserDeviceSlice = createSlice({
  name: "userDevice",
  initialState: initialState,
  reducers: {
    // Patterns Tab
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
    addCurrentDeviceInfoData(state, action) {
      state.currentDeviceInfoData = action.payload;
    },
    addCurrentDeviceSignalData(state, action) {
      state.activePhaseSignal = action.payload;
    },
    addCurrentDeviceStateData(state, action) {
      state.deviceActiveStateData = action.payload;
    },
    updateDeviceAvailability(state, action) {
      state.deviceAvailability = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getUserDevice.pending, (state) => {
        state.isFetchingDevices = true;
      })
      .addCase(getUserDevice.fulfilled, (state, action) => {
        state.devices = action.payload?.devices;
        state.isFetchingDevices = false;
      })
      .addCase(getUserDevice.rejected, (state) => {
        state.isFetchingDevices = false;
      })
      .addCase(getUserPhase.pending, (state) => {
        state.isFetchingPhases = true;
      })
      .addCase(getUserPhase.fulfilled, (state, action) => {
        state.phases = action.payload?.phases.reverse();
        state.isFetchingPhases = false;
      })
      .addCase(getUserPhase.rejected, (state) => {
        state.isFetchingPhases = false;
      })
      .addCase(getUserPattern.pending, (state) => {
        state.isFetchingPatterns = true;
      })
      .addCase(getUserPattern.fulfilled, (state, action) => {
        state.patterns = action.payload?.patterns.reverse();
        state.isFetchingPatterns = false;
      })
      .addCase(getUserPattern.rejected, (state) => {
        state.isFetchingPatterns = false;
      })
      .addCase(getUserPlan.pending, (state) => {
        state.isFetchingPlans = true;
      })
      .addCase(getUserPlan.fulfilled, (state, action) => {
        state.plans = action.payload?.plans.reverse();
        state.isFetchingPlans = false;
      })
      .addCase(getUserPlan.rejected, (state) => {
        state.isFetchingPlans = false;
      })
      .addCase(getUserDeviceInfoData.fulfilled, (state, action) => {
        console.log("Current Device Info", action);
        state.currentDeviceInfoData = action.payload;
      })
      .addCase(getUserDeviceStateData.fulfilled, (state, action) => {
        state.deviceActiveStateData = action.payload;
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
} = UserDeviceSlice.actions;
export default UserDeviceSlice.reducer;
