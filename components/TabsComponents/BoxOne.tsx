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
const BoxOne: React.FC<BoxOneProps> = ({}) => {
  const email = GetItemFromLocalStorage("user")?.email;
  const [checked, setChecked] = useState<number>(1);
  const { phases } = useAppSelector((state) => state.userDevice);
  const dispatch = useAppDispatch();
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

  // Function to handle selecting a phase to update Intersection UI
  const handlePhasePreview = (phaseName: string, signalString: string) => {
    setActiveOrLastAddedPhase(phaseName);
    dispatch(setSignalString(signalString));
    dispatch(setSignalState());
  };

  // Function to delete a phase
  const handleDeletePhase = async (phaseName: string) => {
    const confirmResult = confirm(
      `Are you sure you want to delete "${phaseName}" phase?`
    );

    if (!confirmResult) return;
    const phase = phases?.find((p) => p.name === phaseName);
    const phaseId = phase?._id;

    try {
      const { data } = await HttpRequest.delete(`/phases/${phaseId}/${email}`);
      emitToastMessage(data.message, "success");
      dispatch(getUserPhase(email));
      setActiveOrLastAddedPhase(phaseName);
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  };

  useEffect(() => {
    dispatch(getUserPhase(email));
    dispatch(closePreviewCreatedPatternPhase());
    dispatch(setIsIntersectionConfigurable(true));
  }, [dispatch]);

  return (
    <div className="boxOne">
      {phases && phases?.length > 0 ? (
        <>
          <div className="phases__header">
            <h2>Available Phase(s)</h2>
            <form
              action=""
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

          <ul className="phases">
            {phasesToShow?.map((phase, index) => (
              <li
                className={`phases__item ${
                  activeOrLastAddedPhase === phase.name && "active"
                }`}
                key={index}
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

            if (!password) return;

            try {
              await HttpRequest.post("/confirm-password", {
                email: GetItemFromLocalStorage("user").email,
                password,
              });
              dispatch(allowConflictConfig(true));
              emitToastMessage("Conflict check is disabled", "success");
              return setChecked(0);
            } catch (error: any) {
              emitToastMessage(error?.response.data.message, "error");
              return;
            }
          }

          // If checkbox is checked, clear signal and reset state
          setChecked(1);
          dispatch(setSignalStringToAllRed());
          dispatch(setSignalState());
          dispatch(allowConflictConfig(false));
          emitToastMessage("Signal configuration cleared", "success");
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
      )}
      {!phases || phases?.length === 0 ? (
        <p>
          Once you have completed the signal configuration, click on the add
          icon at the center of the intersection. You will be prompted to enter
          a name for the phase before submitting.
        </p>
      ) : null}
    </div>
  );
};
export default BoxOne;
