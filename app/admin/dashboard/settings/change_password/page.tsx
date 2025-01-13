"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import HttpRequest from "@/store/services/HttpRequest";
import InputField from "@/components/UI/Input/Input";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import Button from "@/components/UI/Button/Button";
import {
  GetItemFromLocalStorage,
  RemoveItemFromLocalStorage,
  SetItemToLocalStorage,
} from "@/utils/localStorageFunc";
import { removeItemFromCookie, setItemToCookie } from "@/utils/cookiesFunc";

const ChangePasswordPage = () => {
  // State managements
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showError, setShowError] = useState<{
    hasError: boolean;
    message: string;
  }>({ hasError: false, message: "" });

  // Yup schema configurations
  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(40, "Password must not exceed 40 characters"),
    confirmNewPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("newPassword"), ""], "Confirm Password does not match"),
  });

  // Formik validation configurations
  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    async onSubmit(values, actions) {
      const { confirmNewPassword, newPassword, oldPassword } = values;
      try {
        const response = await HttpRequest.patch("/auth/admin/updatePassword", {
          email: GetItemFromLocalStorage("adminUser").email,
          confirmNewPassword,
          newPassword,
          oldPassword,
        });
        RemoveItemFromLocalStorage("user");
        removeItemFromCookie("token");

        formik.resetForm();

        SetItemToLocalStorage("user", response?.data.data.user);
        setItemToCookie(
          "token",
          response?.data.token,
          response?.data.expiresIn
        );

        setSuccessMessage("Password updated successfully");
      } catch (error: any) {
        setShowError(() => ({
          hasError: true,
          message: `${error?.response?.data.message} Try again later.`,
        }));
      } finally {
        actions.setSubmitting(false);
        setTimeout(() => {
          setShowError(() => ({ hasError: false, message: "" }));
          setSuccessMessage("");
        }, 7000);
      }
    },
  });

  const updatePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div className="settings_password">
      <h2 className="courses-header settings_form">Change Password</h2>
      <form onSubmit={formik.handleSubmit}>
        <InputField
          id="oldPassword"
          label="Old Password"
          name="oldPassword"
          type={showPassword ? "text" : "password"}
          invalid={formik.errors.oldPassword && formik.touched.oldPassword}
          inputErrorMessage={formik.errors.oldPassword}
          placeholder=""
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.oldPassword}
          passwordIcon={true}
          showPassword={showPassword}
          updatePasswordVisibility={updatePasswordVisibility}
        />
        <InputField
          id="newPassword"
          label="New Password"
          name="newPassword"
          type={showPassword ? "text" : "password"}
          invalid={formik.errors.newPassword && formik.touched.newPassword}
          inputErrorMessage={formik.errors.newPassword}
          placeholder=""
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.newPassword}
          passwordIcon={true}
          showPassword={showPassword}
          updatePasswordVisibility={updatePasswordVisibility}
        />

        <InputField
          id="confirmNewPassword"
          label="Confirm New Password"
          name="confirmNewPassword"
          type={showPassword ? "text" : "password"}
          invalid={
            formik.errors.confirmNewPassword &&
            formik.touched.confirmNewPassword
          }
          inputErrorMessage={formik.errors.confirmNewPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmNewPassword}
          placeholder=""
          passwordIcon={true}
          showPassword={showPassword}
          updatePasswordVisibility={updatePasswordVisibility}
        />
        {showError.hasError && (
          <p className="signup-error">{showError.message}</p>
        )}
        {successMessage && <p className="signup-success">{successMessage}</p>}

        <section>
          <Button id="btn__submit" type="submit" disabled={!formik.isValid}>
            {formik.isSubmitting ? <LoadingSpinner color="white" /> : "Submit"}
          </Button>
        </section>
      </form>
    </div>
  );
};
export default ChangePasswordPage;
