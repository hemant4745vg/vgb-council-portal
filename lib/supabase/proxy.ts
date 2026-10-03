import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function updateSession(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /*
   * If the public Supabase configuration is missing,
   * do not break the entire site at middleware level.
   */
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * getClaims() verifies the access token and is the
   * appropriate server-side check for the SSR session.
   */
  const { data } =
    await supabase.auth.getClaims();

  const user = data?.claims;

  const pathname =
    request.nextUrl.pathname;

  const isProtectedRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  /*
   * Protect dashboard routes.
   *
   * Public portal pages remain publicly accessible.
   */
  if (isProtectedRoute && !user) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set(
      "auth",
      "required"
    );

    return NextResponse.redirect(
      redirectUrl
    );
  }

  return response;
}
