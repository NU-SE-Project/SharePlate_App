import React, { useEffect, useRef, useState } from "react";

const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript() {
  const existingScript = document.querySelector(
    `script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`,
  );

  if (existingScript) {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

const GoogleAuthButton = ({
  text = "Continue with Google",
  onCredential,
  onError,
  disabled = false,
  className = "",
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);
  const buttonContainerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      onErrorRef.current?.(
        "Google sign-in is not configured for this environment.",
      );
      return () => {
        isMountedRef.current = false;
      };
    }

    loadGoogleScript()
      .then(() => {
        if (!isMountedRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) {
              onErrorRef.current?.(
                "Google sign-in did not return a credential.",
              );
              return;
            }

            setIsLoading(true);

            try {
              await onCredentialRef.current?.(response.credential);
            } catch (error) {
              onErrorRef.current?.(
                error?.response?.data?.message ||
                  error?.message ||
                  "Google sign-in failed.",
              );
            } finally {
              if (isMountedRef.current) {
                setIsLoading(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonContainerRef.current) {
          buttonContainerRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: Math.min(buttonContainerRef.current.offsetWidth || 380, 380),
            text:
              text === "Sign up with Google" ? "signup_with" : "signin_with",
          });
        }

        setIsReady(true);
      })
      .catch((error) => {
        onErrorRef.current?.(error.message || "Google sign-in is unavailable.");
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [text]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-center text-sm font-semibold text-slate-500">
        {isLoading ? "Connecting to Google..." : "Or continue with Google"}
      </div>
      <div
        ref={buttonContainerRef}
        className={`min-h-[44px] ${disabled || !isReady ? "pointer-events-none opacity-60" : ""}`}
      />
    </div>
  );
};

export default GoogleAuthButton;
