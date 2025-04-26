"use server"

import { cookies } from "next/headers"

type LoginData = {
  email: string
  password: string
}

type RegisterData = {
  name: string
  email: string
  password: string
}

type AuthResult = {
  success: boolean
  error?: string
}

export async function loginAction(data: LoginData): Promise<AuthResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Error al iniciar sesión",
      };
    }

    if (result.access_token) {
      const cookieStore = await cookies()
      cookieStore.set("access-token", result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error en login:", error);
    return {
      success: false,
      error: "Error de conexión",
    };
  }
}

export async function registerAction(data: RegisterData): Promise<AuthResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Error al registrar usuario',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    return {
      success: false,
      error: 'Error de conexión',
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("access-token")
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}
