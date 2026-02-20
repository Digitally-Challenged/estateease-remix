export const testUser = {
  id: "user-test-001",
  external_id: "ext-test-001",
  first_name: "Test",
  middle_name: undefined,
  last_name: "User",
  email: "test@example.com",
  phone_number: "555-0100",
  date_of_birth: "1990-01-01",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const testAsset = {
  id: "asset-test-001",
  user_id: "user-test-001",
  name: "Test Property",
  category: "REAL_ESTATE",
  value: 500000,
  type: "RESIDENTIAL",
  description: "A test property",
  ownership_type: "INDIVIDUAL",
  trust_id: null,
  is_deleted: 0,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const testTrust = {
  id: "trust-test-001",
  user_id: "user-test-001",
  name: "Test Family Trust",
  type: "REVOCABLE",
  status: "ACTIVE",
  date_created: "2025-01-01",
  description: "A test trust",
  is_deleted: 0,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const testFamilyMember = {
  id: "person-test-001",
  user_id: "user-test-001",
  first_name: "Jane",
  last_name: "Doe",
  full_name: "Jane Doe",
  date_of_birth: "1992-05-15",
  is_minor: 0,
  is_dependent: 0,
  relationship: "SPOUSE",
  primary_phone: "555-0101",
  email: "jane@example.com",
};
