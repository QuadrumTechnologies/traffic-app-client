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

import { toast } from "react-toastify";
import { emitToastMessage } from "@/utils/toastFunc";

const ForgotPassword = () => {
  const router = useRouter();

  // Yup schema configurations
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email address is required"),
  });

  // Formik validation configurations
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    async onSubmit(values, actions) {
      const { email } = values;
      try {
        const response = await HttpRequest.post("/auth/forgotPassword", {
          email,
        });
        emitToastMessage(response.data.message, "success");
      } catch (error: any) {
        const errorMessage =
          error?.response?.data.message || "A network error occurred";
        emitToastMessage(errorMessage, "error");
      } finally {
        actions.setSubmitting(false);
      }
    },
  });

  return (
    <section
      className="forgot"
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
    >
      <div className="forgot-card">
        <h3 className="forgot-card__heading">Forgot Your Password?</h3>
        <p className="forgot-card__para">
          No worries, we’ll send you reset instructions.
        </p>
        <form onSubmit={formik.handleSubmit} className="">
          <InformationInput
            id="email"
            label="Email"
            type="email"
            name="email"
            invalid={formik.errors.email && formik.touched.email}
            placeholder=""
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            inputErrorMessage={formik.errors.email}
          />
          <Button type="submit">
            {formik.isSubmitting ? <LoadingSpinner /> : "Click To Reset"}
          </Button>

          <button
            type="button"
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

export default ForgotPassword;
