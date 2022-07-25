import test from "ava"
import nextflare from "../index"

test("nextflare.routes works", async (t) => {
  t.plan(1)
  const cloudflareObject = nextflare.routes({
    "/api/items/[item_name]": (req, res) => {
      t.is(req.query.item_name, "someitem")
    },
  })

  const req = new Request("http://example.com/api/items/someitem")

  await cloudflareObject.fetch(req, {}, {})
})
