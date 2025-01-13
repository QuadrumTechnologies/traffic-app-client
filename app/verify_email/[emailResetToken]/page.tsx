"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoShieldCheckmark } from "react-icons/io5";
import { BiSolidError } from "react-icons/bi";
import bg from "@/public/images/tra.avif";
import HttpRequest from "@/store/services/HttpRequest";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import Button from "@/components/UI/Button/Button";

interface VerifyEmailProps {
  params: any;
  searchParams: any;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ params }) => {
  const router = useRouter();

  const [seconds, setSeconds] = useState<number>(5);
  const [requestFailed, setRequestFailed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  // Get the token from the url
  const { emailResetToken } = params;

  useEffect(() => {
    (async () => {
      try {
        const response = await HttpRequest.patch(
          `/auth/verifyEmail/${emailResetToken}`,
          {}
        );
        console.log("verify response", response);
        setMessage(() => response.data.message);
        setRequestFailed(() => false);
      } catch (error: any) {
        console.log("verify error", error);
        setMessage(() => error?.response.data.message);
        setRequestFailed(() => true);
      } finally {
        setIsLoading(() => false);
      }
    })();
  }, [router, emailResetToken]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (!isLoading && seconds > 0) {
        setSeconds((prevSeconds) => prevSeconds - 1);
      } else if (seconds === 0 && !requestFailed) {
        router.push("/signup");
      }
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(timerInterval);
  }, [router, isLoading, seconds, requestFailed]);

  return (
    <section
      className="verify"
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
    >
      {isLoading && <LoadingSpinner color="white" height="big" />}
      {!isLoading && !requestFailed && (
        <div className="verify-card">
          <IoShieldCheckmark className="verify-icon__success" />
          <h4 className="verify-card__success">{message}</h4>
          <p className="verify-card__para">
            Redirecting in {seconds} second{seconds === 0 ? "" : "s"}
          </p>
        </div>
      )}
      {/* Not loading and the reqeust failed */}
      {!isLoading && requestFailed && (
        <div className="verify-card">
          <BiSolidError className="verify-icon__error" />
          <h4 className="verify-card__error">{message}</h4>
          <Button onClick={() => router.push("/signup")} type="button">
            Signup Again
          </Button>
        </div>
      )}
    </section>
  );
};
export default VerifyEmail;
