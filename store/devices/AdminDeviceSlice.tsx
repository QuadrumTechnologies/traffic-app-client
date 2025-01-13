import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import HttpRequest from "../services/HttpRequest";
import { emitToastMessage } from "@/utils/toastFunc";

interface InitialStateTypes {
  devices: any[];
  isFetchingDevices: boolean;
}
const initialState: InitialStateTypes = {
  devices: [],
  isFetchingDevices: false,
};

export const getAdminDevice = createAsyncThunk(
  "adminDevice/getAdminDevice",
  async (deviceType: any) => {
    try {
      const { data } = await HttpRequest.get(
        `/admin/devices/${deviceType?.department}`
      );
      if (data.devices.length === 0) {
        return emitToastMessage("You have not added any device yet", "success");
      }
      emitToastMessage("All devices fetched successfully", "success");
      return data;
    } catch (error: any) {
      emitToastMessage("Could not fetch your device(s)", "error");
    }
  }
);

const AdminDeviceSlice = createSlice({
  name: "adminDevice",
  initialState: initialState,
  // Synchronous tasks
  reducers: {
    // AddAdminDevices(state, action: PayloadAction<any>) {
    //   state.devices = action.payload;
    // },
  },
  // Asynchronous tasks
  extraReducers(builder) {
    builder
      .addCase(getAdminDevice.pending, (state) => {
        state.isFetchingDevices = true;
      })
      .addCase(getAdminDevice.fulfilled, (state, action) => {
        state.devices = action.payload.devices;
        state.isFetchingDevices = false;
      })
      .addCase(getAdminDevice.rejected, (state) => {
        state.isFetchingDevices = false;
      });
  },
});
// export const { AddAdminDevices } = AdminDeviceSlice.actions;
export default AdminDeviceSlice.reducer;
