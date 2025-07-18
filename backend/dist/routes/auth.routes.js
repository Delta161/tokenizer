import express from 'express';
import passport from 'passport';
const router = express.Router();
// Step 1: Redirect user to Google login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));
// Step 2: Google redirects back here
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: false,
}), (req, res) => {
    // At this point, `req.user` exists
    // TODO: Issue JWT or session here
    res.json({ message: 'Login successful', user: req.user });
});
// Optional: Failure route
router.get('/failure', (req, res) => {
    res.status(401).json({ message: 'Authentication failed' });
});
export default router;
//# sourceMappingURL=auth.routes.js.map