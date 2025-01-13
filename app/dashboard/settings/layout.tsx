"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleBackRouting = () => {
    router.back();
  };
  return (
    <div>
      <button
        className="dashboard-back__button"
        type="button"
        onClick={handleBackRouting}
      >
        <IoArrowBack />
        <span>Back</span>
      </button>
      {children}
    </div>
  );
}
