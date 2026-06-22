import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createClient() {
  return {
    auth: {
      async getUser() {
        try {
          const session = await auth.api.getSession({ headers: await headers() });
          return {
            data: { user: session?.user || null },
            error: null,
          };
        } catch (error) {
          return {
            data: { user: null },
            error: error instanceof Error ? error : new Error("Authentication failed"),
          };
        }
      },
    },
  };
}
