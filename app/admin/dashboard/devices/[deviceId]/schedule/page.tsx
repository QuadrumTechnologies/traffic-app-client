"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import Select, { ActionMeta, SingleValue } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PhaseConfigType } from "@/components/TabsComponents/BoxTwo";
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
import { toast } from "react-toastify"; // Add import for toast.dismiss

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
    amberDurationGreenToRed: number;
    amberDurationRedToGreen: number;
    amberEnabled: boolean;
    blinkEnabled: boolean;
    blinkTimeGreenToRed: number;
    blinkTimeRedToGreen: number;
    configuredPhases: Array<{
      name: string;
      phaseId: string;
      signalString: string;
      duration: number;
      id: number;
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
  const email = GetItemFromLocalStorage("user")?.email || "";
  const socket = getWebSocket();

  const patternsOptions: Option[] =
    patterns
      ?.map((pattern) => ({
        value: pattern.name.toLowerCase(),
        label: pattern.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const plansOptions: Option[] =
    plans
      ?.map((plan) => ({
        value: plan.name.toLowerCase(),
        label: plan.name,
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
  const [phaseToConfigure, setPhaseToConfigure] =
    useState<PhaseConfigType | null>(null);

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
      return;
    }
    const pattern = patterns?.find(
      (p) => p.name.toLowerCase() === patternName.toLowerCase()
    );
    if (pattern) {
      setSelectedPattern(pattern);
      setRightBoxContent("patterns");
      setUpdatedPatternPhases(pattern.configuredPhases);
      pattern.configuredPhases.forEach((phase: any) => {
        dispatch(addOrUpdatePhaseConfig(phase));
      });
    }
  };

  const handleAvailablePhaseSelect = (phase: any) => {
    const updatedPhases = [
      ...updatedPatternPhases,
      {
        id: phase._id,
        name: phase.name,
        signalString: phase.data,
        duration: "",
      },
    ];
    setUpdatedPatternPhases(updatedPhases);
  };

  const handleRemovePhaseFromSelectedPhases = (phaseId: string) => {
    setUpdatedPatternPhases((prev) =>
      prev.filter((phase) => phase.id !== phaseId)
    );
    dispatch(removePhaseConfig(phaseId));
  };

  const handleConfigurePhase = (phaseId: string, phaseName: string) => {
    if (
      phaseToConfigure &&
      phaseToConfigure.id !== phaseId &&
      phaseFormik.dirty
    ) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Do you want to switch to configuring a different phase without saving?"
      );
      if (!confirmSwitch) return;
    }
    const foundPhase = phases?.find((p) => p.name === phaseName);
    if (foundPhase) {
      setPhaseToConfigure({ ...foundPhase, id: phaseId });
      phaseFormik.resetForm({
        values: {
          duration:
            configuredPhases?.find((p) => p.id === foundPhase.id)?.duration ||
            "",
        },
      });
    }
  };

  const phaseFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      duration: phaseToConfigure
        ? configuredPhases?.find((p) => p.id === phaseToConfigure.id)
            ?.duration || ""
        : "",
    },
    validationSchema: Yup.object({
      duration: Yup.number()
        .required("Duration is required")
        .min(1, "Minimum duration is 1"),
    }),
    onSubmit: async (values) => {
      if (phaseToConfigure) {
        const configToSave = {
          id: phaseToConfigure.id,
          name: phaseToConfigure.name,
          signalString: phaseToConfigure.data,
          duration: values.duration,
        };
        dispatch(addOrUpdatePhaseConfig(configToSave));
        setPhaseToConfigure(null);
        emitToastMessage("Phase configuration saved", "success");
      }
    },
    validateOnBlur: true,
    validateOnChange: false,
  });

  // Show validation errors as toasts on blur
  const handleDurationBlur = () => {
    if (phaseFormik.touched.duration && phaseFormik.errors.duration) {
      emitToastMessage(phaseFormik.errors.duration as string, "error");
    }
  };

  // Cancel handler for phase configuration
  const handleCancelPhaseConfig = () => {
    phaseFormik.resetForm();
    setPhaseToConfigure(null);
  };

  const saveNewPattern = async () => {
    if (!newPatternName) {
      emitToastMessage("Please provide a new pattern name.", "error");
      return;
    }
    try {
      await HttpRequest.post("/patterns", {
        email,
        ...selectedPattern,
        configuredPhases: configuredPhases,
        name: newPatternName,
        deviceId: params.deviceId,
      });
      dispatch(getUserPattern(email));
      dispatch(clearPhaseConfig());
      setSelectedPattern(null);
      setNewPatternName("");
      setUpdatedPatternPhases([]);
      setRightBoxContent(null);
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
        patternsOptions.find((option) => option.value === selectedValue) ||
        null;
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        [time]: selectedOption,
      }));
      handleSelectPattern(selectedValue);
    },
    [patternsOptions]
  );

  const handlePlanChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      setSelectedPlan(newValue);
      const plan = plans?.find(
        (p) => p.name.toLowerCase() === newValue.value.toLowerCase()
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
        (p) => p.name.toLowerCase() === newValue.value.toLowerCase()
      );
      if (plan) {
        handlePlanChange({
          value: newValue.value.toUpperCase(),
          label: newValue.label.toUpperCase(),
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
      (p) => p.name.toUpperCase() === dayType.value.toUpperCase()
    );
    if (existingPlan) {
      const userResponse = confirm(
        `A plan for ${existingPlan.name} exists, do you want to override?`
      );
      if (!userResponse) {
        emitToastMessage("Schedule save cancelled", "info");
        return;
      }
    }
    try {
      await HttpRequest.post("/plans", {
        id: Date.now().toString(),
        deviceId: params.deviceId,
        email,
        schedule,
        dayType: dayType.value,
        name: dayType.value.toUpperCase(),
        customDate:
          dayType.value === "custom" ? customDate?.toISOString() : undefined,
      });
      dispatch(getUserPlan(email));
      setSelectedPlan({
        value: dayType.value.toUpperCase(),
        label: dayType.label.toUpperCase(),
      });
      const fullSchedule: ScheduleData = {};
      timeSegments.forEach((time) => {
        fullSchedule[time] = schedule[time]
          ? { value: schedule[time]!.value, label: schedule[time]!.label }
          : null;
      });
      setSchedule(fullSchedule);
      emitToastMessage("Schedule saved successfully", "success");
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
        (p) => p.name.toLowerCase() === dayType.value.toLowerCase()
      );
      if (!plan) {
        emitToastMessage("Please save the schedule before uploading", "error");
        return;
      }
      for (const timeSegmentKey of Object.keys(schedule)) {
        if (
          plan.schedule[timeSegmentKey]?.label !==
          schedule[timeSegmentKey]?.label
        ) {
          emitToastMessage(
            `Schedule mismatch at ${timeSegmentKey}. Save the schedule before uploading.`,
            "error"
          );
          return;
        }
      }
      const confirmResult = confirm(
        `Are you sure you want to upload "${dayType.label}" plan?`
      );
      if (!confirmResult) {
        emitToastMessage("Upload cancelled", "info");
        return;
      }
      setIsUploadingSchedule(true);
      toastId = emitToastMessage(
        `Uploading plan "${dayType.label}"...`,
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
                ...(plan.name.toUpperCase() === "CUSTOM" && {
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
            if (feedback.event !== "upload_feedback") return;
            if (
              feedback.payload?.Plan === plan.name &&
              feedback.payload?.Period === startSegmentKey
            ) {
              if (feedback.payload?.error) {
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
        if (timeSegment?.value && timeSegment.value !== "None") {
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
      emitToastMessage(
        `Plan "${dayType.label}" uploaded successfully`,
        "success",
        { duration: 3000 }
      );
      toast.dismiss(toastId);
    } catch (error: any) {
      setIsUploadingSchedule(false);
      const message = error.message || "Failed to upload schedule";
      emitToastMessage(message, "error");
      toast.dismiss(toastId);
    }
  };

  const handleDownload = async () => {
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
    if (config.blinkEnabled) {
      parts.push(
        `Blink${config.blinkTimeGreenToRed}${config.blinkTimeRedToGreen}`
      );
    }
    if (config.amberEnabled) {
      parts.push(
        `Amber${config.amberDurationGreenToRed}${config.amberDurationRedToGreen}`
      );
    }
    if (config.configuredPhases[0]?.duration >= 20) {
      parts.push("Peak");
    } else if (config.configuredPhases[0]?.duration >= 10) {
      parts.push("Noon");
    } else {
      parts.push("OffPeak");
    }
    return parts.join("_") || "Default";
  }

  function parsePattern(patternArray: string[]): Pattern {
    const config = {
      amberDurationGreenToRed: 3,
      amberDurationRedToGreen: 3,
      amberEnabled: false,
      blinkEnabled: false,
      blinkTimeGreenToRed: 2,
      blinkTimeRedToGreen: 1,
      configuredPhases: [] as Pattern["config"]["configuredPhases"],
    };
    let currentPhaseIndex = 0;
    patternArray.forEach((line) => {
      const pattern = line.trim();
      const match = pattern.match(/\*(\d+|X)\*(.*?)#/);
      if (!match) return;
      const [_, duration, signalString] = match;
      if (duration === "X") {
        config.blinkEnabled = true;
      }
      if (duration !== "X" && signalString.includes("A")) {
        config.amberEnabled = true;
      }
      if (
        duration !== "X" &&
        !signalString.includes("X") &&
        !signalString.includes("A")
      ) {
        config.configuredPhases.push({
          name: `Phase${currentPhaseIndex + 1}`,
          phaseId: String(currentPhaseIndex),
          signalString: `*${signalString}#`,
          duration: parseInt(duration) || 0,
          id: currentPhaseIndex,
        });
        currentPhaseIndex++;
      }
    });
    return { name: generatePatternName(config), config };
  }

  useEffect(() => {
    dispatch(getUserPlan(email));
    if (!currentDeviceInfoData?.JunctionId) {
      dispatch(getUserDeviceInfoData(params.deviceId));
    }
    handlePlanChange({
      value: dayType.value.toUpperCase(),
      label: dayType.label.toUpperCase(),
    });
  }, [dispatch, email, params.deviceId, dayType]);

  useEffect(() => {
    const handleDataFeedback = async (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event === "ping_received") return;
      if (feedback.payload?.DeviceID !== params.deviceId) return;
      if (feedback.event === "download_feedback") {
        setIsDownloadingSchedule(false);
        if (feedback.payload?.error) {
          emitToastMessage(
            feedback.payload.message ||
              "Could not download schedule from device",
            "error"
          );
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
          const planName =
            numToDay[feedback.payload.Plan] || dayType.value.toUpperCase();
          const patterns = feedback.payload.Program.map((prog: any) => ({
            period: prog.period.slice(0, 5),
            ...parsePattern(prog.pattern),
          }));
          const newPlan = {
            id: Date.now().toString(),
            email,
            data: patterns,
            dayType: planName.toLowerCase(),
            name: planName.toUpperCase(),
            schedule: patterns.reduce((acc: ScheduleData, p: any) => {
              acc[p.period] = { value: p.name.toLowerCase(), label: p.name };
              return acc;
            }, {}),
            customDate:
              feedback.payload.Plan === "CUSTOM" && feedback.payload.Date
                ? new Date(feedback.payload.Date)
                : null,
          };
          try {
            await HttpRequest.put("/plans", newPlan);
            dispatch(getUserPlan(email));
            dispatch(getUserPattern(email));
            handlePlanChange({ value: planName, label: planName });
            emitToastMessage("Schedule downloaded successfully", "success");
          } catch (error: any) {
            const message = error?.response?.data?.message || `Request failed`;
            emitToastMessage(message, "error");
          }
        }
      } else if (feedback.event === "upload_feedback") {
        if (feedback.payload?.error) {
          emitToastMessage(
            feedback.payload.message || "Upload failed",
            "error"
          );
          setIsUploadingSchedule(false);
        }
      } else if (feedback.event === "error") {
        setIsUploadingSchedule(false);
        setIsDownloadingSchedule(false);
        emitToastMessage(
          feedback.payload?.message || "An error occurred",
          "error"
        );
      }
    };
    socket.addEventListener("message", handleDataFeedback);
    return () => {
      socket.removeEventListener("message", handleDataFeedback);
    };
  }, [dispatch, email, params.deviceId, dayType, socket]);

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
            aria-label="Select day type"
          />
          <Select
            options={plansOptions}
            value={selectedPlan}
            onChange={handlePlanChange}
            className="schedule__select-field schedule__select-field-2"
            placeholder="Select existing plan"
            aria-label="Select existing plan"
          />
          {dayType.value === "custom" && (
            <DatePicker
              selected={customDate}
              onChange={handleDateChange}
              className="schedule__datepicker"
              placeholderText="Select custom date"
              aria-label="Select custom date"
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
              {timeSegments.map((time) => (
                <tr key={time}>
                  <td className="schedule__time">{time}</td>
                  <td className="schedule__select">
                    <Select
                      onChange={(
                        newValue: SingleValue<Option>,
                        actionMeta: ActionMeta<Option>
                      ) => {
                        const selectedValue = newValue?.value || "";
                        handleChange(time, selectedValue);
                      }}
                      options={patternsOptions}
                      value={schedule[time] || null}
                      className="schedule__select--field"
                      placeholder="Select pattern"
                      isSearchable
                      isClearable
                      aria-label={`Select pattern for ${time}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="schedule__actions">
          <button
            onClick={saveSchedule}
            className="schedule__button"
            disabled={isUploadingSchedule || isDownloadingSchedule}
            aria-label="Save schedule"
          >
            Save Schedule
          </button>
          <button
            onClick={handleUpload}
            className="schedule__button"
            disabled={isUploadingSchedule || isDownloadingSchedule}
            aria-label="Upload to device"
          >
            {isUploadingSchedule ? "Uploading..." : "Upload to Device"}
          </button>
          <button
            onClick={handleDownload}
            className="schedule__button"
            disabled={isUploadingSchedule || isDownloadingSchedule}
            aria-label="Download from device"
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
                      {updatedPatternPhases.map((phaseInstance, index) => (
                        <Draggable
                          key={phaseInstance.id}
                          draggableId={`${phaseInstance.id}`}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="row">
                                <h3>{phaseInstance.name}</h3>
                                <form onSubmit={phaseFormik.handleSubmit}>
                                  {phaseToConfigure &&
                                  phaseToConfigure.id === phaseInstance.id ? (
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
                                        autoFocus
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
                                      {configuredPhases?.find(
                                        (p) => p.id === phaseInstance.id
                                      )?.duration ? (
                                        <span>
                                          Dur:{" "}
                                          {
                                            configuredPhases.find(
                                              (p) => p.id === phaseInstance.id
                                            )?.duration
                                          }
                                        </span>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleConfigurePhase(
                                            phaseInstance.id,
                                            phaseInstance.name
                                          )
                                        }
                                        aria-label={
                                          configuredPhases?.find(
                                            (p) => p.id === phaseInstance.id
                                          )?.duration
                                            ? "Edit phase duration"
                                            : "Set phase duration"
                                        }
                                      >
                                        {configuredPhases?.find(
                                          (p) => p.id === phaseInstance.id
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
                                      phaseInstance.id
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
                {phases?.map((phase: any, index: any) => (
                  <li
                    className="patterns__availablePhases--item"
                    key={phase._id || index}
                  >
                    <h3>{phase.name}</h3>
                    <div>
                      <button
                        onClick={() => handleAvailablePhaseSelect(phase)}
                        aria-label={`Add phase ${phase.name}`}
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
