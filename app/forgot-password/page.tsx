import { ForgotPasswordForm } from "@/components/forgot-password-form"
import Link from "next/link"


export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Recuperar contraseña</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Ingresa tu email y te enviaremos un codigo para restablecer tu contraseña
                    </p>
                </div>
                <ForgotPasswordForm />
                <div className="text-center">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
