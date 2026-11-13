import DeviceStatusLayout from "@/components/Device/DeviceStatusLayout";

// Built once with "_" for the device id; see hooks/useRealParams.ts.
export function generateStaticParams() {
  return [{ deviceId: "_" }];
}

export default function DeviceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DeviceStatusLayout>{children}</DeviceStatusLayout>;
}
