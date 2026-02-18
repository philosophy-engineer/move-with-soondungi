import { readErrorMessage } from "@/src/shared/lib/response"
import type { z } from "zod"

const DEV_DEFAULT_API_BASE_URL = "http://localhost:4000"

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (configured) {
    return configured
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "운영 환경에서는 NEXT_PUBLIC_API_BASE_URL 환경변수가 필수입니다."
    )
  }

  return DEV_DEFAULT_API_BASE_URL
}

function resolveApiUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  const base = getApiBaseUrl().replace(/\/+$/, "")
  const path = url.startsWith("/") ? url : `/${url}`
  return `${base}${path}`
}

export async function getJson<TSchema extends z.ZodType>(
  url: string,
  parser: TSchema,
  init?: Omit<RequestInit, "method">
): Promise<z.output<TSchema>> {
  const response = await fetch(resolveApiUrl(url), {
    method: "GET",
    ...init,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const raw = (await response.json()) as unknown
  return parser.parse(raw)
}

export async function postJson<TSchema extends z.ZodType>(
  url: string,
  payload: unknown,
  parser: TSchema,
  init?: Omit<RequestInit, "method" | "body">
): Promise<z.output<TSchema>> {
  const response = await fetch(resolveApiUrl(url), {
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
