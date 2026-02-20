import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetForm } from "../../app/components/forms/asset-form";
import { AssetCategory, OwnershipType, PropertyType, FinancialAccountType } from "../../app/types/enums";
import type { RealEstateAsset, FinancialAccount } from "../../app/types/assets";

const defaultRealEstateAsset: RealEstateAsset = {
  id: "test-id",
  category: AssetCategory.REAL_ESTATE,
  name: "",
  value: 0,
  description: "",
  address: "",
  propertyType: PropertyType.SINGLE_FAMILY,
  mortgageBalance: 0,
  monthlyRent: 0,
  annualPropertyTax: 0,
  annualInsurance: 0,
  ownership: {
    type: OwnershipType.INDIVIDUAL,
    percentage: 100,
  },
};

const defaultFinancialAsset: FinancialAccount = {
  id: "test-id",
  category: AssetCategory.FINANCIAL_ACCOUNT,
  name: "",
  value: 0,
  description: "",
  accountType: FinancialAccountType.CHECKING,
  institution: "",
  accountNumber: "",
  ownership: {
    type: OwnershipType.INDIVIDUAL,
    percentage: 100,
  },
};

describe("AssetForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with required fields", () => {
    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={defaultRealEstateAsset}
      />,
    );

    expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("validates required fields via HTML validation", async () => {
    const user = userEvent.setup();

    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={defaultRealEstateAsset}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /create asset/i });
    expect(submitButton).toBeInTheDocument();

    // The form uses HTML required attributes for validation
    const nameInput = screen.getByLabelText(/asset name/i);
    expect(nameInput).toBeRequired();
  });

  it("renders with pre-filled data", async () => {
    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={{
          ...defaultRealEstateAsset,
          name: "Test Property",
          value: 500000,
          description: "Primary residence",
          address: "New York",
        }}
      />,
    );

    const nameInput = screen.getByLabelText(/asset name/i);
    const valueInput = screen.getByLabelText(/current value/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    expect(nameInput).toHaveValue("Test Property");
    expect(valueInput).toHaveValue(500000);
    expect(descriptionInput).toHaveValue("Primary residence");
  });

  it("renders cancel button", () => {
    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={defaultRealEstateAsset}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it("handles different asset categories", () => {
    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={defaultFinancialAsset}
      />,
    );

    // Financial account should show additional fields
    expect(screen.getByLabelText(/institution name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
  });
});
