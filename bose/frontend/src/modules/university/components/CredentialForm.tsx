import { useState, useEffect } from "react";
import { useIssueCredential } from "../hooks/useIssueCredential";
import { useAuth } from "../../../contexts/AuthContext";

export default function CredentialForm({ onIssued }: { onIssued: () => void }) {
  const { user } = useAuth();
  const { issue } = useIssueCredential(onIssued);
  const [form, setForm] = useState({ 
    studentId: "", 
    credentialName: "", 
    institution: user?.organization || "", 
    degree: "", 
    issueDate: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    if (user?.organization) {
      setForm(prev => ({ ...prev, institution: user.organization }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    issue(form);
    setForm({ 
      studentId: "", 
      credentialName: "", 
      institution: user?.organization || "", 
      degree: "", 
      issueDate: new Date().toISOString().split('T')[0] 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/30 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student ID / User ID</label>
        <input
          name="studentId"
          value={form.studentId}
          onChange={e => setForm({ ...form, studentId: e.target.value })}
          placeholder="e.g. USR-STU-001"
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Credential Name</label>
        <input
          name="credentialName"
          value={form.credentialName}
          onChange={e => setForm({ ...form, credentialName: e.target.value })}
          placeholder="e.g. Bachelor of Science"
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution</label>
        <input
          name="institution"
          value={form.institution}
          onChange={e => setForm({ ...form, institution: e.target.value })}
          placeholder="University Name"
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Degree / Major</label>
        <input
          name="degree"
          value={form.degree}
          onChange={e => setForm({ ...form, degree: e.target.value })}
          placeholder="e.g. Computer Science"
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
        <input
          type="date"
          name="issueDate"
          value={form.issueDate}
          onChange={e => setForm({ ...form, issueDate: e.target.value })}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
      </div>

      <div className="md:col-span-2 pt-4">
        <button 
          type="submit" 
          className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-95"
        >
          Issue Credential & Anchor to Blockchain
        </button>
      </div>
    </form>
  );
}


