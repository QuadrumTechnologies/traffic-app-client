"use client";
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var react_1 = require("react");
var styled_components_1 = require("styled-components");
var CheckBox_1 = require("../UI/CheckBox/CheckBox");
var reduxHook_1 = require("@/hooks/reduxHook");
var SignalConfigSlice_1 = require("@/store/signals/SignalConfigSlice");
var toastFunc_1 = require("@/utils/toastFunc");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var UserDeviceSlice_1 = require("@/store/devices/UserDeviceSlice");
var navigation_1 = require("next/navigation");
var ai_1 = require("react-icons/ai");
// Styled components for phase creation and edit modal
var ModalBackdrop = styled_components_1["default"].div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background-color: rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(1px);\n  z-index: 1000;\n  pointer-events: auto;\n"], ["\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background-color: rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(1px);\n  z-index: 1000;\n  pointer-events: auto;\n"])));
var PhaseContainer = styled_components_1["default"].form(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  min-width: 500px;\n  max-height: 80vh;\n  border: 0.1rem solid #ccc;\n  overflow-y: auto;\n  background-color: #ffffff;\n  padding: 3rem;\n  border-radius: 0.4rem;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 0.6rem;\n  z-index: 1001;\n  pointer-events: auto;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n"], ["\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  min-width: 500px;\n  max-height: 80vh;\n  border: 0.1rem solid #ccc;\n  overflow-y: auto;\n  background-color: #ffffff;\n  padding: 3rem;\n  border-radius: 0.4rem;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 0.6rem;\n  z-index: 1001;\n  pointer-events: auto;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n"])));
var PhaseNameInput = styled_components_1["default"].input(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  padding: 0.5rem;\n  border: 0.1rem solid #ccc;\n  border-radius: 0.4rem;\n  font-size: 1.4rem;\n  width: 100%;\n\n  &:focus {\n    outline: none;\n    border-color: #514604;\n  }\n\n  &:hover {\n    border-color: #2a2a29;\n  }\n"], ["\n  padding: 0.5rem;\n  border: 0.1rem solid #ccc;\n  border-radius: 0.4rem;\n  font-size: 1.4rem;\n  width: 100%;\n\n  &:focus {\n    outline: none;\n    border-color: #514604;\n  }\n\n  &:hover {\n    border-color: #2a2a29;\n  }\n"])));
var PhaseNameDisplay = styled_components_1["default"].div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding: 0.5rem;\n  font-size: 1.4rem;\n  font-weight: bold;\n  width: 100%;\n"], ["\n  padding: 0.5rem;\n  font-size: 1.4rem;\n  font-weight: bold;\n  width: 100%;\n"])));
var AddPhaseButton = styled_components_1["default"].button(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  padding: 0.8rem 1rem;\n  background-color: ", ";\n  color: white;\n  border: none;\n  border-radius: 0.4rem;\n  cursor: ", ";\n  font-size: 1.4rem;\n  width: 100%;\n  opacity: ", ";\n\n  &:hover:not(:disabled) {\n    background-color: #2a2a29;\n  }\n"], ["\n  padding: 0.8rem 1rem;\n  background-color: ", ";\n  color: white;\n  border: none;\n  border-radius: 0.4rem;\n  cursor: ", ";\n  font-size: 1.4rem;\n  width: 100%;\n  opacity: ", ";\n\n  &:hover:not(:disabled) {\n    background-color: #2a2a29;\n  }\n"])), function (_a) {
    var disabled = _a.disabled;
    return (disabled ? "#cccccc" : "#514604");
}, function (_a) {
    var disabled = _a.disabled;
    return (disabled ? "not-allowed" : "pointer");
}, function (_a) {
    var disabled = _a.disabled;
    return (disabled ? 0.6 : 1);
});
var SettingsSection = styled_components_1["default"].div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  width: 100%;\n  margin-top: 1rem;\n"], ["\n  width: 100%;\n  margin-top: 1rem;\n"])));
var CloseIcon = styled_components_1["default"](ai_1.AiOutlineClose)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  position: absolute;\n  top: 16px;\n  right: 16px;\n  cursor: pointer;\n  color: #555;\n  &:hover {\n    color: #f00;\n  }\n"], ["\n  position: absolute;\n  top: 16px;\n  right: 16px;\n  cursor: pointer;\n  color: #555;\n  &:hover {\n    color: #f00;\n  }\n"])));
var SettingLabel = styled_components_1["default"].label(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n"], ["\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n"])));
var SettingInput = styled_components_1["default"].input(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n  padding: 0.5rem;\n  border: 0.1rem solid #ccc;\n  border-radius: 0.4rem;\n  width: 60px;\n\n  &:disabled {\n    background-color: #f0f0f0;\n  }\n"], ["\n  padding: 0.5rem;\n  border: 0.1rem solid #ccc;\n  border-radius: 0.4rem;\n  width: 60px;\n\n  &:disabled {\n    background-color: #f0f0f0;\n  }\n"])));
var BoxOne = function () {
    var _a;
    var openInputModal = reduxHook_1.useAppSelector(function (state) { return state.signalConfig; }).openInputModal;
    var email = (_a = localStorageFunc_1.GetItemFromLocalStorage("user")) === null || _a === void 0 ? void 0 : _a.email;
    var params = navigation_1.useParams();
    var dispatch = reduxHook_1.useAppDispatch();
    var _b = react_1.useState(1), checked = _b[0], setChecked = _b[1];
    var phases = reduxHook_1.useAppSelector(function (state) { return state.userDevice; }).phases;
    var landingPageSignals = reduxHook_1.useAppSelector(function (state) { return state.signalConfig; }).landingPageSignals;
    var _c = react_1.useState(""), activeOrLastAddedPhase = _c[0], setActiveOrLastAddedPhase = _c[1];
    var _d = react_1.useState([]), searchedResult = _d[0], setSearchedResult = _d[1];
    var _e = react_1.useState(false), showSearchedResult = _e[0], setShowSearchedResult = _e[1];
    var _f = react_1.useState(""), inputtedPhaseName = _f[0], setInputtedPhaseName = _f[1];
    var _g = react_1.useState(false), isCreatingPhase = _g[0], setIsCreatingPhase = _g[1];
    var _h = react_1.useState(false), isEditingPhase = _h[0], setIsEditingPhase = _h[1];
    var _j = react_1.useState(""), phaseName = _j[0], setPhaseName = _j[1];
    var _k = react_1.useState(null), editPhaseId = _k[0], setEditPhaseId = _k[1];
    var _l = react_1.useState({
        enableBlink: false,
        redToGreenDelay: 0,
        greenToRedDelay: 2,
        enableAmber: true,
        enableAmberBlink: false,
        redToGreenAmberDelay: 0,
        greenToRedAmberDelay: 3,
        holdRedSignalOnAmber: false,
        holdGreenSignalOnAmber: false
    }), phaseSettings = _l[0], setPhaseSettings = _l[1];
    var searchPhaseByName = function (phaseName) {
        var matchedPhases = phases.filter(function (phase) {
            return phase.name.toLowerCase().includes(phaseName.toLowerCase());
        });
        setSearchedResult(matchedPhases);
    };
    var phasesToShow = showSearchedResult ? searchedResult : phases;
    var encodeSignals = function (signals) {
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
        return ("*" +
            signals
                .map(function (signal) {
                var adjacentPedestrian = getAdjacentPedestrianSignal(signals, signal.direction);
                return "" + signal.direction + signal.left + signal.straight + signal.right + signal.bike + signal.pedestrian + adjacentPedestrian;
            })
                .join("") +
            "#");
    };
    var handlePhasePreview = function (phaseName, signalString) {
        setActiveOrLastAddedPhase(phaseName);
        dispatch(SignalConfigSlice_1.setSignalString(signalString));
        dispatch(SignalConfigSlice_1.setSignalState());
    };
    var handleEditPhase = function (phase) {
        var currentEncodedSignals = encodeSignals(landingPageSignals);
        localStorageFunc_1.SetItemToLocalStorage("newtempSignals", currentEncodedSignals);
        // Check if the current signals differ from the phase's original signals
        if (currentEncodedSignals !== phase.data) {
            var confirmEdit = window.confirm("You have modified the signal configuration. Do you want to use the updated configuration for editing this phase?");
            if (!confirmEdit) {
                toastFunc_1.emitToastMessage("Edit cancelled. Signal configuration unchanged.", "info");
                return;
            }
        }
        // Store current signals to ensure they persist
        setEditPhaseId(phase._id);
        setPhaseName(phase.name);
        setPhaseSettings({
            enableBlink: phase.enableBlink,
            redToGreenDelay: phase.redToGreenDelay,
            greenToRedDelay: phase.greenToRedDelay,
            enableAmber: phase.enableAmber,
            enableAmberBlink: phase.enableAmberBlink,
            redToGreenAmberDelay: phase.redToGreenAmberDelay,
            greenToRedAmberDelay: phase.greenToRedAmberDelay,
            holdRedSignalOnAmber: phase.holdRedSignalOnAmber,
            holdGreenSignalOnAmber: phase.holdGreenSignalOnAmber
        });
        dispatch(SignalConfigSlice_1.setSignalString(phase.data));
        dispatch(SignalConfigSlice_1.setSignalState());
        setIsEditingPhase(true);
        dispatch(SignalConfigSlice_1.setInputModal(true));
    };
    var handleUpdatePhase = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var user, signalsFromLocalStorage, phase, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!editPhaseId) {
                        toastFunc_1.emitToastMessage("No phase selected for editing", "error");
                        return [2 /*return*/];
                    }
                    setIsCreatingPhase(true);
                    user = localStorageFunc_1.GetItemFromLocalStorage("user");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    signalsFromLocalStorage = localStorageFunc_1.GetItemFromLocalStorage("newtempSignals");
                    phase = {
                        name: phaseName.toUpperCase(),
                        data: signalsFromLocalStorage,
                        deviceId: params.deviceId,
                        enableBlink: phaseSettings.enableBlink,
                        redToGreenDelay: phaseSettings.redToGreenDelay,
                        greenToRedDelay: phaseSettings.greenToRedDelay,
                        enableAmber: phaseSettings.enableAmber,
                        enableAmberBlink: phaseSettings.enableAmberBlink,
                        redToGreenAmberDelay: phaseSettings.redToGreenAmberDelay,
                        greenToRedAmberDelay: phaseSettings.greenToRedAmberDelay,
                        holdRedSignalOnAmber: phaseSettings.holdRedSignalOnAmber,
                        holdGreenSignalOnAmber: phaseSettings.holdGreenSignalOnAmber
                    };
                    return [4 /*yield*/, HttpRequest_1["default"].patch("/phases/" + editPhaseId + "/" + user.email, {
                            phase: phase
                        })];
                case 2:
                    data = (_a.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPhase(user.email));
                    toastFunc_1.emitToastMessage(data.message, "success");
                    setIsCreatingPhase(false);
                    setPhaseName("");
                    setEditPhaseId(null);
                    setPhaseSettings({
                        enableBlink: false,
                        redToGreenDelay: 0,
                        greenToRedDelay: 2,
                        enableAmber: true,
                        enableAmberBlink: false,
                        redToGreenAmberDelay: 0,
                        greenToRedAmberDelay: 3,
                        holdRedSignalOnAmber: false,
                        holdGreenSignalOnAmber: false
                    });
                    dispatch(SignalConfigSlice_1.setInputModal(false));
                    setIsEditingPhase(false);
                    setActiveOrLastAddedPhase(phaseName);
                    localStorageFunc_1.SetItemToLocalStorage("tempSignals", []); // Clear local storage after update
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error updating phase:", error_1);
                    toastFunc_1.emitToastMessage((error_1 === null || error_1 === void 0 ? void 0 : error_1.response.data.message) || "Failed to update phase", "error");
                    setIsCreatingPhase(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeletePhase = function (phaseName) { return __awaiter(void 0, void 0, void 0, function () {
        var confirmResult, phase, phaseId, data, error_2, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    confirmResult = confirm("Are you sure you want to delete \"" + phaseName + "\" phase?");
                    if (!confirmResult) {
                        toastFunc_1.emitToastMessage("Phase deletion cancelled", "info");
                        return [2 /*return*/];
                    }
                    phase = phases === null || phases === void 0 ? void 0 : phases.find(function (p) { return p.name === phaseName; });
                    phaseId = phase === null || phase === void 0 ? void 0 : phase._id;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, HttpRequest_1["default"]["delete"]("/phases/" + phaseId + "/" + email)];
                case 2:
                    data = (_c.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPhase(email));
                    setActiveOrLastAddedPhase(phaseName);
                    toastFunc_1.emitToastMessage(data.message, "success");
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _c.sent();
                    message = ((_b = (_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                    toastFunc_1.emitToastMessage(message, "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteAllPhases = function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmResult, data, error_3, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    confirmResult = confirm("Are you sure you want to delete ALL phases? This action cannot be undone.");
                    if (!confirmResult) {
                        toastFunc_1.emitToastMessage("All phases deletion cancelled", "info");
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, HttpRequest_1["default"]["delete"]("/phases/all/" + email)];
                case 2:
                    data = (_c.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPhase(email));
                    setActiveOrLastAddedPhase("");
                    setSearchedResult([]);
                    setShowSearchedResult(false);
                    setInputtedPhaseName("");
                    toastFunc_1.emitToastMessage(data.message, "success");
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _c.sent();
                    message = ((_b = (_a = error_3 === null || error_3 === void 0 ? void 0 : error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                    toastFunc_1.emitToastMessage(message, "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleAddPhase = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var user, encodedSignals, phase, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!phaseName) {
                        alert("Please enter a name for the phase.");
                        return [2 /*return*/];
                    }
                    setIsCreatingPhase(true);
                    user = localStorageFunc_1.GetItemFromLocalStorage("user");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    encodedSignals = encodeSignals(landingPageSignals);
                    phase = {
                        name: phaseName.toUpperCase(),
                        data: encodedSignals,
                        deviceId: params.deviceId,
                        enableBlink: phaseSettings.enableBlink,
                        redToGreenDelay: phaseSettings.redToGreenDelay,
                        greenToRedDelay: phaseSettings.greenToRedDelay,
                        enableAmber: phaseSettings.enableAmber,
                        enableAmberBlink: phaseSettings.enableAmberBlink,
                        redToGreenAmberDelay: phaseSettings.redToGreenAmberDelay,
                        greenToRedAmberDelay: phaseSettings.greenToRedAmberDelay,
                        holdRedSignalOnAmber: phaseSettings.holdRedSignalOnAmber,
                        holdGreenSignalOnAmber: phaseSettings.holdGreenSignalOnAmber
                    };
                    return [4 /*yield*/, HttpRequest_1["default"].post("/phases", {
                            email: user.email,
                            phase: phase
                        })];
                case 2:
                    data = (_a.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPhase(user.email));
                    toastFunc_1.emitToastMessage(data.message, "success");
                    setIsCreatingPhase(false);
                    setPhaseName("");
                    setPhaseSettings({
                        enableBlink: false,
                        redToGreenDelay: 0,
                        greenToRedDelay: 2,
                        enableAmber: true,
                        enableAmberBlink: false,
                        redToGreenAmberDelay: 0,
                        greenToRedAmberDelay: 3,
                        holdRedSignalOnAmber: false,
                        holdGreenSignalOnAmber: false
                    });
                    dispatch(SignalConfigSlice_1.setInputModal(false));
                    setActiveOrLastAddedPhase(phaseName);
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error adding phase:", error_4);
                    toastFunc_1.emitToastMessage((error_4 === null || error_4 === void 0 ? void 0 : error_4.response.data.message) || "Failed to create phase", "error");
                    setIsCreatingPhase(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        if (email) {
            dispatch(UserDeviceSlice_1.getUserPhase(email));
        }
        dispatch(SignalConfigSlice_1.closePreviewCreatedPatternPhase());
        dispatch(SignalConfigSlice_1.setIsIntersectionConfigurable(true));
        return function () {
            dispatch(SignalConfigSlice_1.closePreviewCreatedPatternPhase());
        };
    }, [dispatch, email]);
    return (React.createElement("div", { className: "boxOne" },
        phases && (phases === null || phases === void 0 ? void 0 : phases.length) > 0 ? (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "phases__header" },
                React.createElement("h2", null, "Available Phase(s)"),
                React.createElement("form", { onSubmit: function (e) {
                        e.preventDefault();
                        searchPhaseByName(inputtedPhaseName);
                    } },
                    React.createElement("input", { type: "text", placeholder: "Find a phase by its name", value: inputtedPhaseName, onChange: function (e) {
                            setInputtedPhaseName(e.target.value);
                            searchPhaseByName(e.target.value);
                            setShowSearchedResult(true);
                        } }))),
            React.createElement("div", { style: {
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    margin: "-.5rem 0 1rem 0"
                } },
                React.createElement("button", { className: "phases__deleteAll", onClick: handleDeleteAllPhases, disabled: !phases || phases.length === 0 }, "Delete All Phases")),
            React.createElement("ul", { className: "phases" }, phasesToShow === null || phasesToShow === void 0 ? void 0 : phasesToShow.map(function (phase, index) { return (React.createElement("li", { className: "phases__item " + (activeOrLastAddedPhase === phase.name && "active"), key: phase._id || index },
                React.createElement("h3", null, phase.name),
                React.createElement("div", null,
                    React.createElement("button", { onClick: function () { return handlePhasePreview(phase.name, phase.data); } }, "Preview"),
                    React.createElement("button", { onClick: function () { return handleEditPhase(phase); } }, "Edit"),
                    React.createElement("button", { onClick: function () { return handleDeletePhase(phase.name); } }, "Delete")))); })))) : (React.createElement("div", { className: "phases__noPhase" }, "You have not created any phase yet.")),
        openInputModal && (React.createElement(ModalBackdrop, { onClick: function () { return dispatch(SignalConfigSlice_1.setInputModal(false)); } },
            React.createElement(PhaseContainer, { onSubmit: isEditingPhase ? handleUpdatePhase : handleAddPhase, onClick: function (e) { return e.stopPropagation(); } },
                React.createElement(CloseIcon, { size: 20, style: {
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        cursor: "pointer",
                        color: "#555"
                    }, onClick: function () {
                        dispatch(SignalConfigSlice_1.setInputModal(false));
                        setIsEditingPhase(false);
                        setEditPhaseId(null);
                        setPhaseName("");
                        setPhaseSettings({
                            enableBlink: false,
                            redToGreenDelay: 0,
                            greenToRedDelay: 2,
                            enableAmber: true,
                            enableAmberBlink: false,
                            redToGreenAmberDelay: 0,
                            greenToRedAmberDelay: 3,
                            holdRedSignalOnAmber: false,
                            holdGreenSignalOnAmber: false
                        });
                        localStorageFunc_1.SetItemToLocalStorage("newtempSignals", []);
                    } }),
                isEditingPhase ? (React.createElement(PhaseNameDisplay, null, phaseName)) : (React.createElement(PhaseNameInput, { type: "text", placeholder: "Enter phase name", value: phaseName, onChange: function (e) { return setPhaseName(e.target.value); }, autoFocus: true })),
                React.createElement(SettingsSection, null,
                    React.createElement("h3", null, "Blink Settings"),
                    React.createElement(SettingLabel, null,
                        React.createElement("input", { type: "checkbox", checked: phaseSettings.enableBlink, onChange: function (e) {
                                return setPhaseSettings(__assign(__assign({}, phaseSettings), { enableBlink: e.target.checked }));
                            } }),
                        "Enable Blink"),
                    React.createElement(SettingLabel, null,
                        "Red to Green Delay (s):",
                        React.createElement(SettingInput, { type: "number", min: "2", max: "5", value: phaseSettings.redToGreenDelay, onChange: function (e) {
                                return setPhaseSettings(__assign(__assign({}, phaseSettings), { redToGreenDelay: Number(e.target.value) }));
                            }, disabled: !phaseSettings.enableBlink })),
                    React.createElement(SettingLabel, null,
                        "Green to Red Delay (s):",
                        React.createElement(SettingInput, { type: "number", min: "0", max: "5", value: phaseSettings.greenToRedDelay, onChange: function (e) {
                                return setPhaseSettings(__assign(__assign({}, phaseSettings), { greenToRedDelay: Number(e.target.value) }));
                            }, disabled: !phaseSettings.enableBlink }))),
                React.createElement(SettingsSection, null,
                    React.createElement("h3", null, "Amber Settings"),
                    React.createElement(SettingLabel, null,
                        React.createElement("input", { type: "checkbox", checked: phaseSettings.enableAmber, onChange: function (e) {
                                return setPhaseSettings(__assign(__assign({}, phaseSettings), { enableAmber: e.target.checked }));
                            } }),
                        "Enable Amber"),
                    phaseSettings.enableAmber && (React.createElement(React.Fragment, null,
                        React.createElement(SettingLabel, null,
                            React.createElement("input", { type: "checkbox", checked: phaseSettings.enableAmberBlink, onChange: function (e) {
                                    return setPhaseSettings(__assign(__assign({}, phaseSettings), { enableAmberBlink: e.target.checked }));
                                } }),
                            "Enable Amber Blink"),
                        React.createElement(SettingLabel, null,
                            "Red to Green Amber Delay (s):",
                            React.createElement(SettingInput, { type: "number", min: "0", max: "5", value: phaseSettings.redToGreenAmberDelay, onChange: function (e) {
                                    return setPhaseSettings(__assign(__assign({}, phaseSettings), { redToGreenAmberDelay: Number(e.target.value) }));
                                } })),
                        React.createElement(SettingLabel, null,
                            "Green to Red Amber Delay (s):",
                            React.createElement(SettingInput, { type: "number", min: "3", max: "5", value: phaseSettings.greenToRedAmberDelay, onChange: function (e) {
                                    return setPhaseSettings(__assign(__assign({}, phaseSettings), { greenToRedAmberDelay: Number(e.target.value) }));
                                } }))))),
                React.createElement(AddPhaseButton, { type: "submit", disabled: isCreatingPhase }, isCreatingPhase
                    ? "Processing..."
                    : isEditingPhase
                        ? "Update"
                        : "Create")))),
        React.createElement(CheckBox_1["default"], { name: "liability", checked: checked, description: (!checked
                ? "Conflicts Check is Disabled"
                : "Conflicts Check is Enabled") + " ", onChecked: function (e) { return __awaiter(void 0, void 0, void 0, function () {
                var password, reason, error_5, message;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!!e.target.checked) return [3 /*break*/, 5];
                            password = prompt("Please enter your password to proceed");
                            if (!password) {
                                toastFunc_1.emitToastMessage("Password verification cancelled", "info");
                                return [2 /*return*/];
                            }
                            reason = "Device " + (!checked ? "Enable Conflicts Check" : "Disable Conflicts Check") + " action requested by user";
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, HttpRequest_1["default"].post("/confirm-password", {
                                    email: localStorageFunc_1.GetItemFromLocalStorage("user").email,
                                    reason: reason,
                                    password: password
                                })];
                        case 2:
                            _c.sent();
                            dispatch(SignalConfigSlice_1.allowConflictConfig(true));
                            setChecked(0);
                            return [3 /*break*/, 4];
                        case 3:
                            error_5 = _c.sent();
                            message = ((_b = (_a = error_5 === null || error_5 === void 0 ? void 0 : error_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                            toastFunc_1.emitToastMessage(message, "error");
                            return [3 /*break*/, 4];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            setChecked(1);
                            dispatch(SignalConfigSlice_1.setSignalStringToAllRed());
                            dispatch(SignalConfigSlice_1.setSignalState());
                            dispatch(SignalConfigSlice_1.allowConflictConfig(false));
                            _c.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            }); } }),
        !phases || (phases === null || phases === void 0 ? void 0 : phases.length) === 0 ? (React.createElement("p", null,
            "To create a phase, configure each signal by toggling the corresponding lights. If a potential conflict arises, you will receive a notification. If you choose to proceed despite the conflict, you can confirm by selecting the checkbox above. ",
            React.createElement("strong", null, "Note:"),
            " You are responsible for any accidents resulting from the conflict. If the checkbox is unchecked at any point, your current configuration will be discarded.")) : (React.createElement("div", null,
            React.createElement("p", null, "Add a new phase by configuring each signal, then click the add icon to enter the phase name and settings.")))));
};
exports["default"] = BoxOne;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
