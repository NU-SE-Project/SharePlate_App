import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RequireAuth = ({ children, roles } = {}) => {
  const auth = useAuth();
  const location = useLocation();
  const [isCheckingRoute, setIsCheckingRoute] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const revalidateRouteAccess = async () => {
      if (auth.isInitializing || !auth.isAuthenticated || auth.user) {
        if (isMounted) {
          setIsCheckingRoute(false);
        }
        return;
      }

      setIsCheckingRoute(true);

      try {
        await auth.refreshCurrentUser();
      } catch (error) {
        // Auth state is cleared centrally by the auth layer when validation fails.
      } finally {
        if (isMounted) {
          setIsCheckingRoute(false);
        }
      }
    };

    revalidateRouteAccess();

    return () => {
      isMounted = false;
    };
  }, [auth.accessToken, auth.isAuthenticated, auth.isInitializing, auth.user]);

  if (auth.isInitializing || isCheckingRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">
            Validating your session...
          </p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles && Array.isArray(roles) && roles.length > 0) {
    if (!auth.user?.role || !roles.includes(auth.user.role)) {
      const fallbackPath =
        auth.user?.role === "restaurant"
          ? "/restaurant/dashboard"
          : auth.user?.role === "foodbank"
            ? "/foodbank/donated-food"
            : "/dashboard";

      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
};

export default RequireAuth;
