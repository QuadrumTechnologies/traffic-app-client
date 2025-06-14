"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Formik } from "formik";
import * as Yup from "yup";
import { setItemToCookie } from "@/utils/cookiesFunc";
import {
  RemoveItemFromLocalStorage,
  SetItemToLocalStorage,
} from "@/utils/localStorageFunc";
import { useRouter } from "next/navigation";
import InputField from "../UI/Input/Input";
import LoadingSpinner from "../UI/LoadingSpinner/LoadingSpinner";
import Button from "../UI/Button/Button";
import HttpRequest from "@/store/services/HttpRequest";
import { emitToastMessage } from "@/utils/toastFunc";

const LoginForm = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email address is required"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        "Password must be minimum of 8 characters including a number, a capital letter and a symbol"
      ),
  });

  const signInHandler = async (formValues: any, actions: any) => {
    const { email, password } = formValues;
    const reqObj = {
      email,
      password,
    };
    try {
      const response = await HttpRequest.post("/auth/signin", reqObj);

      const {
        data: { user, token, tokenExpiresIn },
      } = response.data;

      setItemToCookie("token", token, +tokenExpiresIn / 24);
      SetItemToLocalStorage("user", user);
      emitToastMessage(response.data.message, "success");
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data.message || "A network error occurred";
      emitToastMessage(errorMessage, "error");
    } finally {
      actions.setSubmitting(false);
    }
  };

  const updatePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    RemoveItemFromLocalStorage("user");
  }, []);

  return (
    <section className="login">
      <h2 className="login-title">Login</h2>
      <Formik
        initialValues={initialValues}
        onSubmit={signInHandler}
        validationSchema={validationSchema}
        validateOnChange={true}
        validateOnBlur={true}
        validateOnMount={true}
      >
        {(formik: any) => (
          <form onSubmit={formik.handleSubmit}>
            <InputField
              id="email"
              type="email"
              name="email"
              label="Email"
              invalid={formik.errors.email && formik.touched.email}
              placeholder=""
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              inputErrorMessage={formik.errors.email}
            />
            <InputField
              id="password"
              name="password"
              label="Password"
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
            <div className="login-box">
              <Link href="/forgot_password" className="login-link">
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" disabled={!formik.isValid}>
              {formik.isSubmitting ? <LoadingSpinner /> : "Login"}
            </Button>
          </form>
        )}
      </Formik>
      <p className="login-other">
        Do not have an account? <Link href="/signup">Signup</Link>
      </p>
    </section>
  );
};

export default LoginForm;
