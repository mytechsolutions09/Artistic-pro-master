/**
 * Warehouse Name Helper Utilities
 * Helps with comparing and validating warehouse names for Delhivery API
 */

import { compareWarehouseNames, normalizeWarehouseName, analyzeWarehouseName } from './delhiveryDiagnostics';

/**
 * Format warehouse name for display with character breakdown
 */
export function formatWarehouseNameForDisplay(name: string): {
  display: string;
  characterBreakdown: Array<{ position: number; char: string; display: string }>;
  copyText: string;
} {
  const analysis = analyzeWarehouseName(name);
  
  const characterBreakdown = analysis.characterBreakdown.map((char, idx) => ({
    position: idx + 1,
    char: char.char,
    display: char.char === ' ' ? '[SPACE]' : char.char === '-' ? '[HYPHEN]' : char.char
  }));
  
  // Create copy-friendly text
  const copyText = `Warehouse Name: "${name}"\nLength: ${name.length} characters\n\nCharacter Breakdown:\n${characterBreakdown.map(c => `  ${c.position}. "${c.display}"`).join('\n')}`;
  
  return {
    display: name,
    characterBreakdown,
    copyText
  };
}

/**
 * Compare warehouse name with Delhivery dashboard name
 * Returns detailed comparison results
 */
export function compareWithDelhiveryName(
  systemName: string,
  delhiveryName: string
): {
  match: boolean;
  exactMatch: boolean;
  normalizedMatch: boolean;
  differences: Array<{
    position: number;
    systemChar: string;
    delhiveryChar: string;
    description: string;
  }>;
  recommendation: string;
} {
  const comparison = compareWarehouseNames(systemName, delhiveryName);
  
  const differences = comparison.differences.map(diff => {
    let description = '';
    if (diff.char1 === '[SPACE]' && diff.char2 !== '[SPACE]') {
      description = 'System has SPACE, Delhivery has different character';
    } else if (diff.char2 === '[SPACE]' && diff.char1 !== '[SPACE]') {
      description = 'Delhivery has SPACE, System has different character';
    } else if (diff.char1 === '[MISSING]') {
      description = 'Character missing in system name';
    } else if (diff.char2 === '[MISSING]') {
      description = 'Character missing in Delhivery name';
    } else {
      description = `Case or character mismatch: "${diff.char1}" vs "${diff.char2}"`;
    }
    
    return {
      position: diff.position,
      systemChar: diff.char1,
      delhiveryChar: diff.char2,
      description
    };
  });
  
  let recommendation = '';
  if (comparison.exactMatch) {
    recommendation = '✅ Names match exactly! If still getting 401, check API token permissions.';
  } else if (comparison.normalizedMatch) {
    recommendation = '⚠️ Names match after normalization (spaces/hyphens). Update system name to match Delhivery exactly.';
  } else {
    recommendation = '❌ Names do not match. Update system warehouse name to match Delhivery dashboard exactly.';
  }
  
  return {
    match: comparison.exactMatch,
    exactMatch: comparison.exactMatch,
    normalizedMatch: comparison.normalizedMatch,
    differences,
    recommendation
  };
}

/**
 * Generate a formatted error message for 401 errors
 */
export function format401ErrorMessage(warehouseName: string, errorDetails?: any): {
  title: string;
  message: string;
  warehouseInfo: {
    name: string;
    length: number;
    characterBreakdown: string;
    copyText: string;
  };
  troubleshootingSteps: string[];
  quickActions: Array<{ label: string; action: string }>;
} {
  const analysis = analyzeWarehouseName(warehouseName);
  const formatted = formatWarehouseNameForDisplay(warehouseName);
  
  const troubleshootingSteps = [
    'Check Edge Function Logs: Supabase Dashboard → Functions → delhivery-api → Logs',
    'Verify warehouse name in Delhivery dashboard: https://one.delhivery.com',
    'Compare warehouse name character-by-character (case-sensitive)',
    'Check API token has pickup permissions (contact Delhivery support)',
    'Ensure warehouse is registered and active in Delhivery',
    'Verify DELHIVERY_API_TOKEN is set in Supabase Edge Function secrets'
  ];
  
  const quickActions = [
    {
      label: 'Copy Warehouse Name',
      action: `copy:${warehouseName}`
    },
    {
      label: 'View Edge Function Logs',
      action: 'https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions/delhivery-api/logs'
    },
    {
      label: 'Open Delhivery Dashboard',
      action: 'https://one.delhivery.com'
    }
  ];
  
  return {
    title: 'Authentication Failed (401 Unauthorized)',
    message: `🔤 Warehouse Name Being Sent: "${warehouseName}"\n\n⚠️ CRITICAL: This name must match EXACTLY with Delhivery dashboard:\n• Case-sensitive (uppercase/lowercase)\n• Spaces must match exactly\n• Hyphens must match exactly\n• No extra spaces or characters`,
    warehouseInfo: {
      name: warehouseName,
      length: warehouseName.length,
      characterBreakdown: formatted.characterBreakdown.map(c => `${c.position}. "${c.display}"`).join('\n'),
      copyText: formatted.copyText
    },
    troubleshootingSteps,
    quickActions
  };
}

/**
 * Copy text to clipboard (browser API)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}



