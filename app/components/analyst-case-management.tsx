
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, User, Mail, Calendar, MessageSquare, Edit, Plus, FileText, Download, File } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Case {
  id: string;
  title: string;
  description: string;
  email: string;
  category: string;
  status: string;
  priority?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  analyst?: {
    name: string;
    email: string;
  };
  updates: Array<{
    id: string;
    message: string;
    createdAt: string;
    analyst: {
      name: string;
    };
  }>;
  documents?: Array<{
    id: string;
    filename: string;
  }>;
  // Dynamic fields
  nameChange?: string;
  addressChange?: string;
  addNewBranch?: string;
  addNewAccount?: string;
  addNewEmployee?: string;
  addNewCompany?: string;
}

interface AnalystCaseManagementProps {
  analystId: string;
}

export default function AnalystCaseManagement({ analystId }: AnalystCaseManagementProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeDialogs, setActiveDialogs] = useState<{[key: string]: boolean}>({});

  const fetchCases = async () => {
    try {
      const url = categoryFilter === 'all' ? '/api/cases' : `/api/cases?category=${categoryFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setCases(data.cases);
        setFilteredCases(data.cases);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [categoryFilter]);

  const updateCase = async (caseId: string, updates: any) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success('Case updated successfully');
        fetchCases();
        return true;
      } else {
        toast.error('Failed to update case');
        return false;
      }
    } catch (error) {
      toast.error('Error updating case');
      return false;
    }
  };

  const addCaseUpdate = async (caseId: string, message: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/cases/${caseId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        toast.success('Update added successfully');
        setUpdateMessage('');
        setActiveDialogs(prev => ({ ...prev, [`update-${caseId}`]: false })); // Close the dialog
        await fetchCases(); // Refresh cases
        return true;
      } else {
        toast.error('Failed to add update');
        return false;
      }
    } catch (error) {
      toast.error('Error adding update');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEmailClick = (email: string, caseTitle: string) => {
    const subject = `Case Update: ${caseTitle}`;
    const body = `Dear Customer,

I am writing to inform you that case "${caseTitle}" has been closed successfully. Please review your case in our Customer Portal for further details.

Best Regards,
Customer Support Team`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const renderDynamicFields = (case_: Case) => {
    const fields = [];
    
    if (case_.category === 'CUSTOMER') {
      if (case_.nameChange) fields.push({ label: 'Name Change', value: case_.nameChange });
      if (case_.addressChange) fields.push({ label: 'Address Change', value: case_.addressChange });
    } else if (case_.category === 'MERCHANT') {
      if (case_.addNewBranch) fields.push({ label: 'New Branch', value: case_.addNewBranch });
      if (case_.addNewAccount) fields.push({ label: 'New Account', value: case_.addNewAccount });
    } else if (case_.category === 'COMMERCIAL') {
      if (case_.addNewEmployee) fields.push({ label: 'New Employee', value: case_.addNewEmployee });
      if (case_.addNewCompany) fields.push({ label: 'New Company', value: case_.addNewCompany });
    }

    return fields;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="MERCHANT">Merchant</SelectItem>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No cases found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((case_) => (
            <Card key={case_.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{case_.title}</CardTitle>
                    {/* Documents Section */}
                    {case_.documents && case_.documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Attached Documents</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {case_.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <div className="flex items-center space-x-2">
                                <File className="h-4 w-4 text-blue-500" />
                                <span className="truncate">{doc.filename}</span>
                              </div>
                              <a href={`/api/cases/${case_.id}/documents/${doc.id}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="p-1 hover:bg-gray-200 rounded">
                                <Download className="h-4 w-4 text-gray-500" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Case Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{case_.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{case_.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(case_.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{case_.category}</Badge>
                      {case_.priority && (
                        <Badge className={getPriorityColor(case_.priority)}>
                          {case_.priority}
                        </Badge>
                      )}
                    </div>
                    {case_.dueDate && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {format(new Date(case_.dueDate), 'MMM dd')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  {case_.description}
                </div>

                {/* Documents Section */}
                {case_.documents && case_.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Attached Documents</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {case_.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center space-x-2">
                            <File className="h-4 w-4 text-blue-500" />
                            <span className="truncate">{doc.filename}</span>
                          </div>
                          <a
                            href={`/api/cases/${case_.id}/documents/${doc.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 rounded">
                            <Download className="h-4 w-4 text-gray-500" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Fields */}
                {renderDynamicFields(case_).length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-sm mb-2">Category-Specific Information</h4>
                    <div className="space-y-1">
                      {renderDynamicFields(case_).map((field, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{field.label}:</span> {field.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Case Updates */}
                {case_.updates.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Recent Updates</span>
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {case_.updates.slice(0, 3).map((update) => (
                        <div key={update.id} className="bg-gray-50 p-3 rounded text-sm">
                          <p className="text-gray-700">{update.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {update.analyst.name} on {format(new Date(update.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEmailClick(case_.email, case_.title)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email Customer
                  </Button>

                  {/* Case Management Dialog */}
                  <Dialog 
                    open={activeDialogs[`manage-${case_.id}`]} 
                    onOpenChange={(open) => setActiveDialogs(prev => ({ ...prev, [`manage-${case_.id}`]: open }))}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Case
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Case: {case_.title}</DialogTitle>
                        <DialogDescription>
                          Update case status, priority, and due date
                        </DialogDescription>
                      </DialogHeader>
                      <CaseManagementForm 
                        case_={case_} 
                        onUpdate={updateCase}
                        onSuccess={() => setActiveDialogs(prev => ({ ...prev, [`manage-${case_.id}`]: false }))} 
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Add Update Dialog */}
                  <Dialog 
                    open={activeDialogs[`update-${case_.id}`]}
                    onOpenChange={(open) => setActiveDialogs(prev => ({ ...prev, [`update-${case_.id}`]: open }))}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Update: {case_.title}</DialogTitle>
                        <DialogDescription>
                          Add a note or update for the customer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="update-message">Update Message</Label>
                          <Textarea
                            id="update-message"
                            placeholder="Enter your update message..."
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <Button
                          onClick={() => addCaseUpdate(case_.id, updateMessage)}
                          disabled={!updateMessage.trim() || isUpdating}
                          className="w-full"
                        >
                          {isUpdating ? 'Adding Update...' : 'Add Update'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Case Management Form Component
function CaseManagementForm({ case_, onUpdate, onSuccess }: { 
  case_: Case; 
  onUpdate: (id: string, updates: any) => Promise<boolean>;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState(case_.status);
  const [priority, setPriority] = useState(case_.priority || '');
  const [dueDate, setDueDate] = useState(case_.dueDate ? format(new Date(case_.dueDate), 'yyyy-MM-dd') : '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const updates: any = {
      status,
      analystId: case_.analyst?.name || undefined,
    };

    if (priority) updates.priority = priority;
    if (dueDate) updates.dueDate = dueDate;

    const success = await onUpdate(case_.id, updates);
    if (success && onSuccess) {
      onSuccess();
    }
    setIsUpdating(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Update Case'}
      </Button>
    </form>
  );
}
