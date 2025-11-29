/**
 * ENUM CONVENTIONS
 * All enum values use UPPERCASE with underscores to match database TEXT field values.
 * This ensures consistency between TypeScript enums and SQLite storage.
 */

/**
 * Categories for classifying assets in estate planning.
 * Used in the `assets` table `category` field to organize different types of holdings.
 *
 * @enum {string}
 * @example
 * // When creating a new home asset
 * const homeAsset = {
 *   category: AssetCategory.REAL_ESTATE,
 *   asset_type: 'primary_residence'
 * }
 */
export enum AssetCategory {
  /** Physical properties including homes, land, and buildings */
  REAL_ESTATE = "REAL_ESTATE",
  /** Bank accounts, investments, and retirement accounts */
  FINANCIAL_ACCOUNT = "FINANCIAL_ACCOUNT",
  /** Life, disability, health, and property insurance policies */
  INSURANCE_POLICY = "INSURANCE_POLICY",
  /** Ownership stakes in businesses, partnerships, or corporations */
  BUSINESS_INTEREST = "BUSINESS_INTEREST",
  /** Valuable personal items like art, jewelry, and collectibles */
  PERSONAL_PROPERTY = "PERSONAL_PROPERTY",
  /** Cars, boats, aircraft, and other transportation assets */
  VEHICLE = "VEHICLE",
  /** Liabilities including mortgages, loans, and credit obligations */
  DEBT = "DEBT",
  /** Catch-all for assets that don't fit other categories */
  OTHER = "OTHER",
}

/**
 * Asset ownership types
 * @enum {string}
 * @description Defines how an asset is legally owned
 * Used by: assets.ownership_type (TEXT field)
 * @example
 * const asset = {
 *   ownership: {
 *     type: OwnershipType.TRUST,
 *     trustId: 'TRUST-001'
 *   }
 * };
 */
export enum OwnershipType {
  /** Asset owned by a single individual */
  INDIVIDUAL = "INDIVIDUAL",
  /** Asset owned jointly by multiple parties (e.g., spouses) */
  JOINT = "JOINT",
  /** Asset owned by a trust entity */
  TRUST = "TRUST",
  /** Asset owned by a business entity (LLC, Corporation, etc.) */
  BUSINESS = "BUSINESS",
}

/**
 * Types of real estate properties for estate planning.
 * Used in the `assets` table when `category` is REAL_ESTATE.
 * Helps determine valuation methods, tax treatment, and estate distribution strategies.
 *
 * @enum {string}
 * @example
 * // For a rental property asset
 * const rentalProperty = {
 *   category: AssetCategory.REAL_ESTATE,
 *   asset_type: PropertyType.MULTI_FAMILY,
 *   description: 'Duplex rental property'
 * }
 */
export enum PropertyType {
  /** Standalone house - primary residences or investment properties */
  SINGLE_FAMILY = "SINGLE_FAMILY",
  /** Condominium unit with shared common areas */
  CONDO = "CONDO",
  /** Attached home with individual ownership */
  TOWNHOUSE = "TOWNHOUSE",
  /** Properties with multiple rental units (duplex, triplex, apartment buildings) */
  MULTI_FAMILY = "MULTI_FAMILY",
  /** Office buildings, retail spaces, warehouses */
  COMMERCIAL = "COMMERCIAL",
  /** Undeveloped or agricultural land */
  LAND = "LAND",
  /** General residential property category */
  RESIDENTIAL = "RESIDENTIAL",
  /** Special purpose properties not fitting other categories */
  OTHER = "OTHER",
}

/**
 * Types of financial accounts for comprehensive estate planning.
 * Used in the `assets` table when `category` is FINANCIAL_ACCOUNT.
 * Important for tax planning, beneficiary designations, and distribution strategies.
 *
 * @enum {string}
 * @example
 * // For a retirement account with beneficiaries
 * const retirementAccount = {
 *   category: AssetCategory.FINANCIAL_ACCOUNT,
 *   asset_type: FinancialAccountType.RETIREMENT_401K,
 *   description: 'Employer 401(k) plan'
 * }
 */
