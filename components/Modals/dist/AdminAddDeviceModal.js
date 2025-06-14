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
var Button_1 = require("../UI/Button/Button");
var react_1 = require("react");
var md_1 = require("react-icons/md");
var deviceTypes_1 = require("@/utils/deviceTypes");
var localStorageFunc_1 = require("@/utils/localStorageFunc");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var SelectField_1 = require("../UI/SelectField/SelectField");
var reduxHook_1 = require("@/hooks/reduxHook");
var AdminDeviceSlice_1 = require("@/store/devices/AdminDeviceSlice");
var toastFunc_1 = require("@/utils/toastFunc");
var AdminAddDeviceModal = function (_a) {
    var _b;
    var closeModal = _a.closeModal;
    var dispatch = reduxHook_1.useAppDispatch();
    var _c = react_1.useState(false), isAddingDevice = _c[0], setIsAddingDevice = _c[1];
    var adminUser = localStorageFunc_1.GetItemFromLocalStorage("adminUser");
    var device = deviceTypes_1.deviceTypes.find(function (dev) { return dev.department === adminUser.department; });
    var options = [
        { value: "available", label: "Available" },
        { value: "purchased", label: "Purchased" },
    ];
    var formik = formik_1.useFormik({
        initialValues: {
            deviceType: (device === null || device === void 0 ? void 0 : device.type) || "",
            deviceId: "",
            deviceStatus: null,
            ownerEmail: "",
            purchasedDate: ""
        },
        validationSchema: Yup.object().shape({
            deviceType: Yup.string().required("Device Type is required"),
            deviceId: Yup.string().required("Device ID is required"),
            deviceStatus: Yup.object()
                .shape({
                value: Yup.string().required("Please select a device status"),
                label: Yup.string().required("Please select a device status")
            })
                .nullable()
                .required("Please select a device status"),
            ownerEmail: Yup.string().when("deviceStatus.value", {
                is: "purchased",
                then: function () {
                    return Yup.string()
                        .email("Invalid email")
                        .required("Owner email is required when device is purchased");
                },
                otherwise: function () { return Yup.string().notRequired(); }
            }),
            purchasedDate: Yup.date().when("deviceStatus.value", {
                is: "purchased",
                then: function () {
                    return Yup.date().required("Purchase date is required when device is purchased");
                },
                otherwise: function () { return Yup.date().notRequired(); }
            })
        }),
        validateOnChange: true,
        validateOnBlur: true,
        validateOnMount: true,
        onSubmit: function (values) { return __awaiter(void 0, void 0, void 0, function () {
            var deviceType, deviceId, deviceStatus, ownerEmail, purchasedDate, error_1, message;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        deviceType = values.deviceType, deviceId = values.deviceId, deviceStatus = values.deviceStatus, ownerEmail = values.ownerEmail, purchasedDate = values.purchasedDate;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 4, 5]);
                        setIsAddingDevice(true);
                        return [4 /*yield*/, HttpRequest_1["default"].post("/admin/devices", {
                                deviceId: deviceId,
                                deviceType: deviceType,
                                adminEmail: adminUser.email,
                                deviceStatus: deviceStatus === null || deviceStatus === void 0 ? void 0 : deviceStatus.value,
                                ownerEmail: ownerEmail,
                                purchasedDate: purchasedDate
                            })];
                    case 2:
                        _c.sent();
                        dispatch(AdminDeviceSlice_1.getAdminDevice(device));
                        closeModal();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _c.sent();
                        message = ((_b = (_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Request failed";
                        toastFunc_1.emitToastMessage(message, "error");
                        return [3 /*break*/, 5];
                    case 4:
                        setIsAddingDevice(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); }
    });
    return (React.createElement("div", { className: "addDeviceOverlay" },
        React.createElement("div", { className: "", onClick: closeModal },
            React.createElement(md_1.MdOutlineClose, { className: "addDeviceOverlay-icon" })),
        React.createElement("h2", { className: "addDeviceOverlay-text" }, "Add Device"),
        React.createElement("form", { onSubmit: formik.handleSubmit },
            React.createElement(InformationInput_1["default"], { id: "deviceType", type: "text", name: "deviceType", value: formik.values.deviceType, onChange: formik.handleChange, onBlur: formik.handleBlur, inputErrorMessage: formik.errors.deviceType, invalid: !!formik.errors.deviceType && formik.touched.deviceType, placeholder: "Device Type", readOnly: true }),
            React.createElement(InformationInput_1["default"], { id: "deviceId", type: "text", name: "deviceId", value: formik.values.deviceId, onChange: formik.handleChange, onBlur: formik.handleBlur, inputErrorMessage: formik.errors.deviceId, invalid: !!formik.errors.deviceId && formik.touched.deviceId, placeholder: "Enter the Device ID" }),
            React.createElement("div", { style: { marginBottom: "2rem" } },
                React.createElement(SelectField_1["default"], { label: "Select Device Status", onChange: function (option) { return formik.setFieldValue("deviceStatus", option); }, value: formik.values.deviceStatus, options: options, placeholder: "Has the device been purchased?" }),
                formik.touched.deviceStatus && formik.errors.deviceStatus && (React.createElement("p", { className: "signup-error" }, formik.errors.deviceStatus))),
            ((_b = formik.values.deviceStatus) === null || _b === void 0 ? void 0 : _b.value) === "purchased" && (React.createElement("div", { className: "addDeviceOverlay__status" },
                React.createElement(InformationInput_1["default"], { id: "ownerEmail", type: "text", name: "ownerEmail", value: formik.values.ownerEmail, onChange: formik.handleChange, onBlur: formik.handleBlur, inputErrorMessage: formik.errors.ownerEmail, invalid: !!formik.errors.ownerEmail && formik.touched.ownerEmail, placeholder: "Enter Owner's Email" }),
                React.createElement(InformationInput_1["default"], { id: "purchasedDate", type: "date", name: "purchasedDate", className: "date", value: formik.values.purchasedDate, onChange: formik.handleChange, onBlur: formik.handleBlur, inputErrorMessage: formik.errors.purchasedDate, invalid: !!formik.errors.purchasedDate && formik.touched.purchasedDate, placeholder: "Select the purchased date" }))),
            React.createElement(Button_1["default"], { type: "submit", disabled: isAddingDevice || !formik.isValid }, isAddingDevice ? "Adding..." : "Add"))));
};
exports["default"] = AdminAddDeviceModal;
