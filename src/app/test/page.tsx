"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";

const page = () => {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });

  return (
    <div>
      <form
        className="flex flex-col"
        onSubmit={(e: any) => {
          e.preventDefault();
          signIn("credentials", {
            email: formdata.email,
            password: formdata.password,
            callbackUrl: window.location.href, // Redirect to the current page
          });
        }}
        action=""
      >
        <input
          type="text"
          value={formdata.email}
          onChange={(e) => setFormdata({ ...formdata, email: e.target.value })}
        />
        <input
          type="text"
          value={formdata.password}
          onChange={(e) =>
            setFormdata({ ...formdata, password: e.target.value })
          }
        />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default page;