export enum FinancialAccountType {
  /** Standard checking account for daily transactions */
  CHECKING = "CHECKING",
  /** Savings account for emergency funds or short-term goals */
  SAVINGS = "SAVINGS",
  /** Higher-yield savings account with limited transactions */
  MONEY_MARKET = "MONEY_MARKET",
  /** Certificate of Deposit - fixed term, fixed rate savings */
  CD = "CD",
  /** Taxable investment account for stocks, bonds, mutual funds */
  INVESTMENT_BROKERAGE = "INVESTMENT_BROKERAGE",
  /** Employer-sponsored retirement plan with pre-tax contributions */
  RETIREMENT_401K = "RETIREMENT_401K",
  /** Traditional Individual Retirement Account - pre-tax contributions */
  RETIREMENT_IRA = "RETIREMENT_IRA",
  /** Roth IRA - after-tax contributions, tax-free withdrawals in retirement */
  RETIREMENT_ROTH_IRA = "RETIREMENT_ROTH_IRA",
  /** Simplified Employee Pension IRA for self-employed individuals */
  RETIREMENT_SEP_IRA = "RETIREMENT_SEP_IRA",
  /** Non-profit/education employer retirement plan similar to 401(k) */
  RETIREMENT_403B = "RETIREMENT_403B",
  /** Government/non-profit deferred compensation plan */
  RETIREMENT_457 = "RETIREMENT_457",
  /** Thrift Savings Plan for federal employees and military */
  RETIREMENT_TSP = "RETIREMENT_TSP",
  /** Defined benefit pension plan providing guaranteed income */
  RETIREMENT_PENSION = "RETIREMENT_PENSION",
  /** Other retirement accounts not listed above */
  RETIREMENT_OTHER = "RETIREMENT_OTHER",
  /** Health Savings Account - triple tax advantage for medical expenses */
  HSA = "HSA",
  /** Flexible Spending Account - pre-tax medical expense account */
  FSA = "FSA",
  /** Cryptocurrency holdings and digital asset accounts */
  CRYPTO = "CRYPTO",
  /** Financial accounts not fitting other categories */
  OTHER = "OTHER",
}

/**
 * Types of insurance policies relevant to estate planning.
 * Used in the `assets` table when `category` is INSURANCE_POLICY.
 * Critical for estate liquidity, wealth transfer, and risk management.
 *
 * @enum {string}
 * @example
 * // For a life insurance policy in an ILIT
 * const lifePolicy = {
 *   category: AssetCategory.INSURANCE_POLICY,
 *   asset_type: InsurancePolicyType.LIFE,
 *   description: 'Term life policy in irrevocable trust'
 * }
 */
export enum InsurancePolicyType {
  /** Life insurance (term, whole, universal) - provides death benefit */
  LIFE = "LIFE",
  /** Disability income insurance - replaces income if disabled */
  DISABILITY = "DISABILITY",
  /** Health insurance coverage for medical expenses */
  HEALTH = "HEALTH",
  /** Long-term care insurance for nursing home/assisted living costs */
  LONG_TERM_CARE = "LONG_TERM_CARE",
  /** Property insurance for primary/secondary residences */
  HOMEOWNERS = "HOMEOWNERS",
  /** Vehicle insurance coverage */
  AUTO = "AUTO",
  /** Personal liability umbrella policy - excess liability coverage */
  UMBRELLA = "UMBRELLA",
  /** Professional liability insurance for doctors, lawyers, etc. */
  MALPRACTICE = "MALPRACTICE",
  /** Business liability, property, or key person insurance */
  BUSINESS = "BUSINESS",
  /** Other insurance types not listed above */
  OTHER = "OTHER",
}

/**
 * Legal structures for business entities in estate planning.
 * Used in the `assets` table when `category` is BUSINESS_INTEREST.
 * Impacts tax treatment, succession planning, and liability protection.
 *
 * @enum {string}
 * @example
 * // For a family business with succession planning
 * const familyBusiness = {
 *   category: AssetCategory.BUSINESS_INTEREST,
 *   asset_type: BusinessStructureType.S_CORP,
 *   description: 'Family construction company'
 * }
 */
export enum BusinessStructureType {
  /** Individual owner, no legal separation from owner */
  SOLE_PROPRIETORSHIP = "SOLE_PROPRIETORSHIP",
  /** General or limited partnership with multiple owners */
  PARTNERSHIP = "PARTNERSHIP",
  /** Limited Liability Company - flexible structure with liability protection */
  LLC = "LLC",
  /** S Corporation - pass-through taxation, ownership restrictions */
  S_CORP = "S_CORP",
  /** C Corporation - double taxation, unlimited shareholders */
  C_CORP = "C_CORP",
  /** 501(c)(3) or other tax-exempt organization */
  NON_PROFIT = "NON_PROFIT",
  /** Other business structures (trusts, cooperatives, etc.) */
  OTHER = "OTHER",
}

