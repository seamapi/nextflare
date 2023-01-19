import test from "ava"
import nextflare from "../index"

test("nextflare.routes works", async (t) => {
  t.plan(1)
  const cloudflareObject = nextflare.routes({
    "/api/hello": async (req, res) => {
      t.is(await req.json(), {
        hello: "world",
      })
    },
  })

  const req = new Request("http://example.com/api/hello")

  await cloudflareObject.fetch(req, {}, {})
})
