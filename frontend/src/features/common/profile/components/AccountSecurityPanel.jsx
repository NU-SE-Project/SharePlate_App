import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, LogOut, MailCheck, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../../../components/common/Button";
import { useAuth } from "../../../../context/AuthContext";

const AccountSecurityPanel = () => {
  const auth = useAuth();
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handleSendVerification = async () => {
    setIsSendingVerification(true);

    try {
      const response = await auth.sendVerificationEmail();
      toast.success(
        response?.message || "Verification email sent successfully.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to send verification email.",
      );
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);

    try {
      await auth.logoutAll();
      toast.success("Logged out from all devices.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to log out all devices.",
      );
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="mt-10 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Account Security</h3>
          <p className="text-sm text-slate-500">
            Keep your session, password, and verification state aligned with the
            backend account record.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-slate-900">
            <MailCheck size={18} className="text-emerald-600" />
            <span className="font-bold">Email Verification</span>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            {auth.user?.emailVerified
              ? "Your email address is verified."
              : "Your email address is not verified yet."}
          </p>

          {auth.user?.emailVerified ? (
            <div className="inline-flex rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
              Verified
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleSendVerification}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={18} />
                    Sending...
                  </>
                ) : (
                  "Send Verification"
                )}
              </Button>
              <Link
                to="/auth/resend-verification"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Resend by Email
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-slate-900">
            <LogOut size={18} className="text-emerald-600" />
            <span className="font-bold">Session Controls</span>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Change your password or revoke all active refresh-token backed
            sessions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/auth/change-password"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Change Password
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogoutAll}
              disabled={isLoggingOutAll}
            >
              {isLoggingOutAll ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Logging out...
                </>
              ) : (
                "Logout All Devices"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurityPanel;
