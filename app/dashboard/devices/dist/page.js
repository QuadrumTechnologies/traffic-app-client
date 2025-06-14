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
var AddDeviceModal_1 = require("@/components/Modals/AddDeviceModal");
var OverlayModal_1 = require("@/components/Modals/OverlayModal");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var fa_1 = require("react-icons/fa");
var bs_1 = require("react-icons/bs");
var ri_1 = require("react-icons/ri");
var reduxHook_1 = require("@/hooks/reduxHook");
var LoadingSpinner_1 = require("@/components/UI/LoadingSpinner/LoadingSpinner");
var useDeviceStatus_1 = require("@/hooks/useDeviceStatus");
var misc_1 = require("@/utils/misc");
var websocket_1 = require("../websocket");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var toastFunc_1 = require("@/utils/toastFunc");
var ci_1 = require("react-icons/ci");
var useOutsideClick_1 = require("@/hooks/useOutsideClick");
var UserDeviceSlice_1 = require("@/store/devices/UserDeviceSlice");
var dayjs_1 = require("dayjs");
var UserDevices = function () {
    var _a = reduxHook_1.useAppSelector(function (state) { return state.userDevice; }), devices = _a.devices, isFetchingDevices = _a.isFetchingDevices;
    websocket_1.getWebSocket();
    var dispatch = reduxHook_1.useAppDispatch();
    var statuses = useDeviceStatus_1.useDeviceStatus();
    var pathname = navigation_1.usePathname();
    var router = navigation_1.useRouter();
    var _b = react_1.useState(false), showAddDeviceModal = _b[0], setShowAddDeviceModal = _b[1];
    var _c = react_1.useState(null), selectedDeviceId = _c[0], setSelectedDeviceId = _c[1];
    var _d = react_1.useState(false), showOptions = _d[0], setShowOptions = _d[1];
    var deviceActionModal = react_1.useRef(null);
    var closeDeviceActionModal = function () {
        setShowOptions(false);
    };
    useOutsideClick_1.useOutsideClick(deviceActionModal, closeDeviceActionModal);
    console.log("Device statuses:", statuses);
    var handleRedirectionToDevicePage = function (deviceId) {
        router.push(pathname + "/" + deviceId);
    };
    var confirmAction = function () { return __awaiter(void 0, void 0, void 0, function () {
        var password, user, reason, error_1, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedDeviceId)
                        return [2 /*return*/];
                    password = prompt("Device " + selectedDeviceId + " will be moved to trash for 30 days. After this period, it will be permanently deleted. Admins can delete it permanently at any time. Enter your password to continue.");
                    if (!password)
                        return [2 /*return*/];
                    user = localStorageFunc_1.GetItemFromLocalStorage("user");
                    reason = "Device " + selectedDeviceId + " moved to trash by user";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, HttpRequest_1["default"].post("/confirm-password", {
                            email: user === null || user === void 0 ? void 0 : user.email,
                            reason: reason,
                            password: password
                        })];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, HttpRequest_1["default"].patch("/devices/" + selectedDeviceId + "/availability", {
                            restore: false
                        })];
                case 3:
                    _c.sent();
                    dispatch(UserDeviceSlice_1.getUserDevice());
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    message = ((_b = (_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                    toastFunc_1.emitToastMessage(message, "error");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isFetchingDevices)
        return React.createElement(LoadingSpinner_1["default"], { color: "blue", height: "big" });
    return (React.createElement("aside", { className: "devices" },
        React.createElement("div", { className: "devices-header" },
            React.createElement("h2", { className: "page-header" }, "My Devices"),
            React.createElement("button", { onClick: function () { return setShowAddDeviceModal(true); } },
                React.createElement(fa_1.FaPlus, null),
                " Add New"),
            showAddDeviceModal && (React.createElement(OverlayModal_1["default"], { onClose: function () { return setShowAddDeviceModal(false); } },
                React.createElement(AddDeviceModal_1["default"], { closeModal: function () { return setShowAddDeviceModal(false); } })))),
        (devices === null || devices === void 0 ? void 0 : devices.length) === 0 && (React.createElement("div", { className: "devices-nodevice" },
            React.createElement(ri_1.RiCreativeCommonsZeroFill, null),
            React.createElement("p", null, "You haven't created any device yet, kindly add a device to continue."),
            React.createElement("button", { className: "devices-button", onClick: function () { return setShowAddDeviceModal(true); } }, "Add Device"))),
        React.createElement("div", { className: "devices-list" }, devices === null || devices === void 0 ? void 0 : devices.map(function (device, index) {
            var _a;
            var status = misc_1.getDeviceStatus(statuses, device.deviceId);
            return (React.createElement("div", { key: index, className: "devices-item " + ((device === null || device === void 0 ? void 0 : device.status) === "disabled" ? "disabled" : "") },
                React.createElement(bs_1.BsDeviceSsd, { className: "devices-item__icon" }),
                React.createElement("div", { className: "devices-item__details" },
                    React.createElement("h3", { onClick: function () { return handleRedirectionToDevicePage(device.deviceId); } }, ((_a = device === null || device === void 0 ? void 0 : device.info) === null || _a === void 0 ? void 0 : _a.JunctionId) || "No Junction ID"),
                    React.createElement("p", null, device === null || device === void 0 ? void 0 :
                        device.deviceType,
                        " : ",
                        device.deviceId)),
                React.createElement("div", null,
                    React.createElement("div", { className: "devices-item__status", style: {
                            display: "flex",
                            justifyContent: "flex-end"
                        } }, device === null || device === void 0 ? void 0 :
                        device.status.toUpperCase(),
                        (status === null || status === void 0 ? void 0 : status.status) ? (React.createElement("div", { className: "devices_on" },
                            React.createElement("p", null, "Online"))) : (React.createElement("div", { className: "devices_off" },
                            React.createElement("p", null, "Offline")))),
                    React.createElement("div", { style: {
                            display: "flex",
                            justifyContent: "flex-end",
                            fontSize: "1.4rem",
                            letterSpacing: "0.05rem",
                            color: "#888"
                        } }, !(status === null || status === void 0 ? void 0 : status.status) && (device === null || device === void 0 ? void 0 : device.lastSeen)
                        ? "Last seen: " + dayjs_1["default"](device === null || device === void 0 ? void 0 : device.lastSeen).format("YYYY-MM-DD HH:mm:ss")
                        : !(status === null || status === void 0 ? void 0 : status.status) && !(device === null || device === void 0 ? void 0 : device.lastSeen)
                            ? "Last seen: Never connected"
                            : null)),
                React.createElement("div", { className: "deviceConfigPage__menu" },
                    React.createElement(ci_1.CiMenuKebab, { size: 24, className: "deviceConfigPage__menu-icon", onClick: function () {
                            setSelectedDeviceId(device.deviceId);
                            setShowOptions(function (prev) { return !prev; });
                        } }),
                    showOptions && selectedDeviceId === device.deviceId && (React.createElement("div", { className: "deviceConfigPage__menu-dropdown", ref: deviceActionModal },
                        React.createElement("button", { className: "deviceConfigPage__menu-dropdown-button", onClick: confirmAction, disabled: device === null || device === void 0 ? void 0 : device.isTrash }, (device === null || device === void 0 ? void 0 : device.isTrash) ? "In Trash" : "Move to Trash"))))));
        }))));
};
exports["default"] = UserDevices;
