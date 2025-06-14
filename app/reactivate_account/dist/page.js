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
var formik_1 = require("formik");
var navigation_1 = require("next/navigation");
var Yup = require("yup");
var HttpRequest_1 = require("@/store/services/HttpRequest");
var tra_avif_1 = require("@/public/images/tra.avif");
var InformationInput_1 = require("@/components/UI/Input/InformationInput");
var LoadingSpinner_1 = require("@/components/UI/LoadingSpinner/LoadingSpinner");
var Button_1 = require("@/components/UI/Button/Button");
var toastFunc_1 = require("@/utils/toastFunc");
var ReactivateAccount = function () {
    var router = navigation_1.useRouter();
    var _a = react_1.useState(false), showPassword = _a[0], setShowPassword = _a[1];
    var validationSchema = Yup.object().shape({
        email: Yup.string()
            .required("Email is required")
            .email("Invalid email address"),
        password: Yup.string().required("Password is required")
    });
    var formik = formik_1.useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        validateOnMount: false,
        onSubmit: function (values, actions) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var email, password, response, error_1, errorMessage;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            email = values.email, password = values.password;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, HttpRequest_1["default"].patch("/auth/reactivateAccount", {
                                    email: email,
                                    password: password
                                })];
                        case 2:
                            response = _b.sent();
                            toastFunc_1.emitToastMessage(response.data.message, "success");
                            router.push("/login");
                            return [3 /*break*/, 5];
                        case 3:
                            error_1 = _b.sent();
                            errorMessage = ((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data.message) || "A network error occurred";
                            toastFunc_1.emitToastMessage(errorMessage, "error");
                            return [3 /*break*/, 5];
                        case 4:
                            actions.setSubmitting(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
    });
    var updatePasswordVisibility = function () {
        setShowPassword(function (prev) { return !prev; });
    };
    return (react_1["default"].createElement("section", { className: "forgot", style: {
            backgroundImage: "url(" + tra_avif_1["default"].src + ")"
        } },
        react_1["default"].createElement("div", { className: "forgot-card" },
            react_1["default"].createElement("h3", { className: "forgot-card__heading" }, "Reactivate Account"),
            react_1["default"].createElement("p", { className: "forgot-card__para" }, "Enter your email and password to reactivate your account"),
            react_1["default"].createElement("form", { onSubmit: formik.handleSubmit, className: "flex flex-col gap-4" },
                react_1["default"].createElement(InformationInput_1["default"], { id: "email", label: "Email", name: "email", type: "email", invalid: formik.errors.email && formik.touched.email, inputErrorMessage: formik.errors.email, placeholder: "", onChange: formik.handleChange, onBlur: formik.handleBlur, value: formik.values.email }),
                react_1["default"].createElement(InformationInput_1["default"], { id: "password", label: "Password", name: "password", type: showPassword ? "text" : "password", invalid: formik.errors.password && formik.touched.password, inputErrorMessage: formik.errors.password, placeholder: "", onChange: formik.handleChange, onBlur: formik.handleBlur, value: formik.values.password, passwordIcon: true, showPassword: showPassword, updatePasswordVisibility: updatePasswordVisibility }),
                react_1["default"].createElement(Button_1["default"], { type: "submit" }, formik.isSubmitting ? react_1["default"].createElement(LoadingSpinner_1["default"], null) : "Reactivate"),
                react_1["default"].createElement("button", { className: "forgot-card__button update-container__button", type: "button", onClick: function () {
                        router.push("/");
                    } }, "Back to login")))));
};
exports["default"] = ReactivateAccount;
