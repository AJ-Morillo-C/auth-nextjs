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
}

export async function getCurrentUser() {

  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value;

  if (!token) {
    console.log("No se encontró token");
    return null;
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
      cookieStore.delete("access-token");
      console.error("Error al verificar el token:", errorData);
      return null;
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
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

export async function updateProfilePhotoAction(formData: FormData): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "No has iniciado sesión",
      };
    }

    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );
    const userId = payload.id;
    if (!userId) {
      return {
        success: false,
        error: "No se pudo obtener el ID del usuario",
      };
    }

    const profilePhoto = formData.get("profilePhoto") as File;
    if (!profilePhoto) {
      return {
        success: false,
        error: "No se ha proporcionado una foto de perfil",
      };
    }

    const backendFormData = new FormData();
    backendFormData.append("file", profilePhoto);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Error al actualizar la foto de perfil",
      };
    }

    revalidatePath("/", "layout");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al actualizar la foto de perfil:", error);
    return {
      success: false,
      error: "Error de conexión con el servidor",
    };
  }
}