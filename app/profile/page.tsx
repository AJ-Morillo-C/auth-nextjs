import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { ProfileForm } from "@/components/profile-form"
import { ChangePasswordForm } from "@/components/change-password-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

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
