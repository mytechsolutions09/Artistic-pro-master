/**
 * Delhivery API Diagnostics Utility
 * Helps diagnose 401 errors and warehouse name issues
 */

export interface DiagnosticResult {
  success: boolean;
  issues: string[];
  recommendations: string[];
  warehouseNameAnalysis?: {
    original: string;
    normalized: string;
    characterBreakdown: Array<{ char: string; code: number; description: string }>;
    potentialIssues: string[];
  };
}

/**
 * Analyze warehouse name for potential issues
 */
export function analyzeWarehouseName(warehouseName: string): DiagnosticResult['warehouseNameAnalysis'] {
  if (!warehouseName || warehouseName.trim().length === 0) {
    return {
      original: warehouseName,
      normalized: '',
      characterBreakdown: [],
      potentialIssues: ['Warehouse name is empty']
    };
  }

  const normalized = warehouseName.trim();
  const characterBreakdown: Array<{ char: string; code: number; description: string }> = [];
  const potentialIssues: string[] = [];

  // Analyze each character
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const code = char.charCodeAt(0);
    
    let description = '';
    if (char === ' ') {
      description = 'SPACE';
    } else if (char === '-') {
      description = 'HYPHEN-MINUS';
    } else if (char === '–') {
      description = 'EN DASH (might cause issues)';
      potentialIssues.push(`Position ${i + 1}: Uses EN DASH (U+2013) instead of regular hyphen`);
    } else if (char === '—') {
      description = 'EM DASH (might cause issues)';
      potentialIssues.push(`Position ${i + 1}: Uses EM DASH (U+2014) instead of regular hyphen`);
    } else if (/[a-zA-Z]/.test(char)) {
      description = char === char.toUpperCase() ? 'UPPERCASE LETTER' : 'lowercase letter';
    } else if (/\d/.test(char)) {
      description = 'DIGIT';
    } else {
      description = `SPECIAL CHAR (U+${code.toString(16).toUpperCase().padStart(4, '0')})`;
      if (code > 127) {
        potentialIssues.push(`Position ${i + 1}: Non-ASCII character might cause encoding issues`);
      }
    }

    characterBreakdown.push({ char, code, description });
  }

  // Check for common issues
  if (normalized !== warehouseName) {
    potentialIssues.push('Warehouse name has leading/trailing whitespace');
  }

  if (normalized.length !== warehouseName.length) {
    potentialIssues.push('Warehouse name contains non-printable characters');
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(normalized)) {
    potentialIssues.push('Warehouse name contains multiple consecutive spaces');
  }

  // Check for leading/trailing hyphens
  if (normalized.startsWith('-') || normalized.endsWith('-')) {
    potentialIssues.push('Warehouse name starts or ends with hyphen');
  }

  return {
    original: warehouseName,
    normalized,
    characterBreakdown,
    potentialIssues
  };
}

/**
 * Generate diagnostic report for 401 error
 */
export function diagnose401Error(
  warehouseName: string,
  errorMessage?: string
): DiagnosticResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze warehouse name
  const warehouseAnalysis = analyzeWarehouseName(warehouseName);
  
  // Check for common 401 causes
  if (errorMessage) {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('warehouse') || lowerError.includes('client_warehouse')) {
      issues.push('Warehouse-related authentication error');
      recommendations.push('Verify warehouse name matches exactly in Delhivery dashboard');
      recommendations.push('Ensure warehouse is registered and active in Delhivery');
    }
    
    if (lowerError.includes('token') || lowerError.includes('auth')) {
      issues.push('Token-related authentication error');
      recommendations.push('Verify DELHIVERY_API_TOKEN is set correctly in Supabase Edge Function secrets');
      recommendations.push('Check if token has pickup permissions (contact Delhivery support)');
      recommendations.push('Verify token is not expired');
    }
  } else {
    issues.push('401 Unauthorized error - exact cause unknown');
  }

  // Add warehouse name analysis issues
  if (warehouseAnalysis.potentialIssues.length > 0) {
    issues.push('Warehouse name format issues detected');
    warehouseAnalysis.potentialIssues.forEach(issue => {
      recommendations.push(`Warehouse name: ${issue}`);
    });
  }

  // General recommendations
  recommendations.push('Check Edge Function logs for detailed error information');
  recommendations.push('Compare warehouse name character-by-character with Delhivery dashboard');
  recommendations.push('Contact Delhivery support if warehouse name matches exactly');

  return {
    success: issues.length === 0 && warehouseAnalysis.potentialIssues.length === 0,
    issues,
    recommendations,
    warehouseNameAnalysis: warehouseAnalysis
  };
}

/**
 * Normalize warehouse name for comparison
 */
export function normalizeWarehouseName(name: string): string {
  if (!name) return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[–—]/g, '-') // Replace EN DASH and EM DASH with regular hyphen
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
}

/**
 * Compare two warehouse names (case-sensitive)
 */
export function compareWarehouseNames(name1: string, name2: string): {
  exactMatch: boolean;
  normalizedMatch: boolean;
  differences: Array<{ position: number; char1: string; char2: string }>;
} {
  const normalized1 = normalizeWarehouseName(name1);
  const normalized2 = normalizeWarehouseName(name2);
  
  const exactMatch = name1 === name2;
  const normalizedMatch = normalized1 === normalized2;
  
  const differences: Array<{ position: number; char1: string; char2: string }> = [];
  
  if (!exactMatch) {
    const maxLength = Math.max(name1.length, name2.length);
    for (let i = 0; i < maxLength; i++) {
      const char1 = name1[i] || '[MISSING]';
      const char2 = name2[i] || '[MISSING]';
      
      if (char1 !== char2) {
        differences.push({
          position: i + 1,
          char1: char1 === ' ' ? '[SPACE]' : char1,
          char2: char2 === ' ' ? '[SPACE]' : char2
        });
      }
    }
  }
  
  return {
    exactMatch,
    normalizedMatch,
    differences
  };
}

/**
 * Generate troubleshooting guide for 401 error
 */
export function generateTroubleshootingGuide(
  warehouseName: string,
  errorDetails?: any
): string {
  const diagnostic = diagnose401Error(warehouseName, errorDetails?.message || errorDetails?.error);
  const analysis = diagnostic.warehouseNameAnalysis!;
  
  let guide = '🔍 DELHIVERY 401 ERROR DIAGNOSTICS\n\n';
  guide += `📦 Warehouse Name Analysis:\n`;
  guide += `   Original: "${analysis.original}"\n`;
  guide += `   Normalized: "${analysis.normalized}"\n`;
  guide += `   Length: ${analysis.original.length} characters\n\n`;
  
  if (analysis.potentialIssues.length > 0) {
    guide += `⚠️ Potential Issues:\n`;
    analysis.potentialIssues.forEach(issue => {
      guide += `   • ${issue}\n`;
    });
    guide += '\n';
  }
  
  guide += `📋 Character Breakdown:\n`;
  analysis.characterBreakdown.forEach((char, idx) => {
    guide += `   ${idx + 1}. "${char.char}" (U+${char.code.toString(16).toUpperCase().padStart(4, '0')}) - ${char.description}\n`;
  });
  guide += '\n';
  
  if (diagnostic.issues.length > 0) {
    guide += `❌ Detected Issues:\n`;
    diagnostic.issues.forEach(issue => {
      guide += `   • ${issue}\n`;
    });
    guide += '\n';
  }
  
  guide += `💡 Recommendations:\n`;
  diagnostic.recommendations.forEach((rec, idx) => {
    guide += `   ${idx + 1}. ${rec}\n`;
  });
  
  return guide;
}
