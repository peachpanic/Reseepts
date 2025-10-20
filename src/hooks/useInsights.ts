import { useQuery } from "@tanstack/react-query";

// Types
interface InsightsData {
  insights_summary: string;
  practical_tips: string[];
}

interface ParsedInsightsResponse {
  insights: InsightsData;
  cached: boolean;
  cached_at?: string;
  generated_at?: string;
}

interface RawInsightsResponse {
  insights: string; // This is a stringified JSON
  cached: boolean;
  cached_at?: string;
  generated_at?: string;
}

// Parser function
const parseInsightsResponse = (
  response: RawInsightsResponse
): ParsedInsightsResponse => {
  try {
    // If insights is a string, parse it to get the actual object
    const parsedInsights =
      typeof response.insights === "string"
        ? JSON.parse(response.insights)
        : response.insights;

    return {
      insights: parsedInsights,
      cached: response.cached,
      cached_at: response.cached_at,
      generated_at: response.generated_at,
    };
  } catch (error) {
    console.error("Failed to parse insights response:", error);
    throw new Error("Invalid insights response format");
  }
};

// Hook
export const useInsights = (userId: string | null | undefined) => {
  return useQuery<ParsedInsightsResponse>({
    queryKey: ["insights", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const data = await response.json();
      return parseInsightsResponse(data);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
