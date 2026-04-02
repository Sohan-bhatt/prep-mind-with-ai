"use client";

import SettingsPanel from "./SettingsPanel";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsPanel />
      {children}
    </>
  );
}
