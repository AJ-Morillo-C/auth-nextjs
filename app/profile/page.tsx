import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { ProfileForm } from "@/components/profile-form"
import { ChangePasswordForm } from "@/components/change-password-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"

export default async function ProfilePage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Perfil de Usuario</h1>
                    <p className="mt-2 text-sm text-gray-600">Administra tu información personal y seguridad</p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Cabecera del perfil con foto y nombre */}
                    <div className="p-6 sm:p-8 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <ProfilePhotoUpload user={user} size="xl" />

                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500">{user.email}</p>
                                <p className="mt-2 text-sm text-gray-600">
                                    Actualiza tu foto de perfil haciendo clic en el icono de cámara.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>



                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Información Personal</TabsTrigger>
                        <TabsTrigger value="security">Seguridad</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <Card className="p-6">
                            <ProfileForm user={user} />
                        </Card>
                    </TabsContent>
                    <TabsContent value="security">
                        <Card className="p-6">
                            <ChangePasswordForm />
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
