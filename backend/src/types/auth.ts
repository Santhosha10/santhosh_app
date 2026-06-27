import { Request } from "express";

export type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    sessionId: string;
  };
};
