// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'
import { forgotPasswordValidator } from '#validators/forgot_password'
import { resetPasswordValidator } from '#validators/reset_password'
import EmailService from '#services/email_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class AuthController {
  /**
   * Process login with smart redirect
   */
  async login({ request, response, auth, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      // Verify credentials
      const user = await User.verifyCredentials(email, password)

      // Check if user can login
      if (!user.canLogin()) {
        if (!user.isEmailVerified) {
          session.flash('error', 'Veuillez vérifier votre email avant de vous connecter.')
        } else if (user.isBlocked) {
          session.flash('error', 'Votre compte a été bloqué.')
        } else if (!user.isActive) {
          session.flash('error', "Votre compte n'est pas actif.")
        }
        return response.redirect().back()
      }

      // Login user
      await auth.use('web').login(user)

      session.flash('success', `Bienvenue ${user.firstName} !`)

      // Get intended URL or redirect to /events
      const intendedUrl = session.get('intended_url', '/events')
      session.forget('intended_url')

      return response.redirect(intendedUrl)
    } catch (error) {
      console.error('Login error:', error)
      session.flash('error', 'Email ou mot de passe incorrect.')
      return response.redirect().back()
    }
  }

  /**
   * Show login page (only for guests)
   */
  async showLogin({ inertia, auth, response }: HttpContext) {
    // This check is redundant if guest middleware is applied
    // but kept as a safety measure
    if (auth.user) {
      return response.redirect('/events')
    }
    return inertia.render('auth/login')
  }

  /**
   * Show register page (only for guests)
   */
  async showRegister({ inertia, auth, response }: HttpContext) {
    if (auth.user) {
      return response.redirect('/events')
    }
    return inertia.render('auth/register')
  }

  /**
   * Logout and redirect to login
   */
  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('success', 'Vous avez été déconnecté avec succès.')
    return response.redirect('/auth/login')
  }

  /**
   * Traite l'inscription
   */
  async register({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const data = await request.validateUsing(registerValidator)

      // Create user within transaction
      const user = await User.create(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          age: data.age,
          province: data.province,
          commune: data.commune,
          phoneNumber: data.phoneNumber || null,
          isEmailVerified: false,
          isActive: true,
          isBlocked: false,
          isAdmin: false,
        },
        { client: trx }
      )

      await trx.commit()

      console.log('User created successfully:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      })

      // Send verification email (outside transaction)
      let emailSent = false
      try {
        await EmailService.sendVerificationEmail(user)
        emailSent = true
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Continue - account is created, user can request resend later
      }

      if (emailSent) {
        session.flash(
          'success',
          'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.'
        )
      } else {
        session.flash(
          'warning',
          'Inscription réussie ! Cependant, l\'email de vérification n\'a pas pu être envoyé. Veuillez contacter le support.'
        )
      }

      return response.redirect('/auth/login')

    } catch (error) {
      await trx.rollback()
      console.error("Erreur lors de l'inscription:", error)

      // Check if it's a duplicate email error
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        // Try to find the user with this email
        const emailFromRequest = request.input('email')

        if (emailFromRequest) {
          try {
            const existingUser = await User.findBy('email', emailFromRequest)

            if (existingUser && !existingUser.isEmailVerified) {
              // User exists but hasn't verified email - resend verification
              try {
                await EmailService.sendVerificationEmail(existingUser)
                session.flash(
                  'info',
                  'Cet email est déjà enregistré mais non vérifié. Un nouvel email de vérification vous a été envoyé.'
                )
              } catch (emailError) {
                console.error('Failed to resend verification email:', emailError)
                session.flash(
                  'warning',
                  'Cet email est déjà enregistré. Veuillez vérifier votre boîte mail ou contactez le support.'
                )
              }
            } else {
              // User exists and is verified - they should login
              session.flash(
                'error',
                'Cet email est déjà utilisé. Si c\'est votre compte, veuillez vous connecter.'
              )
            }
          } catch (findError) {
            // Couldn't find user, show generic message
            session.flash('error', 'Cet email est déjà utilisé.')
          }
        } else {
          session.flash('error', 'Cet email est déjà utilisé.')
        }
      } else {

        // Generic error
        session.flash('error', "Une erreur est survenue lors de l'inscription. Veuillez réessayer.")
      }

      return response.redirect().back()
    }
  }


  /**
   * Vérifie l'email de l'utilisateur
   */
  async verifyEmail({ request, response, session }: HttpContext) {
    const token = request.input('token')

    if (!token) {
      session.flash('error', 'Token de vérification invalide.')
      return response.redirect('/auth/login')
    }

    const user = await User.query().where('email_verification_token', token).first()

    if (!user) {
      session.flash('error', 'Token de vérification invalide ou expiré.')
      return response.redirect('/auth/login')
    }

    if (user.isEmailVerified) {
      session.flash('info', 'Votre email est déjà vérifié.')
      return response.redirect('/auth/login')
    }

    user.isEmailVerified = true
    user.emailVerifiedAt = DateTime.now()
    user.emailVerificationToken = null
    await user.save()

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user)
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error)
    }

    session.flash(
      'success',
      'Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.'
    )
    return response.redirect('/auth/login')
  }

  /**
   * Affiche le formulaire de mot de passe oublié
   */
  async showForgotPassword({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password')
  }

  /**
   * Envoie l'email de réinitialisation
   */
  async forgotPassword({ request, response, session }: HttpContext) {
    try {
      const { email } = await request.validateUsing(forgotPasswordValidator)
      const user = await User.findBy('email', email)

      if (user) {
        await EmailService.sendPasswordResetEmail(user)
      }

      session.flash(
        'success',
        'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants.'
      )
      return response.redirect('/auth/login')
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error)
      session.flash('error', 'Une erreur est survenue. Veuillez réessayer.')
      return response.redirect().back()
    }
  }

  /**
   * Affiche le formulaire de réinitialisation
   */
  async showResetPassword({ request, inertia, response, session }: HttpContext) {
    const token = request.input('token')

    if (!token) {
      session.flash('error', 'Token invalide.')
      return response.redirect('/auth/login')
    }

    return inertia.render('auth/reset_password', { token })
  }

  /**
   * Traite la réinitialisation du mot de passe
   */
  async resetPassword({ request, response, session }: HttpContext) {
    try {
      const { token, password } = await request.validateUsing(resetPasswordValidator)

      const user = await User.query()
        .where('password_reset_token', token)
        .where('password_reset_expires_at', '>', DateTime.now().toSQL())
        .first()

      if (!user) {
        session.flash('error', 'Token invalide ou expiré. Veuillez refaire une demande.')
        return response.redirect('/auth/forgot-password')
      }

      user.password = password
      user.passwordResetToken = null
      user.passwordResetExpiresAt = null
      await user.save()

      session.flash('success', 'Votre mot de passe a été réinitialisé avec succès.')
      return response.redirect('/auth/login')
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
      session.flash('error', 'Une erreur est survenue. Veuillez réessayer.')
      return response.redirect().back()
    }
  }

  /**
   * Renvoie l'email de vérification
   */
  async resendVerificationEmail({ auth, response, session }: HttpContext) {
    const user = auth.user

    if (!user) {
      session.flash('error', 'Vous devez être connecté.')
      return response.redirect('/auth/login')
    }

    if (user.isEmailVerified) {
      session.flash('info', 'Votre email est déjà vérifié.')
      return response.redirect('/')
    }

    try {
      await EmailService.sendVerificationEmail(user)
      session.flash('success', 'Un nouvel email de vérification a été envoyé.')
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error)
      session.flash('error', "Erreur lors de l'envoi de l'email.")
    }

    return response.redirect().back()
  }

  /**
   * Show public resend verification page
   */
  async showResendVerification({ inertia }: HttpContext) {
    return inertia.render('auth/resend_verification')
  }

  /**
   * Resend verification email (public - no auth required)
   */
  async resendVerificationPublic({ request, response, session }: HttpContext) {
    try {
      const email = request.input('email')

      if (!email) {
        session.flash('error', 'Veuillez fournir une adresse email.')
        return response.redirect().back()
      }

      // Find user by email
      const user = await User.findBy('email', email)

      // Don't reveal whether email exists or not (security)
      if (!user) {
        session.flash(
          'success',
          'Si un compte non vérifié existe avec cet email, un nouvel email de vérification a été envoyé.'
        )
        return response.redirect('/auth/login')
      }

      // Check if already verified
      if (user.isEmailVerified) {
        session.flash('info', 'Ce compte est déjà vérifié. Vous pouvez vous connecter.')
        return response.redirect('/auth/login')
      }

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(user)
        session.flash(
          'success',
          'Un nouvel email de vérification a été envoyé. Veuillez vérifier votre boîte mail.'
        )
      } catch (emailError) {
        console.error('Failed to resend verification email:', emailError)
        session.flash(
          'error',
          'Erreur lors de l\'envoi de l\'email. Veuillez réessayer ou contacter le support.'
        )
      }

      return response.redirect('/auth/login')
    } catch (error) {
      console.error('Error in resendVerificationPublic:', error)
      session.flash('error', 'Une erreur est survenue. Veuillez réessayer.')
      return response.redirect().back()
    }
  }
}
