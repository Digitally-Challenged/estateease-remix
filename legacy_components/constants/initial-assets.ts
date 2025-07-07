import {
  AssetCategory,
  FinancialAccountType,
  PropertyType,
  InsurancePolicyType,
  PersonalPropertyType,
  BusinessType,
  DigitalAssetType,
} from '../types';

import type {
  Asset,
  FinancialAccount,
  RealEstate,
  PersonalProperty,
  InsurancePolicy,
  BusinessInterest,
  DigitalAsset,
} from '../types';

// Utility function for parsing currency values
const parseCurrency = (value?: string): number => {
  if (!value) return 0;
  const numericValue = parseFloat(value.replace('$', '').replace(/,/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
};

// Financial Accounts Parser
const parseRawFinancialData = (rawData: string): FinancialAccount[] => {
  const accounts: FinancialAccount[] = [];
  const lines = rawData.trim().split('\n');
  let idCounter = 1000; // Start financial accounts from a different ID range

  const getAccountType = (name: string, categoryRaw: string): FinancialAccountType => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('checking') || lowerName.includes('operating account'))
      return FinancialAccountType.CHECKING;
    if (lowerName.includes('savings') || lowerName.includes('money market'))
      return FinancialAccountType.SAVINGS;
    if (lowerName.includes('health savings account'))
      return FinancialAccountType.INVESTMENT_BROKERAGE;
    if (
      lowerName.includes('stock') ||
      lowerName.includes('brokerage investment') ||
      (lowerName.includes('brokerage') && !lowerName.includes('ira'))
    )
      return FinancialAccountType.INVESTMENT_BROKERAGE;
    if (lowerName.includes('ira')) return FinancialAccountType.RETIREMENT_IRA;
    if (lowerName.includes('401(k)') || lowerName.includes('solo 401(k)'))
      return FinancialAccountType.RETIREMENT_401K;
    if (categoryRaw.toLowerCase().includes('investment'))
      return FinancialAccountType.INVESTMENT_BROKERAGE;
    return FinancialAccountType.OTHER;
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      !trimmedLine ||
      trimmedLine.startsWith('Update Wells Fargo Accounts') ||
      trimmedLine.startsWith('Details')
    ) {
      continue;
    }

    const parts = trimmedLine.split('\t').map(part => part.trim());
    if (parts.length < 5) continue;

    const [categoryRaw, institution, name, accNumRaw, valueRaw, ownersRaw, beneficiaryRaw] = parts;

    if (
      name.toLowerCase().includes('closed') ||
      categoryRaw.toLowerCase().includes('credit card')
    ) {
      continue;
    }

    let description = '';
    if (ownersRaw) description += `Owners: ${ownersRaw}. `;
    if (beneficiaryRaw) description += `Beneficiary: ${beneficiaryRaw}.`;

    // Specific update for Kathleen Geeslin Trust accounts
    if (name.toLowerCase().includes('(kathleen geeslin trust)')) {
      description += ' Trustee: Nick.';
    }

    let accountNumber: string | undefined = undefined;
    if (accNumRaw && accNumRaw.toLowerCase() !== 'na' && /^\d+$/.test(accNumRaw)) {
      accountNumber = `******${accNumRaw.slice(-4)}`;
    } else if (accNumRaw && accNumRaw.toLowerCase() !== 'na' && accNumRaw.includes('*')) {
      accountNumber = accNumRaw;
    }

    accounts.push({
      id: `fa-${idCounter++}`,
      name,
      category: AssetCategory.FINANCIAL_ACCOUNT,
      value: parseCurrency(valueRaw),
      accountType: getAccountType(name, categoryRaw),
      institution,
      accountNumber,
      description: description.trim() || undefined,
      owner: ownersRaw || undefined,
      beneficiaries: beneficiaryRaw ? [beneficiaryRaw] : undefined,
    });
  }
  return accounts;
};

