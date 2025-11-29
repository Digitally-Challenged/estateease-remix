/**
 * Natural Language Processing for EstateEase AI
 * Handles document analysis, query understanding, and conversational AI
 */

import type { Document } from "~/types";

export interface DocumentAnalysisResult {
  summary: string;
  keyTerms: string[];
  entities: {
    people: string[];
    dates: string[];
    amounts: string[];
    properties: string[];
  };
  compliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  riskFactors: string[];
  actionItems: string[];
}

export interface QueryAnalysis {
  intent: "question" | "request" | "complaint" | "information";
  category: "tax" | "estate" | "trust" | "asset" | "legal" | "family" | "financial";
  confidence: number;
  entities: string[];
  suggestedResponses: string[];
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  previousQueries: string[];
  userProfile: {
    estateValue: number;
    primaryConcerns: string[];
    knowledgeLevel: "beginner" | "intermediate" | "advanced";
  };
}

export class NaturalLanguageProcessor {
  private static instance: NaturalLanguageProcessor;
  private documentCache: Map<string, DocumentAnalysisResult> = new Map();
  private conversationHistory: Map<string, ConversationContext> = new Map();

  private constructor() {}

  public static getInstance(): NaturalLanguageProcessor {
    if (!NaturalLanguageProcessor.instance) {
      NaturalLanguageProcessor.instance = new NaturalLanguageProcessor();
    }
    return NaturalLanguageProcessor.instance;
  }

  // Document Analysis
  public async analyzeDocument(document: Document): Promise<DocumentAnalysisResult> {
    const cacheKey = `${document.id}-${document.updatedAt || document.uploadedAt}`;

    if (this.documentCache.has(cacheKey)) {
      return this.documentCache.get(cacheKey)!;
    }

    const analysis = await this.performDocumentAnalysis(document);
    this.documentCache.set(cacheKey, analysis);

    return analysis;
  }

  private async performDocumentAnalysis(document: Document): Promise<DocumentAnalysisResult> {
    // In a real implementation, this would use NLP libraries or APIs
    // For now, we'll simulate intelligent analysis based on document metadata

    const analysis: DocumentAnalysisResult = {
      summary: this.generateDocumentSummary(document),
      keyTerms: this.extractKeyTerms(document),
      entities: this.extractEntities(document),
      compliance: this.assessCompliance(document),
      riskFactors: this.identifyRiskFactors(document),
      actionItems: this.generateActionItems(document),
    };

    return analysis;
  }

  private generateDocumentSummary(document: Document): string {
    const category = document.category?.toLowerCase() || "general";

    const summaries: Record<string, string> = {
      will: `Last Will and Testament for ${document.relatedEntityId || "the estate owner"}. This document establishes the distribution of assets upon death and names executors to manage the estate.`,
      trust: `Trust document establishing a ${document.subcategory || "trust"} structure. This legal entity can hold assets and provide tax advantages and asset protection benefits.`,
      power_of_attorney: `Power of Attorney document granting legal authority to make decisions on behalf of the principal. This includes financial and/or healthcare decision-making powers.`,
      insurance: `Insurance policy providing coverage for estate planning purposes. This may include life insurance for estate liquidity or property insurance for asset protection.`,
      tax: `Tax-related document that may impact estate planning strategies. Important for understanding current tax positions and planning future tax optimization.`,
      legal: `Legal document related to estate planning. This document should be reviewed regularly to ensure compliance with current laws and estate planning objectives.`,
      financial: `Financial document containing important account or asset information. This document supports the overall estate planning and asset management strategy.`,
    };

    return (
      summaries[category] ||
      `Document titled "${document.name}" contains important information for estate planning purposes and should be reviewed by the appropriate professional advisors.`
    );
  }

  private extractKeyTerms(document: Document): string[] {
    const terms: string[] = [];
    const name = document.name?.toLowerCase() || "";
    const category = document.category?.toLowerCase() || "";
    const subcategory = document.subcategory?.toLowerCase() || "";

    // Category-based key terms
    if (category.includes("will")) {
      terms.push("executor", "beneficiary", "bequest", "probate", "guardian");
    }
    if (category.includes("trust")) {
      terms.push("trustee", "grantor", "settlor", "distribution", "income beneficiary");
    }
    if (category.includes("power")) {
      terms.push("agent", "principal", "durable", "healthcare", "financial");
    }
    if (category.includes("tax")) {
      terms.push("deduction", "exemption", "basis", "depreciation", "capital gains");
    }
    if (category.includes("insurance")) {
      terms.push("beneficiary", "premium", "policy owner", "cash value", "death benefit");
    }

    // Add document-specific terms
    if (name.includes("revocable")) terms.push("revocable", "amendable");
    if (name.includes("irrevocable")) terms.push("irrevocable", "permanent");
    if (name.includes("charitable")) terms.push("charitable deduction", "tax-exempt");

    return [...new Set(terms)];
  }

