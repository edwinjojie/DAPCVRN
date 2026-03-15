import React from 'react';
import CredentialForm from '../components/CredentialForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export default function IssueCredential() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Issue New Credential</h1>
        <p className="text-gray-500 mt-1">Directly issue a verified credential to a student</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credential Details</CardTitle>
          <CardDescription>Enter the student and course information to issue a new certificate.</CardDescription>
        </CardHeader>
        <CardContent>
          <CredentialForm onIssued={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
}
