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
exports.__esModule = true;
var react_1 = require("react");
var Intersection_1 = require("./Intersection");
var reduxHook_1 = require("@/hooks/reduxHook");
var SignalConfigSlice_1 = require("@/store/signals/SignalConfigSlice");
var navigation_1 = require("next/navigation");
var positions = {
    N: {
        1600: { top: 22.5, left: 36.4 },
        1500: { top: 22.5, left: 36.3 },
        1400: { top: 22.5, left: 36.3 },
        1300: { top: 23, left: 35.4 },
        1200: { top: 22, left: 38 },
        1100: { top: 22.5, left: 38 },
        1000: { top: 22.5, left: 38 },
        900: { top: 22.5, left: 39.5 },
        800: { top: 22.5, left: 39.5 },
        700: { top: 22, left: 39.5 },
        600: { top: 22, left: 39.8 },
        500: { top: 22, left: 39 },
        400: { top: 22, left: 35.2 },
        300: { top: 60, left: 5 }
    },
    E: {
        1600: { top: 36, left: 71 },
        1500: { top: 36, left: 71 },
        1400: { top: 36, left: 71 },
        1300: { top: 36.4, left: 73.5 },
        1200: { top: 36.4, left: 69 },
        1100: { top: 36, left: 69 },
        1000: { top: 36, left: 69 },
        900: { top: 36, left: 66 },
        800: { top: 36, left: 66 },
        700: { top: 36, left: 66 },
        600: { top: 36, left: 66 },
        500: { top: 36, left: 67.6 },
        400: { top: 36, left: 73 },
        300: { top: 36, left: 66 }
    },
    S: {
        1600: { top: 74, left: 49.7 },
        1500: { top: 74, left: 49.7 },
        1400: { top: 74, left: 49.7 },
        1300: { top: 74.5, left: 50.5 },
        1200: { top: 74.5, left: 50.5 },
        1100: { top: 73.5, left: 49.7 },
        1000: { top: 73.5, left: 49.7 },
        900: { top: 74, left: 49.9 },
        800: { top: 74, left: 50 },
        700: { top: 74, left: 50 },
        600: { top: 74, left: 50 },
        500: { top: 74, left: 50 },
        400: { top: 74, left: 50 },
        300: { top: 74, left: 50 }
    },
    W: {
        1600: { top: 50.3, left: 24.5 },
        1500: { top: 50.3, left: 24.5 },
        1400: { top: 50.3, left: 24.5 },
        1300: { top: 50.8, left: 21.7 },
        1200: { top: 50.8, left: 27.5 },
        1100: { top: 50.4, left: 27.5 },
        1000: { top: 50.4, left: 27.5 },
        900: { top: 50.4, left: 30.5 },
        800: { top: 50.4, left: 30.5 },
        700: { top: 50.4, left: 30.5 },
        600: { top: 50.4, left: 30.5 },
        500: { top: 50.4, left: 29 },
        400: { top: 50.4, left: 23 },
        300: { top: 50.4, left: 30.5 }
    }
};
var pedestrianPositions = {
    N: {
        1600: { first: { top: 25.5, left: -17 }, second: { top: 25.5, left: 150 } },
        1500: { first: { top: 25.5, left: -17 }, second: { top: 25.5, left: 150 } },
        1400: {
            first: { top: 24.5, left: -17 },
            second: { top: 24.5, left: 150 }
        },
        1300: { first: { top: 23, left: -19 }, second: { top: 23, left: 159 } },
        1200: { first: { top: 23, left: -15 }, second: { top: 23, left: 130 } },
        1100: { first: { top: 22, left: -14 }, second: { top: 22, left: 130 } },
        1000: { first: { top: 22, left: -14 }, second: { top: 22, left: 130 } },
        900: { first: { top: 18, left: -12 }, second: { top: 18, left: 110 } },
        800: { first: { top: 18, left: -12 }, second: { top: 18, left: 110 } },
        700: { first: { top: 16, left: -10 }, second: { top: 16, left: 110 } },
        600: { first: { top: 16, left: -11 }, second: { top: 16, left: 108 } },
        500: { first: { top: 16, left: -13 }, second: { top: 16, left: 100 } },
        400: { first: { top: 18, left: -10 }, second: { top: 18, left: 100 } },
        300: { first: { top: 16, left: -9 }, second: { top: 16, left: 80 } }
    },
    E: {
        1600: { first: { top: -20, left: -25 }, second: { top: 145, left: -25 } },
        1500: { first: { top: -20, left: -25 }, second: { top: 145, left: -25 } },
        1400: { first: { top: -20, left: -25 }, second: { top: 145, left: -25 } },
        1300: { first: { top: -22, left: -25 }, second: { top: 158, left: -25 } },
        1200: { first: { top: -22, left: -25 }, second: { top: 125, left: -25 } },
        1100: { first: { top: -18, left: -25 }, second: { top: 125, left: -25 } },
        1000: { first: { top: -18, left: -23 }, second: { top: 125, left: -23 } },
        900: { first: { top: -16, left: -19 }, second: { top: 109, left: -19 } },
        800: { first: { top: -16, left: -19 }, second: { top: 109, left: -19 } },
        700: { first: { top: -14, left: -20 }, second: { top: 110, left: -20 } },
        600: { first: { top: -14, left: -20 }, second: { top: 110, left: -18 } },
        500: { first: { top: -14, left: -18 }, second: { top: 97, left: -18 } },
        400: { first: { top: -13, left: -14 }, second: { top: 95, left: -14 } },
        300: { first: { top: -12, left: -14 }, second: { top: 80, left: -14 } }
    },
    S: {
        1600: {
            first: { top: -27, left: -90 },
            second: { top: -27, left: 75 }
        },
        1500: {
            first: { top: -27, left: -90 },
            second: { top: -27, left: 75 }
        },
        1400: {
            first: { top: -27, left: -91 },
            second: { top: -27, left: 76 }
        },
        1300: { first: { top: -25, left: -99 }, second: { top: -25, left: 78 } },
        1200: { first: { top: -25, left: -80 }, second: { top: -25, left: 60 } },
        1100: { first: { top: -23, left: -80 }, second: { top: -23, left: 68 } },
        1000: { first: { top: -23, left: -80 }, second: { top: -23, left: 68 } },
        900: { first: { top: -20, left: -70 }, second: { top: -20, left: 56 } },
        800: { first: { top: -20, left: -70 }, second: { top: -20, left: 56 } },
        700: { first: { top: -19, left: -68 }, second: { top: -19, left: 55 } },
        600: { first: { top: -19, left: -67 }, second: { top: -19, left: 54 } },
        500: { first: { top: -19, left: -63 }, second: { top: -19, left: 48 } },
        400: { first: { top: -19, left: -62 }, second: { top: -19, left: 50 } },
        300: { first: { top: -15, left: -52 }, second: { top: -15, left: 40 } }
    },
    W: {
        1600: { first: { top: 74, left: 29 }, second: { top: -92, left: 29 } },
        1500: { first: { top: 74, left: 29 }, second: { top: -92, left: 29 } },
        1400: { first: { top: 73, left: 29 }, second: { top: -92, left: 29 } },
        1300: { first: { top: 75, left: 25 }, second: { top: -100, left: 25 } },
        1200: { first: { top: 62, left: 25 }, second: { top: -82, left: 25 } },
        1100: { first: { top: 62, left: 25 }, second: { top: -80, left: 25 } },
        1000: { first: { top: 62, left: 23 }, second: { top: -80, left: 23 } },
        900: { first: { top: 53, left: 21 }, second: { top: -71, left: 21 } },
        800: { first: { top: 53, left: 21 }, second: { top: -71, left: 21 } },
        700: { first: { top: 53, left: 20 }, second: { top: -70, left: 20 } },
        600: { first: { top: 51, left: 20 }, second: { top: -68, left: 20 } },
        500: { first: { top: 49, left: 20 }, second: { top: -63, left: 20 } },
        400: { first: { top: 48, left: 21 }, second: { top: -64, left: 21 } },
        300: { first: { top: 38, left: 19 }, second: { top: -50, left: 19 } }
    }
};
var breakpoints = [
    1600, 1500, 1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600, 500, 400, 300,
];
var getResponsiveValue = function (direction, values, screenWidth) {
    if (!screenWidth) {
        return values[direction][600]; // Default to 600 for undefined screenWidth
    }
    var closestBreakpoint = breakpoints.find(function (bp) { return screenWidth >= bp - 100 && screenWidth <= bp + 100; }) || breakpoints[breakpoints.length - 1]; // Fallback to smallest breakpoint
    console.log("ScreenWidth: " + screenWidth + ", Breakpoint: " + closestBreakpoint); // Debugging
    return values[direction][closestBreakpoint];
};
var getOrientation = function (direction) {
    return direction === "N" || direction === "S" ? "vertical" : "horizontal";
};
var FourWayIntersection = function (_a) {
    var editable = _a.editable;
    var _b = reduxHook_1.useAppSelector(function (state) { return state.signalConfig; }), trafficSignals = _b.signals, createdPatternPhasePreviewing = _b.createdPatternPhasePreviewing, manualMode = _b.manualMode, countDownColor = _b.countDownColor;
    var dispatch = reduxHook_1.useAppDispatch();
    var pathname = navigation_1.usePathname();
    var _c = react_1.useState(undefined), screenWidth = _c[0], setScreenWidth = _c[1];
    react_1.useEffect(function () {
        if (typeof window !== "undefined") {
            setScreenWidth(window.innerWidth);
            var handleResize_1 = function () {
                setScreenWidth(window.innerWidth);
                console.log("Window resized to: " + window.innerWidth); // Debugging
            };
            window.addEventListener("resize", handleResize_1);
            return function () { return window.removeEventListener("resize", handleResize_1); };
        }
    }, []);
    var signalsArray = react_1.useMemo(function () {
        return Object.keys(trafficSignals).map(function (direction) {
            var signalState = trafficSignals[direction];
            return __assign(__assign({ direction: direction }, signalState), { position: getResponsiveValue(direction, positions, screenWidth), pedestrianPosition: getResponsiveValue(direction, pedestrianPositions, screenWidth), orientation: getOrientation(direction) });
        });
    }, [trafficSignals, screenWidth]);
    var isIntersectionConfig = pathname.includes("/intersection_configuration");
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(Intersection_1["default"], { initialSignals: signalsArray, backgroundImage: "/images/cross.png", editable: editable, countDownColor: countDownColor, manualMode: manualMode, createdPatternPhasePreviewing: createdPatternPhasePreviewing }),
        isIntersectionConfig && (react_1["default"].createElement("div", { className: "phases__buttonBox" },
            react_1["default"].createElement("button", { className: "phases__clear", onClick: function () {
                    dispatch(SignalConfigSlice_1.setSignalStringToAllRed());
                    dispatch(SignalConfigSlice_1.setSignalState());
                } }, "All Red"),
            react_1["default"].createElement("button", { className: "phases__clear", onClick: function () {
                    dispatch(SignalConfigSlice_1.setSignalStringToAllAmber());
                    dispatch(SignalConfigSlice_1.setSignalState());
                } }, "All Yellow"),
            react_1["default"].createElement("button", { className: "phases__clear", onClick: function () {
                    dispatch(SignalConfigSlice_1.setSignalStringToAllBlank());
                    dispatch(SignalConfigSlice_1.setSignalState());
                } }, "All Blank")))));
};
exports["default"] = FourWayIntersection;
