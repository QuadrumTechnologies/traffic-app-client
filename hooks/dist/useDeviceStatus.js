"use strict";
exports.__esModule = true;
exports.useDeviceStatus = void 0;
var websocket_1 = require("@/app/dashboard/websocket");
var UserDeviceSlice_1 = require("@/store/devices/UserDeviceSlice");
var toastFunc_1 = require("@/utils/toastFunc");
var react_1 = require("react");
var reduxHook_1 = require("./reduxHook");
var SignalConfigSlice_1 = require("@/store/signals/SignalConfigSlice");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
exports.useDeviceStatus = function () {
    var dispatch = reduxHook_1.useAppDispatch();
    var timeoutMap = react_1.useRef({}).current;
    var user = localStorageFunc_1.GetItemFromLocalStorage("user") || {};
    var userEmail = user.email || null;
    var isAdmin = user.isAdmin || false;
    var _a = reduxHook_1.useAppSelector(function (state) { return state.userDevice; }), devices = _a.devices, deviceStatuses = _a.deviceStatuses;
    var deviceIds = devices.map(function (device) { return device.deviceId; });
    react_1.useEffect(function () {
        var ws = websocket_1.getWebSocket();
        var updateDeviceStatusHandler = function (id, status, lastSeen) {
            if (lastSeen === void 0) { lastSeen = null; }
            var existingStatus = deviceStatuses.find(function (s) { return s.id === id; });
            // Emit toast if status has changed
            if (existingStatus && existingStatus.status !== status) {
                console.log("Status change detected:", existingStatus.status, "->", status);
                toastFunc_1.emitToastMessage("Device " + id + " is " + (status ? "online" : "offline") + ".", "info");
            }
            else if (!existingStatus && status) {
                console.log("New device online:", id);
                toastFunc_1.emitToastMessage("Device " + id + " is online.", "info");
            }
            // Dispatch to Redux
            dispatch(UserDeviceSlice_1.updateDeviceStatus({ id: id, status: status, lastSeen: lastSeen }));
        };
        var handleWebSocketMessage = function (event) {
            try {
                var message = JSON.parse(event.data);
                if (message.event === "ping_received" &&
                    (message === null || message === void 0 ? void 0 : message.source.type) === "hardware") {
                    var deviceId_1 = message.source.id;
                    console.log("Ping received for device:", deviceId_1, deviceIds);
                    if (!isAdmin && userEmail && !deviceIds.includes(deviceId_1)) {
                        return;
                    }
                    updateDeviceStatusHandler(deviceId_1, true, null);
                    clearTimeout(timeoutMap[deviceId_1]);
                    timeoutMap[deviceId_1] = setTimeout(function () {
                        updateDeviceStatusHandler(deviceId_1, false, new Date().toISOString());
                    }, 30000);
                }
                else if (message.event === "device_status" &&
                    (message === null || message === void 0 ? void 0 : message.source.type) === "hardware") {
                    var deviceId = message.source.id;
                    if (!isAdmin && userEmail && !deviceIds.includes(deviceId)) {
                        return;
                    }
                    updateDeviceStatusHandler(deviceId, message.source.status, message.source.lastSeen);
                }
                else if (message.event === "error") {
                    dispatch(UserDeviceSlice_1.handleWsFeedback({ event: "error", message: message.message }));
                }
                else if (message.event === "intersection_control_success") {
                    dispatch(UserDeviceSlice_1.handleWsFeedback({
                        event: "success",
                        message: "Action " + message.action + " set to " + message.value + " successfully."
                    }));
                }
                else if (message.event === "upload_request_success") {
                    dispatch(UserDeviceSlice_1.handleWsFeedback({ event: "success", message: message.message }));
                }
                else if (message.event === "manual_control_success") {
                    dispatch(SignalConfigSlice_1.handleManualControlFeedback({
                        event: "success",
                        message: message.message
                    }));
                }
            }
            catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
        if (ws.readyState === WebSocket.OPEN) {
            ws.onmessage = handleWebSocketMessage;
        }
        else {
            ws.onopen = function () {
                ws.onmessage = handleWebSocketMessage;
            };
        }
        return function () {
            Object.values(timeoutMap).forEach(clearTimeout);
        };
    }, [dispatch, userEmail, isAdmin, deviceIds]);
    return deviceStatuses;
};
