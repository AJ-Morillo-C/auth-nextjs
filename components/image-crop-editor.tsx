"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react"

interface Point {
    x: number
    y: number
}

interface Area {
    x: number
    y: number
    width: number
    height: number
}

interface ImageCropEditorProps {
    image: string
    onCropComplete: (croppedImageBlob: Blob) => void
    onCancel: () => void
}

export function ImageCropEditor({ image, onCropComplete, onCancel }: ImageCropEditorProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropChange = useCallback((location: Point) => {
        setCrop(location)
    }, [])

    const onZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom)
    }, [])

    const onRotationChange = useCallback((newRotation: number) => {
        setRotation(newRotation)
    }, [])

    const onCropCompleteCallback = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const resetSettings = useCallback(() => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
    }, [])

    const createCroppedImage = useCallback(async () => {
        if (!croppedAreaPixels) return

        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
            onCropComplete(croppedImage)
        } catch (e) {
            console.error("Error creating cropped image:", e)
        }
    }, [croppedAreaPixels, rotation, image, onCropComplete])

    return (
        <div className="flex flex-col h-full">
            <div className="relative w-full h-80 mb-4">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteCallback}
                    onZoomChange={onZoomChange}
                    onRotationChange={onRotationChange}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <ZoomOut className="h-4 w-4 text-gray-500" />
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => setZoom(value[0])}
                        className="flex-1"
                    />
                    <ZoomIn className="h-4 w-4 text-gray-500" />
                </div>

                <div className="flex justify-between space-x-4">
                    <Button variant="outline" size="sm" onClick={resetSettings}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restablecer
                    </Button>
                    <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={createCroppedImage}>
                            <Check className="h-4 w-4 mr-2" />
                            Aplicar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Función para crear una imagen recortada a partir de una imagen original
async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
        throw new Error("No 2d context")
    }

    // Establecer el tamaño del canvas para que sea igual al recorte deseado
    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    // Establecer dimensiones mínimas para evitar errores de escala
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Dibujar la imagen recortada
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Transformación para rotar alrededor del centro del canvas
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Dibujar la imagen en el canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
    )

    // Convertir el canvas a Blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas is empty"))
                return
            }
            resolve(blob)
        }, "image/jpeg")
    })
}

// Función auxiliar para crear una imagen a partir de una URL
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error) => reject(error))
        image.crossOrigin = "anonymous" // Evitar problemas CORS
        image.src = url
    })
}
