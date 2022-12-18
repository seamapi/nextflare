import test from "ava"
import getTestServer from "ava-wrangler-fixture"

test("GET /api/health", async (t) => {
  const { axios, serverUrl } = await getTestServer(t)
  return
  console.log({serverUrl})

  const health_res = await axios.get("/health")

  t.is(health_res.status, 200)
})
