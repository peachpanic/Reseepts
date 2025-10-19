import { useState } from "react";

interface UserSignUpPayload {
  email: string;
  password: string;
  full_name: string;
}
// TODO: Convert this into use mutation
const useSignUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const querySignUp = async (payload: UserSignUpPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign up");
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { querySignUp, loading, error, data };
};

export default useSignUser;
