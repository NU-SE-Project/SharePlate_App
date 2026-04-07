import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { verifyEmail as verifyEmailRequest } from "../services/authService";
import { useAuth } from "../../../context/AuthContext";

const verificationRequestCache = new Map();

function verifyEmailOnce(token) {
  if (!verificationRequestCache.has(token)) {
    const request = verifyEmailRequest(token)
      .then((response) => ({
        ok: true,
        response,
      }))
      .catch((error) => ({
        ok: false,
        error,
      }));

    verificationRequestCache.set(token, request);
  }

  return verificationRequestCache.get(token);
}

const VerifyEmailPage = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const authRef = useRef(auth);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  useEffect(() => {
    let isMounted = true;

    const runVerification = async () => {
      if (!token) {
        if (isMounted) {
          setStatus("error");
          setMessage("Verification token is missing.");
        }
        return;
      }

      const result = await verifyEmailOnce(token);
      if (!isMounted) return;

      if (result.ok) {
        const response = result.response;
        setStatus("success");
        setMessage(
          response?.message || "Email verified successfully. You can now log in.",
        );

        if (authRef.current.isAuthenticated) {
          authRef.current.refreshCurrentUser().catch(() => {});
        }
        return;
      }

      const error = result.error;
      if (isMounted) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification link is invalid or expired.",
        );
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We are confirming your email address with the backend verification flow."
    >
      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
        {status === "verifying" ? (
          <>
            <Loader2
              className="mx-auto mb-4 animate-spin text-emerald-600"
              size={36}
            />
            <p className="text-sm font-medium text-slate-500">
              Verifying your email address...
            </p>
          </>
        ) : null}

        {status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={40} />
            <h3 className="text-2xl font-bold text-slate-900">
              Verification complete
            </h3>
            <p className="mt-3 text-sm text-slate-600">{message}</p>
            <Link
              to="/auth/login"
              className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
            >
              Continue to login
            </Link>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <XCircle className="mx-auto mb-4 text-red-500" size={40} />
            <h3 className="text-2xl font-bold text-slate-900">
              Verification failed
            </h3>
            <p className="mt-3 text-sm text-slate-600">{message}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth/resend-verification"
                className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
              >
                Resend verification
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600"
              >
                Back to login
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
