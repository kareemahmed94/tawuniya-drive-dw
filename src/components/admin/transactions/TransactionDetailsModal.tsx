'use client';

import { useState, useEffect } from 'react';
import { adminApi, type Transaction } from '@/lib/admin/api-client';
import { Modal, StatusBadge, LoadingState } from '@/components/admin';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  const [fullTransaction, setFullTransaction] = useState<Transaction | null>(transaction);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFullDetails = async () => {
      if (!transaction || !isOpen) return;
      try {
        setLoading(true);
        const response = await adminApi.getTransactionById(transaction.id);
        if (response.success && response.data) {
          setFullTransaction(response.data);
        }
      } catch (error) {
        console.error('Failed to load transaction details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFullDetails();
  }, [transaction?.id, isOpen]);

  const displayTransaction = fullTransaction || transaction;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details" size="lg">
      <div className="space-y-6">
        {loading ? (
          <LoadingState />
        ) : displayTransaction ? (
          <>
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Transaction ID</label>
                <p className="text-sm text-gray-900 font-mono">{displayTransaction.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                <p className="text-sm text-gray-900 font-semibold">{displayTransaction.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <StatusBadge status={displayTransaction.status} />
              </div>
            </div>

            {/* Amount Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Transaction Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${Number(displayTransaction.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Points</span>
                  <span className="text-sm font-medium text-gray-900">
                    {displayTransaction.points > 0 ? '+' : ''}{displayTransaction.points}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Balance Before</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Number(displayTransaction.balanceBefore).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Balance After</span>
                  <span className="text-base font-bold text-gray-900">
                    {Number(displayTransaction.balanceAfter).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* User & Service Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User</label>
                <p className="text-sm text-gray-900">{displayTransaction.userName || 'N/A'}</p>
                <p className="text-xs text-gray-500">
                  {displayTransaction.userEmail || displayTransaction.userId}
                </p>
              </div>
              {displayTransaction.serviceName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Service</label>
                  <p className="text-sm text-gray-900">{displayTransaction.serviceName}</p>
                  <p className="text-xs text-gray-500">{displayTransaction.serviceId}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {displayTransaction.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-sm text-gray-900">{displayTransaction.description}</p>
              </div>
            )}

            {/* Metadata */}
            {displayTransaction.metadata && Object.keys(displayTransaction.metadata).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Metadata</label>
                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(displayTransaction.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-sm text-gray-900">
                  {new Date(displayTransaction.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                <p className="text-sm text-gray-900">
                  {new Date(displayTransaction.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

