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

interface ReactivateAccountProps {}

const ReactivateAccount: React.FC<ReactivateAccountProps> = () => {
  const router = useRouter();

  // State managements
  const [showError, setShowError] = useState<{
    hasError: boolean;
    message: string;
  }>({ hasError: false, message: "" });

  // Yup schema configurations
  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email(),
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
        const response = await HttpRequest.patch(
          `/auth/admin/reactivateAccount/`,
          {
            email,
          }
        );

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
          Enter your email to reactivate your account
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

          {showError.hasError && (
            <p className="signup-error">{showError.message}</p>
          )}

          <Button type="submit">
            {formik.isSubmitting ? <LoadingSpinner /> : "Reactivate"}
          </Button>

          <button
            className="forgot-card__button update-container__button"
            type="button"
            onClick={() => {
              router.push("/admin/login");
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
