'use client'

/**
 * Warehouse Name Error Display Component
 * Displays 401 error with warehouse name analysis and copy functionality
 */

import React, { useState } from 'react';
import { format401ErrorMessage, copyToClipboard } from '../utils/warehouseNameHelper';

interface WarehouseNameErrorDisplayProps {
  warehouseName: string;
  errorDetails?: any;
  onCopyWarehouseName?: (name: string) => void;
}

export const WarehouseNameErrorDisplay: React.FC<WarehouseNameErrorDisplayProps> = ({
  warehouseName,
  errorDetails,
  onCopyWarehouseName
}) => {
  const [copied, setCopied] = useState(false);
  const errorInfo = format401ErrorMessage(warehouseName, errorDetails);

  const handleCopyWarehouseName = async () => {
    const success = await copyToClipboard(warehouseName);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopyWarehouseName) {
        onCopyWarehouseName(warehouseName);
      }
    }
  };

  const handleCopyFullInfo = async () => {
    await copyToClipboard(errorInfo.warehouseInfo.copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-red-800">{errorInfo.title}</h3>
        <button
          onClick={handleCopyWarehouseName}
          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded border border-red-300 transition-colors"
          title="Copy warehouse name"
        >
          {copied ? '✓ Copied!' : 'Copy Name'}
        </button>
      </div>

      <div className="bg-white rounded p-3 mb-3 border border-red-200">
        <div className="font-mono text-sm">
          <div className="mb-2">
            <span className="font-semibold">Warehouse Name:</span>{' '}
            <span className="text-red-700">"{warehouseName}"</span>
          </div>
          <div className="text-xs text-gray-600">
            Length: {errorInfo.warehouseInfo.length} characters
          </div>
        </div>
      </div>

      <div className="text-sm text-red-700 mb-3 whitespace-pre-line">
        {errorInfo.message}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
        <h4 className="font-semibold text-yellow-800 mb-2">📋 Verification Steps:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-900">
          {errorInfo.troubleshootingSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2">
        {errorInfo.quickActions.map((action, idx) => (
          <a
            key={idx}
            href={action.action.startsWith('http') ? action.action : '#'}
            onClick={(e) => {
              if (!action.action.startsWith('http')) {
                e.preventDefault();
                if (action.action.startsWith('copy:')) {
                  copyToClipboard(action.action.replace('copy:', ''));
                }
              }
            }}
            target={action.action.startsWith('http') ? '_blank' : undefined}
            rel={action.action.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border border-blue-300 transition-colors"
          >
            {action.label}
          </a>
        ))}
        <button
          onClick={handleCopyFullInfo}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border border-gray-300 transition-colors"
        >
          Copy Full Info
        </button>
      </div>
    </div>
  );
};




