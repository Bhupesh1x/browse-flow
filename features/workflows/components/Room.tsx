"use client"

import {
  RoomProvider,
  LiveblocksProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import { ReactNode } from "react"

import { Spinner } from "@/components/ui/spinner"

export function Room({
  roomId,
  children,
}: {
  roomId: string
  children: ReactNode
}) {
  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}
      throttle={16}
    >
      <RoomProvider id={roomId}>
        <ClientSideSuspense
          fallback={
            <div className="flex h-svh w-svw items-center justify-center">
              <Spinner className="size-8" />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
