import { r as __exportAll } from "../_runtime.mjs";
import { n as createMiddleware } from "./server-IPJjiJ69.mjs";
import { t as renderErrorPage } from "./ssr.mjs";
import { i as initializeApp, n as cert, r as getApps, t as getAuth } from "../_libs/firebase-admin+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-CocjDe0W.js
var start_CocjDe0W_exports = /* @__PURE__ */ __exportAll({ startInstance: () => startInstance });
function dedupeSerializationAdapters(deduped, serializationAdapters) {
	for (let i = 0, len = serializationAdapters.length; i < len; i++) {
		const current = serializationAdapters[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
		}
	}
}
var createStart = (getOptions) => {
	return {
		getOptions: async () => {
			const options = await getOptions();
			if (options.serializationAdapters) {
				const deduped = /* @__PURE__ */ new Set();
				dedupeSerializationAdapters(deduped, options.serializationAdapters);
				options.serializationAdapters = Array.from(deduped);
			}
			return options;
		},
		createMiddleware
	};
};
var projectId = process.env.FIREBASE_PROJECT_ID;
var clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
var privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (!projectId || !clientEmail || !privateKey) throw new Error("Missing Firebase admin environment variables. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
privateKey = privateKey.replace(/\\n/g, "\n");
if (!getApps().length) initializeApp({
	credential: cert({
		projectId,
		clientEmail,
		privateKey
	}),
	projectId
});
var adminAuth = getAuth();
async function verifyFirebaseIdToken(idToken) {
	return adminAuth.verifyIdToken(idToken);
}
var firebaseAuthMiddleware = createMiddleware().server(async ({ request, next }) => {
	const authHeader = request.headers.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) return await next();
	const idToken = authHeader.slice(7);
	try {
		await verifyFirebaseIdToken(idToken);
		return await next();
	} catch (error) {
		return new Response("Unauthorized", { status: 401 });
	}
});
var errorMiddleware = createMiddleware().server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (error != null && typeof error === "object" && "statusCode" in error) throw error;
		console.error(error);
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
});
var startInstance = createStart(() => ({
	functionMiddleware: [],
	requestMiddleware: [firebaseAuthMiddleware, errorMiddleware]
}));
//#endregion
export { startInstance, start_CocjDe0W_exports as t };
