"use client";

import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import CheckBox from "../UI/CheckBox/CheckBox";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHook";
import {
  allowConflictConfig,
  closePreviewCreatedPatternPhase,
  setInputModal,
  setIsIntersectionConfigurable,
  setSignalState,
  setSignalString,
  setSignalStringToAllAmber,
  setSignalStringToAllBlank,
  setSignalStringToAllRed,
} from "@/store/signals/SignalConfigSlice";
import { emitToastMessage } from "@/utils/toastFunc";
import {
  GetItemFromLocalStorage,
  SetItemToLocalStorage,
} from "@/utils/localStorageFunc";
import HttpRequest from "@/store/services/HttpRequest";
import { getUserPhase } from "@/store/devices/UserDeviceSlice";
import { useParams } from "next/navigation";
import { AiOutlineClose } from "react-icons/ai";

// Styled components for phase creation and edit modal
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1px);
  z-index: 1000;
  pointer-events: auto;
`;

const PhaseContainer = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 500px;
  max-height: 80vh;
  border: 0.1rem solid #ccc;
  overflow-y: auto;
  background-color: #ffffff;
  padding: 3rem;
  border-radius: 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  z-index: 1001;
  pointer-events: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PhaseNameInput = styled.input`
  padding: 0.5rem;
  border: 0.1rem solid #ccc;
  border-radius: 0.4rem;
  font-size: 1.4rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #514604;
  }

  &:hover {
    border-color: #2a2a29;
  }
`;

const PhaseNameDisplay = styled.div`
  padding: 0.5rem;
  font-size: 1.4rem;
  font-weight: bold;
  width: 100%;
`;

const AddPhaseButton = styled.button<{ disabled: boolean }>`
  padding: 0.8rem 1rem;
  background-color: ${({ disabled }) => (disabled ? "#cccccc" : "#514604")};
  color: white;
  border: none;
  border-radius: 0.4rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: 1.4rem;
  width: 100%;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background-color: #2a2a29;
  }
`;

const SettingsSection = styled.div`
  width: 100%;
  margin-top: 1rem;
`;

const CloseIcon = styled(AiOutlineClose)`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  color: #555;
  &:hover {
    color: #f00;
  }
`;

const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const SettingInput = styled.input`
  padding: 0.5rem;
  border: 0.1rem solid #ccc;
  border-radius: 0.4rem;
  width: 60px;

  &:disabled {
    background-color: #f0f0f0;
  }
