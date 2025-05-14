"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, ShieldUser, User } from "lucide-react"
import { logoutAction } from "@/app/actions/auth-actions"

interface UserProps {
    id: string
    name: string
    email: string
    profilePhoto?: string
}


interface HeaderProps {
    user: UserProps | null
}

export function Header({ user }: HeaderProps) {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    // Evitar errores de hidratación
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    console.log(user)

    // Si no hay usuario, mostramos un encabezado simple
    if (!user) {
        return (
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <ShieldUser className="h-6 w-6" />
                        <span className="font-bold">Auth-NextJS</span>
                    </Link>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            <Link href="/login">
                                <Button variant="outline" size="sm">
                                    Iniciar sesión
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Registrarse</Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>
        )
    }

    // Función para manejar el cierre de sesión
    const handleLogout = async () => {
        await logoutAction()
        router.push("/login")
    }

    // Obtenemos las iniciales del usuario para el fallback del avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <ShieldUser className="h-6 w-6" />
                    <span className="font-bold">Auth-NextJS</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={user.name} />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Perfil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
