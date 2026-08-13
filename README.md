# unoverse client

A starting point for putting an unoverse assistant on your website.

There is very little here, because there is very little to do. Your universe serves the
assistant itself at `<universe>/embed.js`, so this project builds nothing: it is one fake
web page showing where the tag goes, and one file showing how to hand it your login.

```bash
npm create unoverse@latest      # choose Client
cd <your-folder>
npm install
cp .env.example .env            # set VITE_UNOVERSE_URL and VITE_UNOVERSE_APP
npm run dev                     # http://localhost:3010
```

Full platform documentation: **[docs.unoverse.ai](https://docs.unoverse.ai)**.

The page is Northwind Institute, a company that does not exist. It stands in for the
website you already have, so you can see the assistant in place rather than on a blank
page. Delete all of it and keep the two script tags.

## The whole install

```html
<script type="module" src="/src/host.js"></script>
<script async src="https://api.your-domain.com/embed.js" data-app="your-org/your-app"></script>
```

The second tag is the assistant. The first is your login, and you delete it if your app
is public.

Nothing else is configured. The embed works out where your universe is from its own
`src`, and asks the universe for everything else at runtime.

## What happens, and when

**On page load** the file is downloaded, reads its own tag, and draws a launcher. **No
request reaches your universe.** A visitor who never clicks costs you nothing.

**On the first click** it asks your universe whether this app needs a login, gets a token
from your page or mints a guest identity, reads the app over MCP, and puts it in an
iframe. From then on it only relays: the app says how wide it wants to be, and the drawer
obeys.

## Files

| Path | What |
|---|---|
| `index.html` | the fake page, and the two tags to copy |
| `src/host.js` | publishes the token getter the embed reads |
| `.env.example` | every setting, with defaults |
| `vite.config.js` | a dev server, and the two placeholder substitutions |

---

# Reference

## Script tag attributes

Only `data-app` is required.

| Attribute | Default | What it does |
|---|---|---|
| `data-app` | none, **required** | Which app to load, always `<org>/<app>`. The one thing that differs between two sites on the same universe. |
| `data-icon` | a neutral chat glyph | A URL for the launcher icon. Serve it from your own domain. |
| `data-label` | `"Open the assistant"` | The launcher's accessible name, and its tooltip. |
| `data-color` | `#111827` | The launcher's background colour, any CSS colour. |
| `data-side` | `right` | `left` or `right`: which edge the drawer opens from, and which corner the launcher sits in. |
| `data-chrome` | drawn | `none` draws no launcher at all. You draw your own and call `unoverse.open()`. |
| `data-login-url` | none | Your sign-in page. When a secured app meets a visitor with no session, the drawer shows a Sign in button pointing here. `{url}` in it becomes the current page, encoded, so your login can bounce back. |
| `data-surface` | `unoverse_assistant` | Names this host in analytics. Leave it alone unless you have been told otherwise. |
| `data-server` | the script's own origin | Only if you re-host `embed.js` on your own CDN, which breaks the derivation. Almost nobody needs this. |

**The drawer's width is not here.** The app decides how wide it is and tells the drawer,
so the same app is the right size on every site that embeds it.

## Your login

Publish a getter **before** the embed tag:

```html
<script>
  window.unoverseConfig = { token: () => myApp.getAccessToken() }
</script>
<script async src="https://api.your-domain.com/embed.js" data-app="your-org/your-app"></script>
```

| | |
|---|---|
| Called | Before every request, so a refreshed token is picked up with no re-registration |
| May return | A string, `null`, or a promise of either |
| `null` means | Anonymous. A public app runs; a secured one asks the visitor to sign in |
| Declared where | **Before** the tag. The tag is `async`, so a script after it may run second |

`src/host.js` is a working OIDC example. Replace the body of `token()` with however your
site gets its token, or delete the file if your app is public.

When the visitor has no session and the app needs one, the drawer offers your own login:

```html
<script async src="…/embed.js" data-app="your-org/your-app"
        data-login-url="/login?return={url}"></script>
```

`{url}` becomes the page they were on, encoded. No attribute means the drawer says
"Please sign in to continue" and stops, which is honest but a dead end — name your
login page.

**Your universe must trust your identity provider.** It verifies tokens against one
configured issuer and audience, so those must match the ones your site signs in with.
Your provider also has to put `email` and `roles` on the **access token**, not only on the
ID token. If roles work and email silently does not, that is the reason.

## Controlling it from your own page

`window.unoverse` exists once the file has run, which is long before anyone can click.

| Call | What it does |
|---|---|
| `unoverse.open()` | Opens the drawer. Mounts the app on the first call. |
| `unoverse.close()` | Closes it, and tears the app down once the animation finishes. |
| `unoverse.newConversation()` | Closes it and starts a fresh thread next time. |

With `data-chrome="none"` these are the only way in, which is the point: your site already
has buttons that match your site.

## Public or signed-in

You do not choose this here. It is the trigger's **Run Authorization** toggle on the
Canvas, and the embed asks your universe which it is. Flipping the toggle is the whole
configuration.

| | What a visitor gets |
|---|---|
| Public app | A `guest-` identity, minted once and kept in their browser. No login. |
| Secured app | Whatever your `token()` returns. Without one, they are asked to sign in. |

## Identity in the browser

Two ids, both in `localStorage`, neither a cookie. Nothing here touches your consent
banner.

| | Lives | For |
|---|---|---|
| Conversation | `unoverse:conversation` | 30 minutes since last use. A visitor moving between your pages keeps their thread; tomorrow they start fresh. |
| Guest | `unoverse:guestId` | Indefinitely, so a returning anonymous visitor is recognised. |

The 30 minutes matches how long your universe keeps the agent's memory of a thread.
Holding it longer would return a visitor to a conversation nothing remembers.

## Going live

- Set `VITE_UNOVERSE_URL` and `VITE_UNOVERSE_APP` in your build, or paste the real values
  straight into your own HTML. Unset, they fall back to `http://localhost:4105`.
- Your site's origin has to be in your identity provider's callback, logout and web origin
  lists, because the login happens on your domain.
- Everything is cross-origin by definition: the assistant's page is yours and the API is
  your universe's.

## Analytics

Events reach whatever analytics tag your page already carries, so they inherit your
consent state and your configuration. Nothing is sent unless your universe has been given
a destination, and nothing is configured here.

---

## Where to go next

| | |
|---|---|
| [Onboarding](https://docs.unoverse.ai/onboarding/how-it-fits-together) | How the pieces fit: Studio, the platform, the CLI, your first agent |
| [Design](https://docs.unoverse.ai/design/overview) | Building the assistant itself: components and templates as data, no React and no CSS |
| [Architecture](https://docs.unoverse.ai/architecture/overview) | Running your own universe: deployment, Terraform, security |
| [Nodes](https://docs.unoverse.ai/nodes/overview) | Adding capabilities: manifests, credentials, packaging |

## Common questions

**The launcher appears but nothing happens when I click it.**
Check the browser console for the request to `<universe>/embed.js` and then to
`/.well-known/unoverse-app/<org>/<app>`. A 404 on the second means `data-app` names an app
that universe does not have.

**It says the app needs a login and I am signed in.**
Your `token()` is returning null, or the token is not one your universe accepts. It must
be an access token (a JWT) from the issuer and audience your universe is configured with,
not an ID token and not an opaque token.

**Roles work but nothing that needs an email does.**
Your identity provider is not putting `email` on the access token. It is a profile claim
and usually rides only the ID token; it has to be added explicitly, and most providers
namespace it (`https://your-domain/email`).

**Nothing loads from a page served over `file://` or plain HTTP on a LAN address.**
Identity needs a secure context. Use `npm run dev`, or HTTPS.

**I want it on every page of my site.**
Put both tags in your shared layout. The conversation follows the visitor between pages
for 30 minutes, so it behaves as one continuous chat.
