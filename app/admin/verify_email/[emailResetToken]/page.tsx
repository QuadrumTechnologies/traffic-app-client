"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import bg from "@/public/images/tra.avif";
import HttpRequest from "@/store/services/HttpRequest";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import Button from "@/components/UI/Button/Button";
import { emitToastMessage } from "@/utils/toastFunc";

interface VerifyEmailProps {
  params: any;
  searchParams: any;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ params }) => {
  const router = useRouter();

  const [seconds, setSeconds] = useState<number>(5);
  const [requestFailed, setRequestFailed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { emailResetToken } = params;

  useEffect(() => {
    (async () => {
      try {
        const response = await HttpRequest.patch(
          `/auth/admin/verifyEmail/${emailResetToken}`,
          {}
        );
        emitToastMessage(response.data.message, "success");
        setRequestFailed(() => false);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data.message || "A network error occurred";
        emitToastMessage(errorMessage, "error");
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
        router.push("/admin/login");
      }
    }, 1000);

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
      {!isLoading && requestFailed && (
        <div className="verify-card">
          <Button onClick={() => router.push("/admin/signup")} type="button">
            Signup Again
          </Button>
        </div>
      )}
    </section>
  );
};

export default VerifyEmail;
