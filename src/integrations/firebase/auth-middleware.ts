import { createMiddleware } from "@tanstack/react-start";
import { verifyFirebaseIdToken } from "./admin.server";

export const firebaseAuthMiddleware = createMiddleware().server(async ({ request, next }) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return await next();
  }

  const idToken = authHeader.slice(7);
  try {
    await verifyFirebaseIdToken(idToken);
    return await next();
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }
});
