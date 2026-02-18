import { readErrorMessage } from "@/src/shared/lib/response"
import type { output, ZodTypeAny } from "zod"

export async function getJson<TSchema extends ZodTypeAny>(
  url: string,
  parser: TSchema,
  init?: Omit<RequestInit, "method">
): Promise<output<TSchema>> {
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

export async function postJson<TSchema extends ZodTypeAny>(
  url: string,
  payload: unknown,
  parser: TSchema,
  init?: Omit<RequestInit, "method" | "body">
): Promise<output<TSchema>> {
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
