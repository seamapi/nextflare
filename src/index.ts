import nextRouteMatcher from "next-route-matcher"

// Should we import this from next?
export type NextAPIFunction = (req: any, res: any) => any

const cloudflareRequestProperties = [
  "method",
  "url",
  "headers",
  "redirect",
  "fetcher",
  "signal",
  "cf",
  "clone",
]

export const nextflare = (next: NextAPIFunction) => {
  return {
    // TODO add types here
    async fetch(cfReq: any, env: any, ctx: any) {
      const req: any = {}

      // Normal object cloning doesn't work, the cloudflare request class is a
      // bit weird- trying to spread into req or even using Object.getOwnPropertyNames
      // doesn't work on cfReq
      for (const key of cloudflareRequestProperties) {
        req[key] = cfReq[key]
      }

      req.cfReq = cfReq

      req.env = env
      req.ctx = ctx
      const res: any = { statusCode: 200, headers: {} }
      res.status = (statusCode: number) => {
        res.statusCode = statusCode
        return res
      }
      res.json = (body: Object) => {
        res.body = JSON.stringify(body)
        res.headers["Content-Type"] = "application/json"
      }
      res.end = (body: string) => {
        res.body = body
      }
      if (req.headers.get("Content-Type") === "application/json") {
        try {
          req.body = await cfReq.json()
        } catch (e) {
          return new Response("Couldn't parse body as JSON", { status: 400 })
        }
      }

      const { searchParams, pathname } = new URL(req.url)

      req.query = {}
      for (const [key, value] of searchParams) req.query[key] = value

      const cloudflareResponse: Response | undefined = await next(req, res)

      // Cloudflare Response object means the handler didn't use the NextJS
      // convention, no big deal- this is sometimes important for cloudflare
      // -specific functionality for websockets
      if (cloudflareResponse && cloudflareResponse instanceof Response) {
        return cloudflareResponse
      }

      if (res.statusCode !== 200) {
        console.log(`Error [${res.statusCode}]: ${res.body}`)
      }

      return new Response(res.body, {
        status: res.statusCode,
        headers: res.headers,
      })
    },
  }
}

export const routes = (routes: {
  [key: string]:
    | Promise<{ default: NextAPIFunction } | NextAPIFunction>
    | NextAPIFunction
}) => {
  const routeMatcher = nextRouteMatcher(Object.keys(routes))

  return nextflare(async (req: any, res: any) => {
    const { searchParams, pathname } = new URL(req.url)
    const matchedRoute = routeMatcher(pathname)

    if (!matchedRoute) {
      return new Response(`unknown route: ${pathname}`, {
        status: 404,
      })
    }

    let fn = (routes as any)[matchedRoute.matchedRoute]

    fn = await fn
    if (fn.default) fn = fn.default

    req.query = { ...req.query, ...matchedRoute.routeParams }

    return fn(req, res)
  })
}

nextflare.routes = routes

export default nextflare
