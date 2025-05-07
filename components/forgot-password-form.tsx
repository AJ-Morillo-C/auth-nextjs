"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { requestPasswordResetAction } from "@/app/actions/auth-actions"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(data: ForgotPasswordFormValues) {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await requestPasswordResetAction(data.email)

            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.error || "Error al solicitar el restablecimiento de contraseña")
            }
        } catch (err) {
            setError("Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {success ? (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.
                    </AlertDescription>
                </Alert>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="mt-1">
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register("email")}
                                aria-invalid={errors.email ? "true" : "false"}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar codigo de recuperación"
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
