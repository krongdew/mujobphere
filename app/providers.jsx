// ตัวอย่างการแก้ไข Provider
"use client";

import { SessionProvider } from "next-auth/react"

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}