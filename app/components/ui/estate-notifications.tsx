import { showNotification } from "~/components/ui/notification";

// Estate-specific notification helpers
export const showReportGeneratedNotification = (reportType: string) => {
  showNotification(
    "success",
    "Report Generated",
    `${reportType} report has been generated successfully.`,
    5000,
  );
};

export const showAssetUpdatedNotification = (assetName: string) => {
  showNotification("success", "Asset Updated", `${assetName} has been updated successfully.`, 5000);
};

export const showAssetDeletedNotification = (assetName: string) => {
  showNotification(
    "warning",
    "Asset Deleted",
    `${assetName} has been deleted from your estate.`,
    5000,
  );
};

export const showFamilyMemberAddedNotification = (memberName: string) => {
  showNotification(
    "success",
    "Family Member Added",
    `${memberName} has been added to your family directory.`,
    5000,
  );
};

export const showBackupCreatedNotification = () => {
  showNotification(
    "info",
    "Data Backup",
    "Your estate data has been backed up automatically.",
    4000,
  );
};

export const showPrintReadyNotification = () => {
  showNotification("info", "Print Ready", "Your report is ready for printing or PDF export.", 4000);
};

export const showDataLoadingNotification = () => {
  showNotification(
    "info",
    "Loading Data",
    "Please wait while we load your estate information.",
    2000,
  );
};

export const showDataErrorNotification = (error: string) => {
  showNotification(
    "error",
    "Data Error",
    error || "There was an error loading your data. Please try again.",
    7000,
  );
};

export const showSaveProgressNotification = () => {
  showNotification("info", "Saving", "Your changes are being saved...", 2000);
};

export const showSaveSuccessNotification = () => {
  showNotification("success", "Saved", "Your changes have been saved successfully.", 3000);
};

export const showValidationErrorNotification = (field: string) => {
  showNotification(
    "error",
    "Validation Error",
    `Please check the ${field} field and try again.`,
    5000,
  );
};

export const showFormErrorNotification = (errors: string[]) => {
  showNotification(
    "error",
    "Form Errors",
    `Please fix the following errors: ${errors.join(", ")}`,
    6000,
  );
};

export const showConnectionErrorNotification = () => {
  showNotification(
    "error",
    "Connection Error",
    "Unable to connect to the server. Please check your internet connection.",
    7000,
  );
};

export const showMaintenanceNotification = () => {
  showNotification(
    "warning",
    "Maintenance Mode",
    "The system is temporarily in maintenance mode. Some features may be unavailable.",
    8000,
  );
};

export const showSessionExpiredNotification = () => {
  showNotification(
    "warning",
    "Session Expired",
    "Your session has expired. Please refresh the page to continue.",
    10000,
  );
};

export const showFeatureComingSoonNotification = (feature: string) => {
  showNotification(
    "info",
    "Coming Soon",
    `${feature} is coming soon! We're working hard to bring you this feature.`,
    5000,
  );
};

export const showBetaFeatureNotification = (feature: string) => {
  showNotification(
    "info",
    "Beta Feature",
    `${feature} is in beta. Please report any issues you encounter.`,
    6000,
  );
};

export const showSecurityAlertNotification = (message: string) => {
  showNotification("warning", "Security Alert", message, 10000);
};

export const showDataExportNotification = (format: string) => {
  showNotification(
    "success",
    "Export Ready",
    `Your data has been exported in ${format} format.`,
    5000,
  );
};

export const showDataImportNotification = (itemCount: number) => {
  showNotification(
    "success",
    "Import Complete",
    `Successfully imported ${itemCount} items into your estate.`,
    5000,
  );
};

export const showTaxCalculationNotification = () => {
  showNotification(
    "info",
    "Tax Calculation",
    "Estate tax calculations are estimates. Please consult with a tax professional.",
    8000,
  );
};

export const showLegalDisclaimerNotification = () => {
  showNotification(
    "warning",
    "Legal Disclaimer",
    "This platform provides general information only. Please consult with legal professionals for specific advice.",
    10000,
  );
};

export const showQuickActionNotification = (action: string) => {
  showNotification("info", "Quick Action", `${action} completed successfully.`, 3000);
};

export const showBulkOperationNotification = (operation: string, count: number) => {
  showNotification("success", "Bulk Operation", `${operation} completed for ${count} items.`, 5000);
};

export const showSearchResultsNotification = (count: number, query: string) => {
  showNotification("info", "Search Results", `Found ${count} results for "${query}".`, 4000);
};

export const showFilterAppliedNotification = (filterCount: number) => {
  showNotification("info", "Filter Applied", `${filterCount} filters are now active.`, 3000);
};

export const showSortAppliedNotification = (sortBy: string) => {
  showNotification("info", "Sort Applied", `Items sorted by ${sortBy}.`, 3000);
};

export const showMobileOptimizedNotification = () => {
  showNotification(
    "info",
    "Mobile Optimized",
    "This view has been optimized for mobile devices.",
    4000,
  );
};

export const showOfflineNotification = () => {
  showNotification(
    "warning",
    "Offline Mode",
    "You are currently offline. Some features may not be available.",
    7000,
  );
};

export const showOnlineNotification = () => {
  showNotification(
    "success",
    "Back Online",
    "Connection restored. All features are now available.",
    4000,
  );
};

// Batch notifications for complex operations
export const showBatchNotifications = {
  estateReportGenerated: () => {
    showReportGeneratedNotification("Estate Summary");
    showPrintReadyNotification();
  },

  assetBulkUpdate: (count: number) => {
    showBulkOperationNotification("Asset update", count);
    showBackupCreatedNotification();
  },

  familyDirectoryUpdate: (memberName: string) => {
    showFamilyMemberAddedNotification(memberName);
    showSaveSuccessNotification();
  },

  systemMaintenance: () => {
    showMaintenanceNotification();
    showDataLoadingNotification();
  },
};
