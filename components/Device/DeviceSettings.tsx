"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HttpRequest from "@/store/services/HttpRequest";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import { getUserDeviceInfoData } from "@/store/devices/UserDeviceSlice";
import { formatRtcDate, formatRtcTime, formatUnixTimestamp } from "@/utils/misc";
import { emitToastMessage } from "@/utils/toastFunc";

// Device settings: only what the 2024 firmware actually applies, and who may
// help. Restart, lamps and settings reset live under Maintenance on the
// junction page; brightness, error flash and signal type are hidden until the
// firmware uses them.

export default function DeviceSettings({
  deviceId,
  userType,
  canChangeSupport,
}: {
  deviceId: string;
  userType: "user" | "admin";
  canChangeSupport: boolean;
}) {
  const dispatch = useAppDispatch();
  const { currentDeviceInfoData } = useAppSelector((state) => state.userDevice);
  const info: any = currentDeviceInfoData?.DeviceID === deviceId ? currentDeviceInfoData : null;
  const [link, setLink] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (!deviceId) return;
    dispatch(getUserDeviceInfoData(deviceId));
    HttpRequest.get(`/user-devices/${deviceId}`)
      .then(({ data }) => setLink(data?.data || null))
      .catch((error) => setLoadError(error?.response?.data?.message || "The junction's settings couldn't be loaded."));
  }, [deviceId, dispatch]);

  const toggleSupport = async () => {
    if (!link) return;
    setSaving(true);
    try {
      const { data } = await HttpRequest.patch(`/user-devices/${deviceId}`, { allowAdminSupport: !link.allowAdminSupport });
      setLink((l: any) => ({ ...l, allowAdminSupport: data?.data?.allowAdminSupport ?? !l.allowAdminSupport }));
      emitToastMessage(!link.allowAdminSupport ? "Quadrum support can now help on this junction." : "Quadrum support access is off.", "success");
    } catch (error: any) {
      emitToastMessage(error?.response?.data?.message || "That change couldn't be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  const back = userType === "admin" ? `/admin/dashboard/devices/${deviceId}` : `/dashboard/devices/${deviceId}`;
  const rtc = info?.Rtc ? formatUnixTimestamp(+info.Rtc) : null;

  return (
    <section className="qtSettings">
      <p>
        <Link href={back}>&larr; Back to the junction</Link>
      </p>
      <h1>Device settings</h1>

      <div className="qtSettings__card">
        <h2>Controller</h2>
        <dl className="qtSettings__facts">
          <div><dt>Device ID</dt><dd>{deviceId}</dd></div>
          <div><dt>Type</dt><dd>QT-TSLC (TSLC 2.0)</dd></div>
          <div><dt>Junction name</dt><dd>{info?.JunctionId || "Not reported yet"}</dd></div>
          <div><dt>Active plan and period</dt><dd>{info ? `${info.Plan || "–"} · ${info.Period || "–"}` : "Not reported yet"}</dd></div>
          <div><dt>Controller clock</dt><dd>{rtc ? `${formatRtcDate(rtc)}, ${formatRtcTime(rtc)}` : "No reading yet"}</dd></div>
          <div><dt>Radio</dt><dd>{info?.CommunicationFrequency ? `${info.CommunicationFrequency} · channel ${info.CommunicationChannel || "–"}` : "Not reported yet"}</dd></div>
        </dl>
        <p className="qtMuted">These are what the controller last reported. The clock is set from the platform when it connects.</p>
      </div>

      <div className="qtSettings__card">
        <h2>Quadrum support access</h2>
        {loadError ? (
          <p className="qtMuted">{loadError}</p>
        ) : !link ? (
          <p className="qtMuted">Loading…</p>
        ) : (
          <>
            <p>
              {link.allowAdminSupport ? <b>On.</b> : <b>Off.</b>} When it&rsquo;s on, Quadrum support can operate this
              junction (manual control, restart) to help you, and everything they do appears in its activity.
            </p>
            {canChangeSupport ? (
              <button type="button" className="qtButton" disabled={saving} onClick={toggleSupport}>
                {link.allowAdminSupport ? "Turn support access off" : "Turn support access on"}
              </button>
            ) : (
              <p className="qtMuted">{userType === "admin" ? "The client decides this on their side." : "Only a client admin can change this."}</p>
            )}
          </>
        )}
      </div>

      {userType === "user" && link?.secretKey ? (
        <div className="qtSettings__card">
          <h2>Device key</h2>
          <p>The controller signs in to the platform with this key. Quadrum sets it when the controller is commissioned; you don&rsquo;t need it day to day.</p>
          <p className="qtSettings__key">
            <code>{showKey ? link.secretKey : "•".repeat(Math.min(24, String(link.secretKey).length))}</code>
            <button type="button" className="qtButton qtButton--quiet" onClick={() => setShowKey((v) => !v)}>
              {showKey ? "Hide" : "Show"}
            </button>
          </p>
        </div>
      ) : null}

      <p className="qtNotice qtNotice--info">
        Brightness, error flash and signal type aren&rsquo;t applied by this controller&rsquo;s firmware yet, so they&rsquo;re
        hidden. Restart, lamps and settings reset are under <b>Maintenance</b> on the junction page.
      </p>
    </section>
  );
}
