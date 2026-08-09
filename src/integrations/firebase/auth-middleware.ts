import { createMiddleware } from "@tanstack/react-start";
import { verifyFirebaseIdToken, getUserProfileStatus } from "./admin.server";

export const firebaseAuthMiddleware = createMiddleware().server(async ({ request, next }) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return await next();
  }

  const idToken = authHeader.slice(7);
  try {
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const status = await getUserProfileStatus(decodedToken.uid);

    if (status === "pending") {
      return new Response(JSON.stringify({ error: "Account pending approval." }), { status: 403, headers: { "content-type": "application/json" } });
    }

    if (status === "rejected") {
      return new Response(JSON.stringify({ error: "Account rejected." }), { status: 403, headers: { "content-type": "application/json" } });
    }

    return await next();
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }
});
