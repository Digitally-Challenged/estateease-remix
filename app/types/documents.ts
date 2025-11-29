/**
 * Type definitions for legal documents in estate planning
 * This includes wills, powers of attorney, and gift tracking
 */

/**
 * Status types for will documents
 * @enum {string}
 * @description Represents the current state of a will document
 */
export enum WillStatus {
  /** Initial state - document is being prepared */
  DRAFT = "DRAFT",
  /** Document has been signed by testator and witnesses */
  SIGNED = "SIGNED",
  /** Document has been notarized and is legally binding */
  EXECUTED = "EXECUTED",
  /** Document has been revoked and is no longer valid */
  REVOKED = "REVOKED",
}

/**
 * Types of powers of attorney
 * @enum {string}
 * @description Different scopes of authority that can be granted
 */
export enum PowerOfAttorneyType {
  /** Authority over financial matters and transactions */
  FINANCIAL = "FINANCIAL",
  /** Authority over medical decisions and healthcare */
  HEALTHCARE = "HEALTHCARE",
  /** Broad authority covering most decisions */
  GENERAL = "GENERAL",
  /** Authority restricted to specific actions or time periods */
  LIMITED = "LIMITED",
}

/**
 * Status types for power of attorney documents
 * @enum {string}
 * @description Current state of a POA document
 */
export enum PowerOfAttorneyStatus {
  /** Document is being prepared */
  DRAFT = "DRAFT",
  /** Document is signed and currently in effect */
  ACTIVE = "ACTIVE",
  /** Document has been revoked by the principal */
  REVOKED = "REVOKED",
  /** Document has passed its termination date */
  EXPIRED = "EXPIRED",
}

/**
 * Types of gifts for tax tracking
 * @enum {string}
 * @description Categories of gifts for annual exclusion and lifetime exemption tracking
 */
export enum GiftType {
  /** Cash or cash equivalent gifts */
  CASH = "CASH",
  /** Real estate or personal property */
  PROPERTY = "PROPERTY",
  /** Stocks, bonds, or other securities */
  STOCK = "STOCK",
  /** Contributions to trusts */
  TRUST_CONTRIBUTION = "TRUST_CONTRIBUTION",
  /** Other types of gifts */
  OTHER = "OTHER",
}

/**
 * Generation assignment for GST tax purposes
 * @enum {string}
 * @description Determines if generation-skipping transfer tax applies
 */
export enum GenerationAssignment {
  /** Grandchildren and below, subject to GST tax */
  SKIP_PERSON = "SKIP_PERSON",
  /** Children and same generation, not subject to GST tax */
  NON_SKIP_PERSON = "NON_SKIP_PERSON",
}

/**
 * Guardian nomination for minor children
 * @interface GuardianNomination
 */
export interface GuardianNomination {
  /** Primary guardian choice */
  primary: string;
  /** Alternate guardian if primary is unavailable */
  alternate?: string;
  /** Additional notes or conditions */
  notes?: string;
}

/**
 * Will document type definition
 * @interface Will
 * @description Represents a last will and testament document
 */
export interface Will {
  /** Unique identifier */
  id: string;
  /** User who owns this will */
  userId: string;
  /** Display name for the document */
  documentName: string;
  /** Full legal name of the person making the will */
  testatorName: string;
  /** Date the will was created */
  dateCreated: string;
  /** Date the will was signed (null if not yet signed) */
  dateSigned: string | null;
  /** Current status of the will */
  status: WillStatus;
  /** Primary executor/personal representative */
  executorPrimary: string | null;
  /** Backup executor if primary cannot serve */
  executorSecondary: string | null;
  /** First witness name */
  witness1Name: string | null;
  /** Second witness name */
  witness2Name: string | null;
  /** Notary public name */
  notaryName: string | null;
  /** State where notarized */
  notaryState: string | null;
  /** Specific gifts to individuals or organizations */
  specificBequests: string | null;
  /** Distribution of remaining assets */
  residuaryClause: string | null;
  /** Guardian nominations for minor children (JSON string) */
  guardianNominations: string | null;
  /** Instructions for funeral/burial */
  funeralWishes: string | null;
  /** Additional provisions or instructions */
  otherProvisions: string | null;
  /** Whether this will revokes all prior wills */
  revokesPrior: boolean;
  /** Number of codicils (amendments) */
  codicilCount: number;
  /** Attorney who prepared the will */
  attorneyName: string | null;
  /** Law firm that prepared the will */
  lawFirm: string | null;
  /** Additional notes or comments */
  notes: string | null;
  /** Whether the record is active */
  isActive: boolean;
  /** Timestamp when created */
  createdAt: string;
  /** Timestamp when last updated */
  updatedAt: string;
}

/**
 * Power of Attorney document type definition
 * @interface PowerOfAttorney
 * @description Legal document granting authority to act on behalf of another
 */
