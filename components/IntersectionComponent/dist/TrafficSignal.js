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
exports.__esModule = true;
var toastFunc_1 = require("@/utils/toastFunc");
var react_1 = require("react");
var styled_components_1 = require("styled-components");
var conflictChecker_1 = require("@/utils/conflictChecker");
var reduxHook_1 = require("@/hooks/reduxHook");
var SignalWrapper = styled_components_1["default"].div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: absolute;\n  top: ", ";\n  left: ", ";\n  display: flex;\n  flex-direction: ", ";\n  align-items: center;\n  justify-content: center;\n"], ["\n  position: absolute;\n  top: ", ";\n  left: ", ";\n  display: flex;\n  flex-direction: ",
    ";\n  align-items: center;\n  justify-content: center;\n"])), function (_a) {
    var $position = _a.$position;
    return $position.top + "%";
}, function (_a) {
    var $position = _a.$position;
    return $position.left + "%";
}, function (_a) {
    var orientation = _a.orientation;
    return orientation === "horizontal" ? "row" : "column";
});
var SignalLight = styled_components_1["default"].div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  width: 1.45rem;\n  height: 1.45rem;\n  background-color: ", ";\n  margin: 1.7px;\n  border-radius: 50%;\n  cursor: ", ";\n  @media screen and (max-width: 1300px) {\n    margin: 1.5px;\n  }\n  @media screen and (max-width: 1100px) {\n    margin: 1.5px;\n    width: 1.6rem;\n    height: 1.6rem;\n  }\n  @media screen and (max-width: 900px) {\n    margin: 1.1px;\n    width: 1.5rem;\n    height: 1.5rem;\n  }\n  @media screen and (max-width: 500px) {\n    margin: 1.1px;\n    width: 1.3rem;\n    height: 1.3rem;\n  }\n  @media screen and (max-width: 400px) {\n    margin: 1.1px;\n    width: 1.2rem;\n    height: 1.2rem;\n  }\n  @media screen and (max-width: 300px) {\n    margin: 0.8px;\n    width: 1.2rem;\n    height: 1.2rem;\n  }\n"], ["\n  width: 1.45rem;\n  height: 1.45rem;\n  background-color: ",
    ";\n  margin: 1.7px;\n  border-radius: 50%;\n  cursor: ",
    ";\n  @media screen and (max-width: 1300px) {\n    margin: 1.5px;\n  }\n  @media screen and (max-width: 1100px) {\n    margin: 1.5px;\n    width: 1.6rem;\n    height: 1.6rem;\n  }\n  @media screen and (max-width: 900px) {\n    margin: 1.1px;\n    width: 1.5rem;\n    height: 1.5rem;\n  }\n  @media screen and (max-width: 500px) {\n    margin: 1.1px;\n    width: 1.3rem;\n    height: 1.3rem;\n  }\n  @media screen and (max-width: 400px) {\n    margin: 1.1px;\n    width: 1.2rem;\n    height: 1.2rem;\n  }\n  @media screen and (max-width: 300px) {\n    margin: 0.8px;\n    width: 1.2rem;\n    height: 1.2rem;\n  }\n"])), function (_a) {
    var color = _a.color;
    return color === "R"
        ? "red"
        : color === "A"
            ? "orange"
            : color === "G"
                ? "green"
                : "rgb(83,92,91)";
}, function (_a) {
    var $editable = _a.$editable, $manualMode = _a.$manualMode;
    return $editable || $manualMode ? "pointer" : "default";
});
var PedestrianSignalLight = styled_components_1["default"].div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  width: 0.9rem;\n  height: 0.9rem;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  font-size: 1rem;\n  font-weight: 600;\n  color: \"white\";\n  transform: ", ";\n  cursor: ", ";\n\n  @media screen and (max-width: 1100px) {\n    width: 1.2rem;\n    height: 1.2rem;\n  }\n  @media screen and (max-width: 900px) {\n    width: 0.9rem;\n    height: 0.9rem;\n  }\n  @media screen and (max-width: 500px) {\n    width: 0.8rem;\n    height: 0.8rem;\n  }\n  @media screen and (max-width: 400px) {\n    width: 0.7rem;\n    height: 0.7rem;\n    font-size: 0.8rem;\n  }\n"], ["\n  width: 0.9rem;\n  height: 0.9rem;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  font-size: 1rem;\n  font-weight: 600;\n  color: \"white\";\n  transform: ",
    ";\n  cursor: ",
    ";\n\n  @media screen and (max-width: 1100px) {\n    width: 1.2rem;\n    height: 1.2rem;\n  }\n  @media screen and (max-width: 900px) {\n    width: 0.9rem;\n    height: 0.9rem;\n  }\n  @media screen and (max-width: 500px) {\n    width: 0.8rem;\n    height: 0.8rem;\n  }\n  @media screen and (max-width: 400px) {\n    width: 0.7rem;\n    height: 0.7rem;\n    font-size: 0.8rem;\n  }\n"])), function (_a) {
    var orientation = _a.orientation;
    return orientation === "horizontal" ? "rotate(0deg)" : "rotate(0deg)";
}, function (_a) {
    var $editable = _a.$editable, $manualMode = _a.$manualMode;
    return $editable || $manualMode ? "pointer" : "default";
});
var SignalGroup = styled_components_1["default"].div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: ", ";\n  margin: 0 2px;\n"], ["\n  display: flex;\n  flex-direction: ",
    ";\n  margin: 0 2px;\n"])), function (_a) {
    var orientation = _a.orientation;
    return orientation === "horizontal" ? "column" : "row";
});
var TrafficSignal = function (_a) {
    var left = _a.left, straight = _a.straight, right = _a.right, bike = _a.bike, pedestrian = _a.pedestrian, position = _a.position, orientation = _a.orientation, direction = _a.direction, pedestrianPosition = _a.pedestrianPosition, editable = _a.editable, manualMode = _a.manualMode, onSignalClick = _a.onSignalClick, signals = _a.signals;
    var allowConflictingConfig = reduxHook_1.useAppSelector(function (state) { return state.signalConfig; }).allowConflictingConfig;
    var _b = react_1.useState({
        left: left,
        straight: straight,
        right: right,
        bike: bike,
        pedestrian: pedestrian
    }), signalColors = _b[0], setSignalColors = _b[1];
    react_1.useEffect(function () {
        setSignalColors({
            left: left,
            straight: straight,
            right: right,
            bike: bike,
            pedestrian: pedestrian
        });
    }, [left, straight, right, bike, pedestrian]);
    // Toggle only between Red and Green on click
    var handleSignalClick = function (signalType) {
        if (!editable && !manualMode)
            return;
        var currentColor = signalColors[signalType];
        var newColor = currentColor === "R" ? "G" : "R";
        // Check for conflicts
        var conflicts = [];
        if (allowConflictingConfig === false) {
            conflicts = conflictChecker_1.checkForConflicts(direction, signalType, newColor, signals);
        }
        if (conflicts.length > 0) {
            toastFunc_1.emitToastMessage(conflicts.join(" "), "error");
            return;
        }
        // No conflicts, update the signal color
        onSignalClick(direction, signalType, newColor);
        setSignalColors(function (prevColors) {
            var _a;
            return (__assign(__assign({}, prevColors), (_a = {}, _a[signalType] = newColor, _a)));
        });
    };
    return (react_1["default"].createElement(SignalWrapper, { orientation: orientation, "$position": position },
        react_1["default"].createElement(SignalGroup, { orientation: orientation }, direction === "N" || direction === "E" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", { style: {
                    position: "absolute",
                    top: pedestrianPosition.first.top,
                    left: pedestrianPosition.first.left,
                    color: "white",
                    backgroundColor: pedestrian === "R"
                        ? "red"
                        : pedestrian === "G"
                            ? "green"
                            : "rgb(83,92,91)",
                    padding: ".4rem",
                    borderRadius: "50%"
                } },
                react_1["default"].createElement(PedestrianSignalLight, { color: signalColors.pedestrian, orientation: orientation, "$editable": editable, "$manualMode": manualMode, onClick: function () { return handleSignalClick("pedestrian"); } }, direction)),
            react_1["default"].createElement("div", { style: {
                    position: "absolute",
                    top: pedestrianPosition.second.top,
                    left: pedestrianPosition.second.left,
                    color: "white",
                    backgroundColor: pedestrian === "R"
                        ? "red"
                        : pedestrian === "G"
                            ? "green"
                            : "rgb(83,92,91)",
                    padding: ".4rem",
                    borderRadius: "50%"
                } },
                react_1["default"].createElement(PedestrianSignalLight, { color: signalColors.pedestrian, orientation: orientation, "$editable": editable, "$manualMode": manualMode, onClick: function () { return handleSignalClick("pedestrian"); } }, direction)),
            react_1["default"].createElement(SignalLight, { color: signalColors.bike, "$editable": editable, "$manualMode": manualMode, onClick: function () { return handleSignalClick("bike"); } }),
            react_1["default"].createElement(SignalLight, { color: signalColors.right, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("right"); } }),
            react_1["default"].createElement(SignalLight, { color: signalColors.straight, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("straight"); } }),
            react_1["default"].createElement(SignalLight, { color: signalColors.left, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("left"); } }))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(SignalLight, { color: signalColors.left, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("left"); } }),
            react_1["default"].createElement(SignalLight, { color: signalColors.straight, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("straight"); } }),
            react_1["default"].createElement(SignalLight, { color: signalColors.right, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("right"); } }),
            react_1["default"].createElement(SignalLight, { color: signalColors.bike, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("bike"); } }),
            react_1["default"].createElement("div", { style: {
                    position: "absolute",
                    top: pedestrianPosition.first.top,
                    left: pedestrianPosition.first.left,
                    color: "white",
                    backgroundColor: pedestrian === "R"
                        ? "red"
                        : pedestrian === "G"
                            ? "green"
                            : "rgb(83,92,91)",
                    padding: ".4rem",
                    borderRadius: "50%"
                } },
                react_1["default"].createElement(PedestrianSignalLight, { color: signalColors.pedestrian, orientation: orientation, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("pedestrian"); } }, direction)),
            react_1["default"].createElement("div", { style: {
                    position: "absolute",
                    top: pedestrianPosition.second.top,
                    left: pedestrianPosition.second.left,
                    color: "white",
                    backgroundColor: pedestrian === "R"
                        ? "red"
                        : pedestrian === "G"
                            ? "green"
                            : "rgb(83,92,91)",
                    padding: ".4rem",
                    borderRadius: "50%"
                } },
                react_1["default"].createElement(PedestrianSignalLight, { color: signalColors.pedestrian, orientation: orientation, "$manualMode": manualMode, "$editable": editable, onClick: function () { return handleSignalClick("pedestrian"); } }, direction)))))));
};
exports["default"] = TrafficSignal;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
