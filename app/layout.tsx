import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/stylesheets/main.scss";
import ReduxProvider from "./ReduxProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Traffic Monitoring System",
  description:
    "This is a web appication for remote configuration and monitoring of traffic system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="./images/logo.png" sizes="any" />
      <ToastContainer />
      <ReduxProvider>
        <body className={inter.className}>{children}</body>
      </ReduxProvider>
    </html>
  );
}
