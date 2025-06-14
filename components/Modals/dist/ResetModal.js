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
var InformationInput_1 = require("../UI/Input/InformationInput");
var react_1 = require("react");
var md_1 = require("react-icons/md");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var websocket_1 = require("@/app/dashboard/websocket");
var toastFunc_1 = require("@/utils/toastFunc");
var ResetModal = function (_a) {
    var device = _a.device, closeModal = _a.closeModal;
    var _b = react_1.useState(false), isResetting = _b[0], setIsResetting = _b[1];
    var formik = formik_1.useFormik({
        initialValues: {
            deviceId: ""
        },
        validationSchema: Yup.object().shape({
            deviceId: Yup.string()
                .required("Device ID is required")
                .matches(/^[A-Za-z0-9-]+$/, "Device ID must contain only letters, numbers, or hyphens")
        }),
        validateOnChange: true,
        validateOnBlur: true,
        validateOnMount: true,
        onSubmit: function (values) { return __awaiter(void 0, void 0, void 0, function () {
            var response, socket, error_1, message;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (values.deviceId !== (device === null || device === void 0 ? void 0 : device.deviceId)) {
                            toastFunc_1.emitToastMessage("Device ID does not match.", "error");
                            return [2 /*return*/];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 4, 5]);
                        setIsResetting(true);
                        return [4 /*yield*/, HttpRequest_1["default"]["delete"]("/devices/" + values.deviceId + "/reset")];
                    case 2:
                        response = _c.sent();
                        socket = websocket_1.getWebSocket();
                        socket.send(JSON.stringify({
                            event: "device_reset_request",
                            payload: {
                                DeviceID: values.deviceId
                            }
                        }));
                        formik.resetForm();
                        closeModal();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _c.sent();
                        message = ((_b = (_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                        toastFunc_1.emitToastMessage(message, "error");
                        return [3 /*break*/, 5];
                    case 4:
                        setIsResetting(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); }
    });
    react_1.useEffect(function () {
        var socket = websocket_1.getWebSocket();
        var handleFeedback = function (event) {
            var feedback = JSON.parse(event.data);
            if (feedback.event !== "device_reset_feedback")
                return;
            if (feedback.payload.error) {
                toastFunc_1.emitToastMessage(feedback.payload.message, "error");
            }
            else {
                toastFunc_1.emitToastMessage(feedback.payload.message, "success");
                formik.resetForm();
                closeModal();
            }
        };
        socket === null || socket === void 0 ? void 0 : socket.addEventListener("message", handleFeedback);
        return function () {
            socket === null || socket === void 0 ? void 0 : socket.removeEventListener("message", handleFeedback);
        };
    }, [formik, closeModal]);
    return (React.createElement("div", { className: "resetOverlay" },
        React.createElement("div", { className: "", onClick: closeModal },
            React.createElement(md_1.MdOutlineClose, { className: "resetOverlay-icon" })),
        React.createElement("h2", { className: "resetOverlay-text" },
            "This action will reset all configurations for the device with ID",
            " ", device === null || device === void 0 ? void 0 :
            device.deviceId,
            "."),
        React.createElement("h3", { className: "resetOverlay-text_2" },
            "If you wish to continue, enter ",
            React.createElement("span", null, device === null || device === void 0 ? void 0 : device.deviceId),
            " in the field below"),
        React.createElement("form", { onSubmit: formik.handleSubmit },
            React.createElement(InformationInput_1["default"], { id: "deviceId", type: "text", name: "deviceId", value: formik.values.deviceId, onChange: formik.handleChange, onBlur: formik.handleBlur, inputErrorMessage: formik.errors.deviceId, placeholder: "Enter Device ID" }),
            React.createElement("button", { className: "resetOverlay-button", type: "submit", disabled: isResetting || !formik.isValid }, isResetting ? "Resetting..." : "Reset"))));
};
exports["default"] = ResetModal;
