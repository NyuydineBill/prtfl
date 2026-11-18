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
import {
  GitAreasFigure,
  GitConflictFigure,
  GitMergeRebaseFigure,
  GitPrMergeFigure,
  GitQuickReferenceFigure,
  GitUndoFigure,
  GitWorkflowsFigure,
} from "./git";
import {
  SdCachingFigure,
  SdConsistencyFigure,
  SdDesignLoopFigure,
  SdLatencyFigure,
  SdOutboxFigure,
  SdQuickReferenceFigure,
  SdReplicationLagFigure,
  SdRetriesFigure,
  SdScalingPathFigure,
  SdUrlShortenerFigure,
} from "./system-design";
import {
  AiEvalLoopFigure,
  AiFailuresFigure,
  AiLatencyFigure,
  AiQuickReferenceFigure,
  AiRequestPathFigure,
  AiRolloutFigure,
  AiServiceLayerFigure,
  AiTrustBoundaryFigure,
} from "./ai";
import {
  DjLayersFigure,
  DjLostUpdateFigure,
  DjMigrationsFigure,
  DjNPlusOneFigure,
  DjPermissionsFigure,
  DjQuickReferenceFigure,
  DjRequestCycleFigure,
} from "./django";

/**
 * Figures referenced from Markdown with a fenced block:
 *
 *   ```figure
 *   http-lifecycle
 *   ```
 */
export const figureRegistry: Record<string, ComponentType<{ number?: number }>> = {
  // The Practical REST API Handbook
  "http-lifecycle": HttpLifecycleFigure,
  "http-methods": HttpMethodsFigure,
  "status-codes": StatusCodesFigure,
  "auth-flow": AuthFlowFigure,
  pagination: PaginationFigure,
  "error-anatomy": ErrorAnatomyFigure,
  versioning: VersioningFigure,
  "rest-quick-reference": RestQuickReferenceFigure,

  // Git & GitHub: The Developer's Field Guide
  "git-areas": GitAreasFigure,
  "git-merge-rebase": GitMergeRebaseFigure,
  "git-pr-merge": GitPrMergeFigure,
  "git-conflict": GitConflictFigure,
  "git-undo": GitUndoFigure,
  "git-workflows": GitWorkflowsFigure,
  "git-quick-reference": GitQuickReferenceFigure,

  // System Design Fundamentals
  "sd-design-loop": SdDesignLoopFigure,
  "sd-latency": SdLatencyFigure,
  "sd-scaling-path": SdScalingPathFigure,
  "sd-caching": SdCachingFigure,
  "sd-replication-lag": SdReplicationLagFigure,
  "sd-outbox": SdOutboxFigure,
  "sd-retries": SdRetriesFigure,
  "sd-consistency": SdConsistencyFigure,
  "sd-url-shortener": SdUrlShortenerFigure,
  "sd-quick-reference": SdQuickReferenceFigure,

  // From AI Prototype to Production
  "ai-service-layer": AiServiceLayerFigure,
  "ai-request-path": AiRequestPathFigure,
  "ai-eval-loop": AiEvalLoopFigure,
  "ai-latency": AiLatencyFigure,
  "ai-failures": AiFailuresFigure,
  "ai-trust-boundary": AiTrustBoundaryFigure,
  "ai-rollout": AiRolloutFigure,
  "ai-quick-reference": AiQuickReferenceFigure,

  // Django Developer's Practical Reference
  "dj-request-cycle": DjRequestCycleFigure,
  "dj-layers": DjLayersFigure,
  "dj-n-plus-one": DjNPlusOneFigure,
  "dj-lost-update": DjLostUpdateFigure,
  "dj-permissions": DjPermissionsFigure,
  "dj-migrations": DjMigrationsFigure,
  "dj-quick-reference": DjQuickReferenceFigure,
};

/** Figures that are reference sheets rather than numbered illustrations. */
export const unnumberedFigures = new Set(
  Object.keys(figureRegistry).filter((id) => id.endsWith("quick-reference")),
);
