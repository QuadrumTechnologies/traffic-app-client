import type { Metadata } from "next";
import "@fontsource/overpass/400.css";
import "@fontsource/overpass/600.css";
import "@fontsource/overpass/800.css";
import "@fontsource/overpass-mono/400.css";
import "@fontsource/overpass-mono/600.css";
import "./globals.css";
import "@/stylesheets/main.scss";
import ReduxProvider from "./ReduxProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddressBarFix from "@/components/Guards/AddressBarFix";

export const metadata: Metadata = {
  title: "Traffic Control and Monitoring System · Quadrum Technologies",
  description:
    "Remote configuration and monitoring of Quadrum traffic signal controllers.",
};

// Saved before Next.js starts, so pages built with "_" for an id can still
// read the real address (see hooks/useRealParams.ts).
const saveEntryPath = "window.__QT_ENTRY_PATH__=window.location.pathname;";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: saveEntryPath }} />
        <link rel="icon" href="/images/logo.png" sizes="any" />
        <meta name="theme-color" content="#08707d" />
      </head>
      <ReduxProvider>
        <body>
          <ToastContainer />
          <AddressBarFix />
          {children}
        </body>
      </ReduxProvider>
    </html>
  );
}