// Real Estate Parser
const parseRealEstateData = (rawData: string[]): RealEstate[] => {
  const assets: RealEstate[] = [];
  let idCounter = 2000;
  rawData.forEach(line => {
    if (!line.trim() || line.toLowerCase().includes('sold')) return;
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 3) return; // Address, Value, Mortgage Balance are key

    const [
      addressRaw,
      valueRaw,
      mortgageRaw,
      ownershipType,
      owner,
      benNoDesc,
      benWithDesc,
      docs,
      notes,
    ] = parts;
    const address = addressRaw.includes('|')
      ? addressRaw
        .split('|')
        .map(s => s.trim())
        .join(', ')
      : addressRaw;

    // Pemiscot Farmland special case for name and address
    let name = address;
    if (address.toLowerCase().includes('pemiscot farmland')) {
      name = 'Pemiscot Farmland (Geeslin Trust)';
    } else if (address.toLowerCase().includes('blytheville lot')) {
      name = 'Blytheville Lot';
    } else if (address.toLowerCase().includes('s horizon | rogers')) {
      name = '2523 S Horizon, Rogers, AR (Geeslin Trust)';
    }

    assets.push({
      id: `re-${idCounter++}`,
      name,
      category: AssetCategory.REAL_ESTATE,
      address,
      value: parseCurrency(valueRaw),
      mortgageBalance: parseCurrency(mortgageRaw),
      ownershipType: ownershipType || undefined,
      propertyType: PropertyType.OTHER, // Default, can be refined
      owner: owner || undefined,
      beneficiaries:
        benNoDesc && benNoDesc !== benWithDesc
          ? [benNoDesc, benWithDesc]
          : benNoDesc
            ? [benNoDesc]
            : benWithDesc
              ? [benWithDesc]
              : undefined,
      documentsAvailable: docs?.toLowerCase() === 'x',
      notes: notes || undefined,
    });
  });
  return assets;
};

// Personal Property Parser
const parsePersonalPropertyData = (rawData: string[]): PersonalProperty[] => {
  const assets: PersonalProperty[] = [];
  let idCounter = 3000;
  rawData.forEach(line => {
    if (!line.trim()) return;
    const [
      description,
      valueRaw,
      yearRaw,
      owner,
      beneficiary,
      _infoNeeded1,
      _infoNeeded2,
      docs,
      notes,
    ] = line.split('\t').map(p => p.trim());
    if (!description || !valueRaw) return;

    let type = PersonalPropertyType.OTHER;
    if (description.toLowerCase().includes('bmw') || description.toLowerCase().includes('honda'))
      type = PersonalPropertyType.VEHICLE;
    if (description.toLowerCase().includes('portrait')) type = PersonalPropertyType.PORTRAIT;
    if (
      description.toLowerCase().includes('heirlooms') ||
      description.toLowerCase().includes('jewelry')
    )
      type = PersonalPropertyType.FAMILY_HEIRLOOM;

    assets.push({
      id: `pp-${idCounter++}`,
      name: description,
      category: AssetCategory.PERSONAL_PROPERTY,
      propertyType: type,
      value: parseCurrency(valueRaw),
      year: yearRaw ? parseInt(yearRaw) : undefined,
      owner: owner || undefined,
      beneficiaries: beneficiary ? [beneficiary] : undefined,
      documentsAvailable: docs?.toLowerCase() === 'x',
      notes: notes || undefined,
    });
  });
  return assets;
};

// Life Insurance Parser
const parseLifeInsuranceData = (rawData: string[]): InsurancePolicy[] => {
  const policies: InsurancePolicy[] = [];
  let idCounter = 4000;
  rawData.forEach(line => {
    if (!line.trim()) return;
    const [company, policyNumRaw, coverageRaw, netValueRaw, owner, beneficiary, _docsAvail, docs] =
      line.split('\t').map(p => p.trim());
    if (!company || !policyNumRaw) return;

    const policyNumber = policyNumRaw.includes('xxxx')
      ? policyNumRaw.split('xxxx')[1]
      : policyNumRaw;

    policies.push({
      id: `ip-life-${idCounter++}`,
      name: `${company} Life Insurance`,
      category: AssetCategory.INSURANCE_POLICY,
      policyType: InsurancePolicyType.LIFE,
      insurer: company,
      policyNumber,
      coverageAmount: parseCurrency(coverageRaw),
      netAccumulatedValue: parseCurrency(netValueRaw),
      value: parseCurrency(netValueRaw), // Use net accumulated value as the asset value for life insurance
      owner: owner || undefined,
      beneficiaries: beneficiary ? [beneficiary] : undefined,
      documentsAvailable: docs?.toLowerCase() === 'x' || _docsAvail?.toLowerCase() === 'x',
    });
  });
  return policies;
};

