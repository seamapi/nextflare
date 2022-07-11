# Nextflare - NextJS Shim for Cloudflare Workers

This module converts the conventional Cloudflare Worker interface into a mostly
NextJS compatible api endpoint.

More specifically it converts this:

```ts
export default {
  async fetch(
    req: CloudflareRequest,
    env: CloudflareEnv,
    ctx: CloudflareExecutionContext
  ): Promise<Response> {
    return new Response("Hello World!", { status: 200 })
  },
}
```

Into this:

```ts
import nextflare from "nextflare"

export default nextflare(async (req, res) => {
  res.status(200).end("Hello World!")
})
```

The full list of shims are:

- Convert `.headers` into an object (no need for `.headers.get("...")`)
- Add `res.status`, `res.end`, `res.json` etc.
- Add `req.query` with GET Parameters
- Add `req.env` to support accessing the cloudflare environment
- Add `req.ctx` to support accessing the cloudflare execution context
- Automatically parse JSON body into `req.body`

Some additional features are included:

- `nextflare.routes` for clean routing
- Returning a Response overrides anything passed into the `res` object, allowing
  websocket handling in a cloudflare-like way

- [ ] Support NextJS-style slugs
- [ ] Support filesystem routing

> Are we missing a NextJS feature? PRs welcome!

### nextflare.routes

With `nextflare.routes` you can handle multiple routes instead of introducing
a custom router.

```ts
import nextflare from "nextflare"

export default nextflare.routes({
  "/api/health": import("./api/health"),
  "/api/accounts/create": import("./api/accounts/create"),
})
```

You can also explicitly specify the route functions:

```ts
import nextflare from "nextflare"
import healthEndpoint from "./api/health"
import createAccountEndpoint from "./api/account"

export default nextflare.routes({
  "/api/health": healthEndpoint,
  "/api/accounts/create": createAccountEndpoint,
})
```

### NextJS File Routing

One of NextJS's sweetest features is it's file routing, unfortunately we don't
currently support this- if you know a clean way to implement it [please let us
know](#)
