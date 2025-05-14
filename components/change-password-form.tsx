"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { changePasswordAction } from "@/app/actions/auth-actions"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, { message: "La contraseña actual es requerida" }),
        newPassword: z.string().min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres" }),
        confirmPassword: z.string().min(6, { message: "La confirmación debe tener al menos 6 caracteres" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data: ChangePasswordFormValues) {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await changePasswordAction({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            })

            if (result.success) {
                setSuccess(true)
                reset() // Limpiar el formulario
                setTimeout(() => setSuccess(false), 3000)
            } else {
                setError(result.error || "Error al cambiar la contraseña")
            }
        } catch (err) {
            setError("Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Cambiar Contraseña</h2>
                <p className="mt-1 text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>

            {success && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Tu contraseña ha sido actualizada correctamente.
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input
                        id="currentPassword"
                        type="password"
                        {...register("currentPassword")}
                        className="mt-1"
                        aria-invalid={errors.currentPassword ? "true" : "false"}
                    />
                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>}
                </div>

                <div>
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        {...register("newPassword")}
                        className="mt-1"
                        aria-invalid={errors.newPassword ? "true" : "false"}
                    />
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
                </div>

                <div>
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        {...register("confirmPassword")}
                        className="mt-1"
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cambiando...
                        </>
                    ) : (
                        "Cambiar Contraseña"
                    )}
                </Button>
            </form>
        </div>
    )
}
