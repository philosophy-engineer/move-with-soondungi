import { BadRequestException, NotFoundException } from "@nestjs/common"
import { errorResponseSchema } from "@workspace/shared/common"

export function toErrorResponse(message: string) {
  return errorResponseSchema.parse({ message })
}

export function throwBadRequest(message: string): never {
  throw new BadRequestException(toErrorResponse(message))
}

export function throwNotFound(message: string): never {
  throw new NotFoundException(toErrorResponse(message))
}
