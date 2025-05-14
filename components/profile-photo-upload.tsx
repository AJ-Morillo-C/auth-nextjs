"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { updateProfilePhotoAction } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageCropEditor } from "./image-crop-editor"

interface ProfilePhotoUploadProps {
  user: {
    id: string
    name: string
    profilePhoto?: string
  }
  size?: "sm" | "md" | "lg" | "xl"
}

export function ProfilePhotoUpload({ user, size = "lg" }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Obtener las iniciales del usuario para el fallback del avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Tamaños de avatar según la prop size
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40",
  }

  // Tamaños del botón de cámara según la prop size
  const cameraBtnSizes = {
    sm: "h-6 w-6 bottom-0 right-0",
    md: "h-8 w-8 bottom-0 right-0",
    lg: "h-10 w-10 bottom-0 right-0",
    xl: "h-12 w-12 bottom-1 right-1",
  }

  // Tamaños del icono de cámara según la prop size
  const cameraIconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Crear una URL para la vista previa
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)
    setPreviewOpen(true)

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = ""
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploading(true)
    setPreviewOpen(false)

    try {
      // Crear un FormData para enviar el archivo
      const formData = new FormData()

      // Crear un archivo a partir del Blob recortado
      const croppedFile = new File([croppedImageBlob], "profile-photo.jpg", { type: "image/jpeg" })
      formData.append("profilePhoto", croppedFile)

      // Llamar al Server Action para actualizar la foto de perfil
      await updateProfilePhotoAction(formData)

      // Refrescar la página para mostrar la nueva foto
      router.refresh()
    } catch (error) {
      console.error("Error al subir la foto de perfil:", error)
    } finally {
      setIsUploading(false)

      // Liberar la URL de objeto creada para la vista previa
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
        setPreviewImage(null)
      }
    }
  }

  const handleCancelUpload = () => {
    setPreviewOpen(false)

    // Liberar la URL de objeto creada para la vista previa
    if (previewImage) {
      URL.revokeObjectURL(previewImage)
      setPreviewImage(null)
    }
  }

  return (
    <>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>

        {/* Botón de cámara para cambiar la foto */}
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className={`absolute rounded-full ${cameraBtnSizes[size]} bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary`}
          onClick={handleCameraClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className={`${cameraIconSizes[size]} animate-spin`} />
          ) : (
            <Camera className={cameraIconSizes[size]} />
          )}
        </Button>

        {/* Input oculto para seleccionar el archivo */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      {/* Diálogo de editor de recorte */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar foto de perfil</DialogTitle>
            <DialogDescription>
              Mueve, amplía o recorta tu imagen para que se vea perfecta en tu perfil.
            </DialogDescription>
          </DialogHeader>

          {previewImage && (
            <ImageCropEditor image={previewImage} onCropComplete={handleCropComplete} onCancel={handleCancelUpload} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