// Disability Insurance Parser
const parseDisabilityInsuranceData = (rawData: string[]): InsurancePolicy[] => {
  const policies: InsurancePolicy[] = [];
  let idCounter = 4500;
  rawData.forEach(line => {
    if (!line.trim()) return;
    const [
      company,
      policyNumRaw,
      monthlyBenefitRaw,
      annualizedPremiumRaw,
      owner,
      _infoNeeded,
      docs,
    ] = line.split('\t').map(p => p.trim());
    if (!company || !policyNumRaw) return;

    const policyNumber = policyNumRaw.includes('xxxx')
      ? policyNumRaw.split('xxxx')[1]
      : policyNumRaw;

    policies.push({
      id: `ip-dis-${idCounter++}`,
      name: `${company} Disability Income`,
      category: AssetCategory.INSURANCE_POLICY,
      policyType: InsurancePolicyType.DISABILITY,
      insurer: company,
      policyNumber,
      coverageAmount: 0, // Disability is about income replacement, not lump sum coverage in the same way
      monthlyBenefit: parseCurrency(monthlyBenefitRaw),
      premium: parseCurrency(annualizedPremiumRaw), // Annualized premium
      value: 0, // Disability policies typically don't have a cash "asset value"
      owner: owner || undefined,
      documentsAvailable: docs?.toLowerCase() === 'x',
      notes: `Monthly Benefit: ${monthlyBenefitRaw}, Annual Premium: ${annualizedPremiumRaw}`,
    });
  });
  return policies;
};

// Business Interests Parser
const parseBusinessInterestsData = (rawData: string[]): BusinessInterest[] => {
  const interests: BusinessInterest[] = [];
  let idCounter = 5000;
  // Add Pollard-Geeslin from "Closely_Held"
  interests.push({
    id: `bi-${idCounter++}`,
    name: 'Pollard-Geeslin Holding Company C-Corp',
    category: AssetCategory.BUSINESS_INTEREST,
    businessName: 'Pollard-Geeslin Holding Company C-Corp',
    businessType: BusinessType.CORPORATION,
    value: 0, // Value not provided, assumed significant but needs input
    owner: 'Joint Shareholder Nick and Kit Coleman',
    percentageOwned: undefined, // Not specified if 50/50 or other
    notes: 'Joint Shareholder with Kit Coleman.',
  });

  // Add Bubbas, LLC for farmland ownership
  interests.push({
    id: `bi-${idCounter++}`,
    name: 'Bubbas, LLC',
    category: AssetCategory.BUSINESS_INTEREST,
    businessName: 'Bubbas, LLC',
    businessType: BusinessType.LLC,
    value: 750000, // Based on farmland value
    owner: 'Nick Coleman & Kit Coleman',
    percentageOwned: 50, // Nick owns 50%
    notes:
      'Family LLC formed to hold Pemiscot Farmland for liability protection and estate planning benefits. Generates $60,000 annual rental income.',
  });

  rawData.forEach(line => {
    if (!line.trim()) return;
    const [name, percentageRaw, owner, docs1, docs2] = line.split('\t').map(p => p.trim());
    if (!name) return;

    let type = BusinessType.LLC; // Default assumption
    if (name.toLowerCase().includes('attorney at law, pllc')) type = BusinessType.LLC; // PLLC is a form of LLC

    interests.push({
      id: `bi-${idCounter++}`,
      name,
      category: AssetCategory.BUSINESS_INTEREST,
      businessName: name,
      businessType: type,
      percentageOwned: percentageRaw ? parseFloat(percentageRaw.replace('%', '')) : undefined,
      value: 0, // Needs to be estimated or input by user
      owner: owner || undefined,
      documentsAvailable: docs1?.toLowerCase() === 'x' || docs2?.toLowerCase() === 'x',
    });
  });
  return interests;
};

// Social Media Parser
const parseSocialMediaData = (rawData: string[]): DigitalAsset[] => {
  const assets: DigitalAsset[] = [];
  let idCounter = 6000;
  rawData.forEach(line => {
    if (!line.trim() || !line.toLowerCase().startsWith('social media')) return;
    const platforms = line
      .split('\t')[1]
      ?.split(',')
      .map(p => p.trim())
      .filter(Boolean);
    if (platforms) {
      platforms.forEach(platform => {
        assets.push({
          id: `da-sm-${idCounter++}`,
          name: `${platform} Account`,
          category: AssetCategory.DIGITAL_ASSET,
          assetType: DigitalAssetType.SOCIAL_MEDIA,
          value: 0, // Social media accounts typically have no direct monetary value for this context
          accessInfo: platform, // Store platform name as access info
          owner: 'Nick/Kelsey (Assumed)', // From context
        });
      });
    }
  });
  return assets;
};

