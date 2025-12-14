// inertia/components/ui/ImageCropper.tsx - THEMED IMAGE CROPPER
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import {
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassMinusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { useTheme } from '~/hooks/useTheme'
import Button from './Button'
import Modal from './Modal'

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  aspectRatio?: number
  cropShape?: 'rect' | 'round'
}

interface CroppedArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = 'round',
}: ImageCropperProps) {
  const { colors } = useTheme()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (_croppedArea: any, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CroppedArea,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5)

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob)
      }, 'image/jpeg')
    })
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    try {
      setIsProcessing(true)
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal show={true} onClose={onCancel} title="Recadrer votre photo" maxWidth="3xl">
      <div className="space-y-6">
        {/* Cropper Area */}
        <div
          className="relative h-96 rounded-xl overflow-hidden border-4"
          style={{ borderColor: colors.neutral[200], backgroundColor: colors.neutral[900] }}
        >
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            showGrid={true}
            style={{
              containerStyle: {
                backgroundColor: colors.neutral[900],
              },
              cropAreaStyle: {
                borderColor: colors.primary[500],
                color: `${colors.primary[500]}30`,
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
                Zoom
              </label>
              <span className="text-sm font-bold" style={{ color: colors.primary[600] }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${colors.primary[500]} 0%, ${colors.primary[500]} ${((zoom - 1) / 2) * 100}%, ${colors.neutral[200]} ${((zoom - 1) / 2) * 100}%, ${colors.neutral[200]} 100%)`,
              }}
            />
          </div>

          {/* Rotation Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <ArrowPathIcon className="w-4 h-4" />
                Rotation
              </label>
              <span className="text-sm font-bold" style={{ color: colors.secondary[600] }}>
                {rotation}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${colors.secondary[500]} 0%, ${colors.secondary[500]} ${(rotation / 360) * 100}%, ${colors.neutral[200]} ${(rotation / 360) * 100}%, ${colors.neutral[200]} 100%)`,
              }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setRotation((r) => r - 90)}
              className="flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-105"
              style={{
                borderColor: colors.neutral[300],
                color: colors.neutral[700],
                backgroundColor: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.secondary[500]
                e.currentTarget.style.color = colors.secondary[700]
                e.currentTarget.style.backgroundColor = colors.secondary[50]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.neutral[300]
                e.currentTarget.style.color = colors.neutral[700]
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              ↺ -90°
            </button>
            <button
              onClick={() => setRotation((r) => r + 90)}
              className="flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-105"
              style={{
                borderColor: colors.neutral[300],
                color: colors.neutral[700],
                backgroundColor: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.secondary[500]
                e.currentTarget.style.color = colors.secondary[700]
                e.currentTarget.style.backgroundColor = colors.secondary[50]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.neutral[300]
                e.currentTarget.style.color = colors.neutral[700]
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              ↻ +90°
            </button>
            <button
              onClick={() => {
                setRotation(0)
                setZoom(1)
              }}
              className="flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all hover:scale-105"
              style={{
                borderColor: colors.neutral[300],
                color: colors.neutral[700],
                backgroundColor: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.warning[500]
                e.currentTarget.style.color = colors.warning[700]
                e.currentTarget.style.backgroundColor = colors.warning[50]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.neutral[300]
                e.currentTarget.style.color = colors.neutral[700]
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={onCancel}
            iconLeft={XMarkIcon}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            onClick={handleSave}
            loading={isProcessing}
            disabled={isProcessing}
            iconLeft={CheckIcon}
            shadow="xl"
          >
            Appliquer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
