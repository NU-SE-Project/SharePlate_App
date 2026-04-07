import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import heroImage from "../../../assets/auth_hero.png";

const AuthLayout = ({ children, title, subtitle }) => {
  const [typedTitle, setTypedTitle] = useState("");

  useEffect(() => {
    const fullTitle = title || "";
    setTypedTitle("");

    if (!fullTitle) {
      return undefined;
    }

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedTitle(fullTitle.slice(0, index));

      if (index >= fullTitle.length) {
        window.clearInterval(intervalId);
      }
    }, 45);

    return () => window.clearInterval(intervalId);
  }, [title]);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-900">
        <img
          src={heroImage}
          alt="SharePlate Community"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
              <Heart
                className="text-emerald-600"
                fill="currentColor"
                size={28}
              />
            </div>
            <span className="text-3xl font-bold tracking-tight">
              SharePlate
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Reducing Waste,
            <br />
            Feeding Communities.
          </h1>
          <p className="text-emerald-100 text-lg max-w-lg leading-relaxed">
            Join thousands of restaurants, food banks, and volunteers in our
            mission to ensure no good food goes to waste.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden flex items-center gap-2 justify-center">
            <Heart className="text-emerald-600" fill="currentColor" size={24} />
            <span className="text-2xl font-bold text-slate-800">
              SharePlate
            </span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {typedTitle.includes("SharePlate") ? (
                <>
                  {typedTitle.split("SharePlate")[0]}
                  <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent tracking-wide">
                    SharePlate
                  </span>
                  {typedTitle.split("SharePlate")[1]}
                </>
              ) : (
                typedTitle
              )}

              {typedTitle.length < (title || "").length && (
                <span className="inline-block w-0.5 h-8 align-[-0.25rem] bg-slate-900 ml-1 animate-pulse" />
              )}
            </h2>
            {subtitle && <p className="text-slate-500">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
