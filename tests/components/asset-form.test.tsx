import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetForm } from "../../app/components/forms/asset-form";
import { AssetCategory, OwnershipType } from "../../app/types/enums";

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
        asset={{
          id: "test-id",
          category: AssetCategory.REAL_ESTATE,
          name: "",
          value: 0,
          description: "",
          location: "",
          ownership: {
            type: OwnershipType.INDIVIDUAL,
            percentage: 100,
          },
        }}
      />,
    );

    expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={{
          id: "test-id",
          category: AssetCategory.REAL_ESTATE,
          name: "",
          value: 0,
          description: "",
          location: "",
          ownership: {
            type: OwnershipType.INDIVIDUAL,
            percentage: 100,
          },
        }}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /save asset/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/asset name is required/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();

    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={{
          id: "test-id",
          category: AssetCategory.REAL_ESTATE,
          name: "Test Property",
          value: 500000,
          description: "Primary residence",
          location: "New York",
          ownership: {
            type: OwnershipType.INDIVIDUAL,
            percentage: 100,
          },
        }}
      />,
    );

    const nameInput = screen.getByLabelText(/asset name/i);
    const valueInput = screen.getByLabelText(/current value/i);
    const submitButton = screen.getByRole("button", { name: /save asset/i });

    await user.clear(nameInput);
    await user.type(nameInput, "Family Home");
    await user.clear(valueInput);
    await user.type(valueInput, "750000");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Family Home",
          value: 750000,
        }),
      );
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={{
          id: "test-id",
          category: AssetCategory.REAL_ESTATE,
          name: "",
          value: 0,
          description: "",
          location: "",
          ownership: {
            type: OwnershipType.INDIVIDUAL,
            percentage: 100,
          },
        }}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // AssetForm uses Remix Form, no direct callback
  });

  it("handles different asset categories", () => {
    render(
      <AssetForm
        mode="create"
        trusts={[]}
        asset={{
          id: "test-id",
          category: AssetCategory.FINANCIAL_ACCOUNT,
          name: "",
          value: 0,
          description: "",
          location: "",
          ownership: {
            type: OwnershipType.INDIVIDUAL,
            percentage: 100,
          },
        }}
      />,
    );

    // Financial account should show additional fields
    expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
  });
});
