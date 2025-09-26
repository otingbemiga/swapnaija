import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.user_metadata?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/user/userdashboard", request.url))
    }
  }

  return NextResponse.redirect(new URL("/", request.url))
}
