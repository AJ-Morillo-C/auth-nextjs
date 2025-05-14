"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateProfileAction } from "@/app/actions/auth-actions"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

const profileSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
    user: {
        id: string
        name: string
        email: string
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    })

    async function onSubmit(data: ProfileFormValues) {
        if (!isDirty) {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
            return
        }

        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await updateProfileAction({
                id: user.id,
                name: data.name,
                email: data.email,
            })

            if (result.success) {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            } else {
                setError(result.error || "Error al actualizar el perfil")
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
                <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                <p className="mt-1 text-sm text-gray-600">Actualiza tu información personal</p>
            </div>

            {success && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Tu información ha sido actualizada correctamente.
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
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" {...register("name")} className="mt-1" aria-invalid={errors.name ? "true" : "false"} />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="mt-1"
                        aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <Button type="submit" disabled={isLoading || (!isDirty && !success)}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        "Guardar Cambios"
                    )}
                </Button>
            </form>
        </div>
    )
}
