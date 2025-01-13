"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import HttpRequest from "@/store/services/HttpRequest";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import Button from "@/components/UI/Button/Button";
import bg from "@/public/images/tra.avif";
import InformationInput from "@/components/UI/Input/InformationInput";

interface ResetPasswordProps {
  params: { resetPasswordToken: string };
  searchParams: any;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ params }) => {
  const router = useRouter();

  // State managements
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showError, setShowError] = useState<{
    hasError: boolean;
    message: string;
  }>({ hasError: false, message: "" });

  // Yup schema configurations
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        "Password must be minimum of 8 characters including a number, a capital letter and a symbol"
      ),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), ""], "Passwords does not match"),
  });

  // Formik validation configurations
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    async onSubmit(values, actions) {
      const { password, confirmPassword } = values;
      try {
        const response = await HttpRequest.patch(
          `/auth/resetPassword/${params.resetPasswordToken}`,
          {
            password,
            confirmPassword,
          }
        );
        // Login
        router.push("/");
      } catch (error: any) {
        setShowError(() => ({
          hasError: true,
          message: `${error?.response?.data.message} Try again.`,
        }));
      } finally {
        // Enabling the submitting of the form again
        actions.setSubmitting(false);
        setTimeout(() => {
          setShowError(() => ({ hasError: false, message: "" }));
        }, 7000);
      }
    },
  });

  const updatePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <section
      className="forgot"
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
    >
      <div className="forgot-card">
        <h3 className="forgot-card__heading">Set New Password</h3>
        <p className="forgot-card__para">
          Your new password must be different from previously <br />
          used password.
        </p>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <InformationInput
            id="password"
            label="New Password"
            name="password"
            type={showPassword ? "text" : "password"}
            invalid={formik.errors.password && formik.touched.password}
            inputErrorMessage={formik.errors.password}
            placeholder=""
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            passwordIcon={true}
            showPassword={showPassword}
            updatePasswordVisibility={updatePasswordVisibility}
          />
          <InformationInput
            id="confirmPassword"
            label="Confirm New Password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            invalid={
              formik.errors.confirmPassword && formik.touched.confirmPassword
            }
            inputErrorMessage={formik.errors.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            placeholder=""
            passwordIcon={true}
            showPassword={showPassword}
            updatePasswordVisibility={updatePasswordVisibility}
          />

          {showError.hasError && (
            <p className="signup-error">{showError.message}</p>
          )}

          <Button type="submit">
            {formik.isSubmitting ? <LoadingSpinner /> : "Reset Password"}
          </Button>

          <button
            className="forgot-card__button update-container__button"
            type="button"
            onClick={() => {
              router.push("/login");
            }}
          >
            Back to login
          </button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
