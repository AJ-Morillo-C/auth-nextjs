import Link from "next/link"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Establecer nueva contraseña</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Ingresa tu nueva contraseña para completar el proceso de recuperación
                    </p>
                </div>
                <ResetPasswordForm />
                <div className="text-center">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
