/**
 * YOUR SITE'S LOGIN, handed to the assistant.
 *
 * The embed never signs anyone in. Your website already has a session, and this file
 * forwards it: publish a getter on `window.unoverseConfig` and the embed calls it before
 * every request, so a refreshed token is picked up with no re-registration.
 *
 * REPLACE THE BODY OF `token()` with however your site gets its access token. What is
 * here is an OIDC example, because that is the common case; it is not a requirement.
 *
 * Delete this file entirely if your app is public. Visitors then get a persisted guest
 * identity and no login at all, and the assistant still works.
 */
import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const issuer = import.meta.env.VITE_AUTH_ISSUER;
const clientId = import.meta.env.VITE_AUTH_CLIENT_ID;

// Nothing configured means anonymous, which is the right default: a public app runs, and
// a secured one asks the visitor to sign in rather than failing silently.
const manager =
  issuer && clientId
    ? new UserManager({
        authority: issuer,
        client_id: clientId,
        redirect_uri: window.location.origin,
        scope: "openid profile email",
        // Auth0 and similar need `audience` to mint an API access token (a JWT) rather
        // than an opaque one. Your universe verifies that token, so it must be a JWT.
        extraQueryParams: { audience: import.meta.env.VITE_AUTH_AUDIENCE || "gravity-api" },
        userStore: new WebStorageStateStore({ store: window.sessionStorage }),
        automaticSilentRenew: true,
      })
    : null;

window.unoverseConfig = {
  /**
   * Return your current access token, or null for anonymous. May return a promise.
   * Called per request, so never cache the result here.
   */
  token: async () => {
    if (!manager) return null;
    try {
      const user = await manager.getUser();
      // An expired session is no session. Handing over a stale token fails at the
      // universe with a 401 that reads as a platform fault rather than a signed-out
      // visitor.
      return user && !user.expired ? user.access_token : null;
    } catch {
      return null;
    }
  },
};

// Your site owns signing in. This example exposes it so the page can offer a button;
// most sites already have their own and delete this.
window.signIn = () => manager?.signinRedirect();
window.signOut = () => manager?.signoutRedirect();
