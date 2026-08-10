import { r as __exportAll } from "../_runtime.mjs";
import { n as createMiddleware } from "./server-BENmE4dw.mjs";
import { t as renderErrorPage } from "./ssr.mjs";
import { a as initializeApp, i as getApps, n as getAuth, r as cert, t as getFirestore } from "../_libs/firebase-admin+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-EDSgh8Q8.js
var start_EDSgh8Q8_exports = /* @__PURE__ */ __exportAll({ startInstance: () => startInstance });
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
function normalizeFirebasePrivateKey(key) {
	let normalized = key.trim();
	if (normalized.startsWith("\"") && normalized.endsWith("\"")) normalized = normalized.slice(1, -1);
	normalized = normalized.replace(/\\n/g, "\n");
	normalized = normalized.trim();
	return normalized;
}
function ensureAdminInitialized() {
	const projectId = process.env.FIREBASE_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
	let privateKey = process.env.FIREBASE_PRIVATE_KEY;
	if (!projectId || !clientEmail || !privateKey) return null;
	if (!getApps().length) {
		privateKey = normalizeFirebasePrivateKey(privateKey);
		const preview = `${privateKey.slice(0, 30)}...${privateKey.slice(-30)}`;
		console.log("Firebase private key preview:", "length=", privateKey.length, "start=", preview.slice(0, 30), "end=", preview.slice(-30));
		initializeApp({
			credential: cert({
				projectId,
				clientEmail,
				privateKey
			}),
			projectId
		});
	}
	return {
		auth: getAuth(),
		db: getFirestore()
	};
}
function getAdminFirestore() {
	const admin = ensureAdminInitialized();
	if (!admin) throw new Error("Firebase Admin SDK not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to enable server-side Firestore access.");
	return admin.db;
}
async function verifyFirebaseIdToken(idToken) {
	const admin = ensureAdminInitialized();
	if (!admin) throw new Error("Firebase Admin SDK not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to enable server-side token verification.");
	return admin.auth.verifyIdToken(idToken);
}
async function getUserProfileStatus(userId) {
	const docSnap = await getAdminFirestore().doc(`profiles/${userId}`).get();
	if (!docSnap.exists) return null;
	return docSnap.data()?.status ?? null;
}
var firebaseAuthMiddleware = createMiddleware().server(async ({ request, next }) => {
	const authHeader = request.headers.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) return await next();
	const idToken = authHeader.slice(7);
	try {
		const status = await getUserProfileStatus((await verifyFirebaseIdToken(idToken)).uid);
		if (status === "pending") return new Response(JSON.stringify({ error: "Account pending approval." }), {
			status: 403,
			headers: { "content-type": "application/json" }
		});
		if (status === "rejected") return new Response(JSON.stringify({ error: "Account rejected." }), {
			status: 403,
			headers: { "content-type": "application/json" }
		});
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
export { startInstance, start_EDSgh8Q8_exports as t };
