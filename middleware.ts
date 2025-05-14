import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("access-token")?.value;
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register";

  // Si no hay token y no es una página de autenticación, redirige al login
  if (!authToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si hay token y es una página de autenticación, redirige al dashboard
  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Verifica si el token es inválido o ha expirado
  if (authToken) {
    try {
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error("Error al verificar el token en middleware:", errorData);

        // Si el token es inválido o ha expirado, elimínalo y redirige al login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("access-token"); // Elimina el token inválido
        return response;
      }
    } catch (error) {
      console.error("Error al verificar el token en middleware:", error);

      // Si ocurre un error al verificar el token, redirige al login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access-token"); // Elimina el token inválido
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
};