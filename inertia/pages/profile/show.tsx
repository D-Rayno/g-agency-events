import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import { motion } from 'motion/react'
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  TrashIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import AppLayout from '~/components/layouts/AppLayout'
import Card from '~/components/ui/Card'
import Button from '~/components/ui/Button'
import Input from '~/components/ui/Input'
import Select from '~/components/ui/Select'
import Avatar from '~/components/ui/Avatar'
import Badge from '~/components/ui/Badge'
import Alert from '~/components/ui/Alert'
import Modal from '~/components/ui/Modal'
import ImageCropper from '~/components/ui/ImageCropper'
import { useValidatedForm } from '~/hooks/useValidatedForm'
import { useRouteGuard } from '~/hooks/useRouteGuard'
import { updateProfileSchema } from '~/lib/validation'
import { PROVINCES } from '~/lib/constants'
import { useTheme } from '~/hooks/useTheme'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  age: number
  province: string
  commune: string
  phoneNumber?: string
  avatarUrl?: string
  isEmailVerified: boolean
  createdAt: string
}

interface Props {
  user: User
}

export default function ProfileShow({ user }: Props) {
  useRouteGuard({ requiresAuth: true })
  const { colors } = useTheme()

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  
  // Image cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null)
  const [croppedImagePreview, setCroppedImagePreview] = useState<string | null>(null)

  const { form, getError, handleBlur, shouldShowError } = useValidatedForm({
    schema: updateProfileSchema,
    initialData: {
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      province: user.province,
      commune: user.commune,
      phoneNumber: user.phoneNumber || '',
    },
  })

  const provinceOptions = PROVINCES.map((p) => ({
    value: p,
    label: p,
  }))

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez JPG, PNG ou WEBP.')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Fichier trop volumineux. Maximum 2MB.')
        return
      }

      // Create preview and show cropper
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    event.target.value = ''
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    setCroppedImageBlob(croppedBlob)
    const previewUrl = URL.createObjectURL(croppedBlob)
    setCroppedImagePreview(previewUrl)
    setShowCropper(false)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setSelectedImage(null)
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('firstName', form.data.firstName)
    formData.append('lastName', form.data.lastName)
    formData.append('age', String(form.data.age))
    formData.append('province', form.data.province)
    formData.append('commune', form.data.commune)
    if (form.data.phoneNumber) {
      formData.append('phoneNumber', form.data.phoneNumber)
    }
    if (croppedImageBlob) {
      formData.append('avatar', croppedImageBlob, 'avatar.jpg')
    }

    router.post('/profile', formData as any, {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditing(false)
        setCroppedImageBlob(null)
        setCroppedImagePreview(null)
      },
    })
  }

  const handleDeleteAvatar = () => {
    setIsDeletingAvatar(true)
    router.delete('/profile/avatar', {
      preserveScroll: true,
      onSuccess: () => {
        setShowDeleteModal(false)
        setIsDeletingAvatar(false)
      },
      onError: () => {
        setIsDeletingAvatar(false)
      },
    })
  }

  const handleCancel = () => {
    form.reset()
    setCroppedImageBlob(null)
    setCroppedImagePreview(null)
    setIsEditing(false)
  }

  return (
    <>
      <Head title="Mon Profil" />
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="rounded-2xl p-8 mb-2"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})`,
              }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mon Profil</h1>
              <p className="text-white/90">
                Gérez vos informations personnelles et vos préférences
              </p>
            </div>
          </motion.div>

          {/* Email Verification Alert */}
          {!user.isEmailVerified && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Alert type="warning">
                Votre email n'est pas encore vérifié. Veuillez vérifier votre boîte de réception.
              </Alert>
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Sidebar - Left */}
            <motion.div
              className="lg:col-span-1 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Avatar Card */}
              <Card className="p-6">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <Avatar
                      name={`${user.firstName} ${user.lastName}`}
                      src={user.avatarUrl}
                      size="2xl"
                      ring
                    />
                    {user.isEmailVerified && (
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center"
                        style={{ backgroundColor: colors.success[500] }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.5 }}
                      >
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Name */}
                  <h2 className="text-xl font-bold text-neutral-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-neutral-600 mb-4 break-all px-2">{user.email}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${colors.primary[50]}` }}
                    >
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: colors.primary[600] }}
                      >
                        {user.age}
                      </div>
                      <div className="text-xs text-neutral-600">Ans</div>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${colors.secondary[50]}` }}
                    >
                      <div
                        className="text-sm font-bold mb-1"
                        style={{ color: colors.secondary[600] }}
                      >
                        {new Date(user.createdAt).getFullYear()}
                      </div>
                      <div className="text-xs text-neutral-600">Membre</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <Badge variant="info" size="md">
                      <MapPinIcon className="w-4 h-4" />
                      {user.province}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && (
                    <div className="space-y-2">
                      <Button
                        variant="gradient"
                        fullWidth
                        iconLeft={PencilSquareIcon}
                        onClick={() => setIsEditing(true)}
                        shadow="lg"
                      >
                        Modifier le profil
                      </Button>
                      {user.avatarUrl && (
                        <Button
                          variant="outline"
                          fullWidth
                          size="sm"
                          iconLeft={TrashIcon}
                          onClick={() => setShowDeleteModal(true)}
                        >
                          Supprimer la photo
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Main Information - Right */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-neutral-200">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                      Informations personnelles
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isEditing
                        ? 'Modifiez vos informations ci-dessous'
                        : 'Vos informations de profil'}
                    </p>
                  </div>
                  {isEditing && (
                    <Badge variant="info" size="md" pulse>
                      <PencilSquareIcon className="w-4 h-4" />
                      Édition
                    </Badge>
                  )}
                </div>

                {!isEditing ? (
                  /* View Mode */
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoField
                        icon={UserCircleIcon}
                        label="Prénom"
                        value={user.firstName}
                        color={colors.primary[500]}
                      />
                      <InfoField
                        icon={UserCircleIcon}
                        label="Nom"
                        value={user.lastName}
                        color={colors.primary[500]}
                      />
                    </div>
                    <InfoField
                      icon={EnvelopeIcon}
                      label="Email"
                      value={user.email}
                      color={colors.secondary[500]}
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoField
                        icon={CalendarIcon}
                        label="Âge"
                        value={`${user.age} ans`}
                        color={colors.success[500]}
                      />
                      {user.phoneNumber && (
                        <InfoField
                          icon={PhoneIcon}
                          label="Téléphone"
                          value={user.phoneNumber}
                          color={colors.info[500]}
                        />
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoField
                        icon={MapPinIcon}
                        label="Wilaya"
                        value={user.province}
                        color={colors.warning[500]}
                      />
                      <InfoField
                        icon={MapPinIcon}
                        label="Commune"
                        value={user.commune}
                        color={colors.warning[500]}
                      />
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div
                      className="p-4 rounded-xl border-2 border-dashed"
                      style={{
                        borderColor: colors.neutral[300],
                        backgroundColor: colors.neutral[50],
                      }}
                    >
                      <p className="text-sm font-semibold text-neutral-800 mb-3">
                        Photo de profil
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Avatar
                          name={`${form.data.firstName} ${form.data.lastName}`}
                          src={croppedImagePreview || user.avatarUrl}
                          size="lg"
                          ring
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            iconLeft={CameraIcon}
                            onClick={() => document.getElementById('avatar')?.click()}
                          >
                            {croppedImagePreview ? 'Changer' : 'Ajouter'} la photo
                          </Button>
                          <p className="text-xs text-neutral-500 mt-2">
                            JPG, PNG ou WEBP. Max 2MB
                          </p>
                          {croppedImagePreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCroppedImageBlob(null)
                                setCroppedImagePreview(null)
                              }}
                              className="mt-2"
                            >
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="Prénom"
                          value={form.data.firstName}
                          onChange={(value) => form.setData('firstName', value as string)}
                          onBlur={() => handleBlur('firstName')}
                          error={
                            shouldShowError('firstName') ? getError('firstName') : undefined
                          }
                          icon={UserCircleIcon}
                          required
                          disabled={form.processing}
                        />
                        <Input
                          label="Nom"
                          value={form.data.lastName}
                          onChange={(value) => form.setData('lastName', value as string)}
                          onBlur={() => handleBlur('lastName')}
                          error={shouldShowError('lastName') ? getError('lastName') : undefined}
                          icon={UserCircleIcon}
                          required
                          disabled={form.processing}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="Âge"
                          type="number"
                          value={form.data.age}
                          onChange={(value) => form.setData('age', value as number)}
                          onBlur={() => handleBlur('age')}
                          error={shouldShowError('age') ? getError('age') : undefined}
                          icon={CalendarIcon}
                          required
                          min={13}
                          max={120}
                          disabled={form.processing}
                        />
                        <Input
                          label="Téléphone"
                          type="tel"
                          value={form.data.phoneNumber}
                          onChange={(value) => form.setData('phoneNumber', value as string)}
                          onBlur={() => handleBlur('phoneNumber')}
                          error={
                            shouldShowError('phoneNumber') ? getError('phoneNumber') : undefined
                          }
                          icon={PhoneIcon}
                          placeholder="+213 555 123 456"
                          disabled={form.processing}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Select
                          label="Wilaya"
                          value={form.data.province}
                          onChange={(value) => form.setData('province', value as string)}
                          options={provinceOptions}
                          error={shouldShowError('province') ? getError('province') : undefined}
                          required
                          searchable
                          disabled={form.processing}
                        />
                        <Input
                          label="Commune"
                          value={form.data.commune}
                          onChange={(value) => form.setData('commune', value as string)}
                          onBlur={() => handleBlur('commune')}
                          error={shouldShowError('commune') ? getError('commune') : undefined}
                          icon={MapPinIcon}
                          required
                          disabled={form.processing}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200">
                      <Button
                        variant="gradient"
                        size="lg"
                        fullWidth
                        loading={form.processing}
                        disabled={form.processing}
                        onClick={handleSubmit}
                        shadow="lg"
                      >
                        Enregistrer
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={handleCancel}
                        disabled={form.processing}
                        iconLeft={XMarkIcon}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Image Cropper Modal */}
        {showCropper && selectedImage && (
          <ImageCropper
            image={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspectRatio={1}
            cropShape="round"
          />
        )}

        {/* Delete Avatar Modal */}
        <Modal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Supprimer la photo de profil"
          maxWidth="sm"
          footer={
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAvatar}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={isDeletingAvatar}
                disabled={isDeletingAvatar}
                onClick={handleDeleteAvatar}
              >
                Supprimer
              </Button>
            </div>
          }
        >
          <p className="text-neutral-700">
            Êtes-vous sûr de vouloir supprimer votre photo de profil ? Cette action est
            irréversible.
          </p>
        </Modal>
      </AppLayout>
    </>
  )
}

// Info Field Component
interface InfoFieldProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  color: string
}

function InfoField({ icon: Icon, label, value, color }: InfoFieldProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-neutral-900 wrap-break-word">{value}</p>
      </div>
    </div>
  )
}
