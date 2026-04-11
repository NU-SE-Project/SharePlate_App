import React, { memo, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  LogOut,
  MailCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../../../components/common/Button";
import { useAuth } from "../../../../context/AuthContext";

const ActionCard = memo(function ActionCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:border-emerald-200 hover:bg-white hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <h4 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h4>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
});

const StatusBadge = memo(function StatusBadge({ verified }) {
  if (verified) {
    return (
      <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700">
        <CheckCircle2 size={16} />
        Verified
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-700">
      <AlertCircle size={16} />
      Not Verified
    </div>
  );
});

const SecondaryLink = memo(function SecondaryLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      <span>{children}</span>
      <ArrowRight size={16} />
    </Link>
  );
});

const AccountSecurityPanel = () => {
  const auth = useAuth();
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const isEmailVerified = useMemo(
    () => Boolean(auth.user?.emailVerified),
    [auth.user?.emailVerified],
  );

  const handleSendVerification = useCallback(async () => {
    setIsSendingVerification(true);

    try {
      const response = await auth.sendVerificationEmail();
      toast.success(
        response?.message || "Verification email sent successfully.",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to send verification email.",
      );
    } finally {
      setIsSendingVerification(false);
    }
  }, [auth]);

  const handleLogoutAll = useCallback(async () => {
    setIsLoggingOutAll(true);

    try {
      await auth.logoutAll();
      toast.success("Logged out from all devices.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to log out all devices.",
      );
    } finally {
      setIsLoggingOutAll(false);
    }
  }, [auth]);

  return (
    <section className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-transform duration-300 hover:scale-[1.03]">
            <ShieldCheck size={26} />
          </div>

          <div className="min-w-0">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Account Security
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage email verification, password access, and active sessions
              without affecting your current account behavior.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ActionCard
            icon={MailCheck}
            title="Email Verification"
            description="Keep your email verification state aligned with the account record and resend the verification email when needed."
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  {isEmailVerified
                    ? "Your email address has already been verified."
                    : "Your email address is not verified yet."}
                </p>

                <StatusBadge verified={isEmailVerified} />
              </div>

              {!isEmailVerified ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={isSendingVerification}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 sm:w-auto"
                  >
                    {isSendingVerification ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <MailCheck size={18} />
                        <span>Send Verification</span>
                      </>
                    )}
                  </Button>

                  <SecondaryLink to="/auth/resend-verification">
                    Resend by Email
                  </SecondaryLink>
                </div>
              ) : null}
            </div>
          </ActionCard>

          <ActionCard
            icon={LogOut}
            title="Session Controls"
            description="Change your password or revoke all active sessions across devices while keeping the existing logic untouched."
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Use these controls to strengthen account access and remove
                refresh-token backed sessions from other devices.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth/change-password"
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
                >
                  <ShieldCheck size={18} />
                  <span>Change Password</span>
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogoutAll}
                  disabled={isLoggingOutAll}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 sm:w-auto"
                >
                  {isLoggingOutAll ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={18} />
                      <span>Logout All Devices</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ActionCard>
        </div>
      </div>
    </section>
  );
};

export default memo(AccountSecurityPanel);
