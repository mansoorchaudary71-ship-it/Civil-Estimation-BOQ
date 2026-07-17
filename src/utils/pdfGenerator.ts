export const formatSpacedText = (str: string): string => {
  if (!str) return "";
  return String(str)
    .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
    .replace(/([a-zA-Z])(\d)/g, "$1 $2") // split letters from numbers
    .replace(/(\d)([a-zA-Z])/g, "$1 $2") // split numbers from letters
    .replace(/_/g, " ") // replace underscores with spaces
    .replace(/-/g, " ") // replace hyphens with spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim();
};

export const formatTitleCase = (str: string): string => {
  if (!str) return "";
  return formatSpacedText(str)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatCapitalize = (str: string): string => {
  if (!str) return "";
  return formatSpacedText(str)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const filterValidParameters = (obj: any): any => {
  if (!obj) return {};
  const valid = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== "") {
      (valid as any)[key] = value;
    }
  }
  return valid;
};

// Dummy implementation to avoid breaking other parts of the app
// that might still rely on it for PDF generation directly, although
// we now prefer the Print Preview Modal -> browser print dialog flow.
export const generateProfessionalPDF = async (payload: any): Promise<any> => {
  console.warn("generateProfessionalPDF is deprecated in favor of browser print.");
  return {
    output: (format: string) => {
      return "";
    }
  };
};
