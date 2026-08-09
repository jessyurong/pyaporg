import { auth } from "./client";

export async function attachFirebaseAuthToken(headers = new Headers()) {
  const currentUser = auth.currentUser;
  if (!currentUser) return headers;
  const token = await currentUser.getIdToken();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}
