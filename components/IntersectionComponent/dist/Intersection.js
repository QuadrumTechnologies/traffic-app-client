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
var TrafficSignal_1 = require("./TrafficSignal");
var io_1 = require("react-icons/io");
var framer_motion_1 = require("framer-motion");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
var toastFunc_1 = require("@/utils/toastFunc");
var md_1 = require("react-icons/md");
var UserDeviceSlice_1 = require("@/store/devices/UserDeviceSlice");
var reduxHook_1 = require("@/hooks/reduxHook");
var SignalConfigSlice_1 = require("@/store/signals/SignalConfigSlice");
var navigation_1 = require("next/navigation");
var Background = styled_components_1["default"].div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: relative;\n  width: 550px;\n  height: 50em;\n  border: none;\n  background-image: url(", ");\n  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset;\n  background-size: contain;\n  background-repeat: no-repeat;\n  background-position: center;\n  margin: 0 auto;\n\n  @media screen and (max-width: 1300px) {\n    height: 55em;\n  }\n  @media screen and (max-width: 900px) {\n    height: 50em;\n  }\n  @media screen and (max-width: 500px) {\n    width: 450px;\n  }\n  @media screen and (max-width: 400px) {\n    width: 330px;\n  }\n  @media screen and (max-width: 300px) {\n    width: 100%;\n  }\n"], ["\n  position: relative;\n  width: 550px;\n  height: 50em;\n  border: none;\n  background-image: url(", ");\n  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset;\n  background-size: contain;\n  background-repeat: no-repeat;\n  background-position: center;\n  margin: 0 auto;\n\n  @media screen and (max-width: 1300px) {\n    height: 55em;\n  }\n  @media screen and (max-width: 900px) {\n    height: 50em;\n  }\n  @media screen and (max-width: 500px) {\n    width: 450px;\n  }\n  @media screen and (max-width: 400px) {\n    width: 330px;\n  }\n  @media screen and (max-width: 300px) {\n    width: 100%;\n  }\n"])), function (_a) {
    var $backgroundImage = _a.$backgroundImage;
    return $backgroundImage;
});
var ModalBackdrop = styled_components_1["default"].div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background-color: rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(1px);\n  z-index: 1000;\n  pointer-events: auto;\n"], ["\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background-color: rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(1px);\n  z-index: 1000;\n  pointer-events: auto;\n"])));
var PhaseContainer = styled_components_1["default"].form(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 350px;\n  background-color: #ffffff;\n  padding: 1rem;\n  border-radius: 0.4rem;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 0.6rem;\n  z-index: 1001;\n  pointer-events: auto;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n"], ["\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 350px;\n  background-color: #ffffff;\n  padding: 1rem;\n  border-radius: 0.4rem;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 0.6rem;\n  z-index: 1001;\n  pointer-events: auto;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n"])));
var PhaseNameInput = styled_components_1["default"].input(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding: 0.5rem;\n  border: 0.1rem solid #ccc;\n  border-radius: 0.4rem;\n  font-size: 1.4rem;\n  width: 100%;\n\n  &:focus {\n    outline: none;\n    border-color: #514604;\n  }\n\n  &:hover {\n    border-color: #2a2a29;\n  }\n"], ["\n  padding: 0.5rem;\n  border: 0.1rem solid #ccc;\n  border-radius: 0.4rem;\n  font-size: 1.4rem;\n  width: 100%;\n\n  &:focus {\n    outline: none;\n    border-color: #514604;\n  }\n\n  &:hover {\n    border-color: #2a2a29;\n  }\n"])));
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
var AddPhaseIcon = styled_components_1["default"](framer_motion_1.motion.div)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  position: absolute;\n  top: 44.4%;\n  left: 45.8%;\n  background-color: rgb(83, 92, 91);\n  color: white;\n  border: none;\n  cursor: pointer;\n  border-radius: 1rem;\n  @media screen and (max-width: 1300px) {\n    top: 44.6%;\n    left: 45.5%;\n  }\n  @media screen and (max-width: 1200px) {\n    top: 43.5%;\n    left: 45.3%;\n  }\n  @media screen and (max-width: 1100px) {\n    top: 43.3%;\n    left: 45%;\n  }\n  @media screen and (max-width: 900px) {\n    top: 42.9%;\n    left: 46%;\n  }\n  @media screen and (max-width: 500px) {\n    top: 43%;\n    left: 45%;\n  }\n  @media screen and (max-width: 400px) {\n    top: 42%;\n    left: 44%;\n  }\n  @media screen and (max-width: 300px) {\n    top: 42%;\n    left: 43%;\n  }\n"], ["\n  position: absolute;\n  top: 44.4%;\n  left: 45.8%;\n  background-color: rgb(83, 92, 91);\n  color: white;\n  border: none;\n  cursor: pointer;\n  border-radius: 1rem;\n  @media screen and (max-width: 1300px) {\n    top: 44.6%;\n    left: 45.5%;\n  }\n  @media screen and (max-width: 1200px) {\n    top: 43.5%;\n    left: 45.3%;\n  }\n  @media screen and (max-width: 1100px) {\n    top: 43.3%;\n    left: 45%;\n  }\n  @media screen and (max-width: 900px) {\n    top: 42.9%;\n    left: 46%;\n  }\n  @media screen and (max-width: 500px) {\n    top: 43%;\n    left: 45%;\n  }\n  @media screen and (max-width: 400px) {\n    top: 42%;\n    left: 44%;\n  }\n  @media screen and (max-width: 300px) {\n    top: 42%;\n    left: 43%;\n  }\n"])));
var DurationDisplay = styled_components_1["default"].div(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  position: absolute;\n  top: 44.4%;\n  left: 45.8%;\n  background-color: ", ";\n  font-weight: bolder;\n  color: ", ";\n  width: 5.2rem;\n  height: 5.2rem;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  border-radius: 50%;\n  font-size: 2rem;\n  @media screen and (max-width: 1300px) {\n    top: 44.6%;\n    left: 45.5%;\n  }\n  @media screen and (max-width: 1200px) {\n    top: 43.5%;\n    left: 45.3%;\n  }\n  @media screen and (max-width: 1100px) {\n    top: 43.3%;\n    left: 45%;\n  }\n  @media screen and (max-width: 900px) {\n    top: 42.9%;\n    left: 47%;\n  }\n  @media screen and (max-width: 500px) {\n    top: 43%;\n    left: 45%;\n  }\n  @media screen and (max-width: 400px) {\n    top: 42%;\n    left: 44%;\n  }\n  @media screen and (max-width: 300px) {\n    top: 42%;\n    left: 43%;\n  }\n"], ["\n  position: absolute;\n  top: 44.4%;\n  left: 45.8%;\n  background-color: ",
    ";\n  font-weight: bolder;\n  color: ",
    ";\n  width: 5.2rem;\n  height: 5.2rem;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  border-radius: 50%;\n  font-size: 2rem;\n  @media screen and (max-width: 1300px) {\n    top: 44.6%;\n    left: 45.5%;\n  }\n  @media screen and (max-width: 1200px) {\n    top: 43.5%;\n    left: 45.3%;\n  }\n  @media screen and (max-width: 1100px) {\n    top: 43.3%;\n    left: 45%;\n  }\n  @media screen and (max-width: 900px) {\n    top: 42.9%;\n    left: 47%;\n  }\n  @media screen and (max-width: 500px) {\n    top: 43%;\n    left: 45%;\n  }\n  @media screen and (max-width: 400px) {\n    top: 42%;\n    left: 44%;\n  }\n  @media screen and (max-width: 300px) {\n    top: 42%;\n    left: 43%;\n  }\n"])), function (_a) {
    var $countDownColor = _a.$countDownColor;
    return $countDownColor === "red" ||
        $countDownColor === "green" ||
        $countDownColor === "yellow"
        ? "white"
        : "rgb(83, 92, 91)";
}, function (_a) {
    var $countDownColor = _a.$countDownColor;
    return $countDownColor === "red"
        ? "red"
        : $countDownColor === "green"
            ? "green"
            : "rgb(207, 193, 6)";
});
var IntersectionDisplay = function (_a) {
    var initialSignals = _a.initialSignals, backgroundImage = _a.backgroundImage, editable = _a.editable, manualMode = _a.manualMode, countDownColor = _a.countDownColor, createdPatternPhasePreviewing = _a.createdPatternPhasePreviewing;
    var _b = react_1.useState(initialSignals), signals = _b[0], setSignals = _b[1];
    var _c = react_1.useState(false), showInputModal = _c[0], setShowInputModal = _c[1];
    var _d = react_1.useState(false), isCreatingPhase = _d[0], setIsCreatingPhase = _d[1];
    var _e = react_1.useState(""), phaseName = _e[0], setPhaseName = _e[1];
    var dispatch = reduxHook_1.useAppDispatch();
    var params = navigation_1.useParams();
    react_1.useEffect(function () {
        setSignals(initialSignals);
        dispatch(SignalConfigSlice_1.setLandingPageInitialSignals(initialSignals));
    }, [initialSignals]);
    var handleSignalClick = function (direction, signalType, color) {
        setSignals(function (prevSignals) {
            return prevSignals.map(function (signal) {
                var _a;
                return signal.direction === direction
                    ? __assign(__assign({}, signal), (_a = {}, _a[signalType] = color, _a)) : signal;
            });
        });
        dispatch(SignalConfigSlice_1.setLandingPageSignals({ direction: direction, signalType: signalType, color: color }));
    };
    var handleAddPhase = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var user, getAdjacentPedestrianSignal, encodeSignals, encodedSignals, data, error_1;
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
                    getAdjacentPedestrianSignal = function (signals, direction) {
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
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    encodeSignals = function () {
                        return ("*" +
                            signals
                                .map(function (signal) {
                                var adjacentPedestrian = getAdjacentPedestrianSignal(signals, signal.direction);
                                return "" + signal.direction + signal.left + signal.straight + signal.right + signal.bike + signal.pedestrian + adjacentPedestrian;
                            })
                                .join("") +
                            "#");
                    };
                    encodedSignals = encodeSignals();
                    return [4 /*yield*/, HttpRequest_1["default"].post("/phases", {
                            email: user.email,
                            phaseName: phaseName,
                            phaseData: encodedSignals,
                            deviceId: params.deviceId
                        })];
                case 2:
                    data = (_a.sent()).data;
                    dispatch(UserDeviceSlice_1.getUserPhase(user.email));
                    toastFunc_1.emitToastMessage(data.message, "success");
                    setIsCreatingPhase(false);
                    setPhaseName("");
                    setShowInputModal(false);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error adding phase:", error_1);
                    toastFunc_1.emitToastMessage(error_1 === null || error_1 === void 0 ? void 0 : error_1.response.data.message, "error");
                    setIsCreatingPhase(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(Background, { "$backgroundImage": backgroundImage },
        signals.map(function (signal) { return (react_1["default"].createElement(TrafficSignal_1["default"], __assign({ key: signal.direction }, signal, { editable: editable, manualMode: manualMode, onSignalClick: function (direction, signalType, color) {
                return handleSignalClick(direction, signalType, color);
            }, signals: signals }))); }),
        editable && !createdPatternPhasePreviewing.showDuration && (react_1["default"].createElement(AddPhaseIcon, { whileHover: { scale: 1.2 }, whileTap: { scale: 1 }, transition: { duration: 0.3, ease: "easeInOut" }, onClick: function () { return setShowInputModal(function (prev) { return !prev; }); } }, !showInputModal ? (react_1["default"].createElement(io_1.IoMdAddCircle, { size: 56 })) : (react_1["default"].createElement(md_1.MdCancel, { size: 56 })))),
        createdPatternPhasePreviewing.showDuration &&
            createdPatternPhasePreviewing.duration !== null && (react_1["default"].createElement(DurationDisplay, { "$countDownColor": countDownColor },
            createdPatternPhasePreviewing.duration,
            "s")),
        showInputModal && (react_1["default"].createElement(ModalBackdrop, { onClick: function () { return setShowInputModal(false); } },
            react_1["default"].createElement(PhaseContainer, { onSubmit: handleAddPhase, onClick: function (e) { return e.stopPropagation(); } },
                react_1["default"].createElement(PhaseNameInput, { type: "text", placeholder: "Enter phase name", value: phaseName, onChange: function (e) { return setPhaseName(e.target.value); }, autoFocus: true }),
                react_1["default"].createElement(AddPhaseButton, { type: "submit", disabled: isCreatingPhase }, isCreatingPhase ? "Creating..." : "Create"))))));
};
exports["default"] = IntersectionDisplay;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