// Raw data constants
const rawFinancials = `
General Banking	Arvest Bank	Joint Checking	9373	$7,947.74	Joint (Nick & Kelsey)	Surviving Spouse
General Banking	Arvest Bank	Joint Savings - Use	8047	$3,329.72	Joint (Nick & Kelsey)	Surviving Spouse
General Banking	Arvest Bank	Joint Vacation Savings	4220	$2,125.00	Joint (Nick & Kelsey)	Surviving Spouse
Investment 	Fidelity Investments	Health Savings Account	5257	$2,950.57	Joint (Nick & Kelsey)	Surviving Spouse
General Banking	Capital One	Travel	6101	$3,212.00	Kelsey	Nick
General Banking	Capital One	Hanzlik (Kelsey Moms $)	1703	$19,017.00	Kelsey	Nick
General Banking	Capital One	Checking	8998	$1,097.00	Kelsey	Nick
General Banking	Capital One	Savings - Spending	7416	$6,010.00	Kelsey	Nick
General Banking	Capital One	Savings - Emergency 	0437	$10,645.00	Kelsey	Nick
Credit Card	Chase	Credit Card		$162.00	Kelsey	
Business Banking	Chase	Savings Willow Consulting	9220	$1,926.00	Kelsey	Nick
Business Banking	Chase	Checking Willow Consulting	0276	$4,128.00	Kelsey	Nick
Credit Card	Chase Business	Credit Card		$0.00	Kelsey	
Investment 	Computer Share	Walmart Stock (Stock Purchase Plan)	NA	$72,000.00	Kelsey	Nick
Investment 	Merrill Lynch	Walmart Stock	38114	$22,098.00	Kelsey	Nick
Investment 	Wells Fargo	Brokerage IRA	5487	$195,249.00	Kelsey	Nick
Investment 	Wells Fargo	Brokerage	5329	$18,395.00	Kelsey	Nick
Investment 	Wells Fargo	Brokerage IRA	9389	$60,717.00	Kelsey	Nick
General Banking	Arvest Bank	Individual Checking	6738	$4,928.03	Nick	Kelsey
General Banking	Arvest Bank	Coleman Law Firm Operating Account	9375	$19,984.94	Nick	Kelsey
General Banking	Arvest Bank	Coleman Law Firm Money Market	0202	$5,325.74	Nick	Kelsey
General Banking	Arvest Bank	LexMed Operating Account	8100	$4,463.11	Nick	Kelsey
General Banking	Arvest Bank	LexMed Money Market Account	7994	$10,012.47	Nick	Kelsey
Investment 	Northwestern Mutual	Coleman Law Firm Solo 401(k)	1281	$194,435.36	Nick	Kelsey
Investment 	Wells Fargo	SEP IRA	6920	$53,073.71	Nick	Kelsey
Investment 	Wells Fargo Advisors	Brokerage IRA	6140	$270,225.35	Nick	Kelsey
Investment 	Wells Fargo (Kathleen Geeslin Trust)	Brokerage	1022	$1,924,661.43	Nick /Kit	Kelsey
Investment 	Wells Fargo (Kathleen Geeslin Trust)	Brokerage IRA	7814	$103,031.23	Nick/Kit	Kelsey
Investment 	Wells Fargo (Kathleen Geeslin Trust)	Brokerage IRA	*0314	$71,913.25	Nick/Kit	Kelsey 
Investment 	Wells Fargo (Kathleen Geeslin Trust)	Brokerage IRA	7112	$48,790.63	Nick/Kit	Kelsey
Investment 	Wells Fargo (Pollard-Geeslin)	Business Brokerage	3355	$1,209,238.94	Nick/Kit	Kelsey
Investment 	Wells Fargo (Pollard-Geeslin)	Business Brokerage	2780	$788,827.52	Nick/Kit	Kelsey
Investment 	Edward Jones Brokerage Account (Kathleen Geeslin Trust )	CLOSED				
General Banking	Farmers Bank (Kathleen Geeslin Trust)	CLOSED				
General Banking	Arvest Bank	Money Market	4304	?	Nick	Kelsey
Update Wells Fargo Accounts						
Investment	Wells Fargo	Investments (Recently Inherited)	9884	$939,992.81	Nick (Inherited)	Kelsey
Investment  	Wells Fargo	IRA (Inherited) + proceeds from home sale	6625	$52,109.53	Nick	Kelsey
Investment 	Wells Fargo	Brokerage Investment	1022	$0.00	Nick	Kelsey
Investment 	Wells Fargo	IRA (Inherited)	*0080	$57,073.71	Nick	Kelsey
Investment	Wells Fargo	Roth IRA	9141	$36,173.25	Nick	Kelsey
Investment	Wells Fargo	IRA (Inherited)	6702	$25,000.81	Nick	Kelsey
`;

