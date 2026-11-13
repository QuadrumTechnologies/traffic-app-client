import AdminDeviceStatusLayout from "@/components/Device/AdminDeviceStatusLayout";

// Built once with "_" for the device id; see hooks/useRealParams.ts.
export function generateStaticParams() {
  return [{ deviceId: "_" }];
}

export default function AdminDeviceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminDeviceStatusLayout>{children}</AdminDeviceStatusLayout>;
}
