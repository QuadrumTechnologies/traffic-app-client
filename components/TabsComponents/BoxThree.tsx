"use client";

import { getWebSocket } from "@/app/dashboard/websocket";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import { getUserPlan } from "@/store/devices/UserDeviceSlice";
import HttpRequest from "@/store/services/HttpRequest";
import { closePreviewCreatedPatternPhase } from "@/store/signals/SignalConfigSlice";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { MdUpload } from "react-icons/md";
import LoadingSpinner from "../UI/LoadingSpinner/LoadingSpinner";

interface ScheduleSegment {
  value?: string;
  label?: string;
}

interface Plan {
  id: string;
  name: string;
  schedule?: Record<string, ScheduleSegment>;
}

interface BoxThreeProps {}

const BoxThree: React.FC<BoxThreeProps> = () => {
  const router = useRouter();
  const params = useParams<{ deviceId: string }>();
  const pathname = usePathname();
  const newPathname =
    pathname.slice(0, pathname.lastIndexOf("/")) + "/schedule";
  const dispatch = useAppDispatch();
  const email = GetItemFromLocalStorage("user")?.email || "";

  const { plans = [] } = useAppSelector((state) => state.userDevice);
  const [searchedResult, setSearchedResult] = useState<Plan[]>([]);
  const [showSearchedResult, setShowSearchedResult] = useState<boolean>(false);
  const [inputtedPlanName, setInputtedPlanName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const searchPlanByName = (planName: string) => {
    const matchedPhases = plans.filter((plan) =>
      plan.name.toLowerCase().includes(planName.toLowerCase())
    );
    setSearchedResult(matchedPhases);
  };

  const plansToShow = showSearchedResult ? searchedResult : plans;
  const dayOrder = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const sortedPlans = [...(plansToShow || [])].sort((a, b) => {
    if (!a || !b) return 0;
    if (a.name === "CUSTOM") return 1;
    if (b.name === "CUSTOM") return -1;
    return dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name);
  });

  const handleDeletePlan = async (planId: string, planName: string) => {
    const confirmResult = confirm(
      `Are you sure you want to delete "${planName}" plan?`
    );
    if (!confirmResult) {
      emitToastMessage("Plan deletion cancelled", "info");
      return;
    }
    try {
      const response = await HttpRequest.delete(`/plans/${planId}/${email}`);
      dispatch(getUserPlan(email));
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
    emitToastMessage(message, "error");
    }
  };

  const handleDeleteAllPlans = async () => {
    const confirmResult = confirm(
      "Are you sure you want to delete ALL plans? This action cannot be undone."
    );
    if (!confirmResult) {
      emitToastMessage("All plans deletion cancelled", "info");
      return;
    }

    try {
      const response = await HttpRequest.delete(`/plans/all/${email}`);
      dispatch(getUserPlan(email));
      setSearchedResult([]);
      setShowSearchedResult(false);
      setInputtedPlanName("");
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
    emitToastMessage(message, "error");
    }
  };

  const handleUploadPlan = async (
    planId: string,
    planName: string,
    showConfirmation = true
  ) => {
    if (showConfirmation) {
      const confirmResult = confirm(
        `Are you sure you want to upload "${planName}" plan?`
      );
      if (!confirmResult) {
        emitToastMessage("Plan upload cancelled", "info");
        return;
      }
    }

    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan || !plan.schedule) {
        emitToastMessage("Invalid plan or missing schedule", "error");
        return;
      }

      setIsUploading(planId);
      const socket = getWebSocket();

      const sendMessage = (
        startSegmentKey: string,
        endSegmentKey: string,
        timeSegment: ScheduleSegment
      ) => {
        const [startHours, startMinutes] = startSegmentKey
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = endSegmentKey.split(":").map(Number);
        const startTime = `${String(startHours).padStart(2, "0")}:${String(
          startMinutes
        ).padStart(2, "0")}`;
        let endTime = `${String(endHours).padStart(2, "0")}:${String(
          endMinutes
        ).padStart(2, "0")}`;
        endTime = endTime === "00:00" ? "23:59" : endTime;
        const timeSegmentString = `@${startTime}-${endTime}`;

        return new Promise<void>((resolve, reject) => {
          socket.send(
            JSON.stringify({
              event: "upload_request",
              payload: {
                DeviceID: params.deviceId,
                email,
                plan: plan.name,
                timeSegmentString,
                patternName: timeSegment.label || "",
              },
            })
          );

          const handleFeedback = (event: MessageEvent) => {
            const feedback = JSON.parse(event.data);
            if (feedback.event === "ping_received") return;
            if (feedback.event !== "upload_feedback") return;
            if (
              feedback.payload.Plan === plan.name &&
              feedback.payload.Period === startSegmentKey
            ) {
              if (feedback.payload.error) {
                reject(new Error(feedback.payload.message));
              } else {
                resolve();
              }
              socket.removeEventListener("message", handleFeedback);
            }
          };
          socket.addEventListener("message", handleFeedback);
        });
      };

      let lastValidSegment: ScheduleSegment | null = null;
      let lastStartKey: string | null = null;

      for (const timeSegmentKey of Object.keys(plan.schedule || {})) {
        const timeSegment = plan.schedule[timeSegmentKey];
        if (timeSegment?.value) {
          if (
            lastValidSegment &&
            lastStartKey &&
            lastStartKey !== timeSegmentKey
          ) {
            await sendMessage(lastStartKey, timeSegmentKey, lastValidSegment);
          }
          lastValidSegment = timeSegment;
          lastStartKey = timeSegmentKey;
        }
      }

      if (lastValidSegment && lastStartKey) {
        await sendMessage(lastStartKey, "00:00", lastValidSegment);
      }

      setIsUploading(null);
    } catch (error: any) {
      setIsUploading(null);
      const message = error?.response?.data?.message || `Request failed`;
    emitToastMessage(message, "error"); or WebSocket feedback
    }
  };

  const handleUploadAllPlan = async () => {
    const confirmResult = confirm(
      "Are you sure you want to upload all the plans?"
    );
    if (!confirmResult) {
      emitToastMessage("All plans upload cancelled", "info");
      return;
    }

    try {
      for (const plan of plans || []) {
        if (plan?.id && plan?.name) {
          await handleUploadPlan(plan.id, plan.name, false);
        }
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
    emitToastMessage(message, "error");
    }
  };

  useEffect(() => {
    if (email) {
      setIsLoading(true);
      dispatch(getUserPlan(email)).finally(() => setIsLoading(false));
      dispatch(closePreviewCreatedPatternPhase());
    }

    const socket = getWebSocket();
    const handleFeedback = (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event === "ping_received") return;
      if (feedback.payload?.DeviceID !== params.deviceId) return;
      if (feedback.event === "upload_feedback" && feedback.payload.error) {
        emitToastMessage(feedback.payload.message, "error");
        setIsUploading(null);
      }
    };
    socket?.addEventListener("message", handleFeedback);
    return () => {
      socket?.removeEventListener("message", handleFeedback);
    };
  }, [dispatch, email, params.deviceId]);

  return (
    <div className="boxThree">
      {isLoading ? (
        <LoadingSpinner color="blue" />
      ) : plans?.length > 0 ? (
        <>
          <div className="plans__header">
            <h2>Available Plan(s)</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchPlanByName(inputtedPlanName);
              }}
            >
              <input
                type="text"
                placeholder="Find a plan by its name"
                value={inputtedPlanName}
                onChange={(e) => {
                  setInputtedPlanName(e.target.value);
                  searchPlanByName(e.target.value);
                  setShowSearchedResult(true);
                }}
              />
            </form>
          </div>

          <ul className="plans">
            {sortedPlans?.length > 0 ? (
              sortedPlans.map((plan, index) => (
                <li className="plans__list" key={plan.id || index}>
                  <div className="plans__list--item">
                    <h3>{plan.name}</h3>
                    <div>
                      <button
                        onClick={() => handleUploadPlan(plan.id, plan.name)}
                        disabled={isUploading === plan.id}
                      >
                        {isUploading === plan.id ? (
                          <LoadingSpinner color="blue" />
                        ) : (
                          <MdUpload />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="plans__noResults">
                No plans match your search.
              </div>
            )}
          </ul>
        </>
      ) : (
        <div className="plans__noPlans">
          You have not created any schedule yet.
        </div>
      )}
      <div className="boxThree__actions">
        <button onClick={() => router.push(newPathname)}>
          Go to schedule page
        </button>
        <button
          onClick={handleUploadAllPlan}
          disabled={isLoading || !plans || plans.length === 0}
        >
          Upload All Plans
        </button>
        <div>
          <button
            className="phases__deleteAll"
            onClick={handleDeleteAllPlans}
            disabled={!plans || plans.length === 0}
          >
            Delete All Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxThree;
