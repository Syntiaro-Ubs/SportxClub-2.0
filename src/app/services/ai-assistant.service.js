const API_BASE = "/api/ai-assistant";

export const aiAssistantService = {
  chat: async ({ message, user }) => {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        userId: user?.id,
        email: user?.email,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "The assistant could not answer right now.");
    }
    return data.data;
  },
};
