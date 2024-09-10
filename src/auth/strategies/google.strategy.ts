import { PassportStrategy } from '@nestjs/passport'
import { config } from 'dotenv'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { GoogleProfileDto } from '../dto/google-profile.dto'

config({
  path: ['.env.local', '.env']
})

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile']
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, email, picture } = profile._json

    const user = {
      fullName: name as string,
      email: email as string,
      avatar: picture as string
    } as GoogleProfileDto

    done(null, user)
  }
}
