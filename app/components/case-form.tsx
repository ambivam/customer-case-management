
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CaseFormProps {
  onSuccess?: () => void;
}

export default function CaseForm({ onSuccess }: CaseFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [nameChange, setNameChange] = useState('');
  const [addressChange, setAddressChange] = useState('');
  const [addNewBranch, setAddNewBranch] = useState('');
  const [addNewAccount, setAddNewAccount] = useState('');
  const [addNewEmployee, setAddNewEmployee] = useState('');
  const [addNewCompany, setAddNewCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('email', email);
      formData.append('category', category);
      
      // Add dynamic fields based on category
      if (category === 'CUSTOMER') {
        formData.append('nameChange', nameChange);
        formData.append('addressChange', addressChange);
      } else if (category === 'MERCHANT') {
        formData.append('addNewBranch', addNewBranch);
        formData.append('addNewAccount', addNewAccount);
      } else if (category === 'COMMERCIAL') {
        formData.append('addNewEmployee', addNewEmployee);
        formData.append('addNewCompany', addNewCompany);
      }

      const response = await fetch('/api/cases', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Case created successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setEmail('');
        setCategory('');
        setNameChange('');
        setAddressChange('');
        setAddNewBranch('');
        setAddNewAccount('');
        setAddNewEmployee('');
        setAddNewCompany('');
        onSuccess?.();
      } else {
        toast.error(data.error || 'Failed to create case');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDynamicFields = () => {
    switch (category) {
      case 'CUSTOMER':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="nameChange">Name Change Request</Label>
              <Input
                id="nameChange"
                placeholder="Describe the name change required"
                value={nameChange}
                onChange={(e) => setNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressChange">Address Change Request</Label>
              <Textarea
                id="addressChange"
                placeholder="Provide details about the address change"
                value={addressChange}
                onChange={(e) => setAddressChange(e.target.value)}
              />
            </div>
          </>
        );
      case 'MERCHANT':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="addNewBranch">Add New Branch</Label>
              <Textarea
                id="addNewBranch"
                placeholder="Provide details about the new branch"
                value={addNewBranch}
                onChange={(e) => setAddNewBranch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addNewAccount">Add New Account</Label>
              <Textarea
                id="addNewAccount"
                placeholder="Provide details about the new account"
                value={addNewAccount}
                onChange={(e) => setAddNewAccount(e.target.value)}
              />
            </div>
          </>
        );
      case 'COMMERCIAL':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="addNewEmployee">Add New Employee</Label>
              <Textarea
                id="addNewEmployee"
                placeholder="Provide details about the new employee"
                value={addNewEmployee}
                onChange={(e) => setAddNewEmployee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addNewCompany">Add New Company</Label>
              <Textarea
                id="addNewCompany"
                placeholder="Provide details about the new company"
                value={addNewCompany}
                onChange={(e) => setAddNewCompany(e.target.value)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <CardTitle>Create New Case</CardTitle>
        </div>
        <CardDescription>
          Submit a new case for our team to review and resolve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of your issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Case Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="MERCHANT">Merchant</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Case Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your case..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Dynamic fields based on category */}
          {category && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Category-Specific Information</h4>
              {renderDynamicFields()}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Case...' : 'Submit Case'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
