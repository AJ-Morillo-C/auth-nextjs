import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser, logoutAction } from "@/app/actions/auth-actions"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Bienvenido, {user.name}</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Cerrar sesión
              </Button>
            </form>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-gray-700">Has iniciado sesión correctamente. Esta es tu área personal.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
