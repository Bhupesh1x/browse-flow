import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { userId, orgId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!orgId) {
    return NextResponse.json({ error: "No organization selected" }, { status: 403 })
  }

  const body = await request.json()
  const { userIds } = body as { userIds: string[] }

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: "userIds is required" }, { status: 400 })
  }

  const client = await clerkClient()

  // Fetch organization memberships to verify users belong to this org
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: 100,
  })

  const orgUserIds = new Set(memberships.data.map((m) => m.publicUserData?.userId))

  // Resolve user details - returns array in same order as input
  // Returns null for users not in this org
  const users = await Promise.all(
    userIds.map(async (id) => {
      if (!orgUserIds.has(id)) {
        return null
      }
      
      try {
        const user = await client.users.getUser(id)
        return {
          name: user.fullName ?? user.firstName ?? "Anonymous",
          avatar: user.imageUrl,
        }
      } catch {
        return null
      }
    })
  )

  // Return array directly for resolveUsers compatibility
  return NextResponse.json(users)
}
