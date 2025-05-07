"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPasswordAction } from "@/app/actions/auth-actions"
import { AlertCircle, Loader2 } from "lucide-react"

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
        confirmPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
    const searchParams = useSearchParams(); // Usa useSearchParams para obtener los parámetros de la URL
    const token = searchParams.get("token"); // Extrae el token de la URL
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: ResetPasswordFormValues) {
        setIsLoading(true);
        setError(null);

        if (!token) {
            setError("Token no encontrado en la URL.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await resetPasswordAction({
                token,
                password: data.password,
            });

            if (result.success) {
                router.push("/login?reset=success");
            } else {
                setError(result.error || "Error al restablecer la contraseña");
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div>
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <div className="mt-1">
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            {...register("password")}
                            aria-invalid={errors.password ? "true" : "false"}
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                </div>

                <div>
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <div className="mt-1">
                        <Input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            {...register("confirmPassword")}
                            aria-invalid={errors.confirmPassword ? "true" : "false"}
                        />
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Restableciendo...
                            </>
                        ) : (
                            "Restablecer contraseña"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
