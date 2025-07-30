"use client";
"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var formik_1 = require("formik");
var Yup = require("yup");
var reduxHook_1 = require("@/hooks/reduxHook");
var SignalConfigSlice_1 = require("@/store/signals/SignalConfigSlice");
var react_beautiful_dnd_1 = require("react-beautiful-dnd");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
var toastFunc_1 = require("@/utils/toastFunc");
var UserDeviceSlice_1 = require("@/store/devices/UserDeviceSlice");
var fa_1 = require("react-icons/fa");
var md_1 = require("react-icons/md");
var io5_1 = require("react-icons/io5");
var navigation_1 = require("next/navigation");
var BoxTwo = function () {
    var _a, _b;
    var searchParams = navigation_1.useSearchParams();
    var isTabTwo = searchParams.get("tab") === "2";
    var email = (_a = localStorageFunc_1.GetItemFromLocalStorage("user")) === null || _a === void 0 ? void 0 : _a.email;
    var params = navigation_1.useParams();
    var dispatch = reduxHook_1.useAppDispatch();
    var _c = reduxHook_1.useAppSelector(function (state) { return state.userDevice; }), phases = _c.phases, patterns = _c.patterns, configuredPhases = _c.configuredPhases;
    var _d = react_1.useState(false), showAllAvailablePhases = _d[0], setShowAllAvailablePhases = _d[1];
    var _e = react_1.useState(false), showOtherPatternConfig = _e[0], setShowOtherPatternConfig = _e[1];
    var _f = react_1.useState(null), showPatternPhases = _f[0], setShowPatternPhases = _f[1];
    var _g = react_1.useState(null), selectedPattern = _g[0], setSelectedPattern = _g[1];
    var _h = react_1.useState([]), updatedPatternPhases = _h[0], setUpdatedPatternPhases = _h[1];
    var _j = react_1.useState([]), selectedPhases = _j[0], setSelectedPhases = _j[1];
    var _k = react_1.useState(null), phaseToConfigure = _k[0], setPhaseToConfigure = _k[1];
    var _l = react_1.useState(null), alreadyCreatedPatternPhaseToConfigure = _l[0], setAlreadyCreatedPatternPhaseToConfigure = _l[1];
    var _m = react_1.useState(""), activeOrLastAddedPhase = _m[0], setActiveOrLastAddedPhase = _m[1];
    var _o = react_1.useState(null), activeAction = _o[0], setActiveAction = _o[1];
    var _p = react_1.useState(null), activePreviewPhase = _p[0], setActivePreviewPhase = _p[1];
    var _q = react_1.useState([]), searchedResult = _q[0], setSearchedResult = _q[1];
    var _r = react_1.useState(false), showSearchedResult = _r[0], setShowSearchedResult = _r[1];
    var _s = react_1.useState(""), inputtedPatternName = _s[0], setInputtedPatternName = _s[1];
    var _t = react_1.useState(""), newPatternName = _t[0], setNewPatternName = _t[1];
    var searchPatternByName = function (patternName) {
        var matchedPhases = patterns.filter(function (pattern) {
            return pattern.name.toLowerCase().includes(patternName.toLowerCase());
        });
        setSearchedResult(matchedPhases);
    };
    var patternsToShow = showSearchedResult ? searchedResult : patterns;
    var handleActionClick = function (action) {
        setActiveAction(action);
    };
    var handleSelectPattern = function (pattern, index) {
        if (showPatternPhases === index) {
            setShowPatternPhases(null);
            setSelectedPattern(null);
            setUpdatedPatternPhases([]);
        }
        else {
            setShowPatternPhases(index);
            setSelectedPattern(pattern);
            setUpdatedPatternPhases((pattern === null || pattern === void 0 ? void 0 : pattern.configuredPhases) || []);
        }
    };
    var handleDeletePattern = function (patternName) { return __awaiter(void 0, void 0, void 0, function () {
        var confirmResult, pattern, data, error_1, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    confirmResult = confirm("Are you sure you want to delete \"" + patternName + "\" pattern?");
                    if (!confirmResult) {
                        toastFunc_1.emitToastMessage("Pattern deletion cancelled", "info");
                        return [2 /*return*/];
                    }
                    pattern = patterns === null || patterns === void 0 ? void 0 : patterns.find(function (p) { return p.name === patternName; });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, HttpRequest_1["default"]["delete"]("/patterns/" + (pattern === null || pattern === void 0 ? void 0 : pattern.name) + "/" + email)];
                case 2:
                    data = (_c.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPattern(email));
                    setUpdatedPatternPhases([]);
                    setShowPatternPhases(null);
                    setSelectedPattern(null);
                    toastFunc_1.emitToastMessage(data.message, "success");
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
    var handleDeleteAllPatterns = function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmResult, data, error_2, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    confirmResult = confirm("Are you sure you want to delete ALL patterns? This action cannot be undone.");
                    if (!confirmResult) {
                        toastFunc_1.emitToastMessage("All patterns deletion cancelled", "info");
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, HttpRequest_1["default"]["delete"]("/patterns/all/" + email)];
                case 2:
                    data = (_c.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPattern(email));
                    setUpdatedPatternPhases([]);
                    setSelectedPattern(null);
                    setShowPatternPhases(null);
                    setSearchedResult([]);
                    setShowSearchedResult(false);
                    setInputtedPatternName("");
                    setActivePatternIndex(null);
                    setActivePreviewPhase(null);
                    stopPlayPhases();
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
    var handleDragEndEdit = function (result) {
        if (!result.destination)
            return;
        var reorderedPhases = __spreadArrays(updatedPatternPhases);
        var removed = reorderedPhases.splice(result.source.index, 1)[0];
        reorderedPhases.splice(result.destination.index, 0, removed);
        setUpdatedPatternPhases(reorderedPhases);
    };
    var createPatternHandler = function () { return __awaiter(void 0, void 0, void 0, function () {
        var patternData, data, error_3, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!newPatternName.trim()) {
                        toastFunc_1.emitToastMessage("A pattern name is required", "error");
                        return [2 /*return*/];
                    }
                    if (!allPhasesConfigured) {
                        toastFunc_1.emitToastMessage("All selected phases must have a configured duration", "error");
                        return [2 /*return*/];
                    }
                    patternData = {
                        name: newPatternName.toUpperCase(),
                        email: email,
                        deviceId: params.deviceId,
                        configuredPhases: configuredPhases.map(function (phase, index) {
                            var _a;
                            return ({
                                name: phase.name,
                                phaseId: phase._id,
                                id: phase.id,
                                signalString: phase.signalString || ((_a = phases.find(function (p) { return p.name === phase.name; })) === null || _a === void 0 ? void 0 : _a.data) ||
                                    "",
                                duration: phase.duration,
                                deviceId: params.deviceId
                            });
                        })
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, HttpRequest_1["default"].post("/patterns", patternData)];
                case 2:
                    data = (_c.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPattern(email));
                    dispatch(UserDeviceSlice_1.clearPhaseConfig());
                    setSelectedPhases([]);
                    setShowAllAvailablePhases(false);
                    toastFunc_1.emitToastMessage(data.message, "success");
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _c.sent();
                    message = ((_b = (_a = error_3 === null || error_3 === void 0 ? void 0 : error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to create pattern";
                    toastFunc_1.emitToastMessage(message, "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var duplicatePatternHandler = function (patternName) { return __awaiter(void 0, void 0, void 0, function () {
        var newPatternName, pattern, newConfiguredPhases, patternData, data, error_4, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    newPatternName = prompt("Enter a name for the pattern");
                    if (!newPatternName) {
                        toastFunc_1.emitToastMessage("A new pattern name is required", "error");
                        return [2 /*return*/];
                    }
                    pattern = patterns.find(function (pattern) { return pattern.name === patternName; });
                    if (!pattern) {
                        toastFunc_1.emitToastMessage("Pattern not found", "error");
                        return [2 /*return*/];
                    }
                    newConfiguredPhases = pattern.configuredPhases.map(function (phase, index) { return ({
                        name: phase.name,
                        phaseId: phase.phaseId,
                        id: phase.name + "-" + Date.now() + "-" + index,
                        signalString: phase.signalString,
                        duration: phase.duration,
                        deviceId: params.deviceId
                    }); });
                    patternData = {
                        name: newPatternName.toUpperCase(),
                        email: email,
                        deviceId: params.deviceId,
                        configuredPhases: newConfiguredPhases
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, HttpRequest_1["default"].post("/patterns", patternData)];
                case 2:
                    data = (_c.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPattern(email));
                    dispatch(UserDeviceSlice_1.clearPhaseConfig());
                    toastFunc_1.emitToastMessage(data.message, "success");
                    handleCancel();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _c.sent();
                    message = ((_b = (_a = error_4 === null || error_4 === void 0 ? void 0 : error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to duplicate pattern";
                    toastFunc_1.emitToastMessage(message, "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handlePhaseSelect = function (phase) {
        setSelectedPhases(function (prev) {
            var newPhaseInstance = __assign(__assign({}, phase), { id: phase.name + "-" + Date.now() });
            return __spreadArrays(prev, [newPhaseInstance]);
        });
    };
    var handleRemovePhaseFromSelectedPhases = function (phaseId) {
        setSelectedPhases(function (prev) { return prev.filter(function (phase) { return phase.id !== phaseId; }); });
        dispatch(UserDeviceSlice_1.removePhaseConfig(phaseId));
    };
    var handleDragEndCreate = function (result) {
        if (!result.destination)
            return;
        var reorderedPhases = __spreadArrays(selectedPhases);
        var removed = reorderedPhases.splice(result.source.index, 1)[0];
        reorderedPhases.splice(result.destination.index, 0, removed);
        setSelectedPhases(reorderedPhases);
    };
    var handlePhasePreview = function (phaseSignalString, phaseName) {
        dispatch(SignalConfigSlice_1.setSignalString(phaseSignalString));
        dispatch(SignalConfigSlice_1.setSignalState());
        dispatch(SignalConfigSlice_1.closePreviewCreatedPatternPhase());
        dispatch(SignalConfigSlice_1.setIsIntersectionConfigurable(false));
        setActiveOrLastAddedPhase(phaseName);
    };
    var handleCreatedPatternPhasePreview = function (phase) {
        if (activePreviewPhase === phase.phaseId) {
            dispatch(SignalConfigSlice_1.closePreviewCreatedPatternPhase());
            setActivePreviewPhase(null);
        }
        else {
            if (activePreviewPhase) {
                dispatch(SignalConfigSlice_1.closePreviewCreatedPatternPhase());
            }
            dispatch(SignalConfigSlice_1.previewCreatedPatternPhase({
                duration: phase.duration,
                signalString: phase.signalString
            }));
            setActivePreviewPhase(phase.phaseId);
        }
    };
    var handleConfigurePhase = function (phaseId, phaseName) {
        var _a;
        if (phaseToConfigure &&
            phaseToConfigure.id !== phaseId &&
            phaseFormik.dirty) {
            var confirmSwitch = window.confirm("You have unsaved changes. Do you want to switch to configuring a different phase without saving?");
            if (!confirmSwitch)
                return;
        }
        var foundPhase = phases.find(function (p) { return p.name === phaseName; });
        if (foundPhase) {
            setPhaseToConfigure(__assign(__assign({}, foundPhase), { id: phaseId }));
            phaseFormik.resetForm({
                values: {
                    duration: ((_a = configuredPhases.find(function (p) { return p.id === foundPhase.id; })) === null || _a === void 0 ? void 0 : _a.duration) ||
                        ""
                }
            });
        }
    };
    var handleConfigurePhaseForCreatedPattern = function (pattern, phase) {
        if (alreadyCreatedPatternPhaseToConfigure &&
            alreadyCreatedPatternPhaseToConfigure.phaseId !== phase.phaseId &&
            createdPhaseFormik.dirty) {
            var confirmSwitch = window.confirm("You have unsaved changes. Do you want to switch to configuring a different phase without saving?");
            if (!confirmSwitch)
                return;
        }
        var foundPhase = pattern.configuredPhases.find(function (p) { return p.phaseId === phase.phaseId; });
        if (foundPhase) {
            setAlreadyCreatedPatternPhaseToConfigure(__assign({}, foundPhase));
        }
    };
    var phaseFormik = formik_1.useFormik({
        enableReinitialize: true,
        initialValues: {
            duration: phaseToConfigure
                ? ((_b = configuredPhases.find(function (p) { return p.id === phaseToConfigure._id; })) === null || _b === void 0 ? void 0 : _b.duration) || ""
                : ""
        },
        validationSchema: Yup.object({
            duration: Yup.number()
                .required("Duration is required")
                .min(1, "Minimum duration is 1")
        }),
        onSubmit: function (values) { return __awaiter(void 0, void 0, void 0, function () {
            var configToSave;
            return __generator(this, function (_a) {
                if (phaseToConfigure) {
                    configToSave = __assign(__assign({}, phaseToConfigure), { _id: phaseToConfigure._id, name: phaseToConfigure.name, signalString: phaseToConfigure.data, duration: values.duration });
                    dispatch(UserDeviceSlice_1.addOrUpdatePhaseConfig(configToSave));
                    setPhaseToConfigure(null);
                }
                return [2 /*return*/];
            });
        }); }
    });
    var createdPhaseFormik = formik_1.useFormik({
        enableReinitialize: true,
        initialValues: {
            duration: (alreadyCreatedPatternPhaseToConfigure === null || alreadyCreatedPatternPhaseToConfigure === void 0 ? void 0 : alreadyCreatedPatternPhaseToConfigure.duration) || ""
        },
        validationSchema: Yup.object({
            duration: Yup.number()
                .required("Duration is required")
                .min(1, "Minimum duration is 1")
        }),
        onSubmit: function (values) { return __awaiter(void 0, void 0, void 0, function () {
            var configuredPhases, data, error_5, message;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        configuredPhases = updatedPatternPhases.map(function (phase) {
                            if (phase.phaseId === (alreadyCreatedPatternPhaseToConfigure === null || alreadyCreatedPatternPhaseToConfigure === void 0 ? void 0 : alreadyCreatedPatternPhaseToConfigure.phaseId)) {
                                return __assign(__assign({}, phase), { duration: values.duration });
                            }
                            return phase;
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, HttpRequest_1["default"].put("/patterns/" + selectedPattern.name + "/" + email + "/", {
                                configuredPhases: configuredPhases
                            })];
                    case 2:
                        data = (_c.sent()).data;
                        dispatch(UserDeviceSlice_1.getUserPattern(email));
                        setAlreadyCreatedPatternPhaseToConfigure(null);
                        toastFunc_1.emitToastMessage(data.message, "success");
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _c.sent();
                        message = ((_b = (_a = error_5 === null || error_5 === void 0 ? void 0 : error_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                        toastFunc_1.emitToastMessage(message, "error");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }
    });
    var allPhasesConfigured = selectedPhases.length > 0 &&
        selectedPhases.every(function (phase) {
            return configuredPhases.some(function (p) { return p.id === phase.id; });
        });
    var handleCancel = function () {
        setShowAllAvailablePhases(false);
        setShowOtherPatternConfig(false);
        setSelectedPhases([]);
        dispatch(UserDeviceSlice_1.clearPhaseConfig());
    };
    var _u = react_1.useState(false), isPlaying = _u[0], setIsPlaying = _u[1];
    var _v = react_1.useState(0), currentPhaseIndex = _v[0], setCurrentPhaseIndex = _v[1];
    var _w = react_1.useState(null), activePatternIndex = _w[0], setActivePatternIndex = _w[1];
    var _x = react_1.useState(null), remainingTime = _x[0], setRemainingTime = _x[1];
    var _y = react_1.useState([]), activePatternPhases = _y[0], setActivePatternPhases = _y[1];
    var _z = react_1.useState(null), intervalId = _z[0], setIntervalId = _z[1];
    var startPlayPhases = function (pattern, startFromTime) {
        if (startFromTime === void 0) { startFromTime = null; }
        if (!isPlaying) {
            setIsPlaying(true);
            var startPhaseInterval_1 = function (index, initialTimeLeft) {
                if (initialTimeLeft === void 0) { initialTimeLeft = null; }
                if (intervalId) {
                    clearInterval(intervalId);
                    setIntervalId(null);
                }
                var currentPhase = pattern.configuredPhases[index];
                var timeLeft = initialTimeLeft !== null ? initialTimeLeft : currentPhase === null || currentPhase === void 0 ? void 0 : currentPhase.duration;
                var showPhase = function (phase, time) {
                    dispatch(SignalConfigSlice_1.previewCreatedPatternPhase({
                        duration: time,
                        signalString: phase.signalString
                    }));
                };
                var calculateTransitionSignalString = function (currentPhase, nextPhase, elapsed, maxTransitionDuration) {
                    // If elapsed time exceeds the maximum transition duration, return next phase's signalString
                    if (elapsed >= maxTransitionDuration) {
                        return nextPhase.signalString;
                    }
                    var currentSignals = currentPhase.signalString.slice(1, -1);
                    var nextSignals = nextPhase.signalString.slice(1, -1);
                    var transitionSignals = "";
                    for (var i = 0; i < currentSignals.length; i++) {
                        var currentState = currentSignals[i];
                        var nextState = nextSignals[i];
                        if (currentState === "G" && nextState === "R") {
                            // Green to Red transition
                            var blinkDelay = currentPhase.enableBlink
                                ? currentPhase.greenToRedDelay || 0
                                : 0;
                            var amberDelay = currentPhase.enableAmber
                                ? currentPhase.greenToRedAmberDelay || 0
                                : 0;
                            if (elapsed < blinkDelay) {
                                // Blink phase: alternate G and X every 0.5s
                                var blinkCycle = Math.floor(elapsed / 0.5) % 2;
                                transitionSignals += blinkCycle === 0 ? "G" : "X";
                            }
                            else if (elapsed < blinkDelay + amberDelay) {
                                // Amber phase
                                var baseSignal = currentPhase.holdGreenSignalOnAmber
                                    ? "G"
                                    : "X";
                                if (currentPhase.enableAmberBlink) {
                                    var amberCycle = Math.floor((elapsed - blinkDelay) / 0.5) % 2;
                                    transitionSignals += amberCycle === 0 ? "A" : baseSignal;
                                }
                                else {
                                    transitionSignals += baseSignal === "X" ? "A" : baseSignal;
                                }
                            }
                            else {
                                // Still in transition for other signals, keep current state
                                transitionSignals += currentState;
                            }
                        }
                        else if (currentState === "R" && nextState === "G") {
                            // Red to Green transition
                            var blinkDelay = currentPhase.enableBlink
                                ? currentPhase.redToGreenDelay || 0
                                : 0;
                            var amberDelay = currentPhase.enableAmber
                                ? currentPhase.redToGreenAmberDelay || 0
                                : 0;
                            if (elapsed < blinkDelay) {
                                // Blink phase: alternate R and X every 0.5s
                                var blinkCycle = Math.floor(elapsed / 0.5) % 2;
                                transitionSignals += blinkCycle === 0 ? "R" : "X";
                            }
                            else if (elapsed < blinkDelay + amberDelay) {
                                // Amber phase
                                var baseSignal = currentPhase.holdRedSignalOnAmber ? "R" : "X";
                                if (currentPhase.enableAmberBlink) {
                                    var amberCycle = Math.floor((elapsed - blinkDelay) / 0.5) % 2;
                                    transitionSignals += amberCycle === 0 ? "A" : baseSignal;
                                }
                                else {
                                    transitionSignals += baseSignal === "X" ? "A" : baseSignal;
                                }
                            }
                            else {
                                // Still in transition for other signals, keep current state
                                transitionSignals += currentState;
                            }
                        }
                        else {
                            // No change
                            transitionSignals += currentState;
                        }
                    }
                    return "*" + transitionSignals + "#";
                };
                var handleTransition = function (currentPhase, nextPhase) { return __awaiter(void 0, void 0, void 0, function () {
                    var currentSignals, nextSignals, hasRedToGreen, hasGreenToRed, i, greenToRedBlinkDelay, greenToRedAmberDelay, redToGreenBlinkDelay, redToGreenAmberDelay, transitionDuration, startTime_1;
                    return __generator(this, function (_a) {
                        currentSignals = currentPhase.signalString.slice(1, -1);
                        nextSignals = nextPhase.signalString.slice(1, -1);
                        hasRedToGreen = false;
                        hasGreenToRed = false;
                        for (i = 0; i < currentSignals.length; i++) {
                            if (currentSignals[i] === "R" && nextSignals[i] === "G") {
                                hasRedToGreen = true;
                            }
                            else if (currentSignals[i] === "G" && nextSignals[i] === "R") {
                                hasGreenToRed = true;
                            }
                        }
                        greenToRedBlinkDelay = currentPhase.enableBlink && hasGreenToRed
                            ? currentPhase.greenToRedDelay || 0
                            : 0;
                        greenToRedAmberDelay = currentPhase.enableAmber && hasGreenToRed
                            ? currentPhase.greenToRedAmberDelay || 0
                            : 0;
                        redToGreenBlinkDelay = currentPhase.enableBlink && hasRedToGreen
                            ? currentPhase.redToGreenDelay || 0
                            : 0;
                        redToGreenAmberDelay = currentPhase.enableAmber && hasRedToGreen
                            ? currentPhase.redToGreenAmberDelay || 0
                            : 0;
                        transitionDuration = Math.max(greenToRedBlinkDelay + greenToRedAmberDelay, redToGreenBlinkDelay + redToGreenAmberDelay);
                        if (transitionDuration > 0) {
                            startTime_1 = Date.now();
                            return [2 /*return*/, new Promise(function (resolve) {
                                    var transitionInterval = setInterval(function () {
                                        var elapsed = (Date.now() - startTime_1) / 1000;
                                        if (elapsed >= transitionDuration) {
                                            clearInterval(transitionInterval);
                                            dispatch(SignalConfigSlice_1.previewCreatedPatternPhase({
                                                duration: nextPhase.duration,
                                                signalString: nextPhase.signalString
                                            }));
                                            dispatch(SignalConfigSlice_1.updateCountDownColor("green"));
                                            resolve();
                                        }
                                        else {
                                            var signalString = calculateTransitionSignalString(currentPhase, nextPhase, elapsed, transitionDuration // Pass maxTransitionDuration
                                            );
                                            dispatch(SignalConfigSlice_1.previewCreatedPatternPhase({
                                                duration: 0.5,
                                                signalString: signalString
                                            }));
                                            // Update countdown color based on dominant transition state
                                            if (elapsed <
                                                Math.max(greenToRedBlinkDelay, redToGreenBlinkDelay)) {
                                                dispatch(SignalConfigSlice_1.updateCountDownColor("red")); // Blinking
                                            }
                                            else {
                                                dispatch(SignalConfigSlice_1.updateCountDownColor("yellow")); // Amber
                                            }
                                        }
                                    }, 500); // Update every 0.5s
                                })];
                        }
                        else {
                            // No transition needed, immediately show next phase
                            dispatch(SignalConfigSlice_1.previewCreatedPatternPhase({
                                duration: nextPhase.duration,
                                signalString: nextPhase.signalString
                            }));
                            dispatch(SignalConfigSlice_1.updateCountDownColor("green"));
                            return [2 /*return*/, Promise.resolve()];
                        }
                        return [2 /*return*/];
                    });
                }); };
                var runPhase = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var id;
                    return __generator(this, function (_a) {
                        showPhase(currentPhase, timeLeft);
                        dispatch(SignalConfigSlice_1.updateCountDownColor("green"));
                        id = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var nextIndex, nextPhase;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        timeLeft -= 1;
                                        setRemainingTime(timeLeft);
                                        if (!(timeLeft <= 0)) return [3 /*break*/, 2];
                                        clearInterval(id);
                                        setIntervalId(null);
                                        setRemainingTime(null);
                                        nextIndex = index + 1 >= pattern.configuredPhases.length ? 0 : index + 1;
                                        nextPhase = pattern.configuredPhases[nextIndex];
                                        return [4 /*yield*/, handleTransition(currentPhase, nextPhase)];
                                    case 1:
                                        _a.sent();
                                        setCurrentPhaseIndex(nextIndex);
                                        startPhaseInterval_1(nextIndex);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        showPhase(currentPhase, timeLeft);
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, 1000);
                        setIntervalId(id);
                        return [2 /*return*/];
                    });
                }); };
                runPhase();
            };
            startPhaseInterval_1(0, startFromTime);
        }
    };
    var stopPlayPhases = function () {
        if (isPlaying && intervalId) {
            clearInterval(intervalId);
            setIsPlaying(false);
            setIntervalId(null);
        }
    };
    var handlePlayPause = function (pattern, index) {
        if (!isTabTwo)
            return;
        if (activePatternIndex !== index) {
            setActivePatternIndex(index);
            setCurrentPhaseIndex(0);
            setActivePatternPhases(pattern.configuredPhases);
            setIsPlaying(true);
            startPlayPhases(pattern);
        }
        else {
            if (isPlaying) {
                stopPlayPhases();
                setIsPlaying(false);
            }
            else {
                startPlayPhases(pattern, remainingTime || undefined);
                setIsPlaying(true);
            }
        }
    };
    var goToNextPhase = function () {
        var nextIndex = (currentPhaseIndex + 1) % activePatternPhases.length;
        setCurrentPhaseIndex(nextIndex);
        var nextPhase = activePatternPhases[nextIndex];
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        setRemainingTime(nextPhase.duration);
        setIsPlaying(false);
        dispatch(SignalConfigSlice_1.previewCreatedPatternPhase({
            duration: nextPhase.duration,
            signalString: nextPhase.signalString
        }));
    };
    var goToPrevPhase = function () {
        var prevIndex = (currentPhaseIndex - 1 + activePatternPhases.length) %
            activePatternPhases.length;
        setCurrentPhaseIndex(prevIndex);
        var prevPhase = activePatternPhases[prevIndex];
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        setRemainingTime(prevPhase.duration);
        setIsPlaying(false);
        dispatch(SignalConfigSlice_1.previewCreatedPatternPhase({
            duration: prevPhase.duration,
            signalString: prevPhase.signalString
        }));
    };
    var isCurrentPatternPlaying = function (index) {
        return activePatternIndex === index;
    };
    react_1.useEffect(function () {
        if (email) {
            dispatch(UserDeviceSlice_1.getUserPattern(email));
        }
        dispatch(SignalConfigSlice_1.setIsIntersectionConfigurable(false));
    }, [dispatch, email]);
    react_1.useEffect(function () {
        return function () {
            stopPlayPhases();
        };
    }, []);
    console.log("Active Pattern Index:", activePatternIndex, isPlaying);
    return (React.createElement("div", { className: "boxTwo" },
        React.createElement("div", { className: "patterns__buttonBox" },
            !showAllAvailablePhases && !showOtherPatternConfig && (React.createElement("button", { style: { width: "fit-content" }, onClick: function () { return setShowAllAvailablePhases(true); } }, "Add a new Pattern")),
            (showAllAvailablePhases || showOtherPatternConfig) && (React.createElement("button", { onClick: handleCancel }, "Cancel"))),
        showAllAvailablePhases && (React.createElement(React.Fragment, null,
            React.createElement("h2", { className: "patterns__availablePhases--header" }, "Select phases for the new pattern"),
            React.createElement("ul", { className: "patterns__availablePhases" }, phases === null || phases === void 0 ? void 0 : phases.map(function (phase, index) { return (React.createElement("li", { className: "patterns__availablePhases--item " + (activeOrLastAddedPhase === phase.name && "active"), key: phase._id || index },
                React.createElement("h3", null, phase.name),
                React.createElement("div", null,
                    React.createElement("button", { onClick: function () { return handlePhasePreview(phase.data, phase.name); } }, "Preview"),
                    React.createElement("button", { onClick: function () { return handlePhaseSelect(phase); } }, "Add")))); })),
            (selectedPhases === null || selectedPhases === void 0 ? void 0 : selectedPhases.length) > 0 && (React.createElement("div", { className: "patterns__selected" },
                React.createElement("p", null,
                    "Below are the phases you have selected. You can reorder by drag and drop.",
                    " ",
                    React.createElement("span", { onClick: function () { return setSelectedPhases([]); } }, "Clear all")),
                React.createElement(react_beautiful_dnd_1.DragDropContext, { onDragEnd: handleDragEndCreate },
                    React.createElement(react_beautiful_dnd_1.Droppable, { droppableId: "selected-phases" }, function (provided) { return (React.createElement("ul", __assign({}, provided.droppableProps, { ref: provided.innerRef }), selectedPhases === null || selectedPhases === void 0 ? void 0 :
                        selectedPhases.map(function (phaseInstance, index) { return (React.createElement(react_beautiful_dnd_1.Draggable, { key: phaseInstance.id, draggableId: phaseInstance.id, index: index }, function (provided) {
                            var _a, _b, _c;
                            return (React.createElement("li", __assign({ ref: provided.innerRef }, provided.draggableProps, provided.dragHandleProps),
                                React.createElement("div", { className: "row" },
                                    React.createElement("h3", null, phaseInstance.name),
                                    React.createElement("form", { onSubmit: phaseFormik.handleSubmit }, phaseToConfigure &&
                                        phaseToConfigure.id === phaseInstance.id ? (React.createElement(React.Fragment, null,
                                        React.createElement("input", { id: "duration", name: "duration", type: "number", value: phaseFormik.values.duration, onChange: phaseFormik.handleChange, onBlur: phaseFormik.handleBlur, autoFocus: true }),
                                        React.createElement("button", { type: "submit", disabled: !phaseFormik.values.duration ||
                                                !phaseFormik.dirty }, "Save"),
                                        React.createElement("button", { type: "button", onClick: function () {
                                                setPhaseToConfigure(null);
                                                phaseFormik.resetForm();
                                            } }, "Cancel"))) : (React.createElement(React.Fragment, null,
                                        ((_a = configuredPhases.find(function (p) { return p.id === phaseInstance.id; })) === null || _a === void 0 ? void 0 : _a.duration) ? (React.createElement("span", null,
                                            "Dur:",
                                            " ", (_b = configuredPhases.find(function (p) { return p.id === phaseInstance.id; })) === null || _b === void 0 ? void 0 :
                                            _b.duration)) : null,
                                        React.createElement("button", { type: "button", onClick: function () {
                                                return handleConfigurePhase(phaseInstance.id, phaseInstance.name);
                                            } }, ((_c = configuredPhases.find(function (p) { return p.id === phaseInstance.id; })) === null || _c === void 0 ? void 0 : _c.duration) ? "Edit Duration"
                                            : "Set Duration")))),
                                    React.createElement("button", { onClick: function () {
                                            return handleRemovePhaseFromSelectedPhases(phaseInstance.id);
                                        } }, "Remove"))));
                        })); }),
                        provided.placeholder)); })))),
            React.createElement("div", { className: "patterns__selected--ctn" },
                React.createElement("input", { type: "text", value: newPatternName, onChange: function (e) { return setNewPatternName(e.target.value); }, placeholder: "Enter new pattern name", "aria-label": "New pattern name" }),
                React.createElement("button", { onClick: createPatternHandler, disabled: !allPhasesConfigured || !newPatternName.trim(), "aria-label": "Save new pattern" }, "Save New Pattern")))),
        (patterns === null || patterns === void 0 ? void 0 : patterns.length) > 0 ? (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "patterns__header" },
                React.createElement("h2", null, "Available Pattern(s)"),
                React.createElement("form", { onSubmit: function (e) {
                        e.preventDefault();
                        searchPatternByName(inputtedPatternName);
                    } },
                    React.createElement("input", { type: "text", placeholder: "Find a pattern by its name", value: inputtedPatternName, onChange: function (e) {
                            setInputtedPatternName(e.target.value);
                            searchPatternByName(e.target.value);
                            setShowSearchedResult(true);
                        } }))),
            React.createElement("ul", { className: "patterns" }, patternsToShow === null || patternsToShow === void 0 ? void 0 : patternsToShow.map(function (pattern, index) {
                console.log("Index", index);
                return (React.createElement("li", { className: "patterns__list", key: index },
                    React.createElement("div", { className: "patterns__list--item" },
                        React.createElement("h3", null, (pattern === null || pattern === void 0 ? void 0 : pattern.name.length) > 17
                            ? (pattern === null || pattern === void 0 ? void 0 : pattern.name.slice(0, 17)) + "..."
                            : pattern === null || pattern === void 0 ? void 0 : pattern.name),
                        React.createElement("div", null,
                            showPatternPhases === index ? (React.createElement("button", { className: activeAction === "more" ||
                                    showPatternPhases === index
                                    ? "active"
                                    : "", onClick: function () {
                                    handleActionClick("more");
                                    handleSelectPattern(pattern, index);
                                } },
                                React.createElement(md_1.MdExpandLess, null))) : (React.createElement("button", { onClick: function () {
                                    handleActionClick("more");
                                    handleSelectPattern(pattern, index);
                                    setUpdatedPatternPhases(pattern.configuredPhases);
                                } },
                                React.createElement(md_1.MdExpandMore, null))),
                            React.createElement("button", { disabled: !isCurrentPatternPlaying(index), className: activeAction === "prev" && showPatternPhases === index
                                    ? "active"
                                    : "", onClick: function () {
                                    handleActionClick("prev");
                                    goToPrevPhase();
                                } },
                                React.createElement(fa_1.FaArrowLeft, null)),
                            React.createElement("button", { className: activeAction === "play" && showPatternPhases === index
                                    ? "active"
                                    : "", onClick: function () {
                                    handleActionClick("play");
                                    handlePlayPause(pattern, index);
                                } }, isPlaying && activePatternIndex === index ? (React.createElement(fa_1.FaPause, null)) : (React.createElement(fa_1.FaPlay, null))),
                            React.createElement("button", { disabled: !isCurrentPatternPlaying(index), className: activeAction === "next" && showPatternPhases === index
                                    ? "active"
                                    : "", onClick: function () {
                                    handleActionClick("next");
                                    goToNextPhase();
                                } },
                                React.createElement(fa_1.FaArrowRight, null)),
                            React.createElement("button", { className: activeAction === "duplicate" &&
                                    showPatternPhases === index
                                    ? "active"
                                    : "", onClick: function () {
                                    handleActionClick("duplicate");
                                    duplicatePatternHandler(pattern.name);
                                } },
                                React.createElement(io5_1.IoDuplicate, null)),
                            React.createElement("button", { className: activeAction === "delete" &&
                                    showPatternPhases === index
                                    ? "active"
                                    : "", onClick: function () {
                                    handleActionClick("delete");
                                    handleDeletePattern(pattern.name);
                                    handleActionClick("more");
                                } },
                                React.createElement(fa_1.FaTrashAlt, null)))),
                    showPatternPhases === index && (React.createElement(react_beautiful_dnd_1.DragDropContext, { onDragEnd: handleDragEndEdit },
                        React.createElement(react_beautiful_dnd_1.Droppable, { droppableId: "pattern-phases" }, function (provided) { return (React.createElement("ul", __assign({ className: "patterns__phases" }, provided.droppableProps, { ref: provided.innerRef }), updatedPatternPhases === null || updatedPatternPhases === void 0 ? void 0 :
                            updatedPatternPhases.map(function (phase, index) { return (React.createElement(react_beautiful_dnd_1.Draggable, { key: "" + phase.phaseId, draggableId: "" + phase.phaseId, index: index }, function (provided) { return (React.createElement("li", __assign({ className: "patterns__phases--item " + (activePreviewPhase === phase.phaseId
                                    ? "active"
                                    : ""), ref: provided.innerRef }, provided.draggableProps, provided.dragHandleProps),
                                React.createElement("h3", null, phase.name),
                                React.createElement("div", { className: "patterns__phases--form" },
                                    React.createElement("form", { onSubmit: createdPhaseFormik.handleSubmit }, alreadyCreatedPatternPhaseToConfigure &&
                                        alreadyCreatedPatternPhaseToConfigure.phaseId ===
                                            phase.phaseId ? (React.createElement(React.Fragment, null,
                                        React.createElement("input", { id: "duration", name: "duration", type: "number", autoFocus: true, value: createdPhaseFormik.values
                                                .duration, onChange: createdPhaseFormik.handleChange, onBlur: createdPhaseFormik.handleBlur }),
                                        React.createElement("button", { type: "submit", disabled: !createdPhaseFormik.values
                                                .duration ||
                                                !createdPhaseFormik.dirty }, "Save"),
                                        React.createElement("button", { type: "button", onClick: function () {
                                                setAlreadyCreatedPatternPhaseToConfigure(null);
                                                createdPhaseFormik.resetForm();
                                            } }, "Cancel"))) : (React.createElement("button", { type: "button", onClick: function () {
                                            return handleConfigurePhaseForCreatedPattern(pattern, phase);
                                        } }, "Edit Duration"))),
                                    React.createElement("button", { onClick: function () {
                                            return handleCreatedPatternPhasePreview(phase);
                                        } }, activePreviewPhase === phase.phaseId
                                        ? "Close"
                                        : "Preview")))); })); }),
                            provided.placeholder)); })))));
            })))) : (React.createElement("div", { className: "patterns__noPattern" }, "You have not created any pattern yet.")),
        React.createElement("div", { style: {
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                margin: "1rem 0 1rem 0"
            } },
            React.createElement("button", { className: "phases__deleteAll", onClick: handleDeleteAllPatterns, disabled: !patterns || patterns.length === 0 }, "Delete All Patterns"))));
};
exports["default"] = BoxTwo;
