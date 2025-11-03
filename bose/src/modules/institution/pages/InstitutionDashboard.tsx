import CredentialForm from "../components/CredentialForm";
import IssuedList from "../components/IssuedList";

export default function InstitutionDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Institution Dashboard</h1>
      <CredentialForm onIssued={() => {}} />
      <IssuedList />
    </div>
  );
}