/**
 * Business incorporation types for estate planning.
 * Used to specify the legal structure of business entities.
 * Important for tax treatment, liability, and succession planning.
 *
 * @enum {string}
 * @example
 * // For a business asset with incorporation details
 * const business = {
 *   category: AssetCategory.BUSINESS_INTEREST,
 *   incorporation_type: IncorporationType.LLC,
 *   state_of_incorporation: 'DE'
 * }
 */
export enum IncorporationType {
  /** Limited Liability Company */
  LLC = "LLC",
  /** S Corporation - pass-through taxation */
  S_CORP = "S_CORP",
  /** C Corporation - traditional corporation */
  C_CORP = "C_CORP",
  /** General or Limited Partnership */
  PARTNERSHIP = "PARTNERSHIP",
  /** Individual business ownership */
  SOLE_PROPRIETORSHIP = "SOLE_PROPRIETORSHIP",
}

/**
 * Types of vehicles and transportation assets.
 * Used in the `assets` table when `category` is VEHICLE.
 * Relevant for valuation, insurance coverage, and estate distribution.
 *
 * @enum {string}
 * @example
 * // For a classic car collection
 * const classicCar = {
 *   category: AssetCategory.VEHICLE,
 *   asset_type: VehicleType.CAR,
 *   description: '1965 Ford Mustang - collector vehicle'
 * }
 */
export enum VehicleType {
  /** Passenger automobiles including sedans, coupes, convertibles */
  CAR = "CAR",
  /** Pickup trucks and commercial trucks */
  TRUCK = "TRUCK",
  /** Sport utility vehicles and crossovers */
  SUV = "SUV",
  /** Motorcycles, scooters, and similar vehicles */
  MOTORCYCLE = "MOTORCYCLE",
  /** Recreational vehicles, motorhomes, and campers */
  RV = "RV",
  /** Watercraft including sailboats, motorboats, yachts */
  BOAT = "BOAT",
  /** Aircraft including private planes and helicopters */
  AIRPLANE = "AIRPLANE",
  /** Other vehicles (ATVs, snowmobiles, trailers, etc.) */
  OTHER = "OTHER",
}

/**
 * Types of debt and liabilities for estate planning.
 * Used in the `assets` table when `category` is DEBT.
 * Critical for calculating net worth and planning estate liquidity needs.
 *
 * @enum {string}
 * @example
 * // For a home mortgage to track in estate planning
 * const homeMortgage = {
 *   category: AssetCategory.DEBT,
 *   asset_type: DebtType.MORTGAGE,
 *   value: -250000, // Negative value for liabilities
 *   description: 'Primary residence mortgage'
 * }
 */
export enum DebtType {
  /** Primary or secondary home mortgage loans */
  MORTGAGE = "MORTGAGE",
  /** Home equity line of credit (HELOC) or home equity loan */
  HOME_EQUITY = "HOME_EQUITY",
  /** Vehicle financing loans */
  AUTO_LOAN = "AUTO_LOAN",
  /** Educational loans (federal or private) */
  STUDENT_LOAN = "STUDENT_LOAN",
  /** Credit card balances and revolving debt */
  CREDIT_CARD = "CREDIT_CARD",
  /** Unsecured personal loans from banks or lenders */
  PERSONAL_LOAN = "PERSONAL_LOAN",
  /** Business financing, equipment loans, or lines of credit */
  BUSINESS_LOAN = "BUSINESS_LOAN",
  /** Outstanding tax obligations (income, property, estate) */
  TAX_DEBT = "TAX_DEBT",
  /** Other debts not fitting above categories */
  OTHER = "OTHER",
}

/**
 * Types of investment holdings within financial accounts.
 * Used to categorize investments within brokerage and retirement accounts.
 * Important for asset allocation, risk assessment, and tax planning.
 *
 * @enum {string}
 * @example
 * // For tracking investment composition
 * const brokerageHoldings = {
 *   category: AssetCategory.FINANCIAL_ACCOUNT,
 *   asset_type: FinancialAccountType.INVESTMENT_BROKERAGE,
 *   investment_types: [InvestmentType.STOCKS, InvestmentType.BONDS]
 * }
 */
