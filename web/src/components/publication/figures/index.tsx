import type { ComponentType } from "react";
import {
  AuthFlowFigure,
  ErrorAnatomyFigure,
  HttpLifecycleFigure,
  HttpMethodsFigure,
  PaginationFigure,
  RestQuickReferenceFigure,
  StatusCodesFigure,
  VersioningFigure,
} from "./rest";

/**
 * Figures referenced from Markdown with a fenced block:
 *
 *   ```figure
 *   http-lifecycle
 *   ```
 */
export const figureRegistry: Record<string, ComponentType<{ number?: number }>> = {
  "http-lifecycle": HttpLifecycleFigure,
  "http-methods": HttpMethodsFigure,
  "status-codes": StatusCodesFigure,
  "auth-flow": AuthFlowFigure,
  pagination: PaginationFigure,
  "error-anatomy": ErrorAnatomyFigure,
  versioning: VersioningFigure,
  "rest-quick-reference": RestQuickReferenceFigure,
};

/** Figures that are reference sheets rather than numbered illustrations. */
export const unnumberedFigures = new Set(["rest-quick-reference"]);
