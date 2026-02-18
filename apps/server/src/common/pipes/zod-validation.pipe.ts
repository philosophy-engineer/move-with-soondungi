import type { PipeTransform } from "@nestjs/common"
import type { z } from "zod"

import { throwBadRequest } from "../errors/error-response.js"

type ZodValidationPipeOptions = {
  message?: string
}

export class ZodValidationPipe<TSchema extends z.ZodType>
  implements PipeTransform<unknown, z.output<TSchema>>
{
  constructor(
    private readonly schema: TSchema,
    private readonly options?: ZodValidationPipeOptions
  ) {}

  transform(value: unknown): z.output<TSchema> {
    const parsed = this.schema.safeParse(value)

    if (!parsed.success) {
      throwBadRequest(this.options?.message ?? "잘못된 요청입니다.")
    }

    return parsed.data
  }
}
