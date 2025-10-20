"use client";

import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

const GoogleIcon = () => (
  <Image
    height={24}
    width={24}
    src={
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
    }
    alt="Google"
  />
);

const GoogleButton = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/home" });
  };

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GoogleIcon />
          <span className="text-sm font-medium">{session?.user?.email}</span>
        </div>
        <button
          className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="cursor-pointer flex items-center justify-center gap-3 px-8 py-3 bg-white border-2 border-gray-300 rounded-full font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="animate-spin">
            <GoogleIcon />
          </div>
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span>Sign in with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleButton;
