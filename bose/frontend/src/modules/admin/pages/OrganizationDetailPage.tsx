import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ArrowLeft, Landmark, Users, Award, Shield, Mail, Phone, Globe, MapPin } from "lucide-react";
import { useToast } from "../../../components/ui/toast";

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/admin/orgs/${id}`);
        setOrg(res.data.data);
      } catch (error) {
        toast({ title: "Failed to fetch organization details", variant: "error" });
        navigate("/dashboard/admin");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!org) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Organization Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Landmark className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">{org.name}</CardTitle>
              <p className="text-sm text-gray-500 capitalize">{org.type} • ID: {org.organizationId}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem icon={Mail} label="Email" value={org.email} />
              <DetailItem icon={Phone} label="Phone" value={org.phone} />
              <DetailItem icon={Globe} label="Website" value={org.website} isLink />
              <DetailItem icon={MapPin} label="Address" value={`${org.address?.city}, ${org.address?.country}`} />
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{org.description || "No description provided."}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <StatusBadge status={org.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Blockchain</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${org.blockchainRegistered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {org.blockchainRegistered ? 'Registered' : 'Pending'}
                </span>
              </div>
              {org.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-xs text-red-700 dark:text-red-300">{org.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <StatItem icon={Users} label="Total Members" value={org.stats?.totalMembers || 0} />
              <StatItem icon={Award} label="Credentials Issued" value={org.stats?.totalCredentialsIssued || 0} />
              <StatItem icon={Shield} label="Verifications" value={org.stats?.totalVerifications || 0} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Administrative Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {org.admins?.map((admin: any) => (
                  <tr key={admin._id}>
                    <td className="px-4 py-3 text-sm font-medium">{admin.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{admin.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`h-2 w-2 rounded-full inline-block mr-2 ${admin.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, isLink }: any) {
  return (
    <div className="flex gap-3">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{value || "N/A"}</a>
        ) : (
          <p className="text-sm font-medium">{value || "N/A"}</p>
        )}
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}