  private extractEntities(document: Document): DocumentAnalysisResult["entities"] {
    // In a real implementation, this would use NER (Named Entity Recognition)
    return {
      people: this.extractPeopleEntities(document),
      dates: this.extractDateEntities(document),
      amounts: this.extractAmountEntities(document),
      properties: this.extractPropertyEntities(document),
    };
  }

  private extractPeopleEntities(document: Document): string[] {
    const people: string[] = [];

    // Extract from related entity information
    if (document.relatedEntityType === "family_member" && document.relatedEntityId) {
      people.push(document.relatedEntityId);
    }

    // Category-based entity extraction
    const category = document.category?.toLowerCase() || "";
    if (category.includes("will")) {
      people.push("testator", "executor", "beneficiaries");
    }
    if (category.includes("trust")) {
      people.push("grantor", "trustee", "beneficiaries");
    }
    if (category.includes("power")) {
      people.push("principal", "agent");
    }

    return people;
  }

  private extractDateEntities(document: Document): string[] {
    const dates: string[] = [];

    if (document.uploadedAt) {
      dates.push(`Uploaded: ${new Date(document.uploadedAt).toLocaleDateString()}`);
    }

    if (document.updatedAt && document.updatedAt !== document.uploadedAt) {
      dates.push(`Updated: ${new Date(document.updatedAt).toLocaleDateString()}`);
    }

    // Add common estate planning dates
    dates.push("effective date", "expiration date", "review date");

    return dates;
  }

  private extractAmountEntities(document: Document): string[] {
    const amounts: string[] = [];
    const category = document.category?.toLowerCase() || "";

    if (category.includes("insurance")) {
      amounts.push("death benefit", "premium amount", "cash value");
    }
    if (category.includes("trust")) {
      amounts.push("initial funding", "distribution amounts");
    }
    if (category.includes("tax")) {
      amounts.push("taxable amount", "deductions", "credits");
    }

    return amounts;
  }

  private extractPropertyEntities(document: Document): string[] {
    const properties: string[] = [];
    const category = document.category?.toLowerCase() || "";

    if (category.includes("real")) {
      properties.push("real estate", "property address", "legal description");
    }
    if (category.includes("financial")) {
      properties.push("account numbers", "institution names");
    }
    if (category.includes("business")) {
      properties.push("business interests", "ownership percentages");
    }

    return properties;
  }

