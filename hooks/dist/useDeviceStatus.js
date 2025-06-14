"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
    var _a = react_1.useState([]), statuses = _a[0], setStatuses = _a[1];
    var dispatch = reduxHook_1.useAppDispatch();
    var timeoutMap = {};
    var user = localStorageFunc_1.GetItemFromLocalStorage("user") || {};
    var userEmail = user.email || null;
    var isAdmin = user.isAdmin || false;
    var devices = reduxHook_1.useAppSelector(function (state) { return state.userDevice; }).devices;
    var deviceIds = devices.map(function (device) { return device.deviceId; });
    react_1.useEffect(function () {
        var ws = websocket_1.getWebSocket();
        var updateDeviceStatus = function (id, status, lastSeen) {
            if (lastSeen === void 0) { lastSeen = null; }
            setStatuses(function (prevStatuses) {
                var existingStatus = prevStatuses.find(function (s) { return s.id === id; });
                var newStatus = { id: id, status: status, lastSeen: lastSeen };
                console.log("Updating device status:", newStatus, existingStatus);
                // Only emit toast if status has changed
                if (existingStatus && existingStatus.status !== status) {
                    console.log("Status change detected:", existingStatus.status, "->", status);
                    toastFunc_1.emitToastMessage("Device " + id + " is " + (status ? "online" : "offline") + ".", "info");
                }
                else if (!existingStatus && status) {
                    console.log("New device online:", id);
                    toastFunc_1.emitToastMessage("Device " + id + " is online.", "info");
                }
                if (existingStatus) {
                    return prevStatuses.map(function (s) { return (s.id === id ? newStatus : s); });
                }
                else {
                    return __spreadArrays(prevStatuses, [newStatus]);
                }
            });
            dispatch(UserDeviceSlice_1.updateDeviceAvailability({ DeviceID: id, Status: status }));
        };
        var handleWebSocketMessage = function (event) {
            var message = JSON.parse(event.data);
            if (message.event === "ping_received" &&
                (message === null || message === void 0 ? void 0 : message.source.type) === "hardware") {
                var deviceId_1 = message.source.id;
                console.log("Ping received for device:", deviceId_1, deviceIds);
                // Skip if not admin and device not in user's devices
                if (!isAdmin && userEmail && !deviceIds.includes(deviceId_1)) {
                    return;
                }
                console.log("Updating device status for ping:", deviceId_1);
                updateDeviceStatus(deviceId_1, true, null);
                clearTimeout(timeoutMap[deviceId_1]);
                timeoutMap[deviceId_1] = setTimeout(function () {
                    updateDeviceStatus(deviceId_1, false, new Date().toISOString());
                }, 30000);
            }
            else if (message.event === "device_status" &&
                (message === null || message === void 0 ? void 0 : message.source.type) === "hardware") {
                var deviceId = message.source.id;
                // Skip if not admin and device not in user's devices
                if (!isAdmin && userEmail && !deviceIds.includes(deviceId)) {
                    return;
                }
                console.log("Device status update received:", message);
                updateDeviceStatus(deviceId, message.source.status, message.source.lastSeen);
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
        };
        if (ws) {
            ws.onmessage = handleWebSocketMessage;
        }
        return function () {
            Object.values(timeoutMap).forEach(clearTimeout);
        };
    }, [dispatch, userEmail, isAdmin, deviceIds]);
    return statuses;
};
