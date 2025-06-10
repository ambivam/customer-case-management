'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { X, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseFormProps {
  onSuccess?: () => void;
}

export default function CaseForm({ onSuccess }: CaseFormProps) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
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
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      // Append files if any
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });
      
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
        setFiles([]);
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

          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-32',
                    'border-2 border-dashed rounded-lg cursor-pointer',
                    'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB each</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {files.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
