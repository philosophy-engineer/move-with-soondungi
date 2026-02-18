import { readErrorMessage } from "@/src/shared/lib/response"

type Parser<T> = {
  parse: (input: unknown) => T
}

export async function getJson<T>(
  url: string,
  parser: Parser<T>,
  init?: Omit<RequestInit, "method">
): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    ...init,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const raw = (await response.json()) as unknown
  return parser.parse(raw)
}

export async function postJson<T>(
  url: string,
  payload: unknown,
  parser: Parser<T>,
  init?: Omit<RequestInit, "method" | "body">
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const raw = (await response.json()) as unknown
  return parser.parse(raw)
}