export enum InvestmentType {
  /** Fixed income securities (government, corporate, municipal bonds) */
  BONDS = "BONDS",
  /** Physical commodities or commodity futures (gold, silver, oil) */
  COMMODITIES = "COMMODITIES",
  /** Digital currencies (Bitcoin, Ethereum, etc.) */
  CRYPTOCURRENCY = "CRYPTOCURRENCY",
  /** Exchange-traded funds tracking indexes or sectors */
  ETFS = "ETFS",
  /** Professionally managed pooled investment funds */
  MUTUAL_FUNDS = "MUTUAL_FUNDS",
  /** Private equity, venture capital, or hedge fund investments */
  PRIVATE_EQUITY = "PRIVATE_EQUITY",
  /** Direct real estate investments or syndications */
  REAL_ESTATE_INVESTMENT = "REAL_ESTATE_INVESTMENT",
  /** Real Estate Investment Trusts - publicly traded or private */
  REITS = "REITS",
  /** Individual company stocks and equities */
  STOCKS = "STOCKS",
  /** Alternative investments not listed above */
  OTHER = "OTHER",
}

/**
 * Types of personal property for estate inventory.
 * Used in the `assets` table when `category` is PERSONAL_PROPERTY.
 * Important for valuation, insurance coverage, and specific bequests in wills.
 *
 * @enum {string}
 * @example
 * // For valuable art collection
 * const artCollection = {
 *   category: AssetCategory.PERSONAL_PROPERTY,
 *   asset_type: PersonalPropertyType.ART,
 *   description: 'Contemporary art collection - 12 pieces'
 * }
 */
export enum PersonalPropertyType {
  /** Antique furniture, decorative items over 100 years old */
  ANTIQUES = "ANTIQUES",
  /** Paintings, sculptures, photographs, and other artwork */
  ART = "ART",
  /** Rare books, first editions, manuscripts */
  BOOKS = "BOOKS",
  /** Designer clothing, furs, luxury apparel */
  CLOTHING = "CLOTHING",
  /** Stamps, coins, sports memorabilia, trading cards */
  COLLECTIBLES = "COLLECTIBLES",
  /** High-end electronics, home theater equipment */
  ELECTRONICS = "ELECTRONICS",
  /** High-value furniture pieces and home furnishings */
  FURNITURE = "FURNITURE",
  /** Precious jewelry, watches, gemstones */
  JEWELRY = "JEWELRY",
  /** Pianos, guitars, professional instruments */
  MUSICAL_INSTRUMENTS = "MUSICAL_INSTRUMENTS",
  /** Golf clubs, exercise equipment, outdoor gear */
  SPORTS_EQUIPMENT = "SPORTS_EQUIPMENT",
  /** Professional tools, workshop equipment */
  TOOLS = "TOOLS",
  /** Wine collections, rare spirits, cellar contents */
  WINE_SPIRITS = "WINE_SPIRITS",
  /** Other valuable personal property */
  OTHER = "OTHER",
}

/**
 * Family relationships for estate planning.
 * Used for family member tracking and beneficiary designation.
 *
 * @enum {string}
 * @example
 * // For adding a family member
 * const familyMember = {
 *   name: 'John Doe',
 *   relationship: FamilyRelationship.CHILD
 * }
 */
export enum FamilyRelationship {
  /** Spouse or domestic partner */
  SPOUSE = "SPOUSE",
  /** Son or daughter */
  CHILD = "CHILD",
  /** Mother or father */
  PARENT = "PARENT",
  /** Brother or sister */
  SIBLING = "SIBLING",
  /** Grandparent */
  GRANDPARENT = "GRANDPARENT",
  /** Grandchild */
  GRANDCHILD = "GRANDCHILD",
  /** Aunt or uncle */
  AUNT_UNCLE = "AUNT_UNCLE",
  /** Niece or nephew */
  NIECE_NEPHEW = "NIECE_NEPHEW",
  /** Cousin */
  COUSIN = "COUSIN",
  /** Other family relationship */
  OTHER = "OTHER",
}

/**
 * US States for business incorporation and property location.
 * Used for state-specific tax calculations and legal requirements.
 *
 * @enum {string}
 */
