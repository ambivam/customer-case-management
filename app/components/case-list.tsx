
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Mail, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

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
  user?: {
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
}

interface CaseListProps {
  isAnalyst?: boolean;
  onCaseUpdate?: () => void;
}

export default function CaseList({ isAnalyst = false, onCaseUpdate }: CaseListProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

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
    const subject = encodeURIComponent(`Regarding Case: ${caseTitle}`);
    const body = encodeURIComponent(`Dear Customer,\n\nI am writing regarding your case "${caseTitle}".\n\nBest regards,\nSupport Team`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
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
      {isAnalyst && (
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
      )}

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
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{isAnalyst ? case_.user?.name : 'You'}</span>
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
                <CardDescription className="mb-4">
                  {case_.description}
                </CardDescription>
                
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
                {isAnalyst && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEmailClick(case_.email, case_.title)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email Customer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
