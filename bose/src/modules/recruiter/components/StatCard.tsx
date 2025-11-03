import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

interface StatCardProps {
  label: string;
  value: number | string;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorClass: Record<NonNullable<StatCardProps['color']>, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
};

export default function StatCard({ label, value, color = 'blue' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`text-2xl font-bold ${colorClass[color]}`}>{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </CardContent>
    </Card>
  );
}


