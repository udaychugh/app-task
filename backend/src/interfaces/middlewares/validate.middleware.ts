import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { errorResponse } from "../../shared/utils/response.util";

type ParseTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ParseTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // Zod v4: .errors was removed, use .issues instead
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      errorResponse(res, "Validation failed", 422, errors);
      return;
    }

    // Replace with parsed/coerced values
    Object.assign(req[target], result.data);
    next();
  };
}
