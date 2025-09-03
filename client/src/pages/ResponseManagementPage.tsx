import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  FileText,
  Bot,
  User,
  Calendar,
  TrendingUp,
  Filter,
  Eye,
  Download
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';

interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  type: 'manual' | 'automated';
  status: 'active' | 'inactive' | 'draft';
  usageCount: number;
  lastUsed: string;
  createdBy: string;
}

interface CustomerResponse {
  id: string;
  customerName: string;
  feedbackType: 'review' | 'complaint' | 'inquiry';
  originalMessage: string;
  response: string;
  status: 'pending' | 'sent' | 'delivered' | 'read';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  responseTime: string;
  template: string;
  date: string;
}

const ResponseManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [responseFilter, setResponseFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('templates');
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    content: '',
    type: 'manual' as const
  });

  // Mock data for demonstration
  const mockTemplates: ResponseTemplate[] = [
    {
      id: '1',
      name: 'Positive Review Response',
      category: 'Reviews',
      content: 'Thank you for your wonderful feedback! We\'re thrilled that you had a great experience with our product. Your satisfaction is our top priority, and we look forward to serving you again soon.',
      type: 'automated',
      status: 'active',
      usageCount: 156,
      lastUsed: '2024-01-15',
      createdBy: 'Support Team'
    },
    {
      id: '2',
      name: 'Shipping Issue Apology',
      category: 'Complaints',
      content: 'We sincerely apologize for the shipping delay you experienced. This is not the level of service we strive to provide. We\'ve escalated your case and will ensure expedited resolution.',
      type: 'manual',
      status: 'active',
      usageCount: 89,
      lastUsed: '2024-01-14',
      createdBy: 'Customer Service'
    },
    {
      id: '3',
      name: 'Product Inquiry Response',
      category: 'Inquiries',
      content: 'Thank you for your interest in our products! I\'d be happy to provide you with detailed information about [Product Name]. Here are the key features and specifications...',
      type: 'automated',
      status: 'active',
      usageCount: 234,
      lastUsed: '2024-01-15',
      createdBy: 'Sales Team'
    },
    {
      id: '4',
      name: 'Technical Support Follow-up',
      category: 'Support',
      content: 'I hope your technical issue has been resolved. If you\'re still experiencing problems, please don\'t hesitate to reach out. We\'re committed to ensuring your complete satisfaction.',
      type: 'manual',
      status: 'draft',
      usageCount: 0,
      lastUsed: 'Never',
      createdBy: 'Support Team'
    }
  ];

  const mockResponses: CustomerResponse[] = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      feedbackType: 'review',
      originalMessage: 'Excellent product quality and fast delivery. Highly recommend!',
      response: 'Thank you for your wonderful feedback! We\'re thrilled that you had a great experience with our product.',
      status: 'sent',
      priority: 'low',
      assignedTo: 'Support Team A',
      responseTime: '2 hours',
      template: 'Positive Review Response',
      date: '2024-01-15'
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      feedbackType: 'complaint',
      originalMessage: 'Good product, but shipping took longer than expected.',
      response: 'We sincerely apologize for the shipping delay you experienced. This is not the level of service we strive to provide.',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'Customer Service',
      responseTime: '4 hours',
      template: 'Shipping Issue Apology',
      date: '2024-01-14'
    },
    {
      id: '3',
      customerName: 'Emily Rodriguez',
      feedbackType: 'inquiry',
      originalMessage: 'Can you tell me more about your premium product line?',
      response: 'Thank you for your interest in our products! I\'d be happy to provide you with detailed information...',
      status: 'delivered',
      priority: 'low',
      assignedTo: 'Sales Team',
      responseTime: '1 hour',
      template: 'Product Inquiry Response',
      date: '2024-01-13'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30', text: 'Pending' },
      sent: { color: 'bg-blue-900/20 text-blue-400 border-blue-500/30', text: 'Sent' },
      delivered: { color: 'bg-green-900/20 text-green-400 border-green-500/30', text: 'Delivered' },
      read: { color: 'bg-purple-900/20 text-purple-400 border-purple-500/30', text: 'Read' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} border border-0`}>
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-green-900/20 text-green-400 border-green-500/30', text: 'Low' },
      medium: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30', text: 'Medium' },
      high: { color: 'bg-red-900/20 text-red-400 border-red-500/30', text: 'High' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge className={`${config.color} border border-0`}>
        {config.text}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    return type === 'automated' ? 
      <Bot className="h-4 w-4 text-blue-600" /> : 
      <User className="h-4 w-4 text-green-600" />;
  };

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = templateFilter === 'all' || template.category === templateFilter;
    
    return matchesSearch && matchesCategory;
  });

  const filteredResponses = mockResponses.filter(response => {
    const matchesSearch = response.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.originalMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = responseFilter === 'all' || response.status === responseFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateTemplate = () => {
    // In a real app, this would save to the backend
    console.log('Creating template:', newTemplate);
    setShowNewTemplate(false);
    setNewTemplate({ name: '', category: '', content: '', type: 'manual' });
  };

  return (
    <Layout currentPage="response-management" breadcrumb={['Customer Feedback', 'Response Management']}>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Response Management</h1>
              <p className="text-gray-300 mt-1">Manage customer response templates and track response performance</p>
            </div>
            <div className="flex gap-3">
                             <Button className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                 <Download className="h-4 w-4" />
                 Export
               </Button>
               <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0" onClick={() => setShowNewTemplate(true)}>
                 <Plus className="h-4 w-4" />
                 New Template
               </Button>
            </div>
          </div>

                     {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                     <MessageSquare className="h-6 w-6 text-blue-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Total Responses</p>
                     <p className="text-2xl font-bold text-white">1,247</p>
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
                     <p className="text-sm font-medium text-gray-300">Response Rate</p>
                     <p className="text-2xl font-bold text-white">94%</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                     <Clock className="h-6 w-6 text-purple-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Avg Response Time</p>
                     <p className="text-2xl font-bold text-white">2.3h</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                     <FileText className="h-6 w-6 text-orange-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Active Templates</p>
                     <p className="text-2xl font-bold text-white">12</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

                     {/* Main Content Tabs */}
           <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
             <TabsList className="flex w-full bg-gray-800 border border-gray-600 rounded-lg p-1">
               <TabsTrigger 
                 value="templates" 
                 className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
               >
                 Response Templates
               </TabsTrigger>
               <TabsTrigger 
                 value="responses" 
                 className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
               >
                 Customer Responses
               </TabsTrigger>
               <TabsTrigger 
                 value="analytics" 
                 className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
               >
                 Response Analytics
               </TabsTrigger>
             </TabsList>

                         {/* Templates Tab */}
             <TabsContent value="templates" className="space-y-6">
               {/* Filters */}
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardContent className="p-6">
                   <div className="flex flex-col lg:flex-row gap-4">
                     <div className="flex-1">
                       <div className="relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                         <Input
                           placeholder="Search templates..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                         />
                       </div>
                     </div>
                     <Select value={templateFilter} onValueChange={setTemplateFilter}>
                       <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                         <SelectValue placeholder="Category" />
                       </SelectTrigger>
                       <SelectContent className="bg-gray-800 border-gray-600">
                         <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Categories</SelectItem>
                         <SelectItem value="Reviews" className="text-white hover:bg-gray-700 focus:bg-gray-700">Reviews</SelectItem>
                         <SelectItem value="Complaints" className="text-white hover:bg-gray-700 focus:bg-gray-700">Complaints</SelectItem>
                         <SelectItem value="Inquiries" className="text-white hover:bg-gray-700 focus:bg-gray-700">Inquiries</SelectItem>
                         <SelectItem value="Support" className="text-white hover:bg-gray-700 focus:bg-gray-700">Support</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </CardContent>
               </Card>

                             {/* Templates List */}
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardHeader>
                   <CardTitle className="text-white">Response Templates</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {filteredTemplates.map((template) => (
                       <div key={template.id} className="border border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-800/50">
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center gap-3">
                             {getTypeIcon(template.type)}
                             <div>
                               <h4 className="font-medium text-white">{template.name}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-sm text-gray-400">{template.category}</span>
                                 <span className="text-gray-500">•</span>
                                 <span className="text-sm text-gray-400">Used {template.usageCount} times</span>
                               </div>
                             </div>
                           </div>
                                                       <div className="flex items-center gap-2">
                              <Badge className={`${
                                template.status === 'active' ? 'bg-green-900/20 text-green-400 border-green-500/30' :
                                template.status === 'inactive' ? 'bg-gray-900/20 text-gray-400 border-gray-500/30' :
                                'bg-yellow-900/20 text-yellow-400 border-yellow-500/30'
                              } border border-0`}>
                                {template.status}
                              </Badge>
                            </div>
                         </div>
                         
                         <div className="mb-4">
                           <p className="text-gray-300 mb-3">{template.content}</p>
                           <div className="flex items-center gap-4 text-sm text-gray-400">
                             <span className="flex items-center gap-1">
                               <User className="h-3 w-3" />
                               {template.createdBy}
                             </span>
                             <span className="flex items-center gap-1">
                               <Calendar className="h-3 w-3" />
                               Last used: {template.lastUsed}
                             </span>
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <span className="text-sm text-gray-400">Type: {template.type}</span>
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <Eye className="h-4 w-4" />
                               Preview
                             </Button>
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <Edit className="h-4 w-4" />
                               Edit
                             </Button>
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <Copy className="h-4 w-4" />
                               Copy
                             </Button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>

                         {/* Responses Tab */}
             <TabsContent value="responses" className="space-y-6">
               {/* Filters */}
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardContent className="p-6">
                   <div className="flex flex-col lg:flex-row gap-4">
                     <div className="flex-1">
                       <div className="relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                         <Input
                           placeholder="Search responses..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                         />
                       </div>
                     </div>
                     <Select value={responseFilter} onValueChange={setResponseFilter}>
                       <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                         <SelectValue placeholder="Status" />
                       </SelectTrigger>
                       <SelectContent className="bg-gray-800 border-gray-600">
                         <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Statuses</SelectItem>
                         <SelectItem value="pending" className="text-white hover:bg-gray-700 focus:bg-gray-700">Pending</SelectItem>
                         <SelectItem value="sent" className="text-white hover:bg-gray-700 focus:bg-gray-700">Sent</SelectItem>
                         <SelectItem value="delivered" className="text-white hover:bg-gray-700 focus:bg-gray-700">Delivered</SelectItem>
                         <SelectItem value="read" className="text-white hover:bg-gray-700 focus:bg-gray-700">Read</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </CardContent>
               </Card>

                             {/* Responses List */}
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardHeader>
                   <CardTitle className="text-white">Customer Responses</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {filteredResponses.map((response) => (
                       <div key={response.id} className="border border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-800/50">
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                               {response.customerName.charAt(0)}
                             </div>
                             <div>
                               <h4 className="font-medium text-white">{response.customerName}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-sm text-gray-400">{response.feedbackType}</span>
                                 <span className="text-gray-500">•</span>
                                 <span className="text-sm text-gray-400">{response.responseTime} response</span>
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {getStatusBadge(response.status)}
                             {getPriorityBadge(response.priority)}
                           </div>
                         </div>
                         
                         <div className="mb-4">
                           <div className="mb-3">
                             <h5 className="font-semibold text-white mb-2">Original Message:</h5>
                             <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded border border-gray-600">{response.originalMessage}</p>
                           </div>
                           <div className="mb-3">
                             <h5 className="font-semibold text-white mb-2">Response:</h5>
                             <p className="text-gray-300 text-sm bg-blue-900/20 p-3 rounded border border-blue-500/30">{response.response}</p>
                           </div>
                           <div className="flex items-center gap-4 text-sm text-gray-400">
                             <span className="flex items-center gap-1">
                               <Calendar className="h-3 w-3" />
                               {response.date}
                             </span>
                             <span className="flex items-center gap-1">
                               <User className="h-3 w-3" />
                               {response.assignedTo}
                             </span>
                             <span className="flex items-center gap-1">
                               <FileText className="h-3 w-3" />
                               {response.template}
                             </span>
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <span className="text-sm text-gray-400">Response Time: {response.responseTime}</span>
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <Eye className="h-4 w-4" />
                               View Details
                             </Button>
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <Send className="h-4 w-4" />
                               Resend
                             </Button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>

                         {/* Analytics Tab */}
             <TabsContent value="analytics" className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                   <CardHeader>
                     <CardTitle className="text-white">Response Performance</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-gray-300">Response Rate</span>
                         <div className="flex items-center gap-2">
                           <div className="w-24 h-2 bg-gray-700 rounded-full">
                             <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                           </div>
                           <span className="text-sm text-gray-400">94%</span>
                         </div>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-gray-300">Avg Response Time</span>
                         <span className="text-sm text-gray-400">2.3 hours</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-gray-300">Customer Satisfaction</span>
                         <span className="text-sm text-gray-400">4.2/5</span>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                   <CardHeader>
                     <CardTitle className="text-white">Template Usage</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       {mockTemplates.slice(0, 3).map((template) => (
                         <div key={template.id} className="flex items-center justify-between">
                           <span className="text-sm font-medium text-gray-300">{template.name}</span>
                           <span className="text-sm text-gray-400">{template.usageCount} uses</span>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </TabsContent>
          </Tabs>

                     {/* New Template Modal */}
           {showNewTemplate && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
               <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700">
                 <h3 className="text-lg font-semibold mb-4 text-white">Create New Response Template</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
                     <Input
                       value={newTemplate.name}
                       onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                       placeholder="Enter template name"
                       className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                     <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                       <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent className="bg-gray-800 border-gray-600">
                         <SelectItem value="Reviews" className="text-white hover:bg-gray-700 focus:bg-gray-700">Reviews</SelectItem>
                         <SelectItem value="Complaints" className="text-white hover:bg-gray-700 focus:bg-gray-700">Complaints</SelectItem>
                         <SelectItem value="Inquiries" className="text-white hover:bg-gray-700 focus:bg-gray-700">Inquiries</SelectItem>
                         <SelectItem value="Support" className="text-white hover:bg-gray-700 focus:bg-gray-700">Support</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                     <Textarea
                       value={newTemplate.content}
                       onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                       placeholder="Enter template content"
                       rows={4}
                       className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                     <Select value={newTemplate.type} onValueChange={(value: 'manual' | 'automated') => setNewTemplate({...newTemplate, type: value})}>
                       <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-gray-800 border-gray-600">
                         <SelectItem value="manual" className="text-white hover:bg-gray-700 focus:bg-gray-700">Manual</SelectItem>
                         <SelectItem value="automated" className="text-white hover:bg-gray-700 focus:bg-gray-700">Automated</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                 <div className="flex gap-3 mt-6">
                   <Button onClick={handleCreateTemplate} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">Create Template</Button>
                   <Button onClick={() => setShowNewTemplate(false)} className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">Cancel</Button>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </Layout>
  );
};

export default ResponseManagementPage;