  private assessCompliance(document: Document): DocumentAnalysisResult["compliance"] {
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    const now = new Date();
    const uploadDate = new Date(document.uploadedAt);
    const daysSinceUpload = Math.floor(
      (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Age-based compliance checks
    if (daysSinceUpload > 365 * 3) {
      // 3 years old
      score -= 20;
      issues.push("Document is over 3 years old and may need review");
      recommendations.push("Schedule review with estate planning attorney");
    }

    // Status-based compliance checks
    if (document.status === "pending_review") {
      score -= 30;
      issues.push("Document is pending professional review");
      recommendations.push("Complete professional review process");
    }

    // Category-specific compliance
    const category = document.category?.toLowerCase() || "";
    if (category.includes("will") && daysSinceUpload > 365 * 5) {
      score -= 30;
      issues.push("Will should be reviewed every 5 years or after major life events");
      recommendations.push("Update will to reflect current circumstances");
    }

    if (category.includes("power") && daysSinceUpload > 365 * 7) {
      score -= 25;
      issues.push("Power of attorney documents should be reviewed periodically");
      recommendations.push("Confirm agents are still appropriate and willing to serve");
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  private identifyRiskFactors(document: Document): string[] {
    const risks: string[] = [];
    const category = document.category?.toLowerCase() || "";
    const now = new Date();
    const uploadDate = new Date(document.uploadedAt);
    const daysSinceUpload = Math.floor(
      (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Universal risks
    if (daysSinceUpload > 365 * 5) {
      risks.push("Document may be outdated due to law changes");
    }

    if (document.status === "draft") {
      risks.push("Document is in draft status and may not be legally effective");
    }

    // Category-specific risks
    if (category.includes("will")) {
      risks.push("Potential probate delays if will is contested");
      risks.push("May not reflect current tax law advantages");
    }

    if (category.includes("trust")) {
      risks.push("Trust may not be properly funded");
      risks.push("Successor trustees may need to be updated");
    }

    if (category.includes("power")) {
      risks.push("Agents may no longer be available or suitable");
      risks.push("Powers may be insufficient for current needs");
    }

    if (category.includes("insurance")) {
      risks.push("Beneficiary designations may be outdated");
      risks.push("Coverage amounts may be insufficient");
    }

    return risks;
  }

  private generateActionItems(document: Document): string[] {
    const actions: string[] = [];
    const category = document.category?.toLowerCase() || "";
    const compliance = this.assessCompliance(document);

    // Compliance-based actions
    if (compliance.score < 80) {
      actions.push("Schedule professional review of document");
    }

    if (compliance.score < 60) {
      actions.push("Consider updating or replacing document");
    }

    // Category-specific actions
    if (category.includes("will")) {
      actions.push("Review and update beneficiary designations");
      actions.push("Confirm executor is still willing and able to serve");
      actions.push("Consider codicil or full will update if circumstances changed");
    }

    if (category.includes("trust")) {
      actions.push("Verify trust is properly funded with current assets");
      actions.push("Review trustee succession planning");
      actions.push("Consider trust distribution strategies");
    }

    if (category.includes("power")) {
      actions.push("Confirm agents are still appropriate");
      actions.push("Review scope of powers granted");
      actions.push("Ensure agents have copies of document");
    }

    if (category.includes("insurance")) {
      actions.push("Review coverage amounts and beneficiaries");
      actions.push("Consider tax implications of current structure");
      actions.push("Evaluate need for additional coverage");
    }

    // Universal actions
    actions.push("Store document in secure, accessible location");
    actions.push("Ensure relevant parties have copies");
    actions.push("Set calendar reminder for periodic review");

    return actions;
  }

  // Query Understanding
  public async analyzeQuery(query: string, context?: ConversationContext): Promise<QueryAnalysis> {
    const intent = this.determineIntent(query);
    const category = this.categorizeQuery(query);
    const confidence = this.calculateConfidence(query, intent, category);
    const entities = this.extractQueryEntities(query);
    const suggestedResponses = this.generateSuggestedResponses(query, intent, category, context);

    return {
      intent,
      category,
      confidence,
      entities,
      suggestedResponses,
    };
  }

  private determineIntent(query: string): QueryAnalysis["intent"] {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("?") ||
      lowerQuery.startsWith("what") ||
      lowerQuery.startsWith("how") ||
      lowerQuery.startsWith("when") ||
      lowerQuery.startsWith("why") ||
      lowerQuery.startsWith("where")
    ) {
      return "question";
    }

    if (
      lowerQuery.includes("please") ||
      lowerQuery.includes("can you") ||
      lowerQuery.includes("help me")
    ) {
      return "request";
    }

    if (
      lowerQuery.includes("problem") ||
      lowerQuery.includes("issue") ||
      lowerQuery.includes("wrong")
    ) {
      return "complaint";
    }

    return "information";
  }

  private categorizeQuery(query: string): QueryAnalysis["category"] {
    const lowerQuery = query.toLowerCase();

    const categoryKeywords = {
      tax: ["tax", "irs", "deduction", "exemption", "estate tax", "gift tax"],
      estate: ["estate", "will", "probate", "inheritance", "heir"],
      trust: ["trust", "trustee", "beneficiary", "distribution"],
      asset: ["asset", "property", "account", "investment", "real estate"],
      legal: ["legal", "law", "attorney", "court", "document"],
      family: ["family", "spouse", "children", "parent", "relative"],
      financial: ["financial", "money", "value", "cost", "price", "worth"],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
        return category as QueryAnalysis["category"];
      }
    }

    return "estate"; // Default category
  }

  private calculateConfidence(query: string, intent: string, category: string): number {
    let confidence = 70; // Base confidence

    // Intent confidence adjustments
    if (intent === "question" && query.includes("?")) confidence += 20;
    if (intent === "request" && query.includes("please")) confidence += 15;

    // Category confidence adjustments
    const categoryWords = query
      .toLowerCase()
      .split(" ")
      .filter((word) =>
        ["tax", "estate", "trust", "asset", "legal", "family", "financial"].includes(word),
      );
    confidence += categoryWords.length * 10;

    // Query clarity adjustments
    if (query.length > 50) confidence += 10; // More detailed queries
    if (query.split(" ").length < 3) confidence -= 20; // Very short queries

    return Math.min(100, Math.max(0, confidence));
  }

  private extractQueryEntities(query: string): string[] {
    const entities: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Common estate planning entities
    const entityPatterns = [
      /\b(trust|will|estate|asset|property|beneficiary|trustee|executor)\b/g,
      /\b(spouse|child|children|parent|family|heir)\b/g,
      /\b(tax|irs|deduction|exemption|gift|inheritance)\b/g,
      /\b(attorney|lawyer|accountant|advisor|professional)\b/g,
      /\$[\d,]+/g, // Dollar amounts
      /\b\d{4}\b/g, // Years
    ];

    entityPatterns.forEach((pattern) => {
      const matches = lowerQuery.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return [...new Set(entities)];
  }

  private generateSuggestedResponses(
    query: string,
    intent: string,
    category: string,
    context?: ConversationContext,
  ): string[] {
    const responses: string[] = [];

    // Intent-based responses
    if (intent === "question") {
      responses.push(`Let me help answer your ${category} question.`);
      responses.push(
        `Based on your estate planning situation, here's what you should know about ${category}.`,
      );
    }

    if (intent === "request") {
      responses.push(`I'd be happy to help you with that ${category} request.`);
      responses.push(`Let me guide you through the ${category} process.`);
    }

    // Category-specific responses
    const categoryResponses: Record<string, string[]> = {
      tax: [
        "Tax planning is crucial for estate optimization. Let me explain the current tax landscape.",
        "Here are some tax-efficient strategies for your estate planning goals.",
      ],
      estate: [
        "Estate planning involves coordinating multiple legal and financial strategies.",
        "Let me walk you through the key components of a comprehensive estate plan.",
      ],
      trust: [
        "Trusts can provide significant benefits for asset protection and tax planning.",
        "There are several types of trusts to consider based on your specific goals.",
      ],
      asset: [
        "Asset protection and management are fundamental to estate planning.",
        "Let me help you understand how to optimize your asset structure.",
      ],
      legal: [
        "Legal documents form the foundation of any estate plan.",
        "It's important to ensure all legal documents are current and properly executed.",
      ],
      family: [
        "Family dynamics play a crucial role in estate planning decisions.",
        "Let me help you consider the impact on your family members.",
      ],
      financial: [
        "Financial planning and estate planning work hand in hand.",
        "Here's how to align your financial goals with your estate planning objectives.",
      ],
    };

    if (categoryResponses[category]) {
      responses.push(...categoryResponses[category]);
    }

    // Context-based personalization
    if (context?.userProfile) {
      const { estateValue, knowledgeLevel } = context.userProfile;

      if (knowledgeLevel === "beginner") {
        responses.push("Let me explain this in simple terms since you're new to estate planning.");
      }

      if (estateValue > 10000000) {
        responses.push("Given your estate size, there are advanced strategies we should consider.");
      }
    }

    return responses.slice(0, 3); // Return top 3 suggestions
  }

  // Conversation Management
  public updateConversationContext(
    userId: string,
    query: string,
    context?: Partial<ConversationContext>,
  ): ConversationContext {
    const sessionId = context?.sessionId || `session-${Date.now()}`;

    const existingContext = this.conversationHistory.get(userId) || {
      userId,
      sessionId,
      previousQueries: [],
      userProfile: {
        estateValue: 0,
        primaryConcerns: [],
        knowledgeLevel: "beginner" as const,
      },
    };

    const updatedContext: ConversationContext = {
      ...existingContext,
      ...context,
      previousQueries: [...existingContext.previousQueries, query].slice(-10), // Keep last 10 queries
    };

    this.conversationHistory.set(userId, updatedContext);
    return updatedContext;
  }

  public getConversationContext(userId: string): ConversationContext | null {
    return this.conversationHistory.get(userId) || null;
  }

  // Smart Response Generation
  public generateContextualResponse(
    query: string,
    analysis: QueryAnalysis,
    context?: ConversationContext,
  ): string {
    const { intent, category, confidence } = analysis;

    // Low confidence responses
    if (confidence < 50) {
      return "I want to make sure I understand your question correctly. Could you provide a bit more detail about what you'd like to know?";
    }

    // Generate contextual response based on category and intent
    const responseTemplates = this.getResponseTemplates(category, intent);
    const baseResponse = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];

    // Add personalization based on context
    if (context?.userProfile) {
      return this.personalizeResponse(baseResponse, context.userProfile);
    }

    return baseResponse;
  }

  private getResponseTemplates(category: string, intent: string): string[] {
    const templates: Record<string, Record<string, string[]>> = {
      tax: {
        question: [
          "Tax planning is a critical component of estate planning. Let me explain how this works in your situation.",
          "Estate taxes can significantly impact your legacy. Here's what you need to know about current tax laws.",
        ],
        request: [
          "I'd be happy to help you with tax planning strategies for your estate.",
          "Let me guide you through some tax-efficient approaches for your situation.",
        ],
      },
      estate: {
        question: [
          "Estate planning involves coordinating multiple strategies to protect and transfer your wealth effectively.",
          "A comprehensive estate plan addresses several key areas. Let me walk you through the most important ones.",
        ],
        request: [
          "I can help you develop a comprehensive estate planning strategy tailored to your goals.",
          "Let's work together to create an estate plan that protects your assets and provides for your loved ones.",
        ],
      },
    };

    return (
      templates[category]?.[intent] || [
        "That's a great question about estate planning. Let me provide you with some helpful information.",
        "I'd be happy to help you understand this aspect of estate planning better.",
      ]
    );
  }

  private personalizeResponse(
    response: string,
    userProfile: ConversationContext["userProfile"],
  ): string {
    const { estateValue, knowledgeLevel } = userProfile;

    let personalizedResponse = response;

    // Add complexity based on knowledge level
    if (knowledgeLevel === "beginner") {
      personalizedResponse +=
        " I'll explain this in straightforward terms to help you understand the basics.";
    } else if (knowledgeLevel === "advanced") {
      personalizedResponse +=
        " Given your experience, I can dive into the more sophisticated aspects of this topic.";
    }

    // Add estate size considerations
    if (estateValue > 10000000) {
      personalizedResponse +=
        " With an estate of your size, there are some advanced strategies we should definitely consider.";
    } else if (estateValue > 1000000) {
      personalizedResponse +=
        " For estates in your range, there are several effective planning strategies available.";
    }

    return personalizedResponse;
  }
}

// Export singleton instance
export const nlpProcessor = NaturalLanguageProcessor.getInstance();

// Utility functions
export function summarizeDocumentRisks(analysis: DocumentAnalysisResult): string {
  const { compliance, riskFactors } = analysis;

  if (compliance.score >= 80 && riskFactors.length === 0) {
    return "This document appears to be in good condition with minimal risk factors.";
  }

  if (compliance.score < 60 || riskFactors.length > 3) {
    return "This document has significant compliance issues or risk factors that need immediate attention.";
  }

  return "This document has some areas for improvement but is generally acceptable.";
}

export function generateDocumentActionPlan(analysis: DocumentAnalysisResult): string[] {
  const plan: string[] = [];

  // Add compliance actions
  if (analysis.compliance.score < 80) {
    plan.push("Schedule professional review to address compliance issues");
  }

  // Add risk mitigation actions
  if (analysis.riskFactors.length > 0) {
    plan.push("Implement risk mitigation strategies identified in analysis");
  }

  // Add specific action items
  plan.push(...analysis.actionItems.slice(0, 3)); // Top 3 action items

  return plan;
}

export function formatDocumentInsights(analysis: DocumentAnalysisResult): string {
  const insights: string[] = [];

  insights.push(`Document Summary: ${analysis.summary}`);
  insights.push(`Compliance Score: ${analysis.compliance.score}%`);

  if (analysis.riskFactors.length > 0) {
    insights.push(`Key Risks: ${analysis.riskFactors.slice(0, 2).join(", ")}`);
  }

  if (analysis.actionItems.length > 0) {
    insights.push(`Priority Actions: ${analysis.actionItems.slice(0, 2).join("; ")}`);
  }

  return insights.join("\n\n");
}
