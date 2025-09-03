import React, { useState } from 'react';
import { 
  Star, 
  AlertTriangle, 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Award,
  Lightbulb
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface OverviewStats {
  totalReviews: number;
  totalComplaints: number;
  averageRating: number;
  responseRate: number;
  avgResponseTime: string;
  customerSatisfaction: number;
  aiInsights: number;
  pendingActions: number;
}

interface RecentActivity {
  id: string;
  type: 'review' | 'complaint' | 'ai-insight' | 'response';
  title: string;
  description: string;
  date: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
}

const ReviewsComplaintsOverviewPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for demonstration
  const overviewStats: OverviewStats = {
    totalReviews: 1247,
    totalComplaints: 89,
    averageRating: 4.3,
    responseRate: 94,
    avgResponseTime: '2.3h',
    customerSatisfaction: 87,
    aiInsights: 47,
    pendingActions: 23
  };

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'review',
      title: 'New 5-star review from Sarah Johnson',
      description: 'Excellent product quality and fast delivery. Highly recommend!',
      date: '2 hours ago',
      status: 'New'
    },
    {
      id: '2',
      type: 'complaint',
      title: 'High priority complaint from Mike Chen',
      description: 'Product arrived damaged - requires immediate attention',
      date: '4 hours ago',
      priority: 'high',
      status: 'In Progress'
    },
    {
      id: '3',
      type: 'ai-insight',
      title: 'AI detected declining satisfaction trend',
      description: '15% decrease in positive sentiment across product categories',
      date: '6 hours ago',
      priority: 'high'
    },
    {
      id: '4',
      type: 'response',
      title: 'Response sent to Emily Rodriguez',
      description: 'Shipping issue resolved with compensation offer',
      date: '8 hours ago',
      status: 'Resolved'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'complaint':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'ai-insight':
        return <Brain className="h-5 w-5 text-blue-500" />;
      case 'response':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      'New': { color: 'bg-blue-900/20 text-blue-400 border-blue-500/30', text: 'New' },
      'In Progress': { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30', text: 'In Progress' },
      'Resolved': { color: 'bg-green-900/20 text-green-400 border-green-500/30', text: 'Resolved' },
      'Closed': { color: 'bg-gray-900/20 text-gray-400 border-gray-500/30', text: 'Closed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} border border-0`}>
        {config.text}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Layout currentPage="reviews-complaints-overview" breadcrumb={['Customer Feedback', 'Overview']}>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Reviews & Complaints Overview</h1>
              <p className="text-gray-300 mt-1">Comprehensive dashboard for customer feedback management</p>
            </div>
            <div className="flex gap-3">
                             <Select value={timeFilter} onValueChange={setTimeFilter}>
                 <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-gray-800 border-gray-600">
                   <SelectItem value="24h" className="text-white hover:bg-gray-700 focus:bg-gray-700">Last 24h</SelectItem>
                   <SelectItem value="7d" className="text-white hover:bg-gray-700 focus:bg-gray-700">Last 7 days</SelectItem>
                   <SelectItem value="30d" className="text-white hover:bg-gray-700 focus:bg-gray-700">Last 30 days</SelectItem>
                   <SelectItem value="90d" className="text-white hover:bg-gray-700 focus:bg-gray-700">Last 90 days</SelectItem>
                 </SelectContent>
               </Select>
               <Button className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                 <RefreshCw className="h-4 w-4" />
                 Refresh
               </Button>
               <Button className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                 <Download className="h-4 w-4" />
                 Export
               </Button>
            </div>
          </div>

                     {/* Main Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Reviews Stats */}
             <Card className="border-l-4 border-l-blue-500 w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                     <Star className="h-6 w-6 text-blue-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-300">Total Reviews</p>
                     <p className="text-2xl font-bold text-white">{overviewStats.totalReviews.toLocaleString()}</p>
                     <div className="flex items-center gap-1 mt-1">
                       {renderStars(overviewStats.averageRating)}
                       <span className="text-sm text-gray-400 ml-2">{overviewStats.averageRating}/5</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Complaints Stats */}
             <Card className="border-l-4 border-l-red-500 w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                     <AlertTriangle className="h-6 w-6 text-red-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-300">Total Complaints</p>
                     <p className="text-2xl font-bold text-white">{overviewStats.totalComplaints}</p>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm text-gray-300">Response Rate:</span>
                       <span className="text-sm font-medium text-green-400">{overviewStats.responseRate}%</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* AI Analysis Stats */}
             <Card className="border-l-4 border-l-purple-500 w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                     <Brain className="h-6 w-6 text-purple-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-300">AI Insights</p>
                     <p className="text-2xl font-bold text-white">{overviewStats.aiInsights}</p>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm text-gray-300">Accuracy:</span>
                       <span className="text-sm font-medium text-blue-400">94.2%</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Response Management Stats */}
             <Card className="border-l-4 border-l-green-500 w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                     <MessageSquare className="h-6 w-6 text-green-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-300">Response Time</p>
                     <p className="text-2xl font-bold text-white">{overviewStats.avgResponseTime}</p>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm text-gray-300">Pending:</span>
                       <span className="text-sm font-medium text-orange-400">{overviewStats.pendingActions}</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

                     {/* Performance Metrics */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Customer Satisfaction */}
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-white">
                   <Award className="h-5 w-5" />
                   Customer Satisfaction
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-center">
                   <div className="text-3xl font-bold text-white mb-2">{overviewStats.customerSatisfaction}%</div>
                   <div className="flex items-center justify-center gap-1 mb-4">
                     {renderStars(4)}
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-300">Excellent</span>
                       <span className="text-green-400">72%</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-300">Good</span>
                       <span className="text-blue-400">18%</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-gray-300">Needs Improvement</span>
                       <span className="text-orange-400">10%</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Response Performance */}
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-white">
                   <Target className="h-5 w-5" />
                   Response Performance
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div>
                     <div className="flex items-center justify-between text-sm mb-2">
                       <span className="text-gray-300">Response Rate</span>
                       <span className="font-medium text-gray-300">{overviewStats.responseRate}%</span>
                     </div>
                     <Progress value={overviewStats.responseRate} className="h-2" />
                   </div>
                   <div>
                     <div className="flex items-center justify-between text-sm mb-2">
                       <span className="text-gray-300">Avg Response Time</span>
                       <span className="font-medium text-gray-300">{overviewStats.avgResponseTime}</span>
                     </div>
                     <Progress value={85} className="h-2" />
                   </div>
                   <div>
                     <div className="flex items-center justify-between text-sm mb-2">
                       <span className="text-gray-300">Resolution Rate</span>
                       <span className="font-medium text-gray-300">89%</span>
                     </div>
                     <Progress value={89} className="h-2" />
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* AI Analysis Summary */}
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-white">
                   <Lightbulb className="h-5 w-5" />
                   AI Analysis Summary
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-300">Insights Generated</span>
                     <span className="text-lg font-bold text-blue-400">{overviewStats.aiInsights}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-300">Accuracy</span>
                     <span className="text-lg font-bold text-green-400">94.2%</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-300">Predictions</span>
                     <span className="text-lg font-bold text-purple-400">89%</span>
                   </div>
                   <div className="pt-2">
                     <Button size="sm" className="w-full gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                       <Brain className="h-4 w-4" />
                       View All Insights
                     </Button>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2 w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors bg-gray-800/50 border border-gray-600">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-300">{activity.title}</h4>
                          {getPriorityBadge(activity.priority)}
                          {getStatusBadge(activity.status)}
                        </div>
                        <p className="text-sm text-gray-400 mb-1">{activity.description}</p>
                        <span className="text-xs text-gray-500">{activity.date}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <Button className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start gap-2 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                    <Star className="h-4 w-4" />
                    Review New Feedback
                  </Button>
                  <Button className="w-full justify-start gap-2 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                    <AlertTriangle className="h-4 w-4" />
                    Handle Complaints
                  </Button>
                  <Button className="w-full justify-start gap-2 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                    <Brain className="h-4 w-4" />
                    Run AI Analysis
                  </Button>
                  <Button className="w-full justify-start gap-2 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    Manage Responses
                  </Button>
                  <Button className="w-full justify-start gap-2 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                    <BarChart3 className="h-4 w-4" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback Trends */}
            <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  Feedback Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-400">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-medium mb-2 text-gray-300">Trend Charts Coming Soon</h3>
                  <p className="text-gray-400">Visual trend analysis and comparison charts will be available in the next update.</p>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <PieChart className="h-5 w-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Product Quality</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-24" />
                      <span className="text-sm text-gray-400">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Customer Service</span>
                    <div className="flex items-center gap-2">
                      <Progress value={28} className="w-24" />
                      <span className="text-sm text-gray-400">28%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Shipping & Delivery</span>
                    <div className="flex items-center gap-2">
                      <Progress value={22} className="w-24" />
                      <span className="text-xs text-gray-400">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Website Experience</span>
                    <div className="flex items-center gap-2">
                      <Progress value={15} className="w-24" />
                      <span className="text-sm text-gray-400">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewsComplaintsOverviewPage;
