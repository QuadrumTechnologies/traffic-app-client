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
var react_1 = require("react");
var CheckBox_1 = require("../UI/CheckBox/CheckBox");
var reduxHook_1 = require("@/hooks/reduxHook");
var SignalConfigSlice_1 = require("@/store/signals/SignalConfigSlice");
var toastFunc_1 = require("@/utils/toastFunc");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var UserDeviceSlice_1 = require("@/store/devices/UserDeviceSlice");
var BoxOne = function () {
    var _a;
    var email = (_a = localStorageFunc_1.GetItemFromLocalStorage("user")) === null || _a === void 0 ? void 0 : _a.email;
    var dispatch = reduxHook_1.useAppDispatch();
    var _b = react_1.useState(1), checked = _b[0], setChecked = _b[1];
    var phases = reduxHook_1.useAppSelector(function (state) { return state.userDevice; }).phases;
    var _c = react_1.useState(""), activeOrLastAddedPhase = _c[0], setActiveOrLastAddedPhase = _c[1];
    var _d = react_1.useState([]), searchedResult = _d[0], setSearchedResult = _d[1];
    var _e = react_1.useState(false), showSearchedResult = _e[0], setShowSearchedResult = _e[1];
    var _f = react_1.useState(""), inputtedPhaseName = _f[0], setInputtedPhaseName = _f[1];
    var searchPhaseByName = function (phaseName) {
        var matchedPhases = phases.filter(function (phase) {
            return phase.name.toLowerCase().includes(phaseName.toLowerCase());
        });
        setSearchedResult(matchedPhases);
    };
    var phasesToShow = showSearchedResult ? searchedResult : phases;
    var handlePhasePreview = function (phaseName, signalString) {
        setActiveOrLastAddedPhase(phaseName);
        dispatch(SignalConfigSlice_1.setSignalString(signalString));
        dispatch(SignalConfigSlice_1.setSignalState());
    };
    var handleDeletePhase = function (phaseName) { return __awaiter(void 0, void 0, void 0, function () {
        var confirmResult, phase, phaseId, response, error_1, message;
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
                    response = _c.sent();
                    dispatch(UserDeviceSlice_1.getUserPhase(email));
                    setActiveOrLastAddedPhase(phaseName);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    message = ((_b = (_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                    toastFunc_1.emitToastMessage(message, "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteAllPhases = function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmResult, response, error_2, message;
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
                    response = _c.sent();
                    dispatch(UserDeviceSlice_1.getUserPhase(email));
                    setActiveOrLastAddedPhase("");
                    setSearchedResult([]);
                    setShowSearchedResult(false);
                    setInputtedPhaseName("");
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
                    React.createElement("button", { onClick: function () { return handleDeletePhase(phase.name); } }, "Delete")))); })))) : (React.createElement("div", { className: "phases__noPhase" }, "You have not created any phase yet.")),
        React.createElement(CheckBox_1["default"], { name: "liability", checked: checked, description: (!checked
                ? "Conflicts Check is Disabled"
                : "Conflicts Check is Enabled") + " ", onChecked: function (e) { return __awaiter(void 0, void 0, void 0, function () {
                var password, reason, error_3, message;
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
                            error_3 = _c.sent();
                            message = ((_b = (_a = error_3 === null || error_3 === void 0 ? void 0 : error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
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
            React.createElement("p", null, "Add a new phase by configuring each signal, then click the add icon at the center of the intersection to enter the phase name."))),
        !phases || (phases === null || phases === void 0 ? void 0 : phases.length) === 0 ? (React.createElement("p", null, "Once you have completed the signal configuration, click on the add icon at the center of the intersection. You will be prompted to enter a name for the phase before submitting.")) : null,
        React.createElement("div", { className: "phases__buttonBox" },
            React.createElement("button", { className: "phases__clear", onClick: function () {
                    dispatch(SignalConfigSlice_1.setSignalStringToAllRed());
                    dispatch(SignalConfigSlice_1.setSignalState());
                } }, "All Red"),
            React.createElement("button", { className: "phases__clear", onClick: function () {
                    dispatch(SignalConfigSlice_1.setSignalStringToAllAmber());
                    dispatch(SignalConfigSlice_1.setSignalState());
                } }, "All Yellow"),
            React.createElement("button", { className: "phases__clear", onClick: function () {
                    dispatch(SignalConfigSlice_1.setSignalStringToAllBlank());
                    dispatch(SignalConfigSlice_1.setSignalState());
                } }, "All Blank"))));
};
exports["default"] = BoxOne;
