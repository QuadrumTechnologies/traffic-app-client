"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHook";
import {
  closePreviewCreatedPatternPhase,
  previewCreatedPatternPhase,
  setIsIntersectionConfigurable,
  setSignalState,
  setSignalString,
  updateCountDownColor,
} from "@/store/signals/SignalConfigSlice";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import HttpRequest from "@/store/services/HttpRequest";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import {
  addOrUpdatePhaseConfig,
  clearPhaseConfig,
  getUserPattern,
  removePhaseConfig,
} from "@/store/devices/UserDeviceSlice";
import Button from "../UI/Button/Button";
import {
  FaPlay,
  FaPause,
  FaTrashAlt,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { useParams, useSearchParams } from "next/navigation";

interface BoxTwoProps {}

interface Pattern {
  configuredPhases: any[];
}

const BoxTwo: React.FC<BoxTwoProps> = () => {
  const searchParams = useSearchParams();
  const isTabTwo = searchParams.get("tab") === "2";
  const email = GetItemFromLocalStorage("user")?.email;
  const params = useParams<{ deviceId: string }>();
  const dispatch = useAppDispatch();
  const { phases, patterns, configuredPhases } = useAppSelector(
    (state) => state.userDevice
  );
  const [showAllAvailablePhases, setShowAllAvailablePhases] =
    useState<boolean>(false);
  const [showOtherPatternConfig, setShowOtherPatternConfig] =
    useState<boolean>(false);
  const [showPatternPhases, setShowPatternPhases] = useState<number | null>(
    null
  );
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [updatedPatternPhases, setUpdatedPatternPhases] = useState<any[]>([]);
  const [selectedPhases, setSelectedPhases] = useState<any[]>([]);
  const [phaseToConfigure, setPhaseToConfigure] = useState<any | null>(null);
  const [
    alreadyCreatedPatternPhaseToConfigure,
    setAlreadyCreatedPatternPhaseToConfigure,
  ] = useState<any | null>(null);
  const [activeOrLastAddedPhase, setActiveOrLastAddedPhase] =
    useState<string>("");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [activePreviewPhase, setActivePreviewPhase] = useState(null);
  const [searchedResult, setSearchedResult] = useState<any[]>([]);
  const [showSearchedResult, setShowSearchedResult] = useState<boolean>(false);
  const [inputtedPatternName, setInputtedPatternName] = useState<string>("");
  const [newPatternName, setNewPatternName] = useState<string>("");

  const searchPatternByName = (patternName: string) => {
    const matchedPhases = patterns.filter((pattern) =>
      pattern.name.toLowerCase().includes(patternName.toLowerCase())
    );
    setSearchedResult(matchedPhases);
  };
  const patternsToShow = showSearchedResult ? searchedResult : patterns;

  const handleActionClick = (action: string) => {
    setActiveAction(action);
  };

  const handleSelectPattern = (pattern: any, index: number) => {
    if (showPatternPhases === index) {
      setShowPatternPhases(null);
      setSelectedPattern(null);
      setUpdatedPatternPhases([]);
    } else {
      setShowPatternPhases(index);
      setSelectedPattern(pattern);
      setUpdatedPatternPhases(pattern?.configuredPhases || []);
    }
  };

  const handleDeletePattern = async (patternName: string) => {
    const confirmResult = confirm(
      `Are you sure you want to delete "${patternName}" pattern?`
    );
    if (!confirmResult) {
      emitToastMessage("Pattern deletion cancelled", "info");
      return;
    }
    const pattern = patterns?.find((p) => p.name === patternName);

    try {
      const { data } = await HttpRequest.delete(
        `/patterns/${pattern?.name}/${email}`
      );
      dispatch(getUserPattern(email));
      setUpdatedPatternPhases([]);
      setShowPatternPhases(null);
      setSelectedPattern(null);
      emitToastMessage(data.message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  const handleDeleteAllPatterns = async () => {
    const confirmResult = confirm(
      "Are you sure you want to delete ALL patterns? This action cannot be undone."
    );
    if (!confirmResult) {
      emitToastMessage("All patterns deletion cancelled", "info");
      return;
    }

    try {
      const { data } = await HttpRequest.delete(`/patterns/all/${email}`);
      dispatch(getUserPattern(email));
      setUpdatedPatternPhases([]);
      setSelectedPattern(null);
      setShowPatternPhases(null);
      setSearchedResult([]);
      setShowSearchedResult(false);
      setInputtedPatternName("");
      setActivePatternIndex(null);
      setActivePreviewPhase(null);
      stopPlayPhases();
      emitToastMessage(data.message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  const handleDragEndEdit = (result: any) => {
    if (!result.destination) return;
    const reorderedPhases = [...updatedPatternPhases];
    const [removed] = reorderedPhases.splice(result.source.index, 1);
    reorderedPhases.splice(result.destination.index, 0, removed);
    setUpdatedPatternPhases(reorderedPhases);
  };

  const createPatternHandler = async () => {
    if (!newPatternName.trim()) {
      emitToastMessage("A pattern name is required", "error");
      return;
    }

    if (!allPhasesConfigured) {
      emitToastMessage(
        "All selected phases must have a configured duration",
        "error"
      );
      return;
    }

    const patternData = {
      name: newPatternName.toUpperCase(),
      email: email,
      deviceId: params.deviceId,
      configuredPhases: configuredPhases.map((phase, index) => ({
        name: phase.name,
        phaseId: phase._id,
        id: phase.id,
        signalString:
          phase.signalString ||
          phases.find((p) => p.name === phase.name)?.data ||
          "",
        duration: phase.duration,
        deviceId: params.deviceId,
      })),
    };

    try {
      const { data } = await HttpRequest.post("/patterns", patternData);
      dispatch(getUserPattern(email));
      dispatch(clearPhaseConfig());
      setSelectedPhases([]);
      setShowAllAvailablePhases(false);
      emitToastMessage(data.message, "success");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to create pattern";
      emitToastMessage(message, "error");
    }
  };

  const duplicatePatternHandler = async (patternName: string) => {
    const newPatternName = prompt("Enter a name for the pattern");
    if (!newPatternName) {
      emitToastMessage("A new pattern name is required", "error");
      return;
    }

    const pattern = patterns.find((pattern) => pattern.name === patternName);
    if (!pattern) {
      emitToastMessage("Pattern not found", "error");
      return;
    }

    const newConfiguredPhases = pattern.configuredPhases.map(
      (phase: any, index: number) => ({
        name: phase.name,
        phaseId: phase.phaseId,
        id: `${phase.name}-${Date.now()}-${index}`,
        signalString: phase.signalString,
        duration: phase.duration,
        deviceId: params.deviceId,
      })
    );

    const patternData = {
      name: newPatternName.toUpperCase(),
      email,
      deviceId: params.deviceId,
      configuredPhases: newConfiguredPhases,
    };

    try {
      const { data } = await HttpRequest.post("/patterns", patternData);
      dispatch(getUserPattern(email));
      dispatch(clearPhaseConfig());
      emitToastMessage(data.message, "success");
      handleCancel();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to duplicate pattern";
      emitToastMessage(message, "error");
    }
  };

  const handlePhaseSelect = (phase: any) => {
    setSelectedPhases((prev) => {
      const newPhaseInstance = { ...phase, id: `${phase.name}-${Date.now()}` };
      return [...prev, newPhaseInstance];
    });
  };

  const handleRemovePhaseFromSelectedPhases = (phaseId: string) => {
    setSelectedPhases((prev) => prev.filter((phase) => phase.id !== phaseId));
    dispatch(removePhaseConfig(phaseId));
  };

  const handleDragEndCreate = (result: any) => {
    if (!result.destination) return;
    const reorderedPhases = [...selectedPhases];
    const [removed] = reorderedPhases.splice(result.source.index, 1);
    reorderedPhases.splice(result.destination.index, 0, removed);
    setSelectedPhases(reorderedPhases);
  };

  const handlePhasePreview = (phaseSignalString: string, phaseName: string) => {
    dispatch(setSignalString(phaseSignalString));
    dispatch(setSignalState());
    dispatch(closePreviewCreatedPatternPhase());
    dispatch(setIsIntersectionConfigurable(false));
    setActiveOrLastAddedPhase(phaseName);
  };

  const handleCreatedPatternPhasePreview = (phase: any) => {
    if (activePreviewPhase === phase.phaseId) {
      dispatch(closePreviewCreatedPatternPhase());
      setActivePreviewPhase(null);
    } else {
      if (activePreviewPhase) {
        dispatch(closePreviewCreatedPatternPhase());
      }
      dispatch(
        previewCreatedPatternPhase({
          duration: phase.duration,
          signalString: phase.signalString,
        })
      );
      setActivePreviewPhase(phase.phaseId);
    }
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

    const foundPhase = phases.find((p) => p.name === phaseName);
    if (foundPhase) {
      setPhaseToConfigure({ ...foundPhase, id: phaseId });
      phaseFormik.resetForm({
        values: {
          duration:
            configuredPhases.find((p) => p.id === foundPhase.id)?.duration ||
            "",
        },
      });
    }
  };

  const handleConfigurePhaseForCreatedPattern = (pattern: any, phase: any) => {
    if (
      alreadyCreatedPatternPhaseToConfigure &&
      alreadyCreatedPatternPhaseToConfigure.phaseId !== phase.phaseId &&
      createdPhaseFormik.dirty
    ) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Do you want to switch to configuring a different phase without saving?"
      );
      if (!confirmSwitch) return;
    }

    const foundPhase = pattern.configuredPhases.find(
      (p: any) => p.phaseId === phase.phaseId
    );
    if (foundPhase) {
      setAlreadyCreatedPatternPhaseToConfigure({ ...foundPhase });
    }
  };

  const phaseFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      duration: phaseToConfigure
        ? configuredPhases.find((p) => p.id === phaseToConfigure._id)
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
          ...phaseToConfigure,
          _id: phaseToConfigure._id,
          name: phaseToConfigure.name,
          signalString: phaseToConfigure.data,
          duration: values.duration,
        };
        dispatch(addOrUpdatePhaseConfig(configToSave));
        setPhaseToConfigure(null);
      }
    },
  });

  const createdPhaseFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      duration: alreadyCreatedPatternPhaseToConfigure?.duration || "",
    },
    validationSchema: Yup.object({
      duration: Yup.number()
        .required("Duration is required")
        .min(1, "Minimum duration is 1"),
    }),
    onSubmit: async (values) => {
      const configuredPhases = updatedPatternPhases.map((phase) => {
        if (phase.phaseId === alreadyCreatedPatternPhaseToConfigure?.phaseId) {
          return { ...phase, duration: values.duration };
        }
        return phase;
      });

      try {
        const { data } = await HttpRequest.put(
          `/patterns/${selectedPattern.name}/${email}/`,
          {
            configuredPhases: configuredPhases,
          }
        );
        dispatch(getUserPattern(email));
        setAlreadyCreatedPatternPhaseToConfigure(null);
        emitToastMessage(data.message, "success");
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
      }
    },
  });

  const allPhasesConfigured =
    selectedPhases.length > 0 &&
    selectedPhases.every((phase) =>
      configuredPhases.some((p) => p.id === phase.id)
    );

  const handleCancel = () => {
    setShowAllAvailablePhases(false);
    setShowOtherPatternConfig(false);
    setSelectedPhases([]);
    dispatch(clearPhaseConfig());
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [activePatternIndex, setActivePatternIndex] = useState<number | null>(
    null
  );
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [activePatternPhases, setActivePatternPhases] = useState<any[]>([]);
  const [intervalId, setIntervalId] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  const startPlayPhases = (
    pattern: Pattern,
    startFromTime: number | null = null
  ) => {
    if (!isPlaying) {
      setIsPlaying(true);

      const startPhaseInterval = (
        index: number,
        initialTimeLeft: number | null = null
      ) => {
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }

        const currentPhase = pattern.configuredPhases[index];
        let timeLeft =
          initialTimeLeft !== null ? initialTimeLeft : currentPhase?.duration;

        const showPhase = (phase: any, time: number) => {
          dispatch(
            previewCreatedPatternPhase({
              duration: time,
              signalString: phase.signalString,
            })
          );
        };

        const calculateTransitionSignalString = (
          currentPhase: any,
          nextPhase: any,
          elapsed: number,
          maxTransitionDuration: number
        ) => {
          // If elapsed time exceeds the maximum transition duration, return next phase's signalString
          if (elapsed >= maxTransitionDuration) {
            return nextPhase.signalString;
          }

          const currentSignals = currentPhase.signalString.slice(1, -1);
          const nextSignals = nextPhase.signalString.slice(1, -1);
          let transitionSignals = "";

          for (let i = 0; i < currentSignals.length; i++) {
            const currentState = currentSignals[i];
            const nextState = nextSignals[i];

            if (currentState === "G" && nextState === "R") {
              // Green to Red transition
              const blinkDelay = currentPhase.enableBlink
                ? currentPhase.greenToRedDelay || 0
                : 0;
              const amberDelay = currentPhase.enableAmber
                ? currentPhase.greenToRedAmberDelay || 0
                : 0;

              if (elapsed < blinkDelay) {
                // Blink phase: alternate G and X every 0.5s
                const blinkCycle = Math.floor(elapsed / 0.5) % 2;
                transitionSignals += blinkCycle === 0 ? "G" : "X";
              } else if (elapsed < blinkDelay + amberDelay) {
                // Amber phase
                let baseSignal = currentPhase.holdGreenSignalOnAmber
                  ? "G"
                  : "X";
                if (currentPhase.enableAmberBlink) {
                  const amberCycle =
                    Math.floor((elapsed - blinkDelay) / 0.5) % 2;
                  transitionSignals += amberCycle === 0 ? "A" : baseSignal;
                } else {
                  transitionSignals += baseSignal === "X" ? "A" : baseSignal;
                }
              } else {
                // Still in transition for other signals, keep current state
                transitionSignals += currentState;
              }
            } else if (currentState === "R" && nextState === "G") {
              // Red to Green transition
              const blinkDelay = currentPhase.enableBlink
                ? currentPhase.redToGreenDelay || 0
                : 0;
              const amberDelay = currentPhase.enableAmber
                ? currentPhase.redToGreenAmberDelay || 0
                : 0;

              if (elapsed < blinkDelay) {
                // Blink phase: alternate R and X every 0.5s
                const blinkCycle = Math.floor(elapsed / 0.5) % 2;
                transitionSignals += blinkCycle === 0 ? "R" : "X";
              } else if (elapsed < blinkDelay + amberDelay) {
                // Amber phase
                let baseSignal = currentPhase.holdRedSignalOnAmber ? "R" : "X";
                if (currentPhase.enableAmberBlink) {
                  const amberCycle =
                    Math.floor((elapsed - blinkDelay) / 0.5) % 2;
                  transitionSignals += amberCycle === 0 ? "A" : baseSignal;
                } else {
                  transitionSignals += baseSignal === "X" ? "A" : baseSignal;
                }
              } else {
                // Still in transition for other signals, keep current state
                transitionSignals += currentState;
              }
            } else {
              // No change
              transitionSignals += currentState;
            }
          }

          return "*" + transitionSignals + "#";
        };

        const handleTransition = async (currentPhase: any, nextPhase: any) => {
          // Check if any signals are transitioning
          const currentSignals = currentPhase.signalString.slice(1, -1);
          const nextSignals = nextPhase.signalString.slice(1, -1);
          let hasRedToGreen = false;
          let hasGreenToRed = false;
          for (let i = 0; i < currentSignals.length; i++) {
            if (currentSignals[i] === "R" && nextSignals[i] === "G") {
              hasRedToGreen = true;
            } else if (currentSignals[i] === "G" && nextSignals[i] === "R") {
              hasGreenToRed = true;
            }
          }

          // Calculate transition duration based on actual transitions
          const greenToRedBlinkDelay =
            currentPhase.enableBlink && hasGreenToRed
              ? currentPhase.greenToRedDelay || 0
              : 0;
          const greenToRedAmberDelay =
            currentPhase.enableAmber && hasGreenToRed
              ? currentPhase.greenToRedAmberDelay || 0
              : 0;
          const redToGreenBlinkDelay =
            currentPhase.enableBlink && hasRedToGreen
              ? currentPhase.redToGreenDelay || 0
              : 0;
          const redToGreenAmberDelay =
            currentPhase.enableAmber && hasRedToGreen
              ? currentPhase.redToGreenAmberDelay || 0
              : 0;

          const transitionDuration = Math.max(
            greenToRedBlinkDelay + greenToRedAmberDelay,
            redToGreenBlinkDelay + redToGreenAmberDelay
          );

          if (transitionDuration > 0) {
            const startTime = Date.now();
            return new Promise<void>((resolve) => {
              const transitionInterval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;

                if (elapsed >= transitionDuration) {
                  clearInterval(transitionInterval);
                  dispatch(
                    previewCreatedPatternPhase({
                      duration: nextPhase.duration,
                      signalString: nextPhase.signalString,
                    })
                  );
                  dispatch(updateCountDownColor("green"));
                  resolve();
                } else {
                  const signalString = calculateTransitionSignalString(
                    currentPhase,
                    nextPhase,
                    elapsed,
                    transitionDuration // Pass maxTransitionDuration
                  );
                  dispatch(
                    previewCreatedPatternPhase({
                      duration: 0.5,
                      signalString,
                    })
                  );
                  // Update countdown color based on dominant transition state
                  if (
                    elapsed <
                    Math.max(greenToRedBlinkDelay, redToGreenBlinkDelay)
                  ) {
                    dispatch(updateCountDownColor("red")); // Blinking
                  } else {
                    dispatch(updateCountDownColor("yellow")); // Amber
                  }
                }
              }, 500); // Update every 0.5s
            });
          } else {
            // No transition needed, immediately show next phase
            dispatch(
              previewCreatedPatternPhase({
                duration: nextPhase.duration,
                signalString: nextPhase.signalString,
              })
            );
            dispatch(updateCountDownColor("green"));
            return Promise.resolve();
          }
        };

        const runPhase = async () => {
          showPhase(currentPhase, timeLeft);
          dispatch(updateCountDownColor("green"));

          const id = setInterval(async () => {
            timeLeft -= 1;
            setRemainingTime(timeLeft);

            if (timeLeft <= 0) {
              clearInterval(id);
              setIntervalId(null);
              setRemainingTime(null);

              const nextIndex =
                index + 1 >= pattern.configuredPhases.length ? 0 : index + 1;
              const nextPhase = pattern.configuredPhases[nextIndex];

              await handleTransition(currentPhase, nextPhase);

              setCurrentPhaseIndex(nextIndex);
              startPhaseInterval(nextIndex);
            } else {
              showPhase(currentPhase, timeLeft);
            }
          }, 1000);
          setIntervalId(id);
        };

        runPhase();
      };

      startPhaseInterval(0, startFromTime);
    }
  };

  const stopPlayPhases = () => {
    if (isPlaying && intervalId) {
      clearInterval(intervalId);
      setIsPlaying(false);
      setIntervalId(null);
    }
  };

  const handlePlayPause = (pattern: Pattern, index: number) => {
    if (!isTabTwo) return;
    if (activePatternIndex !== index) {
      setActivePatternIndex(index);
      setCurrentPhaseIndex(0);
      setActivePatternPhases(pattern.configuredPhases);
      setIsPlaying(true);
      startPlayPhases(pattern);
    } else {
      if (isPlaying) {
        stopPlayPhases();
        setIsPlaying(false);
      } else {
        startPlayPhases(pattern, remainingTime || undefined);
        setIsPlaying(true);
      }
    }
  };

  const goToNextPhase = () => {
    const nextIndex = (currentPhaseIndex + 1) % activePatternPhases.length;
    setCurrentPhaseIndex(nextIndex);
    const nextPhase = activePatternPhases[nextIndex];

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setRemainingTime(nextPhase.duration);
    setIsPlaying(false);

    dispatch(
      previewCreatedPatternPhase({
        duration: nextPhase.duration,
        signalString: nextPhase.signalString,
      })
    );
  };

  const goToPrevPhase = () => {
    const prevIndex =
      (currentPhaseIndex - 1 + activePatternPhases.length) %
      activePatternPhases.length;
    setCurrentPhaseIndex(prevIndex);
    const prevPhase = activePatternPhases[prevIndex];

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setRemainingTime(prevPhase.duration);
    setIsPlaying(false);

    dispatch(
      previewCreatedPatternPhase({
        duration: prevPhase.duration,
        signalString: prevPhase.signalString,
      })
    );
  };

  const isCurrentPatternPlaying = (index: number) =>
    activePatternIndex === index;

  useEffect(() => {
    if (email) {
      dispatch(getUserPattern(email));
    }
    dispatch(setIsIntersectionConfigurable(false));
  }, [dispatch, email]);

  useEffect(() => {
    return () => {
      stopPlayPhases();
    };
  }, []);

  // console.log("Active Pattern Index:", activePatternIndex, isPlaying);

  return (
    <div className="boxTwo">
      <div className="patterns__buttonBox">
        {!showAllAvailablePhases && !showOtherPatternConfig && (
          <button
            style={{ width: "fit-content" }}
            onClick={() => setShowAllAvailablePhases(true)}
          >
            Add a new Pattern
          </button>
        )}

        {(showAllAvailablePhases || showOtherPatternConfig) && (
          <button onClick={handleCancel}>Cancel</button>
        )}
      </div>
      {showAllAvailablePhases && (
        <>
          <h2 className="patterns__availablePhases--header">
            Select phases for the new pattern
          </h2>
          <ul className="patterns__availablePhases">
            {phases?.map((phase: any, index: any) => (
              <li
                className={`patterns__availablePhases--item ${
                  activeOrLastAddedPhase === phase.name && "active"
                }`}
                key={phase._id || index}
              >
                <h3>{phase.name}</h3>
                <div>
                  <button
                    onClick={() => handlePhasePreview(phase.data, phase.name)}
                  >
                    Preview
                  </button>
                  <button onClick={() => handlePhaseSelect(phase)}>Add</button>
                </div>
              </li>
            ))}
          </ul>

          {selectedPhases?.length > 0 && (
            <div className="patterns__selected">
              <p>
                Below are the phases you have selected. You can reorder by drag
                and drop.{" "}
                <span onClick={() => setSelectedPhases([])}>Clear all</span>
              </p>
              <DragDropContext onDragEnd={handleDragEndCreate}>
                <Droppable droppableId="selected-phases">
                  {(provided) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef}>
                      {selectedPhases?.map((phaseInstance, index) => (
                        <Draggable
                          key={phaseInstance.id}
                          draggableId={phaseInstance.id}
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
                                        onBlur={phaseFormik.handleBlur}
                                        autoFocus
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
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPhaseToConfigure(null);
                                          phaseFormik.resetForm();
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {configuredPhases.find(
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
                                      >
                                        {configuredPhases.find(
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
            </div>
          )}
          <div className="patterns__selected--ctn">
            <input
              type="text"
              value={newPatternName}
              onChange={(e) => setNewPatternName(e.target.value)}
              placeholder="Enter new pattern name"
              aria-label="New pattern name"
            />
            <button
              onClick={createPatternHandler}
              disabled={!allPhasesConfigured || !newPatternName.trim()}
              aria-label="Save new pattern"
            >
              Save New Pattern
            </button>
          </div>
        </>
      )}

      {patterns?.length > 0 ? (
        <>
          <div className="patterns__header">
            <h2>Available Pattern(s)</h2>
            <form
              onSubmit={(e: any) => {
                e.preventDefault();
                searchPatternByName(inputtedPatternName);
              }}
            >
              <input
                type="text"
                placeholder="Find a pattern by its name"
                value={inputtedPatternName}
                onChange={(e) => {
                  setInputtedPatternName(e.target.value);
                  searchPatternByName(e.target.value);
                  setShowSearchedResult(true);
                }}
              />
            </form>
          </div>

          <ul className="patterns">
            {patternsToShow?.map((pattern, index) => {
              // console.log("Index", index);

              return (
                <li className="patterns__list" key={index}>
                  <div className="patterns__list--item">
                    <h3>
                      {pattern?.name.length > 17
                        ? `${pattern?.name.slice(0, 17)}...`
                        : pattern?.name}
                    </h3>
                    <div>
                      {showPatternPhases === index ? (
                        <button
                          className={
                            activeAction === "more" ||
                            showPatternPhases === index
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            handleActionClick("more");
                            handleSelectPattern(pattern, index);
                          }}
                        >
                          <MdExpandLess />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleActionClick("more");
                            handleSelectPattern(pattern, index);
                            setUpdatedPatternPhases(pattern.configuredPhases);
                          }}
                        >
                          <MdExpandMore />
                        </button>
                      )}
                      <button
                        disabled={!isCurrentPatternPlaying(index)}
                        className={
                          activeAction === "prev" && showPatternPhases === index
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          handleActionClick("prev");
                          goToPrevPhase();
                        }}
                      >
                        <FaArrowLeft />
                      </button>
                      <button
                        className={
                          activeAction === "play" && showPatternPhases === index
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          handleActionClick("play");
                          handlePlayPause(pattern, index);
                        }}
                      >
                        {isPlaying && activePatternIndex === index ? (
                          <FaPause />
                        ) : (
                          <FaPlay />
                        )}
                      </button>
                      <button
                        disabled={!isCurrentPatternPlaying(index)}
                        className={
                          activeAction === "next" && showPatternPhases === index
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          handleActionClick("next");
                          goToNextPhase();
                        }}
                      >
                        <FaArrowRight />
                      </button>
                      <button
                        className={
                          activeAction === "duplicate" &&
                          showPatternPhases === index
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          handleActionClick("duplicate");
                          duplicatePatternHandler(pattern.name);
                        }}
                      >
                        <IoDuplicate />
                      </button>
                      <button
                        className={
                          activeAction === "delete" &&
                          showPatternPhases === index
                            ? "active"
                            : ""
                        }
                        onClick={() => {
                          handleActionClick("delete");
                          handleDeletePattern(pattern.name);
                          handleActionClick("more");
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>

                  {showPatternPhases === index && (
                    <DragDropContext onDragEnd={handleDragEndEdit}>
                      <Droppable droppableId="pattern-phases">
                        {(provided) => (
                          <ul
                            className="patterns__phases"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {updatedPatternPhases?.map(
                              (phase: any, index: any) => (
                                <Draggable
                                  key={`${phase.phaseId}`}
                                  draggableId={`${phase.phaseId}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <li
                                      className={`patterns__phases--item ${
                                        activePreviewPhase === phase.phaseId
                                          ? "active"
                                          : ""
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <h3>{phase.name}</h3>
                                      <div className="patterns__phases--form">
                                        <form
                                          onSubmit={
                                            createdPhaseFormik.handleSubmit
                                          }
                                        >
                                          {alreadyCreatedPatternPhaseToConfigure &&
                                          alreadyCreatedPatternPhaseToConfigure.phaseId ===
                                            phase.phaseId ? (
                                            <>
                                              <input
                                                id="duration"
                                                name="duration"
                                                type="number"
                                                autoFocus
                                                value={
                                                  createdPhaseFormik.values
                                                    .duration
                                                }
                                                onChange={
                                                  createdPhaseFormik.handleChange
                                                }
                                                onBlur={
                                                  createdPhaseFormik.handleBlur
                                                }
                                              />
                                              <button
                                                type="submit"
                                                disabled={
                                                  !createdPhaseFormik.values
                                                    .duration ||
                                                  !createdPhaseFormik.dirty
                                                }
                                              >
                                                Save
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setAlreadyCreatedPatternPhaseToConfigure(
                                                    null
                                                  );
                                                  createdPhaseFormik.resetForm();
                                                }}
                                              >
                                                Cancel
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleConfigurePhaseForCreatedPattern(
                                                  pattern,
                                                  phase
                                                )
                                              }
                                            >
                                              Edit Duration
                                            </button>
                                          )}
                                        </form>
                                        <button
                                          onClick={() =>
                                            handleCreatedPatternPhasePreview(
                                              phase
                                            )
                                          }
                                        >
                                          {activePreviewPhase === phase.phaseId
                                            ? "Close"
                                            : "Preview"}
                                        </button>
                                      </div>
                                    </li>
                                  )}
                                </Draggable>
                              )
                            )}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="patterns__noPattern">
          You have not created any pattern yet.
        </div>
      )}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          margin: "1rem 0 1rem 0",
        }}
      >
        <button
          className="phases__deleteAll"
          onClick={handleDeleteAllPatterns}
          disabled={!patterns || patterns.length === 0}
        >
          Delete All Patterns
        </button>
      </div>
    </div>
  );
};

export default BoxTwo;