export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
] as const;

/**
 * Industry types for business interests.
 * Used to categorize business assets for valuation and succession planning.
 * Helps identify industry-specific considerations for estate planning.
 *
 * @enum {string}
 * @example
 * // For a family-owned business
 * const constructionCompany = {
 *   category: AssetCategory.BUSINESS_INTEREST,
 *   business_type: BusinessType.CONSTRUCTION,
 *   structure: BusinessStructureType.S_CORP
 * }
 */
export enum BusinessType {
  /** Farming, ranching, agricultural production */
  AGRICULTURE = "AGRICULTURE",
  /** Professional services, advisory, consulting firms */
  CONSULTING = "CONSULTING",
  /** Construction, contracting, development companies */
  CONSTRUCTION = "CONSTRUCTION",
  /** Schools, training centers, educational services */
  EDUCATION = "EDUCATION",
  /** Media, arts, entertainment businesses */
  ENTERTAINMENT = "ENTERTAINMENT",
  /** Financial services, investment firms, insurance agencies */
  FINANCE = "FINANCE",
  /** Medical practices, healthcare facilities, wellness centers */
  HEALTHCARE = "HEALTHCARE",
  /** Hotels, restaurants, tourism businesses */
  HOSPITALITY = "HOSPITALITY",
  /** Production, fabrication, assembly businesses */
  MANUFACTURING = "MANUFACTURING",
  /** Property management, brokerage, development firms */
  REAL_ESTATE = "REAL_ESTATE",
  /** Stores, e-commerce, direct-to-consumer businesses */
  RETAIL = "RETAIL",
  /** General service businesses (cleaning, repair, maintenance) */
  SERVICE = "SERVICE",
  /** Software, IT services, tech startups */
  TECHNOLOGY = "TECHNOLOGY",
  /** Logistics, shipping, delivery services */
  TRANSPORTATION = "TRANSPORTATION",
  /** Distribution, wholesale trade businesses */
  WHOLESALE = "WHOLESALE",
  /** Industries not fitting above categories */
  OTHER = "OTHER",
}

/**
 * Types of documents essential for estate planning and administration.
 * Used in document management system to categorize important papers.
 * Ensures all critical documents are organized and accessible when needed.
 *
 * @enum {string}
 * @example
 * // For uploading estate planning documents
 * const trustDocument = {
 *   document_type: DocumentType.TRUST,
 *   filename: 'Coleman_Family_Trust_2024.pdf',
 *   entity_type: 'trust',
 *   entity_id: 'trust-001'
 * }
 */
export enum DocumentType {
  /** Monthly/quarterly bank account statements */
  BANK_STATEMENT = "BANK_STATEMENT",
  /** Official birth certificates for identification */
  BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
  /** Business contracts, purchase agreements, leases */
  CONTRACT = "CONTRACT",
  /** Property deeds and titles for real estate */
  DEED = "DEED",
  /** Personal or business financial statements */
  FINANCIAL_STATEMENT = "FINANCIAL_STATEMENT",
  /** Living will, advance directives, DNR orders */
  HEALTHCARE_DIRECTIVE = "HEALTHCARE_DIRECTIVE",
  /** Insurance policy documents and riders */
  INSURANCE_POLICY = "INSURANCE_POLICY",
  /** Brokerage and investment account statements */
  INVESTMENT_STATEMENT = "INVESTMENT_STATEMENT",
  /** Marriage certificates for spousal rights */
  MARRIAGE_CERTIFICATE = "MARRIAGE_CERTIFICATE",
  /** Health records, prescriptions, medical history */
  MEDICAL_RECORDS = "MEDICAL_RECORDS",
  /** Mortgage agreements, promissory notes */
  MORTGAGE_DOCUMENT = "MORTGAGE_DOCUMENT",
  /** Financial and healthcare power of attorney documents */
  POWER_OF_ATTORNEY = "POWER_OF_ATTORNEY",
  /** Federal and state income tax returns */
  TAX_RETURN = "TAX_RETURN",
  /** Vehicle titles, boat titles, certificates of ownership */
  TITLE = "TITLE",
  /** Revocable and irrevocable trust agreements */
  TRUST = "TRUST",
  /** Last will and testament documents and codicils */
  WILL = "WILL",
  /** Estate planning documents not listed above */
  OTHER = "OTHER",
}
