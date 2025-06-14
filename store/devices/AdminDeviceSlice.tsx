import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import HttpRequest from "../services/HttpRequest";
import { emitToastMessage } from "@/utils/toastFunc";
import { setItemToCookie } from "@/utils/cookiesFunc";

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
  async (deviceType: any, { rejectWithValue }) => {
    try {
      const { data } = await HttpRequest.get(
        `/admin/devices/${deviceType?.department}`
      );
      const filteredDevices = data.data.devices.map((device: any) => ({
        deviceId: device.deviceId,
        email: device.userDevice?.email,
        status: device.userDevice?.status,
        allowAdminSupport: device.userDevice?.allowAdminSupport,
        isTrash: device.userDevice?.isTrash,
        deletedAt: device.userDevice?.deletedAt,
      }));

      setItemToCookie(
        "adminDevices",
        JSON.stringify(filteredDevices),
        60 * 60 * 24
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch admin devices"
      );
    }
  }
);

const AdminDeviceSlice = createSlice({
  name: "adminDevice",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAdminDevice.pending, (state) => {
        state.isFetchingDevices = true;
      })
      .addCase(getAdminDevice.fulfilled, (state, action) => {
        state.devices = action.payload?.data?.devices || [];
        state.isFetchingDevices = false;
      })
      .addCase(getAdminDevice.rejected, (state, action) => {
        state.isFetchingDevices = false;
        emitToastMessage(action.payload as string, "error");
      });
  },
});

export default AdminDeviceSlice.reducer;
