import { config } from "@/config";
import { type MiddlewareHandler } from "hono";

/**
 * API Key 鉴权中间件
 */
export const authMiddleware: MiddlewareHandler = (c, next) => {
  const clientKey = c.req.header("x-api-key");

  if (!clientKey) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing X-API-Key header",
        },
      },
      401,
    );
  }

  if (clientKey !== config.api.key) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Invalid X-API-Key",
        },
      },
      403,
    );
  }

  return next();
};
