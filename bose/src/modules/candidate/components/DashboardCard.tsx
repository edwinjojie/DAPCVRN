interface Props { label: string; value: number; }

export default function DashboardCard({ label, value }: Props) {
  return (
    <div className="bg-secondary p-4 rounded-xl text-center hover:shadow-[0_0_15px_#00BFA6]/10">
      <p className="text-gray-400 text-sm">{label}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
  );
}


