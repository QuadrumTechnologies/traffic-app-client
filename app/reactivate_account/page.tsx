"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import HttpRequest from "@/store/services/HttpRequest";
import bg from "@/public/images/tra.avif";
import InformationInput from "@/components/UI/Input/InformationInput";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import Button from "@/components/UI/Button/Button";
import { emitToastMessage } from "@/utils/toastFunc";

interface ReactivateAccountProps {}

const ReactivateAccount: React.FC<ReactivateAccountProps> = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email address"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    async onSubmit(values, actions) {
      const { email, password } = values;
      try {
        const response = await HttpRequest.patch(`/auth/reactivateAccount`, {
          email,
          password,
        });
        emitToastMessage(response.data.message, "success");
        router.push("/login");
      } catch (error: any) {
        const errorMessage =
          error?.response?.data.message || "A network error occurred";
        emitToastMessage(errorMessage, "error");
      } finally {
        actions.setSubmitting(false);
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
        <h3 className="forgot-card__heading">Reactivate Account</h3>
        <p className="forgot-card__para">
          Enter your email and password to reactivate your account
        </p>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <InformationInput
            id="email"
            label="Email"
            name="email"
            type="email"
            invalid={formik.errors.email && formik.touched.email}
            inputErrorMessage={formik.errors.email}
            placeholder=""
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          <InformationInput
            id="password"
            label="Password"
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
          <Button type="submit">
            {formik.isSubmitting ? <LoadingSpinner /> : "Reactivate"}
          </Button>
          <button
            style={{
              marginTop: "10px",
              backgroundColor: "transparent",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              textAlign: "center",
              textDecoration: "underline",
              padding: "0",
              outline: "none",
              transition: "color 0.3s ease",
            }}
            type="button"
            onClick={() => {
              router.push("/");
            }}
          >
            Back to login
          </button>
        </form>
      </div>
    </section>
  );
};

export default ReactivateAccount;
