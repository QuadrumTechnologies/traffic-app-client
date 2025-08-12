"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import Select, { ActionMeta, SingleValue } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import HttpRequest from "@/store/services/HttpRequest";
import { emitToastMessage } from "@/utils/toastFunc";
import {
  addOrUpdatePhaseConfig,
  clearPhaseConfig,
  getUserDeviceInfoData,
  getUserPattern,
  getUserPlan,
  removePhaseConfig,
} from "@/store/devices/UserDeviceSlice";
import * as Yup from "yup";
import { useFormik } from "formik";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { getWebSocket } from "@/app/dashboard/websocket";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface ScheduleData {
  [time: string]: Option | null;
}

interface ScheduleTemplateProps {
  params: { deviceId: string };
}

interface Pattern {
  name: string;
  config: {
    configuredPhases: Array<{
      name: string;
      phaseId: string;
      signalString: string;
      duration: number;
      id: number;
      enableBlink: boolean;
      redToGreenDelay: number;
      greenToRedDelay: number;
      enableAmber: boolean;
      enableAmberBlink: boolean;
      redToGreenAmberDelay: number;
      greenToRedAmberDelay: number;
      holdRedSignalOnAmber: boolean;
      holdGreenSignalOnAmber: boolean;
    }>;
  };
}

function generateTimeSegments(): string[] {
  const segments: string[] = [];
  segments.push("00:00");
  let hour = 0;
  let minute = 31;
  while (hour < 24) {
    const time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    segments.push(time);
    minute += 30;
    if (minute >= 60) {
      minute -= 60;
      hour += 1;
    }
    if (hour >= 24) break;
  }
  return segments;
}

const timeSegments = generateTimeSegments();

const dayTypeOptions: Option[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
  { value: "custom", label: "Custom" },
];

