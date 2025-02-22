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

interface Option {
  value: string;
  label: string;
}

interface ScheduleData {
  [time: string]: Option | null;
}

interface ScheduleTemplateProps {
  params: any;
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
        value: plan?.name,
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

    // If no patternName or invalid pattern, reset everything to null
    if (!patternName) {
      setSelectedPattern(null);
      setRightBoxContent(null);
      setUpdatedPatternPhases([]);
      dispatch(clearPhaseConfig());
      return;
    }

    const pattern = patterns?.find(
      (pattern) => pattern?.name.toLowerCase() === patternName
    );

    if (pattern) {
      setSelectedPattern(pattern);
      setRightBoxContent("patterns");
      setUpdatedPatternPhases(pattern.configuredPhases);
      pattern?.configuredPhases.forEach((phase: any) => {
        dispatch(addOrUpdatePhaseConfig(phase));
      });
    }
  };

  const handleAvailablePhaseSelect = (phase: any) => {
    const updatedPhases = [
      ...updatedPatternPhases,
      {
        id: phase._id,
        name: phase?.name,
        signalString: phase.data,
        duration: "",
      },
    ];
    setUpdatedPatternPhases(updatedPhases);
  };

  const handleRemovePhaseFromSelectedPhases = (phaseId: string) => {
    setUpdatedPatternPhases((prev) =>
      prev.filter((phase) => phase?.id !== phaseId)
    );
    dispatch(removePhaseConfig(phaseId));
  };

  const handleConfigurePhase = (phaseId: string, phaseName: string) => {
    if (
      phaseToConfigure &&
      phaseToConfigure?.id !== phaseId &&
      phaseFormik.dirty
    ) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Do you want to switch to configuring a different phase without saving?"
      );
      if (!confirmSwitch) return;
    }

    const foundPhase = phases?.find((p) => p?.name === phaseName);

    if (foundPhase) {
      setPhaseToConfigure({ ...foundPhase, id: phaseId });
      phaseFormik.resetForm({
        values: {
          duration:
            configuredPhases?.find((p) => p?.id === foundPhase?.id)?.duration ||
            "",
        },
      });
    }
  };

  const phaseFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      duration: phaseToConfigure
        ? configuredPhases?.find((p) => p?.id === phaseToConfigure?.id)
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
          id: phaseToConfigure?.id,
          name: phaseToConfigure?.name,
          signalString: phaseToConfigure.data,
          duration: values.duration,
        };
        dispatch(addOrUpdatePhaseConfig(configToSave));
        setPhaseToConfigure(null);
      }
    },
  });

  const saveNewPattern = async () => {
    if (!newPatternName) {
      alert("Please provide a new pattern name.");
      return;
    }

    try {
      const { data } = await HttpRequest.post("/patterns", {
        email: email,
        ...selectedPattern,
        configuredPhases: configuredPhases,
        name: newPatternName,
      });

      emitToastMessage(data.message, "success");
      dispatch(getUserPattern());
      dispatch(clearPhaseConfig());
      setSelectedPattern(null);
    } catch (error: any) {
      emitToastMessage(
        error?.response?.data?.message || "An error occurred",
        "error"
      );
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
    [patterns, patternsOptions]
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
          fullSchedule[time] = plan.schedule[time] || null;
        });

        setSchedule(fullSchedule);
        setCustomDate(plan.customDate ? new Date(plan.customDate) : null);
      } else {
        const emptySchedule: ScheduleData = {};
        timeSegments.forEach((time) => {
          emptySchedule[time] = null;
        });

        setSchedule(emptySchedule);
      }
    }
  };

  useEffect(() => {
    handlePlanChange({
      value: dayType?.value.toUpperCase(),
      label: dayType?.label.toUpperCase(),
    });
  }, []);

  const handleDayTypeChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      setDayType(newValue);

      const plan = plans?.find(
        (plan) => plan?.name.toLowerCase() === newValue.value.toLowerCase()
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
      (plan) => plan.name.toUpperCase() === dayType.value.toUpperCase()
    );
    if (existingPlan) {
      const userResponse = confirm(
        `A plan for ${existingPlan?.name} exist, do you want to override?`
      );
      if (!userResponse) return;
    }
    try {
      const { data } = await HttpRequest.post("/plans", {
        id: Date.now().toString(),
        email,
        schedule,
        dayType: dayType.value,
        name: dayType.value.toUpperCase(),
        customDate:
          dayType.value === "custom" ? customDate || undefined : undefined,
      });
      emitToastMessage(data.message, "success");
      dispatch(getUserPlan());
      // setSchedule({});
      setSelectedPattern(null);
      handlePlanChange({
        value: dayType.value.toUpperCase(),
        label: dayType.label.toUpperCase(),
      });
    } catch (error: any) {
      emitToastMessage(
        error?.response?.data?.message || "An error occurred",
        "error"
      );
    }
  };

  useEffect(() => {
    dispatch(getUserPlan());
    if (!currentDeviceInfoData?.JunctionId) {
      dispatch(getUserDeviceInfoData(params.deviceId));
    }
  }, []);

  const handleUpload = async () => {
    // Ensure the datyTpe and existing plan are selected and the same
    if (dayType.value.toLowerCase() !== selectedPlan?.value.toLowerCase()) {
      emitToastMessage(
        "Day type and selected existing plan must be the same",
        "error"
      );
      return;
    }
    //

    try {
      const plan = plans?.find(
        (plan) => plan.name.toLowerCase() === dayType.value.toLowerCase()
      );

      // Compare the pattern of plan.schedule and schedule to see if there's any difference, if there is difference, trigger an error for the user to save the schedule
      if (plan) {
        for (const timeSegmentKey of Object.keys(schedule)) {
          const timeSegment = schedule[timeSegmentKey];
          if (plan.schedule[timeSegmentKey]?.label !== timeSegment?.label) {
            emitToastMessage(
              `There's a difference between the current schedule and the selected plan at ${timeSegmentKey}, save the schedule before uploading.`,
              "error"
            );
            return;
          }
        }
      }

      if (!plan || !plan.schedule) {
        console.error("Invalid plan or missing schedule");
        return emitToastMessage(
          "This is a new plan, you have to save it prior to uploading",
          "error"
        );
      }
      // Final confirmation before uploading
      const confirmResult = confirm(
        `Are you sure you want to upload "${dayType.value}" plan?`
      );
      if (!confirmResult) return emitToastMessage("Upload cancelled", "error");
      const socket = getWebSocket();
      setIsUploadingSchedule(true);
      const sendMessage = (
        startSegmentKey: any,
        endSegmentKey: any,
        timeSegment: any
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

        return new Promise<void>((resolve) => {
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

          socket.onmessage = (event: MessageEvent) => {
            const feedback = JSON.parse(event.data);
            if (feedback.event === "ping_received") return;
            if (
              feedback?.event === "upload_feedback" &&
              feedback.payload.Plan === plan.name &&
              feedback.payload.Period === startSegmentKey
            ) {
              console.log("Upload success for time segment:", feedback);
              resolve();
            }
          };
        });
      };

      // Track the last valid time segment value and its key
      let lastValidSegment = null;
      let lastStartKey = null;

      for (const timeSegmentKey of Object.keys(plan.schedule)) {
        let timeSegment = plan.schedule[timeSegmentKey];

        // If the current segment has a value, send the previous accumulated range and start a new one
        if (timeSegment && timeSegment.value && timeSegment.value !== "None") {
          // If there's a previous segment without values, send it
          if (lastValidSegment && lastStartKey !== timeSegmentKey) {
            console.log(
              `Uploading accumulated time segment from ${lastStartKey} to ${timeSegmentKey}`
            );
            await sendMessage(lastStartKey, timeSegmentKey, lastValidSegment);
          }

          // Update the last valid segment and its start key
          lastValidSegment = timeSegment;
          lastStartKey = timeSegmentKey;
        }
      }

      // If there's any remaining segment that needs to be uploaded till the end of the day
      if (lastValidSegment && lastStartKey) {
        await sendMessage(lastStartKey, "23:59", lastValidSegment);
      }
      emitToastMessage(
        `All segments uploaded for plan: ${plan.name}`,
        "success"
      );
      setIsUploadingSchedule(false);
      console.log(`All segments uploaded for plan: ${plan.name}`);
    } catch (error: any) {
      emitToastMessage(error?.response?.data?.message, "error");
    }
  };

  const socket = getWebSocket();

  const handleDownload = async () => {
    getWebSocket();
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
      socket.onopen = () => {
        sendMessage();
      };
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

    patternArray.forEach((line, index) => {
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

    const pattern: Pattern = {
      name: generatePatternName(config),
      config,
    };

    return pattern;
  }

  useEffect(() => {
    const socket = getWebSocket();

    const handleDataFeedback = async (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event !== "download_feedback") return;
      setIsDownloadingSchedule(false);

      if (feedback.payload.error) {
        emitToastMessage("Could not download schedule from device", "error");
      } else {
        emitToastMessage(
          "Schedule downloaded from hardware successfully! Saving...",
          "success"
        );
        const numToDay: { [key: number]: string } = {
          0: "MONDAY",
          1: "TUESDAY",
          2: "WEDNESDAY",
          3: "THURSDAY",
          4: "FRIDAY",
          5: "SATURDAY",
          6: "SUNDAY",
        };
        const Plan = numToDay[feedback?.payload?.Plan];

        const patterns = feedback?.payload.Program.map((prog: any) => ({
          period: prog.period.slice(0, 5),
          ...parsePattern(prog.pattern),
        }));

        const newPlan = {
          id: Date.now().toString(),
          email,
          data: patterns,
          dayType: Plan.toLowerCase(),
          name: Plan.toUpperCase(),
        };
        console.log("New Plans", newPlan);

        try {
          const {
            data: { message, plan },
          } = await HttpRequest.put("/plans", newPlan);
          dispatch(getUserPlan());
          dispatch(getUserPattern());
          handlePlanChange({
            value: plan.dayType.toUpperCase(),
            label: plan.dayType.toUpperCase(),
          });
          emitToastMessage(message, "success");
        } catch (error) {
          emitToastMessage("Could not save downloaded schedule", "error");
        }
      }
    };

    socket?.addEventListener("message", handleDataFeedback);

    return () => {
      socket?.removeEventListener("message", handleDataFeedback);
    };
  }, []);

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
            onClick={() => {
              handleUpload();
            }}
            className="schedule__button"
          >
            {isUploadingSchedule ? "Uploading" : " Upload to Device"}
          </button>
          <button
            onClick={() => {
              handleDownload();
            }}
            className="schedule__button"
          >
            {isDownloadingSchedule ? "Downloading" : "Download from Device"}
          </button>
        </div>
      </div>

      {/* Right div to show selected pattern and phases */}
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
                          key={phaseInstance?.id}
                          draggableId={`${phaseInstance?.id}`}
                          index={index}
                        >
                          {(provided) => {
                            return (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="row">
                                  <h3>{phaseInstance?.name}</h3>
                                  <form onSubmit={phaseFormik.handleSubmit}>
                                    {phaseToConfigure &&
                                    phaseToConfigure?.id ===
                                      phaseInstance?.id ? (
                                      <>
                                        <input
                                          id="duration"
                                          name="duration"
                                          type="number"
                                          value={phaseFormik.values.duration}
                                          onChange={phaseFormik.handleChange}
                                          onBlur={phaseFormik.handleBlur}
                                        />
                                        <button
                                          type="submit"
                                          disabled={
                                            !phaseFormik.values.duration ||
                                            !phaseFormik.dirty
                                          }
                                        >
                                          Save
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {configuredPhases?.find(
                                          (p) => p?.id === phaseInstance?.id
                                        )?.duration ? (
                                          <span>
                                            Dur:{" "}
                                            {
                                              configuredPhases?.find(
                                                (p) =>
                                                  p?.id === phaseInstance?.id
                                              )?.duration
                                            }
                                          </span>
                                        ) : null}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleConfigurePhase(
                                              phaseInstance?.id,
                                              phaseInstance?.name
                                            )
                                          }
                                        >
                                          {configuredPhases?.find(
                                            (p) => p?.id === phaseInstance?.id
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
                                        phaseInstance?.id
                                      )
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>
                              </li>
                            );
                          }}
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
                />
                <button onClick={saveNewPattern}>Save New Pattern</button>
              </div>
            </div>
            <div className="available-phases">
              <h2 className="patterns__availablePhases--header">
                Available Phases
              </h2>
              <ul className="patterns__availablePhases">
                {phases?.map((phase: any, index: any) => (
                  <li className={`patterns__availablePhases--item`} key={index}>
                    <h3>{phase?.name}</h3>
                    <div>
                      <button onClick={() => handleAvailablePhaseSelect(phase)}>
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