const rawRealEstate = [
  '2211 NW Willow | Bentonville, AR 72712	$746,400.00	$384,189.16	Mortgaged (Joint Tenancy)	Nick/Kelsey	Kelsey	Decendants	X	',
  '3 Rio Vista Circle | Hardy, AR 72542	$115,100.00	$0.00	Owned outright (Joint Tenancy)	Nick Coleman & Kit Coleman	Kit	Decendants	x	Could put in LLC for liability protection. Needs to go into a trust once one brother passes. Need new deed if we have children and make tenants in common and put Nicks 50% into our trust for the children. ',
  'Pemiscot Farmland (Geeslin Trust)	$750,000	0	Owned outright (Joint Tenancy)	Nick Coleman & Kit Coleman	Kit	Decendants	x	Need to put in LLC',
  'Blytheville Lot	-$50,000	0	Owned outright (Joint Tenancy)	Nick Coleman & Kit Coleman	Kit	Decendants	x	', // Note: Negative value handled by parseCurrency
  '2523 S Horizon | Rogers, AR 72758 (Geeslin Trust)	$575,000	0	Owned outright (Joint Tenancy)	Nick Coleman & Kit Coleman	Kit		x	Property is listed on the the market right now as of 2/25',
  '911 W. Main | Blytheville, AR 72712	SOLD			Kathleen Geeslin 			x	',
];

const rawPersonalProperty = [
  '2021 BMW X5	$44,157.00	2021	Nick	Kelsey	Information needed		Information needed	',
  '2025 Honda CRV	$40,000.00	2025	Kelsey	Nick	Information needed		Information needed	',
  'Portrait				Kit				Include in hand written list',
  'Family Heirlooms & Jewelry			Kelsey/Nick					Include in hand written list',
];

const rawLifeInsurance = ['Northwestern Mutual	90 Life - xxxx3413	$37,395.00	$3,461.67	Nick	Kelsey			'];

const rawDisabilityInsurance = [
  'Northwestern Mutual	Non Cancellable DI - xxxx4309	$5,201.00	$1,152.65	Nick			Information needed	',
];

const rawBusinessInterests = [
  'Willow Consulting LLC (Kelsey F. Brown Sole MBR)	100%	Kelsey	X	X',
  'Nicholas L. Coleman, Attorney at Law, PLLC	100%	Nick	X	X',
  'LexMed, LLC (Nicholas Coleman Sole MBR)	100%	Nick	X	X',
];

const rawMiscDataForSocialMedia = [
  '9. Social Media	Facebook, Instagram, Reddit, Linkedin, Marco Polo, and Pinterest',
];

// Parse all data
const initialFinancials = parseRawFinancialData(rawFinancials);
const initialRealEstate = parseRealEstateData(rawRealEstate);
const initialPersonalProperty = parsePersonalPropertyData(rawPersonalProperty);
const initialLifeInsurance = parseLifeInsuranceData(rawLifeInsurance);
const initialDisabilityInsurance = parseDisabilityInsuranceData(rawDisabilityInsurance);
const initialBusinessInterests = parseBusinessInterestsData(rawBusinessInterests);
const initialSocialMedia = parseSocialMediaData(rawMiscDataForSocialMedia);

// Export combined initial assets
export const INITIAL_ASSETS: Asset[] = [
  ...initialFinancials,
  ...initialRealEstate,
  ...initialPersonalProperty,
  ...initialLifeInsurance,
  ...initialDisabilityInsurance,
  ...initialBusinessInterests,
  ...initialSocialMedia,
];
