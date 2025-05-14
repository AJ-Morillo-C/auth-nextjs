"use server"

import { revalidatePath } from "next/cache"
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

let cachedUser: any = null;

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
      cookieStore.set("access-token", result.access_token);
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
  cachedUser = null;
}

export async function getCurrentUser() {
  // if (cachedUser) {
  //   return cachedUser; // Devuelve el usuario cacheado si ya existe
  // }

  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value;

  if (!token) {
    console.log("No se encontró token");
    return null; // Si no hay token, no se realiza la solicitud
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al verificar el token:", errorData);
      return null; // No intentes modificar cookies aquí
    }

    cachedUser = await response.json(); // Cachea el usuario después de la primera solicitud
    return cachedUser;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    cachedUser = null; // Limpia el cache en caso de error
    return null;
  }
}

type ResetPasswordData = {
  token: string
  password: string
}

export async function requestPasswordResetAction(email: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Error al solicitar recuperación',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    return {
      success: false,
      error: 'Error de conexión',
    };
  }
}

export async function resetPasswordAction(data: ResetPasswordData): Promise<AuthResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        token: data.token,
        newPassword: data.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Error al restablecer contraseña',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error en restablecimiento:', error);
    return {
      success: false,
      error: 'Error de conexión',
    };
  }
}

export async function updateProfileAction(data: { id: string, name: string; email: string }): Promise<AuthResult> {

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("access-token")?.value;

    if (!token) {
      return {
        success: false,
        error: 'No se encontró el token de acceso'
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Error al actualizar el perfil',
      };
    }

    revalidatePath("/", "layout")

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor',
    };
  }
}

export async function changePasswordAction(data: { currentPassword: string; newPassword: string; }): Promise<AuthResult> {
  try {

    const cookieStore = await cookies()
    const token = cookieStore.get("access-token")?.value;

    if (!token) {
      return {
        success: false,
        error: 'No se encontró el token de acceso'
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Error al cambiar la contraseña',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor',
    };
  }
}
