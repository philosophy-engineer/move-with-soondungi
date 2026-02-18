export async function waitMockDelay(minMs = 200, maxMs = 400) {
  const delayMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  await new Promise((resolve) => setTimeout(resolve, delayMs))
}
