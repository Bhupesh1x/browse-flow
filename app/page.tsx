import { SignInButton, SignUpButton } from "@clerk/nextjs"

function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Browse Flow</h1>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Welcome to Browse Flow</h2>
          <p className="mt-4 text-gray-600">
            Sign in or create an account to get started.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Page
