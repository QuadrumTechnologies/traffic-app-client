"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var formik_1 = require("formik");
var Yup = require("yup");
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var IntersectionConfigurationItem_1 = require("./IntersectionConfigurationItem");
var reduxHook_1 = require("@/hooks/reduxHook");
var SignalConfigSlice_1 = require("@/store/signals/SignalConfigSlice");
var websocket_1 = require("@/app/dashboard/websocket");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
var toastFunc_1 = require("@/utils/toastFunc");
var UserDeviceSlice_1 = require("@/store/devices/UserDeviceSlice");
var Button_1 = require("../UI/Button/Button");
var IntersectionConfiguration = function (_a) {
    var _b;
    var intersectionConfigItems = _a.intersectionConfigItems, deviceId = _a.deviceId, userType = _a.userType, _c = _a.showCommandsOnly, showCommandsOnly = _c === void 0 ? false : _c;
    var _d = reduxHook_1.useAppSelector(function (state) { return state.userDevice; }), devices = _d.devices, deviceActiveStateData = _d.deviceActiveStateData, currentDeviceInfoData = _d.currentDeviceInfoData;
    var landingPageSignals = reduxHook_1.useAppSelector(function (state) { return state.signalConfig; }).landingPageSignals;
    var dispatch = reduxHook_1.useAppDispatch();
    var router = navigation_1.useRouter();
    var pathname = navigation_1.usePathname();
    var params = navigation_1.useParams();
    var email = (_b = localStorageFunc_1.GetItemFromLocalStorage("user")) === null || _b === void 0 ? void 0 : _b.email;
    var _e = react_1.useState(false), showManualMoreConfig = _e[0], setShowManualMoreConfig = _e[1];
    var _f = react_1.useState(""), initialSignalStrings = _f[0], setInitialSignalStrings = _f[1];
    var handleRequest = function (action) { return __awaiter(void 0, void 0, void 0, function () {
        var device, isPasswordVerified, password, reason, endpoint, error_1, message, socket, sendMessage;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("Action requested:", action);
                    device = devices === null || devices === void 0 ? void 0 : devices.find(function (device) { return device.deviceId === deviceId; });
                    if (!device) {
                        toastFunc_1.emitToastMessage("Device not found.", "error");
                        return [2 /*return*/];
                    }
                    if (userType === "admin" && !((_a = device === null || device === void 0 ? void 0 : device.userDevice) === null || _a === void 0 ? void 0 : _a.allowAdminSupport)) {
                        toastFunc_1.emitToastMessage("Admin support is not(enabled for this device.", "error");
                        return [2 /*return*/];
                    }
                    isPasswordVerified = localStorageFunc_1.GetItemFromLocalStorage("isPasswordVerified");
                    if (!(!isPasswordVerified || Date.now() - isPasswordVerified.time > 180000)) return [3 /*break*/, 4];
                    password = prompt("Please enter your password to proceed");
                    if (!password) {
                        toastFunc_1.emitToastMessage("Password verification cancelled.", "info");
                        return [2 /*return*/];
                    }
                    reason = "Device " + deviceId + " " + action + " action requested by user";
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    endpoint = pathname.includes("admin")
                        ? "/admin/confirm-password"
                        : "/confirm-password";
                    return [4 /*yield*/, HttpRequest_1["default"].post(endpoint, {
                            email: email,
                            reason: reason,
                            password: password
                        })];
                case 2:
                    _d.sent();
                    localStorageFunc_1.SetItemToLocalStorage("isPasswordVerified", {
                        isPasswordVerified: true,
                        time: Date.now()
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _d.sent();
                    message = ((_c = (_b = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Request failed";
                    toastFunc_1.emitToastMessage(message, "error");
                    return [2 /*return*/];
                case 4:
                    if (action === "Manual") {
                        dispatch(SignalConfigSlice_1.setManualMode(true));
                        setShowManualMoreConfig(true);
                        dispatch(SignalConfigSlice_1.closePreviewCreatedPatternPhase());
                    }
                    else if (action === "Auto") {
                        dispatch(SignalConfigSlice_1.setManualMode(false));
                        setShowManualMoreConfig(false);
                    }
                    socket = websocket_1.getWebSocket();
                    sendMessage = function () {
                        socket.send(JSON.stringify({
                            event: "intersection_control_request",
                            payload: { action: action, DeviceID: deviceId }
                        }));
                        setTimeout(function () {
                            dispatch(UserDeviceSlice_1.getUserDeviceStateData(deviceId));
                        }, 2000);
                    };
                    if (socket.readyState === WebSocket.OPEN) {
                        sendMessage();
                    }
                    else {
                        socket.onopen = function () { return sendMessage(); };
                    }
                    localStorageFunc_1.SetItemToLocalStorage("isPasswordVerified", {
                        isPasswordVerified: true,
                        time: Date.now()
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    var getAdjacentPedestrianSignal = function (signals, direction) {
        var adjacentDirection;
        switch (direction) {
            case "S":
                adjacentDirection = "E";
                break;
            case "E":
                adjacentDirection = "N";
                break;
            case "N":
                adjacentDirection = "W";
                break;
            case "W":
                adjacentDirection = "S";
                break;
            default:
                adjacentDirection = "N";
        }
        var adjacentSignal = signals.find(function (signal) { return signal.direction === adjacentDirection; });
        return adjacentSignal ? adjacentSignal.pedestrian : "X";
    };
    var encodeSignals = function () {
        return ("*" +
            landingPageSignals
                .map(function (signal) {
                var adjacentPedestrian = getAdjacentPedestrianSignal(landingPageSignals, signal.direction);
                return "" + signal.direction + signal.left + signal.straight + signal.right + signal.bike + signal.pedestrian + adjacentPedestrian;
            })
                .join("") +
            "#");
    };
    react_1.useEffect(function () {
        var initialStrings = encodeSignals();
        setInitialSignalStrings(initialStrings);
    }, [landingPageSignals]);
    react_1.useEffect(function () {
        if (!(deviceActiveStateData === null || deviceActiveStateData === void 0 ? void 0 : deviceActiveStateData.Auto))
            setShowManualMoreConfig(true);
    }, [deviceActiveStateData, currentDeviceInfoData]);
    var formik = formik_1.useFormik({
        enableReinitialize: true,
        initialValues: {
            blinkEnabled: false,
            blinkTimeGreenToRed: 2,
            amberEnabled: true,
            amberDurationGreenToRed: 3
        },
        validationSchema: Yup.object({
            blinkTimeGreenToRed: Yup.number().when("blinkEnabled", {
                is: true,
                then: function () {
                    return Yup.number()
                        .min(0, "Blink time must be at least 0")
                        .max(5, "Blink time must be at most 5")
                        .required("Blink time is required");
                },
                otherwise: function () { return Yup.number().notRequired(); }
            }),
            amberDurationGreenToRed: Yup.number().when("amberEnabled", {
                is: true,
                then: function () {
                    return Yup.number()
                        .min(0, "Amber duration must be at least 0")
                        .max(5, "Amber duration must be at most 5")
                        .required("Amber duration is required");
                },
                otherwise: function () { return Yup.number().notRequired(); }
            })
        }),
        onSubmit: function (values) { return __awaiter(void 0, void 0, void 0, function () {
            var encodedSignals_1, socket_1, sendMessage_1, message;
            var _a, _b;
            return __generator(this, function (_c) {
                try {
                    encodedSignals_1 = encodeSignals();
                    socket_1 = websocket_1.getWebSocket();
                    sendMessage_1 = function () {
                        socket_1.send(JSON.stringify({
                            event: "signal_request",
                            payload: {
                                DeviceID: params.deviceId,
                                initialSignalStrings: initialSignalStrings,
                                signalString: encodedSignals_1,
                                duration: 30,
                                blinkEnabled: !initialSignalStrings.includes("G")
                                    ? false
                                    : values.blinkEnabled,
                                blinkTimeGreenToRed: !initialSignalStrings.includes("G")
                                    ? 0
                                    : values.blinkTimeGreenToRed,
                                amberEnabled: !initialSignalStrings.includes("G")
                                    ? false
                                    : values.amberEnabled,
                                amberDurationGreenToRed: !initialSignalStrings.includes("G")
                                    ? 0
                                    : values.amberDurationGreenToRed
                            }
                        }));
                    };
                    if (socket_1.readyState === WebSocket.OPEN) {
                        sendMessage_1();
                    }
                    else {
                        socket_1.onopen = function () { return sendMessage_1(); };
                    }
                    setInitialSignalStrings(encodedSignals_1);
                    dispatch(UserDeviceSlice_1.getUserDeviceStateData(deviceId));
                }
                catch (error) {
                    message = ((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                    toastFunc_1.emitToastMessage(message, "error");
                }
                return [2 /*return*/];
            });
        }); }
    });
    react_1.useEffect(function () {
        var socket = websocket_1.getWebSocket();
        var handleFeedback = function (event) {
            var _a;
            var feedback = JSON.parse(event.data);
            if (feedback.event === "ping_received")
                return;
            if (((_a = feedback.payload) === null || _a === void 0 ? void 0 : _a.DeviceID) !== deviceId)
                return;
            switch (feedback.event) {
                case "intersection_control_feedback":
                    if (feedback.payload.error) {
                        toastFunc_1.emitToastMessage(feedback.payload.message, "error");
                    }
                    else {
                        setTimeout(function () {
                            dispatch(UserDeviceSlice_1.getUserDeviceStateData(deviceId));
                        }, 2000);
                    }
                    break;
                case "signal_feedback":
                    if (feedback.payload.error) {
                        toastFunc_1.emitToastMessage(feedback.payload.message, "error");
                    }
                    else {
                        setTimeout(function () {
                            dispatch(UserDeviceSlice_1.getUserDeviceStateData(deviceId));
                        }, 2000);
                    }
                    break;
                default:
                    console.log("Unhandled event:", feedback.event);
            }
        };
        socket === null || socket === void 0 ? void 0 : socket.addEventListener("message", handleFeedback);
        return function () {
            socket === null || socket === void 0 ? void 0 : socket.removeEventListener("message", handleFeedback);
        };
    }, [dispatch, deviceId]);
    var handleRedirectionToDevicePage = function () {
        var _a;
        var device = devices.find(function (device) { return device.deviceId === deviceId; });
        if (!device) {
            toastFunc_1.emitToastMessage("Device not found.", "error");
            return;
        }
        if (userType === "admin" && !((_a = device === null || device === void 0 ? void 0 : device.userDevice) === null || _a === void 0 ? void 0 : _a.allowAdminSupport)) {
            toastFunc_1.emitToastMessage("Admin support is not enabled for this device.", "error");
            return;
        }
        router.push(pathname + "/intersection_configuration");
        dispatch(SignalConfigSlice_1.setManualMode(false));
        dispatch(SignalConfigSlice_1.setIsIntersectionConfigurable(true));
    };
    if (showCommandsOnly) {
        return (React.createElement("div", { style: {
                width: "90%",
                border: "1px solid #ccc",
                margin: "10px auto",
                padding: "20px",
                borderRadius: "8px"
            } },
            React.createElement("div", null,
                React.createElement("h2", null, "Commands Control"),
                React.createElement("div", { className: "intersectionConfiguration__commands" },
                    React.createElement("button", { onClick: function () {
                            var action = (deviceActiveStateData === null || deviceActiveStateData === void 0 ? void 0 : deviceActiveStateData.Auto) ? "Manual" : "Auto";
                            handleRequest(action);
                        } }, (deviceActiveStateData === null || deviceActiveStateData === void 0 ? void 0 : deviceActiveStateData.Auto) ? "Switch to Manual"
                        : "Switch to Auto"),
                    React.createElement("button", { onClick: function () { return handleRequest("Hold"); } }, "Hold"),
                    React.createElement("button", { onClick: function () { return handleRequest("Next"); } }, "Next"),
                    React.createElement("button", { onClick: function () { return handleRequest("Reboot"); } }, "Reboot")),
                showManualMoreConfig && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "phases__buttonBox" },
                        React.createElement("button", { className: "phases__clear", onClick: function () {
                                dispatch(SignalConfigSlice_1.setSignalStringToAllRed());
                                dispatch(SignalConfigSlice_1.setSignalState());
                            } }, "All Red"),
                        React.createElement("button", { 
                            // className="phases__clear"
                            onClick: function () {
                                dispatch(SignalConfigSlice_1.setSignalStringToAllAmber());
                                dispatch(SignalConfigSlice_1.setSignalState());
                            } }, "All Yellow"),
                        React.createElement("button", { 
                            // className="phases__clear"
                            onClick: function () {
                                dispatch(SignalConfigSlice_1.setSignalStringToAllBlank());
                                dispatch(SignalConfigSlice_1.setSignalState());
                            } }, "All Blank")),
                    React.createElement("form", { onSubmit: formik.handleSubmit, className: "patterns__selected--form" },
                        React.createElement("div", null,
                            React.createElement("h3", null, "Blink and Amber Configuration"),
                            React.createElement("div", { className: "patterns__selected--title" },
                                React.createElement("label", null,
                                    React.createElement("input", { type: "checkbox", name: "blinkEnabled", checked: formik.values.blinkEnabled, onChange: formik.handleChange, onBlur: formik.handleBlur }),
                                    "Enable Blink"),
                                formik.values.blinkEnabled && (React.createElement("div", { className: "patterns__selected--item" },
                                    React.createElement("label", null, "Blink Time (Green to Red)"),
                                    React.createElement("input", { type: "number", name: "blinkTimeGreenToRed", value: formik.values.blinkTimeGreenToRed, min: 0, max: 5, onChange: function (e) {
                                            var value = Math.max(0, Math.min(5, Number(e.target.value)));
                                            formik.setFieldValue("blinkTimeGreenToRed", value);
                                        }, onBlur: formik.handleBlur, autoFocus: true }),
                                    formik.touched.blinkTimeGreenToRed &&
                                        formik.errors.blinkTimeGreenToRed && (React.createElement("div", null, formik.errors.blinkTimeGreenToRed))))),
                            React.createElement("div", { className: "patterns__selected--title" },
                                React.createElement("label", null,
                                    React.createElement("input", { type: "checkbox", name: "amberEnabled", checked: formik.values.amberEnabled, onChange: formik.handleChange, onBlur: formik.handleBlur }),
                                    "Enable Amber"),
                                formik.values.amberEnabled && (React.createElement("div", { className: "patterns__selected--item" },
                                    React.createElement("label", null, "Amber Duration (Green to Red)"),
                                    React.createElement("input", { type: "number", name: "amberDurationGreenToRed", value: formik.values.amberDurationGreenToRed, min: 0, max: 5, onChange: function (e) {
                                            var value = Math.max(0, Math.min(5, Number(e.target.value)));
                                            formik.setFieldValue("amberDurationGreenToRed", value);
                                        }, onBlur: formik.handleBlur }),
                                    formik.touched.amberDurationGreenToRed &&
                                        formik.errors.amberDurationGreenToRed && (React.createElement("div", null, formik.errors.amberDurationGreenToRed)))))),
                        React.createElement(Button_1["default"], { type: "submit", style: {
                                color: "white",
                                padding: "10px 20px",
                                backgroundColor: "#6c6128",
                                borderRadius: "5px"
                            } }, "Send Signal")))))));
    }
    return (React.createElement("section", { className: "intersectionConfiguration" },
        React.createElement("div", { className: "intersectionConfiguration__header" },
            React.createElement("h2", null, "Intersection Configuration"),
            React.createElement("button", { type: "button", onClick: handleRedirectionToDevicePage }, "Configure")),
        React.createElement("ul", { className: "intersectionConfiguration__list" }, intersectionConfigItems.map(function (item, index) { return (React.createElement(IntersectionConfigurationItem_1["default"], { key: index, item: item })); }))));
};
exports["default"] = IntersectionConfiguration;
