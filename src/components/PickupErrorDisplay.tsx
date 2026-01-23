/**
 * Pickup Error Display Component
 * Displays detailed 401 error information with diagnostics and troubleshooting steps
 */

import React, { useState } from 'react';
import { AlertCircle, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { copyToClipboard } from '../utils/warehouseNameHelper';

interface PickupErrorDisplayProps {
  error: {
    success: false;
    message: string;
    error: string;
    troubleshooting?: string[];
    diagnostic?: {
      warehouseNameAnalysis?: {
        original: string;
        normalized: string;
        characterBreakdown: Array<{
          char: string;
          code: number;
          description: string;
        }>;
        potentialIssues: string[];
      };
      issues?: string[];
      recommendations?: string[];
    };
    status?: number;
  };
  onClose?: () => void;
}

export const PickupErrorDisplay: React.FC<PickupErrorDisplayProps> = ({ error, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    diagnostics: true,
    troubleshooting: false,
    characterBreakdown: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const warehouseName = error.diagnostic?.warehouseNameAnalysis?.original || 'Unknown';
  const is401Error = error.status === 401;

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 my-4 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-bold text-red-800">{error.message}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      {/* Warehouse Name Section */}
      {warehouseName !== 'Unknown' && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Warehouse Name Being Sent:</div>
              <div className="font-mono text-lg text-red-700">"{warehouseName}"</div>
              <div className="text-xs text-gray-500 mt-1">
                Length: {warehouseName.length} characters
              </div>
            </div>
            <button
              onClick={() => handleCopy(warehouseName, 'warehouse')}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded border border-red-300 transition-colors flex items-center gap-2"
            >
              {copied === 'warehouse' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'warehouse' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Error Details */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
        <div className="text-sm text-gray-700 whitespace-pre-line">{error.error}</div>
      </div>

      {/* Diagnostics Section */}
      {error.diagnostic && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('diagnostics')}
            className="w-full flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 rounded-lg p-3 border border-yellow-200 transition-colors"
          >
            <span className="font-semibold text-yellow-900">🔍 Diagnostic Information</span>
            {expandedSections.diagnostics ? (
              <ChevronUp className="w-5 h-5 text-yellow-700" />
            ) : (
              <ChevronDown className="w-5 h-5 text-yellow-700" />
            )}
          </button>

          {expandedSections.diagnostics && (
            <div className="mt-2 bg-white rounded-lg p-4 border border-yellow-200">
              {/* Issues */}
              {error.diagnostic.issues && error.diagnostic.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-red-700 mb-2">Detected Issues:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {error.diagnostic.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {error.diagnostic.recommendations && error.diagnostic.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-blue-700 mb-2">Recommendations:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {error.diagnostic.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Character Breakdown */}
              {error.diagnostic.warehouseNameAnalysis && (
                <div>
                  <button
                    onClick={() => toggleSection('characterBreakdown')}
                    className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2"
                  >
                    <span>Character Breakdown</span>
                    {expandedSections.characterBreakdown ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedSections.characterBreakdown && (
                    <div className="bg-gray-50 rounded p-3 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        {error.diagnostic.warehouseNameAnalysis.characterBreakdown.map((char, idx) => (
                          <div key={idx} className="border-b border-gray-200 pb-1">
                            <div className="font-semibold">
                              {idx + 1}. {char.char === ' ' ? '[SPACE]' : char.char === '-' ? '[HYPHEN]' : char.char}
                            </div>
                            <div className="text-gray-500 text-xs">{char.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Troubleshooting Steps */}
      {error.troubleshooting && error.troubleshooting.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('troubleshooting')}
            className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 rounded-lg p-3 border border-blue-200 transition-colors"
          >
            <span className="font-semibold text-blue-900">📋 Troubleshooting Steps</span>
            {expandedSections.troubleshooting ? (
              <ChevronUp className="w-5 h-5 text-blue-700" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-700" />
            )}
          </button>

          {expandedSections.troubleshooting && (
            <div className="mt-2 bg-white rounded-lg p-4 border border-blue-200">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {error.troubleshooting.map((step, idx) => (
                  <li key={idx} className="pl-2">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-red-200">
        <a
          href="https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions/delhivery-api/logs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View Edge Function Logs
        </a>
        <a
          href="https://one.delhivery.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Open Delhivery Dashboard
        </a>
        <button
          onClick={() => handleCopy(error.error, 'fullError')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          {copied === 'fullError' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied === 'fullError' ? 'Copied!' : 'Copy Full Error'}
        </button>
      </div>

      {/* Most Likely Cause Highlight */}
      {is401Error && (
        <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <div className="font-semibold text-yellow-900 mb-2">💡 Most Likely Cause:</div>
          <div className="text-sm text-yellow-800">
            <strong>API token doesn't have pickup permissions.</strong> Your token works for waybills and shipments, 
            but Delhivery requires separate permissions for pickup requests. Contact Delhivery support to enable 
            pickup scheduling permissions for your API token.
          </div>
        </div>
      )}
    </div>
  );
};
