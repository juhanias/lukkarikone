export interface RealizationMetadata {
  color?: string;
  hidden?: boolean;
}

export type RealizationMetadataMap = Record<string, RealizationMetadata>;

export interface EventMetadata {
  hidden?: boolean;
  color?: string;
  attachedRealizationId?: string;
}

export type EventMetadataMap = Record<string, EventMetadata>;
