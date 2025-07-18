declare const router: import("express-serve-static-core").Router;
export default router;
/**
 * Export route configuration for documentation
 */
export declare const authRouteConfig: {
    basePath: string;
    routes: {
        health: string;
        googleAuth: string;
        googleCallback: string;
        azureAuth: string;
        azureCallback: string;
        azureCallbackAlt: string;
        currentUser: string;
        logout: string;
        logoutPost: string;
        refreshToken: string;
        error: string;
    };
    middleware: {
        requireAuth: string;
        passport: string;
    };
};
//# sourceMappingURL=auth.routes.d.ts.map