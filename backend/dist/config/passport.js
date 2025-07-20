import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../config/prisma.js';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const providerId = profile.id;
        const fullName = profile.displayName;
        const avatarUrl = profile.photos[0]?.value;
        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { provider_providerId: { provider: 'GOOGLE', providerId } },
        });
        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    provider: 'GOOGLE',
                    providerId,
                    fullName,
                    avatarUrl,
                    role: 'INVESTOR',
                    status: 'ACTIVE',
                },
            });
        }
        return done(null, user);
    }
    catch (err) {
        return done(err, null);
    }
}));
// Required for session support
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
//# sourceMappingURL=passport.js.map