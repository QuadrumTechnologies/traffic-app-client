"use client";

import { ChangeEvent, useEffect, useState } from "react";
import CheckBox from "../UI/CheckBox/CheckBox";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHook";
import {
  allowConflictConfig,
  closePreviewCreatedPatternPhase,
  setIsIntersectionConfigurable,
  setSignalState,
  setSignalString,
  setSignalStringToAllAmber,
  setSignalStringToAllBlank,
  setSignalStringToAllRed,
} from "@/store/signals/SignalConfigSlice";
import { emitToastMessage } from "@/utils/toastFunc";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import HttpRequest from "@/store/services/HttpRequest";
import { getUserPhase } from "@/store/devices/UserDeviceSlice";

interface BoxOneProps {}

const BoxOne: React.FC<BoxOneProps> = () => {
  const email = GetItemFromLocalStorage("user")?.email;
  const dispatch = useAppDispatch();
  const [checked, setChecked] = useState<number>(1);
  const { phases } = useAppSelector((state) => state.userDevice);

  const [activeOrLastAddedPhase, setActiveOrLastAddedPhase] =
    useState<string>("");
  const [searchedResult, setSearchedResult] = useState<any[]>([]);
  const [showSearchedResult, setShowSearchedResult] = useState<boolean>(false);
  const [inputtedPhaseName, setInputtedPhaseName] = useState<string>("");

  const searchPhaseByName = (phaseName: string) => {
    const matchedPhases = phases.filter((phase) =>
      phase.name.toLowerCase().includes(phaseName.toLowerCase())
    );
    setSearchedResult(matchedPhases);
  };
  const phasesToShow = showSearchedResult ? searchedResult : phases;

  const handlePhasePreview = (phaseName: string, signalString: string) => {
    setActiveOrLastAddedPhase(phaseName);
    dispatch(setSignalString(signalString));
    dispatch(setSignalState());
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
            at the center of the intersection to enter the phase name.
          </p>
        </div>
      )}
      {!phases || phases?.length === 0 ? (
        <p>
          Once you have completed the signal configuration, click on the add
          icon at the center of the intersection. You will be prompted to enter
          a name for the phase before submitting.
        </p>
      ) : null}
      <div className="phases__buttonBox">
        <button
          className="phases__clear"
          onClick={() => {
            dispatch(setSignalStringToAllRed());
            dispatch(setSignalState());
          }}
        >
          All Red
        </button>
        <button
          className="phases__clear"
          onClick={() => {
            dispatch(setSignalStringToAllAmber());
            dispatch(setSignalState());
          }}
        >
          All Yellow
        </button>
        <button
          className="phases__clear"
          onClick={() => {
            dispatch(setSignalStringToAllBlank());
            dispatch(setSignalState());
          }}
        >
          All Blank
        </button>
      </div>
    </div>
  );
};

export default BoxOne;
