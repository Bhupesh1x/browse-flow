import { auth, currentUser } from "@clerk/nextjs/server"

import { liveblocks } from "@/lib/liveblocks"

export async function POST() {
  const { userId, orgId } = await auth()

  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (!orgId) {
    return new Response("No organization selected", { status: 403 })
  }

  const user = await currentUser()

  const { status, body } = await liveblocks.identifyUser(
    {
      userId,
      groupIds: [orgId],
      organizationId: orgId
    },
    {
      userInfo: {
        name: user?.fullName ?? user?.firstName ?? "Anonymous",
        avatar: user?.imageUrl,
      },
    }
  )

  return new Response(body, { status })
}
