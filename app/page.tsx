import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Bienvenido a la Plataforma</h1>
          <p className="text-gray-600">Por favor, inicia sesión o regístrate para continuar.</p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button variant="default" className="bg-blue-600">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="default" className="bg-green-600">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