export interface PowerOfAttorney {
  /** Unique identifier */
  id: string;
  /** User who owns this POA */
  userId: string;
  /** Display name for the document */
  documentName: string;
  /** Type of POA */
  type: PowerOfAttorneyType;
  /** Person granting the power (grantor) */
  principalName: string;
  /** Primary agent/attorney-in-fact */
  agentPrimary: string;
  /** Backup agent if primary cannot serve */
  agentSecondary: string | null;
  /** Date the POA becomes effective */
  effectiveDate: string | null;
  /** Date the POA expires (null if no expiration) */
  terminationDate: string | null;
  /** Whether POA survives incapacity */
  durable: boolean;
  /** Condition that triggers a springing POA */
  springCondition: string | null;
  /** General description of powers granted */
  powersGranted: string | null;
  /** Specific limitations on authority */
  limitations: string | null;
  /** Healthcare-specific powers */
  healthcarePowers: string | null;
  /** Financial management powers */
  financialPowers: string | null;
  /** Real estate transaction powers */
  realEstatePowers: string | null;
  /** Business operation powers */
  businessPowers: string | null;
  /** Tax filing and payment powers */
  taxPowers: string | null;
  /** Authority to make gifts */
  giftPowers: string | null;
  /** Trust management powers */
  trustPowers: string | null;
  /** Special instructions or conditions */
  specialInstructions: string | null;
  /** First witness name */
  witness1Name: string | null;
  /** Second witness name */
  witness2Name: string | null;
  /** Notary public name */
  notaryName: string | null;
  /** State where notarized */
  notaryState: string | null;
  /** Date the POA was signed */
  dateSigned: string | null;
  /** Current status */
  status: PowerOfAttorneyStatus;
  /** Attorney who prepared the POA */
  attorneyName: string | null;
  /** Law firm that prepared the POA */
  lawFirm: string | null;
  /** Additional notes */
  notes: string | null;
  /** Whether the record is active */
  isActive: boolean;
  /** Timestamp when created */
  createdAt: string;
  /** Timestamp when last updated */
  updatedAt: string;
}

/**
 * Gift tracking type definition
 * @interface Gift
 * @description Tracks gifts for annual exclusion and lifetime exemption purposes
 */
export interface Gift {
  /** Unique identifier */
  id: string;
  /** User who made the gift */
  userId: string;
  /** Name of the person making the gift */
  donorName: string;
  /** Name of the gift recipient */
  recipientName: string;
  /** Date the gift was made */
  giftDate: string;
  /** Type of gift */
  giftType: GiftType | null;
  /** Description of the gift */
  description: string | null;
  /** Fair market value at time of gift */
  fairMarketValue: number;
  /** Amount applied to annual exclusion */
  annualExclusionApplied: number;
  /** Amount applied to lifetime exemption */
  lifetimeExemptionUsed: number;
  /** Whether gift splitting with spouse was elected */
  giftSplitElection: boolean;
  /** Spouse name if gift splitting */
  splitWithSpouse: string | null;
  /** Generation assignment for GST tax */
  generationAssignment: GenerationAssignment | null;
  /** GST exemption amount allocated */
  gstExemptionAllocated: number;
  /** Whether Form 709 was filed */
  form709Filed: boolean;
  /** Additional notes */
  notes: string | null;
  /** Whether the record is active */
  isActive: boolean;
  /** Timestamp when created */
  createdAt: string;
  /** Timestamp when last updated */
  updatedAt: string;
}

/**
 * Input types for creating documents (without system fields)
 */
export type CreateWillInput = Omit<Will, "id" | "userId" | "isActive" | "createdAt" | "updatedAt">;
export type CreatePowerOfAttorneyInput = Omit<
  PowerOfAttorney,
  "id" | "userId" | "isActive" | "createdAt" | "updatedAt"
>;
export type CreateGiftInput = Omit<Gift, "id" | "userId" | "isActive" | "createdAt" | "updatedAt">;

/**
 * Update types for modifying documents
 */
export type UpdateWillInput = Partial<CreateWillInput>;
export type UpdatePowerOfAttorneyInput = Partial<CreatePowerOfAttorneyInput>;
export type UpdateGiftInput = Partial<CreateGiftInput>;

/**
 * Document type definition for file management
 * @interface Document
 * @description Represents uploaded documents in the system
 */
export interface Document {
  /** Database ID */
  id: number;
  /** Unique document identifier */
  document_id: string;
  /** User who owns this document */
  user_id: number;
  /** Display name for the document */
  name: string;
  /** Original filename when uploaded */
  original_filename: string;
  /** File path on server */
  file_path: string;
  /** File size in bytes */
  file_size: number;
  /** File type/extension */
  file_type: string;
  /** MIME type */
  mime_type: string;
  /** Document category */
  category: string;
  /** Description of the document */
  description: string | null;
  /** Type of related entity */
  related_entity_type: string | null;
  /** ID of related entity */
  related_entity_id: string | null;
  /** Processing status */
  status: string;
  /** When document was uploaded */
  uploaded_at: string;
  /** When document was verified */
  verified_at: string | null;
  /** When document expires */
  expires_at: string | null;
  /** Tags for organization */
  tags: string | null;
  /** Whether document is archived */
  is_archived: number;
  /** Timestamp when created */
  created_at: string;
  /** Timestamp when last updated */
  updated_at: string;
}

/**
 * Summary types for dashboard displays
 */
export interface WillSummary {
  id: string;
  documentName: string;
  status: WillStatus;
  dateSigned: string | null;
  executorPrimary: string | null;
}

export interface PowerOfAttorneySummary {
  id: string;
  documentName: string;
  type: PowerOfAttorneyType;
  status: PowerOfAttorneyStatus;
  agentPrimary: string;
  effectiveDate: string | null;
}

export interface GiftSummary {
  recipientName: string;
  giftCount: number;
  totalValue: number;
  exclusionUsed: number;
  exemptionUsed: number;
}
