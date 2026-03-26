import { MessageSquare, Calendar, Check, X as Close, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface Props {
  applicant: Applicant;
  onUpdate: (id: string, status: Applicant['status']) => void;
  onMessage: (applicant: Applicant) => void;
  onSchedule: (applicant: Applicant) => void;
}

export default function ApplicantActions({ applicant, onUpdate, onMessage, onSchedule }: Props) {
  const statusActions = [
    { label: 'Shortlist', status: 'shortlisted', icon: Check, variant: 'outline' as const },
    { label: 'Reject', status: 'rejected', icon: Close, variant: 'ghost' as const },
    { label: 'Hire', status: 'hired', icon: UserCheck, variant: 'default' as const },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex border-r border-gray-200 pr-2 mr-2 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMessage(applicant)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="Direct Inquiry"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Inquiry
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSchedule(applicant)}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          title="Schedule Interview"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Schedule
        </Button>
      </div>

      <div className="flex gap-1">
        {statusActions.map((action) => (
          <Button
            key={action.status}
            variant={action.variant}
            size="sm"
            onClick={() => onUpdate(applicant.id, action.status as Applicant['status'])}
            disabled={applicant.status === action.status}
            className={action.status === 'rejected' ? 'text-red-500 hover:bg-red-50' : ''}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}