const ScheduleTemplate: React.FC<ScheduleTemplateProps> = ({ params }) => {
  const { patterns, phases, plans, configuredPhases, currentDeviceInfoData } =
    useAppSelector((state) => state.userDevice);
  const dispatch = useAppDispatch();
  const email = GetItemFromLocalStorage("user")?.email;
  const patternsOptions: Option[] =
    patterns
      ?.map((pattern) => ({
        value: pattern?.name?.toLowerCase(),
        label: pattern?.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const plansOptions: Option[] =
    plans
      ?.map((plan) => ({
        value: plan?.name.toLowerCase(),
        label: plan?.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [dayType, setDayType] = useState<Option>(dayTypeOptions[0]);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Option | null>(null);
  const [rightBoxContent, setRightBoxContent] = useState<
    "patterns" | "upload" | "download" | null
  >(null);
  const [isUploadingSchedule, setIsUploadingSchedule] =
    useState<boolean>(false);
  const [isDownloadingSchedule, setIsDownloadingSchedule] =
    useState<boolean>(false);
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [updatedPatternPhases, setUpdatedPatternPhases] = useState<any[]>([]);
  const [newPatternName, setNewPatternName] = useState<string>("");
  const [phaseToConfigure, setPhaseToConfigure] = useState<any | null>(null);

  const handleDragEndEdit = (result: any) => {
    if (!result.destination) return;
    const reorderedPhases = [...updatedPatternPhases];
    const [removed] = reorderedPhases.splice(result.source.index, 1);
    reorderedPhases.splice(result.destination.index, 0, removed);
    setUpdatedPatternPhases(reorderedPhases);
  };

  const handleSelectPattern = (patternName: string) => {
    dispatch(clearPhaseConfig());
    if (!patternName) {
      setSelectedPattern(null);
      setRightBoxContent(null);
      setUpdatedPatternPhases([]);
      dispatch(clearPhaseConfig());
      return;
    }
    const pattern = patterns?.find(
      (pattern) => pattern?.name.toLowerCase() === patternName.toLowerCase()
    );

    if (pattern) {
      setSelectedPattern(pattern);
      setRightBoxContent("patterns");
      setUpdatedPatternPhases(pattern.configuredPhases || []);
      pattern?.configuredPhases?.forEach((phase: any) => {
        dispatch(addOrUpdatePhaseConfig(phase));
      });
    }
  };

  const handleAvailablePhaseSelect = (phase: any) => {
    const transformedPhase = {
      deviceId: phase.deviceId,
      duration: 1,
      enableAmber: phase.enableAmber,
      enableAmberBlink: phase.enableAmberBlink,
      enableBlink: phase.enableBlink,
      greenToRedAmberDelay: phase.greenToRedAmberDelay,
      greenToRedDelay: phase.greenToRedDelay,
      holdGreenSignalOnAmber: phase.holdGreenSignalOnAmber,
      holdRedSignalOnAmber: phase.holdRedSignalOnAmber,
      id: phase._id,
      index: updatedPatternPhases.length,
      name: phase.name,
      phaseId: `${phase.name}-${Date.now()}`,
      redToGreenAmberDelay: phase.redToGreenAmberDelay,
      redToGreenDelay: phase.redToGreenDelay,
      signalString: phase.data,
    };

    const updatedPhases = [...updatedPatternPhases, transformedPhase];

    setUpdatedPatternPhases(updatedPhases);
  };

  const handleRemovePhaseFromSelectedPhases = (phaseId: string) => {
    setUpdatedPatternPhases((prev) =>
      prev.filter((phase) => phase?.phaseId !== phaseId)
    );
    dispatch(removePhaseConfig(phaseId));
  };

  const handleConfigurePhase = (phaseInstance: any) => {
    if (
      phaseToConfigure &&
      phaseToConfigure?.phaseId !== phaseInstance?.phaseId &&
      phaseFormik.dirty
    ) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Do you want to switch to configuring a different phase without saving?"
      );
      if (!confirmSwitch) return;
    }

    setPhaseToConfigure(phaseInstance);
    phaseFormik.resetForm({
      values: {
        duration:
          updatedPatternPhases?.find(
            (p) => p?.phaseId === phaseInstance?.phaseId
          )?.duration || "",
        enableBlink: phaseInstance?.enableBlink ?? false,
        redToGreenDelay: phaseInstance?.redToGreenDelay ?? 0,
        greenToRedDelay: phaseInstance?.greenToRedDelay ?? 2,
        enableAmber: phaseInstance?.enableAmber ?? true,
        enableAmberBlink: phaseInstance?.enableAmberBlink ?? false,
        redToGreenAmberDelay: phaseInstance?.redToGreenAmberDelay ?? 0,
        greenToRedAmberDelay: phaseInstance?.greenToRedAmberDelay ?? 3,
      },
    });
  };

  const phaseFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      duration: phaseToConfigure
        ? updatedPatternPhases?.find(
            (p) => p?.phaseId === phaseToConfigure?.phaseId
          )?.duration || ""
        : "",
      enableBlink: phaseToConfigure?.enableBlink ?? false,
      redToGreenDelay: phaseToConfigure?.redToGreenDelay ?? 0,
      greenToRedDelay: phaseToConfigure?.greenToRedDelay ?? 2,
      enableAmber: phaseToConfigure?.enableAmber ?? true,
      enableAmberBlink: phaseToConfigure?.enableAmberBlink ?? false,
      redToGreenAmberDelay: phaseToConfigure?.redToGreenAmberDelay ?? 0,
      greenToRedAmberDelay: phaseToConfigure?.greenToRedAmberDelay ?? 3,
    },
    validationSchema: Yup.object({
      duration: Yup.number()
        .required("Duration is required")
        .min(1, "Minimum duration is 1"),
      redToGreenDelay: Yup.number().min(0).max(5, "Max 5 seconds"),
      greenToRedDelay: Yup.number().min(0).max(5, "Max 5 seconds"),
      redToGreenAmberDelay: Yup.number().min(0).max(5, "Max 5 seconds"),
      greenToRedAmberDelay: Yup.number()
        .min(2, "Min 2 seconds")
        .max(5, "Max 5 seconds"),
    }),
    onSubmit: async (values) => {
      if (phaseToConfigure) {
        const configToSave = {
          id: phaseToConfigure?.id,
          name: phaseToConfigure?.name,
          phaseId: phaseToConfigure?.phaseId || phaseToConfigure?.id,
          signalString: phaseToConfigure?.signalString,
          duration: values.duration,
          enableBlink: values.enableBlink,
          redToGreenDelay: values.redToGreenDelay,
          greenToRedDelay: values.greenToRedDelay,
          enableAmber: values.enableAmber,
          enableAmberBlink: values.enableAmberBlink,
          redToGreenAmberDelay: values.redToGreenAmberDelay,
          greenToRedAmberDelay: values.greenToRedAmberDelay,
          holdRedSignalOnAmber: false,
          holdGreenSignalOnAmber: false,
        };
        dispatch(addOrUpdatePhaseConfig(configToSave));
        setPhaseToConfigure(null);
        emitToastMessage("Phase configuration saved", "success");
      }
    },
    validateOnBlur: true,
    validateOnChange: false,
  });

  const handleDurationBlur = () => {
    if (phaseFormik.touched.duration && phaseFormik.errors.duration) {
      emitToastMessage(
        Array.isArray(phaseFormik.errors.duration)
          ? phaseFormik.errors.duration.join(", ")
          : typeof phaseFormik.errors.duration === "object" &&
            phaseFormik.errors.duration !== null
          ? JSON.stringify(phaseFormik.errors.duration)
          : (phaseFormik.errors.duration as string),
        "error"
      );
    }
  };

  const handleCancelPhaseConfig = () => {
    phaseFormik.resetForm();
    setPhaseToConfigure(null);
  };

  const saveNewPattern = async () => {
    if (!newPatternName) {
      emitToastMessage("Please provide a new pattern name.", "error");
      return;
    }

    const newConfiguredPhases = updatedPatternPhases.map(
      (phase: any, index: number) => ({
        name: phase.name,
        phaseId: phase.id,
        id: `${phase.name}-${Date.now()}-${index}`,
        signalString: phase.signalString,
        duration: phase.duration,
        deviceId: params.deviceId,
        enableBlink: phase.enableBlink ?? false,
        redToGreenDelay: phase.redToGreenDelay ?? 0,
        greenToRedDelay: phase.greenToRedDelay ?? 2,
        enableAmber: phase.enableAmber ?? true,
        enableAmberBlink: phase.enableAmberBlink ?? false,
        redToGreenAmberDelay: phase.redToGreenAmberDelay ?? 0,
        greenToRedAmberDelay: phase.greenToRedAmberDelay ?? 3,
        holdRedSignalOnAmber: false,
        holdGreenSignalOnAmber: false,
      })
    );
    try {
      await HttpRequest.post("/patterns", {
        email,
        name: newPatternName.toUpperCase(),
        deviceId: params.deviceId,
        config: {
          configuredPhases: newConfiguredPhases,
        },
      });
      dispatch(getUserPattern());
      dispatch(clearPhaseConfig());
      setSelectedPattern(null);
      setNewPatternName("");
      setUpdatedPatternPhases([]);
      setRightBoxContent(null);
      emitToastMessage("Pattern saved successfully", "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  const handleDateChange = (date: Date | null) => {
    setCustomDate(date);
  };

  const handleChange = useCallback(
    (time: string, selectedValue: string) => {
      const selectedOption =
        patternsOptions?.find((option) => option.value === selectedValue) ||
        null;
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        [time]: selectedOption,
      }));
    },
    [patternsOptions]
  );

  const handlePlanChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      setSelectedPlan(newValue);
      const plan = plans?.find(
        (plan) => plan?.name.toLowerCase() === newValue.value.toLowerCase()
      );
      if (plan) {
        const fullSchedule: ScheduleData = {};
        timeSegments.forEach((time) => {
          fullSchedule[time] = plan.schedule[time]
            ? {
                value: plan.schedule[time].value,
                label: plan.schedule[time].label,
              }
            : null;
        });
        setSchedule(fullSchedule);
        setCustomDate(plan.customDate ? new Date(plan.customDate) : null);
      } else {
        setSchedule((prev) => ({ ...prev }));
        setCustomDate(dayType.value === "custom" ? customDate : null);
      }
    }
  };

  const handleDayTypeChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      setDayType(newValue);
      const plan = plans?.find(
        (plan) => plan?.name.toLowerCase() === newValue.value.toLowerCase()
      );
      if (plan) {
        handlePlanChange({
          value: newValue.value,
          label: newValue.label,
        });
        setSelectedPattern(null);
        setRightBoxContent(null);
        setUpdatedPatternPhases([]);
        dispatch(clearPhaseConfig());
      } else {
        const emptySchedule: ScheduleData = {};
        timeSegments.forEach((time) => {
          emptySchedule[time] = null;
        });
        setSchedule(emptySchedule);
        setSelectedPlan(null);
      }
      if (newValue.value !== "custom") {
        setCustomDate(null);
      }
    }
  };

  const saveSchedule = async () => {
    if (schedule["00:00"] === null || schedule["00:00"]?.label === "None") {
      emitToastMessage(
        "A plan must have a pattern for the first time segment",
        "error"
      );
      return;
    }
    const existingPlan = plans?.find(
      (plan) => plan.name.toUpperCase() === dayType.value.toUpperCase()
    );
    if (existingPlan) {
      const userResponse = confirm(
        `A plan for ${existingPlan?.name} exists, do you want to override?`
      );
      if (!userResponse) return;
    }
    try {
      const { data } = await HttpRequest.post("/plans", {
        id: Date.now().toString(),
        deviceId: params.deviceId,
        email,
        schedule,
        dayType: dayType.value,
        name: dayType.value.toUpperCase(),
        customDate:
          dayType.value === "custom" ? customDate || undefined : undefined,
      });
      dispatch(getUserPlan());
      const updatedPlan = {
        value: dayType.value.toUpperCase(),
        label: dayType.label.toUpperCase(),
      };
      setSelectedPlan(updatedPlan);
      const fullSchedule: ScheduleData = {};
      timeSegments.forEach((time) => {
        fullSchedule[time] = schedule[time]
          ? {
              value: schedule[time]!.value,
              label: schedule[time]!.label,
            }
          : null;
      });
      setSchedule(fullSchedule);
      setCustomDate(dayType.value === "custom" ? customDate : null);
      emitToastMessage(data.message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  const handleUpload = async () => {
    if (dayType.value.toLowerCase() !== selectedPlan?.value.toLowerCase()) {
      emitToastMessage(
        "Day type and selected existing plan must be the same",
        "error"
      );
      return;
    }
    let toastId: string | undefined;
    try {
      const plan = plans?.find(
        (plan) => plan.name.toLowerCase() === dayType.value.toLowerCase()
      );
      if (plan) {
        for (const timeSegmentKey of Object.keys(schedule)) {
          const timeSegment = schedule[timeSegmentKey];
          if (plan.schedule[timeSegmentKey]?.label !== timeSegment?.label) {
            emitToastMessage(
              `Difference detected at ${timeSegmentKey}. Save the schedule before uploading.`,
              "error"
            );
            return;
          }
        }
      }
      if (!plan || !plan.schedule) {
        emitToastMessage(
          "This is a new plan. Save it before uploading.",
          "error"
        );
        return;
      }
      const confirmResult = confirm(
        `Are you sure you want to upload "${dayType.value}" plan?`
      );
      if (!confirmResult) {
        emitToastMessage("Upload cancelled", "info");
        return;
      }
      const socket = getWebSocket();
      setIsUploadingSchedule(true);
      toastId = emitToastMessage(
        `Uploading plan "${dayType.value}"...`,
        "info",
        {
          duration: false,
        }
      );

      const sendMessage = (
        startSegmentKey: string,
        endSegmentKey: string,
        timeSegment: Option
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
                ...(plan?.name.toUpperCase() === "CUSTOM" && {
                  customDateUnix: customDate?.getTime(),
                }),
                timeSegmentString,
                patternName: timeSegment.label,
              },
            })
          );
          const handleFeedback = (event: MessageEvent) => {
            const feedback = JSON.parse(event.data);
            if (feedback.event === "ping_received") return;
            if (
              feedback.event === "upload_feedback" &&
              feedback.payload.Plan === plan.name &&
              feedback.payload.Period === startSegmentKey
            ) {
              if (feedback.payload.error) {
                setIsUploadingSchedule(false);
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

      let lastValidSegment: Option | null = null;
      let lastStartKey: string | null = null;

      for (const timeSegmentKey of Object.keys(plan.schedule)) {
        const timeSegment = plan.schedule[timeSegmentKey];
        if (timeSegment && timeSegment.value && timeSegment.value !== "None") {
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

      setIsUploadingSchedule(false);
      dispatch(getUserDeviceInfoData(params.deviceId));
      emitToastMessage(
        `Plan "${dayType.value}" uploaded successfully`,
        "success",
        {
          duration: 5000,
        }
      );
      toast.dismiss(toastId);
    } catch (error: any) {
      setIsUploadingSchedule(false);
      const message = error?.message || `Request failed`;
      emitToastMessage(message, "error");
      toast.dismiss(toastId);
    } finally {
      if (toastId) {
        toast.dismiss(toastId);
      }
      setTimeout(() => {
        setIsUploadingSchedule(false);
      }, 5000);
    }
  };

  const handleDownload = async () => {
    const socket = getWebSocket();
    setIsDownloadingSchedule(true);
    const sendMessage = () => {
      socket.send(
        JSON.stringify({
          event: "download_request",
          payload: {
            DeviceID: params.deviceId,
            Plan: dayType.value.toUpperCase(),
          },
        })
      );
    };
    if (socket.readyState === WebSocket.OPEN) {
      sendMessage();
    } else {
      socket.onopen = () => sendMessage();
    }
  };

  function generatePatternName(config: Pattern["config"]): string {
    const parts: string[] = [];
    const firstPhase = config.configuredPhases[0];
    if (firstPhase) {
      if (firstPhase.enableBlink) {
        parts.push(
          `Blink${firstPhase.greenToRedDelay}${firstPhase.redToGreenDelay}`
        );
      }
      if (firstPhase.enableAmber) {
        parts.push(
          `Amber${firstPhase.greenToRedAmberDelay}${firstPhase.redToGreenAmberDelay}`
        );
      }
      if (firstPhase.duration >= 20) {
        parts.push("Peak");
      } else if (firstPhase.duration >= 10) {
        parts.push("Noon");
      } else {
        parts.push("OffPeak");
      }
    }
    return parts.join("_") || "Default";
  }

  function parsePattern(patternArray: string[]): Pattern {
    const configuredPhases: Pattern["config"]["configuredPhases"] = [];
    let currentPhaseIndex = 0;

    // Default phase configuration based on provided rules
    const defaultPhaseConfig = {
      enableBlink: false,
      redToGreenDelay: 0, // redToGreenBlinkDelay
      greenToRedDelay: 2, // greenToRedBlinkDelay
      enableAmber: true,
      enableAmberBlink: false,
      redToGreenAmberDelay: 0,
      greenToRedAmberDelay: 3,
      holdRedSignalOnAmber: false,
      holdGreenSignalOnAmber: false,
    };

    for (let i = 0; i < patternArray.length; i++) {
      const pattern = patternArray[i].trim();
      const match = pattern.match(/\*(\d+|X)\*(.*?)#/);
      if (!match) continue;

      const [_, duration, signalString] = match;

      if (
        duration !== "X" &&
        !signalString.includes("X") &&
        !signalString.includes("A")
      ) {
        // Main phase (no transition signals like X or A)
        const phase = {
          name: `Phase${currentPhaseIndex + 1}`,
          phaseId: String(currentPhaseIndex),
          signalString: `*${signalString}#`,
          duration: parseInt(duration) || 0,
          id: currentPhaseIndex,
          ...defaultPhaseConfig,
        };

        // Check subsequent lines for transition settings (blink or amber)
        let nextIndex = i + 1;
        while (nextIndex < patternArray.length) {
          const nextPattern = patternArray[nextIndex].trim();
          const nextMatch = nextPattern.match(/\*(\d+|X)\*(.*?)#/);
          if (!nextMatch) break;

          const [_, nextDuration, nextSignalString] = nextMatch;

          if (nextDuration === "X" && nextSignalString.includes("X")) {
            // Blink phase detected
            phase.enableBlink = true;
            // Estimate blink duration by counting consecutive 'X' lines
            let blinkCount = 0;
            for (let j = nextIndex; j < patternArray.length; j++) {
              const check = patternArray[j].match(/\*X\*(.*?)#/);
              if (!check || !check[1].includes("X")) break;
              blinkCount += 0.5; // Each X line represents a 0.5s blink cycle
              nextIndex = j + 1;
            }
            // Assign blink duration (split between green-to-red and red-to-green for simplicity)
            phase.greenToRedDelay = Math.min(blinkCount / 2, 5); // Cap at 5s
            phase.redToGreenDelay = Math.min(blinkCount / 2, 5); // Cap at 5s
            continue;
          } else if (nextSignalString.includes("A")) {
            // Amber phase detected
            phase.enableAmber = true;
            phase.enableAmberBlink = nextSignalString.includes("X");
            // Estimate amber duration
            let amberCount = 0;
            for (let j = nextIndex; j < patternArray.length; j++) {
              const check = patternArray[j].match(/\*(\d+|X)\*(.*?)#/);
              if (!check || !check[2].includes("A")) break;
              amberCount += check[1] === "X" ? 0.5 : parseInt(check[1]) / 2; // Approximate duration
              nextIndex = j + 1;
            }
            phase.greenToRedAmberDelay = Math.min(
              Math.max(amberCount / 2, 2),
              5
            ); // Range 2–5s
            phase.redToGreenAmberDelay = Math.min(amberCount / 2, 5); // Range 0–5s
            continue;
          } else {
            break; // No more transition phases
          }
        }

        configuredPhases.push(phase);
        currentPhaseIndex++;
        i = nextIndex - 1; // Skip processed transition lines
      }
    }

    return {
      name: generatePatternName({ configuredPhases }),
      config: { configuredPhases },
    };
  }

  useEffect(() => {
    dispatch(getUserPlan());
    dispatch(getUserPattern());
    if (!currentDeviceInfoData?.JunctionId) {
      dispatch(getUserDeviceInfoData(params.deviceId));
    }
  }, [dispatch, params.deviceId, currentDeviceInfoData?.JunctionId]);

  useEffect(() => {
    const socket = getWebSocket();
    const handleDataFeedback = async (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event === "ping_received") return;
      if (feedback.payload?.DeviceID !== params.deviceId) return;

      switch (feedback.event) {
        case "download_feedback":
          setIsDownloadingSchedule(false);
          if (feedback.payload.error) {
            emitToastMessage(feedback.payload.message, "error");
          } else {
            const numToDay: { [key: number]: string } = {
              0: "MONDAY",
              1: "TUESDAY",
              2: "WEDNESDAY",
              3: "THURSDAY",
              4: "FRIDAY",
              5: "SATURDAY",
              6: "SUNDAY",
            };
            const planName = numToDay[feedback?.payload?.Plan] || "CUSTOM";
            const patterns = feedback?.payload.Program.map((prog: any) => ({
              period: prog.period.slice(0, 5),
              ...parsePattern(prog.pattern),
            }));
            const newPlan = {
              id: Date.now().toString(),
              email,
              data: patterns,
              dayType: planName.toLowerCase(),
              name: planName.toUpperCase(),
              schedule: patterns.reduce((acc: ScheduleData, prog: any) => {
                acc[prog.period] =
                  patternsOptions.find((opt) => opt.label === prog.name) ||
                  null;
                return acc;
              }, {}),
              customDate:
                feedback.payload.Plan === "CUSTOM" && feedback.payload.Date
                  ? new Date(feedback.payload.Date)
                  : null,
            };
            try {
              await HttpRequest.put("/plans", newPlan);
              dispatch(getUserPlan());
              dispatch(getUserPattern());
              handlePlanChange({
                value: newPlan.dayType.toUpperCase(),
                label: newPlan.dayType.toUpperCase(),
              });
            } catch (error: any) {
              const message =
                error?.response?.data?.message || `Request failed`;
              emitToastMessage(message, "error");
            }
          }
          break;
        case "upload_feedback":
          if (feedback.payload.error) {
            emitToastMessage(feedback.payload.message, "error");
            setIsUploadingSchedule(false);
          }
          break;
        default:
          // emitToastMessage(`Unhandled event type:1${feedback.event}`, "error");
      }
    };
    socket?.addEventListener("message", handleDataFeedback);
    return () => {
      socket?.removeEventListener("message", handleDataFeedback);
    };
  }, [dispatch, params.deviceId, email, patternsOptions]);

  return (
    <div className="schedule__container">
      <div className="schedule__left">
        <div className="schedule__controls">
          <Select
            options={dayTypeOptions}
            value={dayType}
            onChange={handleDayTypeChange}
            className="schedule__select-field schedule__select-field-1"
            placeholder="Select day type"
          />
          <Select
            options={plansOptions}
            value={selectedPlan}
            onChange={handlePlanChange}
            className="schedule__select-field schedule__select-field-2"
            placeholder="Select existing plan"
          />
          {dayType.value === "custom" && (
            <DatePicker
              selected={customDate}
              onChange={handleDateChange}
              className="schedule__datepicker"
              placeholderText="Select custom date"
            />
          )}
        </div>
        <div className="schedule__table-wrapper">
          <table className="schedule__table">
            <thead>
              <tr>
                <th className="schedule__header">Time</th>
                <th className="schedule__header">Pattern</th>
              </tr>
            </thead>
            <tbody>
              {timeSegments?.map((time) => (
                <tr key={time}>
                  <td className="schedule__time">{time}</td>
                  <td className="schedule__select">
                    <Select
                      onChange={(
                        newValue: SingleValue<string | Option>,
                        actionMeta: ActionMeta<string | Option>
                      ) => {
                        const selectedValue =
                          typeof newValue === "string"
                            ? newValue
                            : newValue?.value || "";
                        handleChange(time, selectedValue);
                        handleSelectPattern(selectedValue);
                      }}
                      options={patternsOptions}
                      value={schedule[time] || null}
                      className="schedule__select--field"
                      placeholder="Select pattern"
                      isSearchable
                      isClearable
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="schedule__actions">
          <button onClick={saveSchedule} className="schedule__button">
            Save Schedule
          </button>
          <button
            onClick={handleUpload}
            className="schedule__button"
            disabled={isUploadingSchedule}
          >
            {isUploadingSchedule ? "Uploading..." : "Upload to Device"}
          </button>
          <button
            onClick={handleDownload}
            className="schedule__button"
            disabled={isDownloadingSchedule}
          >
            {isDownloadingSchedule ? "Downloading..." : "Download from Device"}
          </button>
        </div>
      </div>
      <div className="schedule__right">
        {rightBoxContent === "patterns" && (
          <>
            <div className="patterns__selected">
              <h3>Phases in "{selectedPattern?.name}"</h3>
              <DragDropContext onDragEnd={handleDragEndEdit}>
                <Droppable droppableId="selected-phases">
                  {(provided) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef}>
                      {updatedPatternPhases?.map((phaseInstance, index) => (
                        <Draggable
                          key={phaseInstance?.phaseId}
                          draggableId={`${phaseInstance?.phaseId}`}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="row">
                                <h3>{phaseInstance?.name}</h3>
                                <form onSubmit={phaseFormik.handleSubmit}>
                                  {phaseToConfigure &&
                                  phaseToConfigure?.phaseId ===
                                    phaseInstance?.phaseId ? (
                                    <>
                                      <input
                                        id="duration"
                                        name="duration"
                                        type="number"
                                        value={phaseFormik.values.duration}
                                        onChange={phaseFormik.handleChange}
                                        onBlur={(e) => {
                                          phaseFormik.handleBlur(e);
                                          handleDurationBlur();
                                        }}
                                        aria-label="Phase duration"
                                      />
                                      <button
                                        type="submit"
                                        disabled={
                                          !phaseFormik.values.duration ||
                                          !phaseFormik.dirty ||
                                          !!phaseFormik.errors.duration
                                        }
                                        aria-label="Save phase duration"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelPhaseConfig}
                                        aria-label="Cancel phase duration edit"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {updatedPatternPhases?.find(
                                        (p) =>
                                          p?.phaseId === phaseInstance?.phaseId
                                      )?.duration ? (
                                        <span>
                                          Dur:{" "}
                                          {
                                            updatedPatternPhases?.find(
                                              (p) =>
                                                p?.phaseId ===
                                                phaseInstance?.phaseId
                                            )?.duration
                                          }
                                        </span>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleConfigurePhase(phaseInstance)
                                        }
                                        aria-label={
                                          updatedPatternPhases?.find(
                                            (p) =>
                                              p?.phaseId ===
                                              phaseInstance?.phaseId
                                          )?.duration
                                            ? "Edit phase duration"
                                            : "Set phase duration"
                                        }
                                      >
                                        {updatedPatternPhases?.find(
                                          (p) =>
                                            p?.phaseId ===
                                            phaseInstance?.phaseId
                                        )?.duration
                                          ? "Edit Duration"
                                          : "Set Duration"}
                                      </button>
                                    </>
                                  )}
                                </form>
                                <button
                                  onClick={() =>
                                    handleRemovePhaseFromSelectedPhases(
                                      phaseInstance?.phaseId
                                    )
                                  }
                                  aria-label="Remove phase"
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
              <div className="patterns__selected--ctn">
                <input
                  type="text"
                  value={newPatternName}
                  onChange={(e) => setNewPatternName(e.target.value)}
                  placeholder="Enter new pattern name"
                  aria-label="New pattern name"
                />
                <button onClick={saveNewPattern} aria-label="Save new pattern">
                  Save New Pattern
                </button>
              </div>
            </div>
            <div className="available-phases">
              <h2 className="patterns__availablePhases--header">
                Available Phases
              </h2>
              <ul className="patterns__availablePhases">
                {phases?.map((phase: any, index: number) => (
                  <li
                    className={`patterns__availablePhases--item`}
                    key={phase._id || index}
                  >
                    <h3>{phase?.name}</h3>
                    <div>
                      <button
                        onClick={() => handleAvailablePhaseSelect(phase)}
                        aria-label={`Add phase ${phase?.name}`}
                      >
                        Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleTemplate;
