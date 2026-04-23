'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/auth-context'
import { useUpdateProfile, useChangePassword, useDeleteAccount } from '@/hooks/queries/use-user'
import { User, Lock, Trash2, Eye, EyeOff } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e _'),
  bio: z.string().max(200, 'Bio pode ter no máximo 200 caracteres').optional(),
  institution: z.string().optional(),
  course: z.string().optional(),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const deleteAccount = useDeleteAccount()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
      institution: user?.institution || '',
      course: user?.course || '',
      avatarUrl: user?.avatarUrl || '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        username: data.username,
        bio: data.bio || undefined,
        institution: data.institution || undefined,
        course: data.course || undefined,
        avatarUrl: data.avatarUrl || undefined,
      })
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil')
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Senha alterada com sucesso!')
      passwordForm.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar senha')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync()
      toast.success('Conta excluída com sucesso')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir conta')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Meu Perfil" description="Gerencie suas informações pessoais" />

      <div className="flex-1 space-y-6 p-4 lg:p-6 max-w-3xl">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Informações do Perfil</CardTitle>
            </div>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileForm.watch('avatarUrl')} alt={user?.name} />
                  <AvatarFallback className="text-lg">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Field>
                    <FieldLabel htmlFor="avatarUrl">URL do Avatar</FieldLabel>
                    <Input
                      id="avatarUrl"
                      placeholder="https://exemplo.com/avatar.jpg"
                      {...profileForm.register('avatarUrl')}
                    />
                  </Field>
                </div>
              </div>

              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                    <Input
                      id="name"
                      {...profileForm.register('name')}
                      className={profileForm.formState.errors.name ? 'border-destructive' : ''}
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      {...profileForm.register('username')}
                      className={profileForm.formState.errors.username ? 'border-destructive' : ''}
                    />
                    {profileForm.formState.errors.username && (
                      <p className="text-sm text-destructive">{profileForm.formState.errors.username.message}</p>
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    {...profileForm.register('bio')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profileForm.watch('bio')?.length || 0}/200 caracteres
                  </p>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="institution">Instituição</FieldLabel>
                    <Input
                      id="institution"
                      placeholder="Ex: USP, UFRJ..."
                      {...profileForm.register('institution')}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="course">Curso</FieldLabel>
                    <Input
                      id="course"
                      placeholder="Ex: Engenharia de Software"
                      {...profileForm.register('course')}
                    />
                  </Field>
                </div>
              </FieldGroup>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Alterar Senha</CardTitle>
            </div>
            <CardDescription>Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword')}
                      className={passwordForm.formState.errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        {...passwordForm.register('newPassword')}
                        className={passwordForm.formState.errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirmar nova senha</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                      className={passwordForm.formState.errors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </Field>
                </div>
              </FieldGroup>

              <div className="flex justify-end">
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Alterando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            </div>
            <CardDescription>
              Ações irreversíveis para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Excluir conta</p>
                <p className="text-sm text-muted-foreground">
                  Isso excluirá permanentemente sua conta e todos os dados associados.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Excluir Conta</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                      e removerá todos os seus dados dos nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sim, excluir minha conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