`;

interface BoxOneProps {}

const BoxOne: React.FC<BoxOneProps> = () => {
  const { openInputModal } = useAppSelector((state) => state.signalConfig);
  const email = GetItemFromLocalStorage("user")?.email;
  const params = useParams<{ deviceId: string }>();
  const dispatch = useAppDispatch();
  const [checked, setChecked] = useState<number>(1);
  const { phases } = useAppSelector((state) => state.userDevice);
  const { landingPageSignals } = useAppSelector((state) => state.signalConfig);
  const [activeOrLastAddedPhase, setActiveOrLastAddedPhase] =
    useState<string>("");
  const [searchedResult, setSearchedResult] = useState<any[]>([]);
  const [showSearchedResult, setShowSearchedResult] = useState<boolean>(false);
  const [inputtedPhaseName, setInputtedPhaseName] = useState<string>("");
  const [isCreatingPhase, setIsCreatingPhase] = useState<boolean>(false);
  const [isEditingPhase, setIsEditingPhase] = useState<boolean>(false);
  const [phaseName, setPhaseName] = useState<string>("");
  const [editPhaseId, setEditPhaseId] = useState<string | null>(null);
  const [phaseSettings, setPhaseSettings] = useState({
    enableBlink: false,
    redToGreenDelay: 0,
    greenToRedDelay: 2,
    enableAmber: true,
    enableAmberBlink: false,
    redToGreenAmberDelay: 0,
    greenToRedAmberDelay: 3,
    holdRedSignalOnAmber: false,
    holdGreenSignalOnAmber: false,
  });

  const searchPhaseByName = (phaseName: string) => {
    const matchedPhases = phases.filter((phase) =>
      phase.name.toLowerCase().includes(phaseName.toLowerCase())
    );
    setSearchedResult(matchedPhases);
  };
  const phasesToShow = showSearchedResult ? searchedResult : phases;

  const encodeSignals = (signals: typeof landingPageSignals) => {
    const getAdjacentPedestrianSignal = (
      signals: typeof landingPageSignals,
      direction: "N" | "E" | "S" | "W"
    ): "R" | "G" | "X" => {
      let adjacentDirection: "N" | "E" | "S" | "W";
      switch (direction) {
        case "S":
          adjacentDirection = "E";
          break;
        case "E":
          adjacentDirection = "N";
          break;
        case "N":
          adjacentDirection = "W";
          break;
        case "W":
          adjacentDirection = "S";
          break;
        default:
          adjacentDirection = "N";
      }
      const adjacentSignal = signals.find(
        (signal) => signal.direction === adjacentDirection
      );
      return adjacentSignal ? adjacentSignal.pedestrian : "X";
    };

    return (
      "*" +
      signals
        .map((signal) => {
          const adjacentPedestrian = getAdjacentPedestrianSignal(
            signals,
            signal.direction
          );
          return `${signal.direction}${signal.left}${signal.straight}${signal.right}${signal.bike}${signal.pedestrian}${adjacentPedestrian}`;
        })
        .join("") +
      "#"
    );
  };

  const handlePhasePreview = (phaseName: string, signalString: string) => {
    setActiveOrLastAddedPhase(phaseName);
    dispatch(setSignalString(signalString));
    dispatch(setSignalState());
  };

  const handleEditPhase = (phase: any) => {
    const currentEncodedSignals = encodeSignals(landingPageSignals);
    SetItemToLocalStorage("newtempSignals", currentEncodedSignals);

    // Check if the current signals differ from the phase's original signals
    if (currentEncodedSignals !== phase.data) {
      const confirmEdit = window.confirm(
        "You have modified the signal configuration. Do you want to use the updated configuration for editing this phase?"
      );
      if (!confirmEdit) {
        emitToastMessage(
          "Edit cancelled. Signal configuration unchanged.",
          "info"
        );
        return;
      }
    }

    // Store current signals to ensure they persist
    setEditPhaseId(phase._id);
    setPhaseName(phase.name);
    setPhaseSettings({
      enableBlink: phase.enableBlink,
      redToGreenDelay: phase.redToGreenDelay,
      greenToRedDelay: phase.greenToRedDelay,
      enableAmber: phase.enableAmber,
      enableAmberBlink: phase.enableAmberBlink,
      redToGreenAmberDelay: phase.redToGreenAmberDelay,
      greenToRedAmberDelay: phase.greenToRedAmberDelay,
      holdRedSignalOnAmber: phase.holdRedSignalOnAmber,
      holdGreenSignalOnAmber: phase.holdGreenSignalOnAmber,
    });
    dispatch(setSignalString(phase.data));
    dispatch(setSignalState());
    setIsEditingPhase(true);
    dispatch(setInputModal(true));
  };

  const handleUpdatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPhaseId) {
      emitToastMessage("No phase selected for editing", "error");
      return;
    }
    setIsCreatingPhase(true);
    const user = GetItemFromLocalStorage("user");

    try {
      const signalsFromLocalStorage = GetItemFromLocalStorage("newtempSignals");

      const phase = {
        name: phaseName.toUpperCase(),
        data: signalsFromLocalStorage,
        deviceId: params.deviceId,
        enableBlink: phaseSettings.enableBlink,
        redToGreenDelay: phaseSettings.redToGreenDelay,
        greenToRedDelay: phaseSettings.greenToRedDelay,
        enableAmber: phaseSettings.enableAmber,
        enableAmberBlink: phaseSettings.enableAmberBlink,
        redToGreenAmberDelay: phaseSettings.redToGreenAmberDelay,
        greenToRedAmberDelay: phaseSettings.greenToRedAmberDelay,
        holdRedSignalOnAmber: phaseSettings.holdRedSignalOnAmber,
        holdGreenSignalOnAmber: phaseSettings.holdGreenSignalOnAmber,
      };
      const { data } = await HttpRequest.patch(
        `/phases/${editPhaseId}/${user.email}`,
        {
          phase,
        }
      );
      dispatch(getUserPhase(user.email));
      emitToastMessage(data.message, "success");
      setIsCreatingPhase(false);
      setPhaseName("");
      setEditPhaseId(null);
      setPhaseSettings({
        enableBlink: false,
        redToGreenDelay: 0,
        greenToRedDelay: 2,
        enableAmber: true,
        enableAmberBlink: false,
        redToGreenAmberDelay: 0,
        greenToRedAmberDelay: 3,
        holdRedSignalOnAmber: false,
        holdGreenSignalOnAmber: false,
      });
      dispatch(setInputModal(false));
      setIsEditingPhase(false);
      setActiveOrLastAddedPhase(phaseName);
      SetItemToLocalStorage("tempSignals", []); // Clear local storage after update
    } catch (error: any) {
      console.error("Error updating phase:", error);
      emitToastMessage(
        error?.response.data.message || "Failed to update phase",
        "error"
      );
      setIsCreatingPhase(false);
    }
  };

  const handleDeletePhase = async (phaseName: string) => {
    const confirmResult = confirm(
      `Are you sure you want to delete "${phaseName}" phase?`
    );
    if (!confirmResult) {
      emitToastMessage("Phase deletion cancelled", "info");
      return;
    }
    const phase = phases?.find((p) => p.name === phaseName);
    const phaseId = phase?._id;

    try {
      const { data } = await HttpRequest.delete(`/phases/${phaseId}/${email}`);
      dispatch(getUserPhase(email));
      setActiveOrLastAddedPhase(phaseName);
      emitToastMessage(data.message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  const handleDeleteAllPhases = async () => {
    const confirmResult = confirm(
      "Are you sure you want to delete ALL phases? This action cannot be undone."
    );
    if (!confirmResult) {
      emitToastMessage("All phases deletion cancelled", "info");
      return;
    }

    try {
      const { data } = await HttpRequest.delete(`/phases/all/${email}`);
      dispatch(getUserPhase(email));
      setActiveOrLastAddedPhase("");
      setSearchedResult([]);
      setShowSearchedResult(false);
      setInputtedPhaseName("");
      emitToastMessage(data.message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseName) {
      alert("Please enter a name for the phase.");
      return;
    }
    setIsCreatingPhase(true);
    const user = GetItemFromLocalStorage("user");

    try {
      const encodedSignals = encodeSignals(landingPageSignals);
      const phase = {
        name: phaseName.toUpperCase(),
        data: encodedSignals,
        deviceId: params.deviceId,
        enableBlink: phaseSettings.enableBlink,
        redToGreenDelay: phaseSettings.redToGreenDelay,
        greenToRedDelay: phaseSettings.greenToRedDelay,
        enableAmber: phaseSettings.enableAmber,
        enableAmberBlink: phaseSettings.enableAmberBlink,
        redToGreenAmberDelay: phaseSettings.redToGreenAmberDelay,
        greenToRedAmberDelay: phaseSettings.greenToRedAmberDelay,
        holdRedSignalOnAmber: phaseSettings.holdRedSignalOnAmber,
        holdGreenSignalOnAmber: phaseSettings.holdGreenSignalOnAmber,
      };
      const { data } = await HttpRequest.post("/phases", {
        email: user.email,
        phase,
      });
      dispatch(getUserPhase(user.email));
      emitToastMessage(data.message, "success");
      setIsCreatingPhase(false);
      setPhaseName("");
      setPhaseSettings({
        enableBlink: false,
        redToGreenDelay: 0,
        greenToRedDelay: 2,
        enableAmber: true,
        enableAmberBlink: false,
        redToGreenAmberDelay: 0,
        greenToRedAmberDelay: 3,
        holdRedSignalOnAmber: false,
        holdGreenSignalOnAmber: false,
      });
      dispatch(setInputModal(false));
      setActiveOrLastAddedPhase(phaseName);
    } catch (error: any) {
      console.error("Error adding phase:", error);
      emitToastMessage(
        error?.response.data.message || "Failed to create phase",
        "error"
      );
      setIsCreatingPhase(false);
    }
  };

  useEffect(() => {
    if (email) {
      dispatch(getUserPhase(email));
    }
    dispatch(closePreviewCreatedPatternPhase());
    dispatch(setIsIntersectionConfigurable(true));

    return () => {
      dispatch(closePreviewCreatedPatternPhase());
    };
  }, [dispatch, email]);

  return (
    <div className="boxOne">
      {phases && phases?.length > 0 ? (
        <>
          <div className="phases__header">
            <h2>Available Phase(s)</h2>
            <form
              onSubmit={(e: any) => {
                e.preventDefault();
                searchPhaseByName(inputtedPhaseName);
              }}
            >
              <input
                type="text"
                placeholder="Find a phase by its name"
                value={inputtedPhaseName}
                onChange={(e) => {
                  setInputtedPhaseName(e.target.value);
                  searchPhaseByName(e.target.value);
                  setShowSearchedResult(true);
                }}
              />
            </form>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              margin: "-.5rem 0 1rem 0",
            }}
          >
            <button
              className="phases__deleteAll"
              onClick={handleDeleteAllPhases}
              disabled={!phases || phases.length === 0}
            >
              Delete All Phases
            </button>
          </div>

          <ul className="phases">
            {phasesToShow?.map((phase, index) => (
              <li
                className={`phases__item ${
                  activeOrLastAddedPhase === phase.name && "active"
                }`}
                key={phase._id || index}
              >
                <h3>{phase.name}</h3>
                <div>
                  <button
                    onClick={() => handlePhasePreview(phase.name, phase.data)}
                  >
                    Preview
                  </button>
                  <button onClick={() => handleEditPhase(phase)}>Edit</button>
                  <button onClick={() => handleDeletePhase(phase.name)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="phases__noPhase">
          You have not created any phase yet.
        </div>
      )}

      {openInputModal && (
        <ModalBackdrop onClick={() => dispatch(setInputModal(false))}>
          <PhaseContainer
            onSubmit={isEditingPhase ? handleUpdatePhase : handleAddPhase}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseIcon
              size={20}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                cursor: "pointer",
                color: "#555",
              }}
              onClick={() => {
                dispatch(setInputModal(false));
                setIsEditingPhase(false);
                setEditPhaseId(null);
                setPhaseName("");
                setPhaseSettings({
                  enableBlink: false,
                  redToGreenDelay: 0,
                  greenToRedDelay: 2,
                  enableAmber: true,
                  enableAmberBlink: false,
                  redToGreenAmberDelay: 0,
                  greenToRedAmberDelay: 3,
                  holdRedSignalOnAmber: false,
                  holdGreenSignalOnAmber: false,
                });

                SetItemToLocalStorage("newtempSignals", []);
              }}
            />
            {isEditingPhase ? (
              <PhaseNameDisplay>{phaseName}</PhaseNameDisplay>
            ) : (
              <PhaseNameInput
                type="text"
                placeholder="Enter phase name"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                autoFocus={true}
              />
            )}
            <SettingsSection>
              <h3>Blink Settings</h3>
              <SettingLabel>
                <input
                  type="checkbox"
                  checked={phaseSettings.enableBlink}
                  onChange={(e) =>
                    setPhaseSettings({
                      ...phaseSettings,
                      enableBlink: e.target.checked,
                    })
                  }
                />
                Enable Blink
              </SettingLabel>
              <SettingLabel>
                Red to Green Delay (s):
                <SettingInput
                  type="number"
                  min="0"
                  max="5"
                  value={phaseSettings.redToGreenDelay}
                  onChange={(e) =>
                    setPhaseSettings({
                      ...phaseSettings,
                      redToGreenDelay: Number(e.target.value),
                    })
                  }
                  disabled={!phaseSettings.enableBlink}
                />
              </SettingLabel>
              <SettingLabel>
                Green to Red Delay (s):
                <SettingInput
                  type="number"
                  min="0"
                  max="5"
                  value={phaseSettings.greenToRedDelay}
                  onChange={(e) =>
                    setPhaseSettings({
                      ...phaseSettings,
                      greenToRedDelay: Number(e.target.value),
                    })
                  }
                  disabled={!phaseSettings.enableBlink}
                />
              </SettingLabel>
            </SettingsSection>
            <SettingsSection>
              <h3>Amber Settings</h3>
              <SettingLabel>
                <input
                  type="checkbox"
                  checked={phaseSettings.enableAmber}
                  onChange={(e) =>
                    setPhaseSettings({
                      ...phaseSettings,
                      enableAmber: e.target.checked,
                    })
                  }
                />
                Enable Amber
              </SettingLabel>
              {phaseSettings.enableAmber && (
                <>
                  <SettingLabel>
                    <input
                      type="checkbox"
                      checked={phaseSettings.enableAmberBlink}
                      onChange={(e) =>
                        setPhaseSettings({
                          ...phaseSettings,
                          enableAmberBlink: e.target.checked,
                        })
                      }
                    />
                    Enable Amber Blink
                  </SettingLabel>
                  <SettingLabel>
                    Red to Green Amber Delay (s):
                    <SettingInput
                      type="number"
                      min="0"
                      max="5"
                      value={phaseSettings.redToGreenAmberDelay}
                      onChange={(e) =>
                        setPhaseSettings({
                          ...phaseSettings,
                          redToGreenAmberDelay: Number(e.target.value),
                        })
                      }
                    />
                  </SettingLabel>
                  <SettingLabel>
                    Green to Red Amber Delay (s):
                    <SettingInput
                      type="number"
                      min="0"
                      max="5"
                      value={phaseSettings.greenToRedAmberDelay}
                      onChange={(e) =>
                        setPhaseSettings({
                          ...phaseSettings,
                          greenToRedAmberDelay: Number(e.target.value),
                        })
                      }
                    />
                  </SettingLabel>
                </>
              )}
            </SettingsSection>
            <AddPhaseButton type="submit" disabled={isCreatingPhase}>
              {isCreatingPhase
                ? "Processing..."
                : isEditingPhase
                ? "Update"
                : "Create"}
            </AddPhaseButton>
          </PhaseContainer>
        </ModalBackdrop>
      )}
      <CheckBox
        name="liability"
        checked={checked}
        description={`${
          !checked
            ? "Conflicts Check is Disabled"
            : "Conflicts Check is Enabled"
        } `}
        onChecked={async (e: ChangeEvent<HTMLInputElement>) => {
          if (!e.target.checked) {
            const password = prompt("Please enter your password to proceed");
            if (!password) {
              emitToastMessage("Password verification cancelled", "info");
              return;
            }

            const reason = `Device ${
              !checked ? "Enable Conflicts Check" : "Disable Conflicts Check"
            } action requested by user`;

            try {
              await HttpRequest.post("/confirm-password", {
                email: GetItemFromLocalStorage("user").email,
                reason,
                password,
              });
              dispatch(allowConflictConfig(true));
              setChecked(0);
            } catch (error: any) {
              const message =
                error?.response?.data?.message || `Request failed`;
              emitToastMessage(message, "error");
            }
          } else {
            setChecked(1);
            dispatch(setSignalStringToAllRed());
            dispatch(setSignalState());
            dispatch(allowConflictConfig(false));
          }
        }}
      />
      {!phases || phases?.length === 0 ? (
        <p>
          To create a phase, configure each signal by toggling the corresponding
          lights. If a potential conflict arises, you will receive a
          notification. If you choose to proceed despite the conflict, you can
          confirm by selecting the checkbox above. <strong>Note:</strong> You
          are responsible for any accidents resulting from the conflict. If the
          checkbox is unchecked at any point, your current configuration will be
          discarded.
        </p>
      ) : (
        <div>
          <p>
            Add a new phase by configuring each signal, then click the add icon
            to enter the phase name and settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default BoxOne;
