'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'status' | 'type';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'active':
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'inactive':
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'REVERSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'EARN':
        return 'text-green-600';
      case 'BURN':
        return 'text-red-600';
      case 'EXPIRED':
        return 'text-orange-600';
      case 'ADJUSTMENT':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (variant === 'type') {
    return (
      <span className={`text-xs font-medium ${getTypeColors(status)}`}>{status}</span>
    );
  }

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColors(status)}`}
    >
      {status}
    </span>
  );
}

