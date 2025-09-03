import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Search, 
  Download, 
  Eye, 
  MessageSquare,
  Flag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Priority,
  Filter
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface Complaint {
  id: string;
  customerName: string;
  subject: string;
  description: string;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  assignedTo: string;
  responseTime: string;
}

const ComplaintsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock data for demonstration
  const mockComplaints: Complaint[] = [
    {
      id: '1',
      customerName: 'Jennifer Martinez',
      subject: 'Product arrived damaged',
      description: 'The package was delivered with visible damage and the product inside is broken.',
      date: '2024-01-15',
      priority: 'high',
      status: 'in-progress',
      category: 'Shipping Issues',
      assignedTo: 'Support Team A',
      responseTime: '2 hours'
    },
    {
      id: '2',
      customerName: 'Robert Wilson',
      subject: 'Incorrect order received',
      description: 'I ordered a blue widget but received a red one instead.',
      date: '2024-01-14',
      priority: 'medium',
      status: 'open',
      category: 'Order Errors',
      assignedTo: 'Unassigned',
      responseTime: '4 hours'
    },
    {
      id: '3',
      customerName: 'Lisa Thompson',
      subject: 'Poor customer service',
      description: 'The customer service representative was rude and unhelpful.',
      date: '2024-01-13',
      priority: 'critical',
      status: 'open',
      category: 'Service Quality',
      assignedTo: 'Management',
      responseTime: '1 hour'
    },
    {
      id: '4',
      customerName: 'Michael Brown',
      subject: 'Website not working',
      description: 'Cannot access the website or place orders for the past 2 hours.',
      date: '2024-01-12',
      priority: 'high',
      status: 'resolved',
      category: 'Technical Issues',
      assignedTo: 'IT Support',
      responseTime: '30 minutes'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-green-900/20 text-green-400 border-green-500/30', text: 'Low' },
      medium: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30', text: 'Medium' },
      high: { color: 'bg-orange-900/20 text-orange-400 border-orange-500/30', text: 'High' },
      critical: { color: 'bg-red-900/20 text-red-400 border-red-500/30', text: 'Critical' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge className={`${config.color} border border-0`}>
        {config.text}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-red-900/20 text-red-400 border-red-500/30', text: 'Open' },
      'in-progress': { color: 'bg-blue-900/20 text-blue-400 border-blue-500/30', text: 'In Progress' },
      resolved: { color: 'bg-green-900/20 text-green-400 border-green-500/30', text: 'Resolved' },
      closed: { color: 'bg-gray-900/20 text-gray-400 border-gray-500/30', text: 'Closed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} border border-0`}>
        {config.text}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredComplaints = mockComplaints.filter(complaint => {
    const matchesSearch = complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected tab (status-based)
    let matchesTab = true;
    if (selectedTab === 'open') {
      matchesTab = complaint.status === 'open';
    } else if (selectedTab === 'in-progress') {
      matchesTab = complaint.status === 'in-progress';
    } else if (selectedTab === 'resolved') {
      matchesTab = complaint.status === 'resolved';
    } else if (selectedTab === 'closed') {
      matchesTab = complaint.status === 'closed';
    }
    // 'all' tab shows everything
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    
    return matchesSearch && matchesTab && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <Layout currentPage="complaints" breadcrumb={['Customer Feedback', 'Complaints']}>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Customer Complaints</h1>
              <p className="text-gray-300 mt-1">Track and resolve customer issues efficiently</p>
            </div>
            <div className="flex gap-3">
                             <Button className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                 <Download className="h-4 w-4" />
                 Export
               </Button>
               <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
                 <MessageSquare className="h-4 w-4" />
                 New Complaint
               </Button>
            </div>
          </div>

                     {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                     <AlertTriangle className="h-6 w-6 text-red-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Open Complaints</p>
                     <p className="text-2xl font-bold text-white">{mockComplaints.filter(c => c.status === 'open').length}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                     <Clock className="h-6 w-6 text-orange-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">In Progress</p>
                     <p className="text-2xl font-bold text-white">{mockComplaints.filter(c => c.status === 'in-progress').length}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                     <CheckCircle className="h-6 w-6 text-green-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Resolved Today</p>
                     <p className="text-2xl font-bold text-white">{mockComplaints.filter(c => c.status === 'resolved').length}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                     <TrendingDown className="h-6 w-6 text-purple-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Avg Response</p>
                     <p className="text-2xl font-bold text-white">2.3h</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

                     {/* Filters and Search */}
           <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
             <CardContent className="p-6">
               <div className="flex flex-col lg:flex-row gap-4">
                 <div className="flex-1">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input
                       placeholder="Search complaints, customers, or subjects..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                     />
                   </div>
                 </div>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                     <SelectValue placeholder="Status" />
                   </SelectTrigger>
                   <SelectContent className="bg-gray-800 border-gray-600">
                     <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Statuses</SelectItem>
                     <SelectItem value="open" className="text-white hover:bg-gray-700 focus:bg-gray-700">Open</SelectItem>
                     <SelectItem value="in-progress" className="text-white hover:bg-gray-700 focus:bg-gray-700">In Progress</SelectItem>
                     <SelectItem value="resolved" className="text-white hover:bg-gray-700 focus:bg-gray-700">Resolved</SelectItem>
                     <SelectItem value="closed" className="text-white hover:bg-gray-700 focus:bg-gray-700">Closed</SelectItem>
                   </SelectContent>
                 </Select>
                 <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                   <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                     <SelectValue placeholder="Priority" />
                   </SelectTrigger>
                   <SelectContent className="bg-gray-800 border-gray-600">
                     <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Priorities</SelectItem>
                     <SelectItem value="low" className="text-white hover:bg-gray-700 focus:bg-gray-700">Low</SelectItem>
                     <SelectItem value="medium" className="text-white hover:bg-gray-700 focus:bg-gray-700">Medium</SelectItem>
                     <SelectItem value="high" className="text-white hover:bg-gray-700 focus:bg-gray-700">High</SelectItem>
                     <SelectItem value="critical" className="text-white hover:bg-gray-700 focus:bg-gray-700">Critical</SelectItem>
                   </SelectContent>
                 </Select>
                 <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                   <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                     <SelectValue placeholder="Category" />
                   </SelectTrigger>
                   <SelectContent className="bg-gray-800 border-gray-600">
                     <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Categories</SelectItem>
                     <SelectItem value="Shipping Issues" className="text-white hover:bg-gray-700 focus:bg-gray-700">Shipping Issues</SelectItem>
                     <SelectItem value="Order Errors" className="text-white hover:bg-gray-700 focus:bg-gray-700">Order Errors</SelectItem>
                     <SelectItem value="Service Quality" className="text-white hover:bg-gray-700 focus:bg-gray-700">Service Quality</SelectItem>
                     <SelectItem value="Technical Issues" className="text-white hover:bg-gray-700 focus:bg-gray-700">Technical Issues</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </CardContent>
           </Card>

                     {/* Complaints Tabs */}
           <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
             <CardHeader>
               <CardTitle className="text-white">Customer Complaints</CardTitle>
             </CardHeader>
             <CardContent>
               <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                 <TabsList className="flex w-full bg-gray-800 border border-gray-600 rounded-lg p-1">
                   <TabsTrigger 
                     value="all" 
                     className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                   >
                     All
                   </TabsTrigger>
                   <TabsTrigger 
                     value="open" 
                     className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                   >
                     Open
                   </TabsTrigger>
                   <TabsTrigger 
                     value="in-progress" 
                     className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                   >
                     In Progress
                   </TabsTrigger>
                   <TabsTrigger 
                     value="resolved" 
                     className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                   >
                     Resolved
                   </TabsTrigger>
                   <TabsTrigger 
                     value="closed" 
                     className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                   >
                     Closed
                   </TabsTrigger>
                 </TabsList>
                 
                 <TabsContent value={selectedTab} className="mt-6">
                   <div className="mb-4 flex items-center justify-between">
                     <p className="text-sm text-gray-400">
                       Showing {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
                       {selectedTab !== 'all' && ` in ${selectedTab.replace('-', ' ')} status`}
                     </p>
                   </div>
                   <div className="space-y-4">
                     {filteredComplaints.map((complaint) => (
                       <div key={complaint.id} className="border border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-800/50">
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                               {complaint.customerName.charAt(0)}
                             </div>
                             <div>
                               <h4 className="font-medium text-white">{complaint.customerName}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-sm text-gray-400">{complaint.category}</span>
                                 <span className="text-gray-500">•</span>
                                 <span className="text-sm text-gray-400">{complaint.responseTime} response</span>
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {getPriorityBadge(complaint.priority)}
                             {getStatusBadge(complaint.status)}
                           </div>
                         </div>
                         
                         <div className="mb-4">
                           <h5 className="font-semibold text-white mb-2">{complaint.subject}</h5>
                           <p className="text-gray-300 mb-3">{complaint.description}</p>
                           <div className="flex items-center gap-4 text-sm text-gray-400">
                             <span className="flex items-center gap-1">
                               <Calendar className="h-3 w-3" />
                               {complaint.date}
                             </span>
                             <span className="flex items-center gap-1">
                               <User className="h-3 w-3" />
                               {complaint.assignedTo}
                             </span>
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             {getPriorityIcon(complaint.priority)}
                             <span className="text-sm text-gray-400">Priority: {complaint.priority}</span>
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <Eye className="h-4 w-4" />
                               View
                             </Button>
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <MessageSquare className="h-4 w-4" />
                               Respond
                             </Button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </TabsContent>
               </Tabs>
             </CardContent>
           </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ComplaintsPage;
