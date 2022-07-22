import test from "ava"
import nextflare from "../index"

test("nextflare.routes works", async (t) => {
  t.plan(1)
  const cloudflareObject = nextflare.routes({
    "/api/items/[item_name]": (req, res) => {
      t.is(req.query.item_name, "someitem")
    },
  })

  await cloudflareObject.fetch(
    { url: "http://example.com/api/items/someitem", headers: { get() {} } },
    {},
    {}
  )
})
