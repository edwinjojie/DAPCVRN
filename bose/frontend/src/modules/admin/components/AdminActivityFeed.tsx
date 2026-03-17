import React from 'react';
import { useAdminLogs } from '../hooks/useAdminLogs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Ban, 
  UserCheck, 
  Shield, 
  Clock,
  ExternalLink,
  RefreshCw,
  Landmark,
  User,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminActivityFeed() {
  const { logs, loading } = useAdminLogs();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVE_ORG': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECT_ORG': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'BAN_USER': return <Ban className="h-4 w-4 text-red-500" />;
      case 'UNBAN_USER': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'REVOKE_CREDENTIAL': return <Shield className="h-4 w-4 text-red-600" />;
      case 'ROLE_CHANGE': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'ORGANIZATION': return <Landmark className="h-3 w-3" />;
      case 'USER': return <User className="h-3 w-3" />;
      case 'CREDENTIAL': return <Award className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white dark:bg-gray-800/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" /> System Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading activity...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent activity.</div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="relative pl-8 pb-6 border-l border-gray-100 dark:border-gray-800 last:pb-0">
                <div className="absolute left-[-9px] top-0 p-1 bg-white dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {log.adminName} <span className="font-normal text-gray-500 lowercase">{log.action.replace('_', ' ')}</span>
                    </p>
                    <span className="text-[10px] font-medium text-gray-400 uppercase">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                      {getTargetIcon(log.targetType)}
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {log.targetName}
                      </span>
                    </div>
                    {log.reason && (
                      <span className="text-xs italic text-gray-400 truncate max-w-[200px]">
                        "{log.reason}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
