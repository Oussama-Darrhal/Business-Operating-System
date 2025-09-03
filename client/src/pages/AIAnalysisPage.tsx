import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Activity,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  MessageSquare,
  Star,
  Users,
  Target,
  Eye
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

interface AIInsight {
  id: string;
  type: 'sentiment' | 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  date: string;
  status: 'new' | 'reviewed' | 'implemented';
}

interface SentimentData {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
}

const AIAnalysisPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [insightTypeFilter, setInsightTypeFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data for demonstration
  const mockInsights: AIInsight[] = [
    {
      id: '1',
      type: 'sentiment',
      title: 'Customer satisfaction declining in Q4',
      description: 'AI detected a 15% decrease in positive sentiment across all product categories, particularly in shipping and delivery feedback.',
      confidence: 94,
      impact: 'high',
      category: 'Customer Experience',
      date: '2024-01-15',
      status: 'new'
    },
    {
      id: '2',
      type: 'trend',
      title: 'Positive feedback increasing for premium products',
      description: 'Analysis shows 23% improvement in customer satisfaction for premium product lines, suggesting successful quality improvements.',
      confidence: 87,
      impact: 'medium',
      category: 'Product Quality',
      date: '2024-01-14',
      status: 'reviewed'
    },
    {
      id: '3',
      type: 'anomaly',
      title: 'Unusual spike in technical support complaints',
      description: 'Detected 3x increase in technical issues reported on weekends, potentially related to system maintenance schedules.',
      confidence: 91,
      impact: 'high',
      category: 'Technical Support',
      date: '2024-01-13',
      status: 'new'
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Optimize response time during peak hours',
      description: 'AI suggests increasing support staff during 2-6 PM timeframe to reduce average response time from 4.2h to 2.1h.',
      confidence: 89,
      impact: 'medium',
      category: 'Operations',
      date: '2024-01-12',
      status: 'implemented'
    }
  ];

  const mockSentimentData: SentimentData[] = [
    { category: 'Product Quality', positive: 78, neutral: 15, negative: 7 },
    { category: 'Customer Service', positive: 65, neutral: 20, negative: 15 },
    { category: 'Shipping & Delivery', positive: 72, neutral: 18, negative: 10 },
    { category: 'Website Experience', positive: 81, neutral: 12, negative: 7 },
    { category: 'Pricing', positive: 58, neutral: 25, negative: 17 }
  ];

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'sentiment':
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const impactConfig = {
      low: { color: 'bg-green-900/20 text-green-400 border-green-500/30', text: 'Low Impact' },
      medium: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30', text: 'Medium Impact' },
      high: { color: 'bg-red-900/20 text-red-400 border-red-500/30', text: 'High Impact' }
    };
    
    const config = impactConfig[impact as keyof typeof impactConfig];
    return (
      <Badge className={`${config.color} border border-0`}>
        {config.text}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-900/20 text-blue-400 border-blue-500/30', text: 'New' },
      reviewed: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30', text: 'Reviewed' },
      implemented: { color: 'bg-green-900/20 text-green-400 border-green-500/30', text: 'Implemented' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} border border-0`}>
        {config.text}
      </Badge>
    );
  };

  const filteredInsights = mockInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = insightTypeFilter === 'all' || insight.type === insightTypeFilter;
    const matchesImpact = impactFilter === 'all' || insight.impact === impactFilter;
    
    return matchesSearch && matchesType && matchesImpact;
  });

  return (
    <Layout currentPage="ai-analysis" breadcrumb={['Customer Feedback', 'AI Analysis']}>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Analysis</h1>
              <p className="text-gray-300 mt-1">AI-powered insights and sentiment analysis for customer feedback</p>
            </div>
            <div className="flex gap-3">
                             <Button className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                 <Download className="h-4 w-4" />
                 Export Report
               </Button>
               <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
                 <Brain className="h-4 w-4" />
                 Run Analysis
               </Button>
            </div>
          </div>

                     {/* AI Performance Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                     <Brain className="h-6 w-6 text-blue-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">AI Accuracy</p>
                     <p className="text-2xl font-bold text-white">94.2%</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                     <TrendingUp className="h-6 w-6 text-green-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Insights Generated</p>
                     <p className="text-2xl font-bold text-white">47</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                     <Target className="h-6 w-6 text-purple-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Predictions</p>
                     <p className="text-2xl font-bold text-white">89%</p>
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
                     <p className="text-sm font-medium text-gray-300">Last Updated</p>
                     <p className="text-2xl font-bold text-white">2h ago</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

                     {/* Main Content Tabs */}
           <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
             <TabsList className="flex w-full bg-gray-800 border border-gray-600 rounded-lg p-1">
               <TabsTrigger 
                 value="overview" 
                 className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
               >
                 Overview
               </TabsTrigger>
               <TabsTrigger 
                 value="insights" 
                 className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
               >
                 AI Insights
               </TabsTrigger>
               <TabsTrigger 
                 value="sentiment" 
                 className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
               >
                 Sentiment Analysis
               </TabsTrigger>
               <TabsTrigger 
                 value="trends" 
                 className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
               >
                 Trends & Patterns
               </TabsTrigger>
             </TabsList>

                         {/* Overview Tab */}
             <TabsContent value="overview" className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Sentiment Overview */}
                 <Card className="w-full bg-gray-900 border-gray-700 shadow-xl">
                   <CardHeader className="pb-4">
                     <CardTitle className="flex items-center gap-2 text-white">
                       <PieChart className="h-5 w-5 text-purple-400" />
                       Overall Sentiment
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-5">
                       {/* Positive Sentiment */}
                       <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-medium text-gray-300">Positive</span>
                           <span className="text-lg font-bold text-green-400">72%</span>
                         </div>
                         <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300 ease-out"
                             style={{ width: '72%' }}
                           ></div>
                         </div>
                       </div>
                       
                       {/* Neutral Sentiment */}
                       <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-medium text-gray-300">Neutral</span>
                           <span className="text-lg font-bold text-yellow-400">18%</span>
                         </div>
                         <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300 ease-out"
                             style={{ width: '18%' }}
                           ></div>
                         </div>
                       </div>
                       
                       {/* Negative Sentiment */}
                       <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-medium text-gray-300">Negative</span>
                           <span className="text-lg font-bold text-red-400">10%</span>
                         </div>
                         <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300 ease-out"
                             style={{ width: '10%' }}
                           ></div>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                                 {/* Recent Insights */}
                 <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-white">
                       <Lightbulb className="h-5 w-5" />
                       Recent Insights
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       {mockInsights.slice(0, 3).map((insight) => (
                         <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
                           {getInsightTypeIcon(insight.type)}
                           <div className="flex-1">
                             <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                             <p className="text-xs text-gray-400 mt-1">{insight.description.substring(0, 80)}...</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
              </div>

                             {/* Quick Actions */}
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardHeader>
                   <CardTitle className="text-white">Quick Actions</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Button className="h-20 flex-col gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                       <Brain className="h-6 w-6" />
                       <span>Run New Analysis</span>
                     </Button>
                     <Button className="h-20 flex-col gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                       <Download className="h-6 w-6" />
                       <span>Download Report</span>
                     </Button>
                     <Button className="h-20 flex-col gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                       <MessageSquare className="h-6 w-6" />
                       <span>Share Insights</span>
                     </Button>
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>

                         {/* AI Insights Tab */}
             <TabsContent value="insights" className="space-y-6">
               {/* Filters */}
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardContent className="p-6">
                   <div className="flex flex-col lg:flex-row gap-4">
                     <div className="flex-1">
                       <div className="relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                         <Input
                           placeholder="Search insights..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                         />
                       </div>
                     </div>
                     <Select value={insightTypeFilter} onValueChange={setInsightTypeFilter}>
                       <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                         <SelectValue placeholder="Type" />
                       </SelectTrigger>
                       <SelectContent className="bg-gray-800 border-gray-600">
                         <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Types</SelectItem>
                         <SelectItem value="sentiment" className="text-white hover:bg-gray-700 focus:bg-gray-700">Sentiment</SelectItem>
                         <SelectItem value="trend" className="text-white hover:bg-gray-700 focus:bg-gray-700">Trend</SelectItem>
                         <SelectItem value="anomaly" className="text-white hover:bg-gray-700 focus:bg-gray-700">Anomaly</SelectItem>
                         <SelectItem value="recommendation" className="text-white hover:bg-gray-700 focus:bg-gray-700">Recommendation</SelectItem>
                       </SelectContent>
                     </Select>
                     <Select value={impactFilter} onValueChange={setImpactFilter}>
                       <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                         <SelectValue placeholder="Impact" />
                       </SelectTrigger>
                       <SelectContent className="bg-gray-800 border-gray-600">
                         <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Impact</SelectItem>
                         <SelectItem value="low" className="text-white hover:bg-gray-700 focus:bg-gray-700">Low</SelectItem>
                         <SelectItem value="medium" className="text-white hover:bg-gray-700 focus:bg-gray-700">Medium</SelectItem>
                         <SelectItem value="high" className="text-white hover:bg-gray-700 focus:bg-gray-700">High</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </CardContent>
               </Card>

                             {/* Insights List */}
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardHeader>
                   <CardTitle className="text-white">AI-Generated Insights</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {filteredInsights.map((insight) => (
                       <div key={insight.id} className="border border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-800/50">
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center gap-3">
                             {getInsightTypeIcon(insight.type)}
                             <div>
                               <h4 className="font-medium text-white">{insight.title}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-sm text-gray-400">{insight.category}</span>
                                 <span className="text-gray-500">•</span>
                                 <span className="text-sm text-gray-400">{insight.date}</span>
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {getImpactBadge(insight.impact)}
                             {getStatusBadge(insight.status)}
                           </div>
                         </div>
                         
                         <div className="mb-4">
                           <p className="text-gray-300 mb-3">{insight.description}</p>
                           <div className="flex items-center gap-4 text-sm text-gray-400">
                             <span className="flex items-center gap-1">
                               <Target className="h-3 w-3" />
                               Confidence: {insight.confidence}%
                             </span>
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <span className="text-sm text-gray-400">AI Confidence: {insight.confidence}%</span>
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <Eye className="h-4 w-4" />
                               View Details
                             </Button>
                             <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                               <MessageSquare className="h-4 w-4" />
                               Share
                             </Button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>

                         {/* Sentiment Analysis Tab */}
             <TabsContent value="sentiment" className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {mockSentimentData.map((data) => (
                   <Card key={data.category} className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                     <CardHeader>
                       <CardTitle className="text-lg text-white">{data.category}</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-3">
                         {/* Positive Sentiment */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-green-400">Positive</span>
                             <span className="text-lg font-bold text-green-400">{data.positive}%</span>
                           </div>
                           <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                             <div 
                               className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300 ease-out"
                               style={{ width: `${data.positive}%` }}
                             ></div>
                           </div>
                         </div>
                         
                         {/* Neutral Sentiment */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-gray-300">Neutral</span>
                             <span className="text-lg font-bold text-yellow-400">{data.neutral}%</span>
                           </div>
                           <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                             <div 
                               className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300 ease-out"
                               style={{ width: `${data.neutral}%` }}
                             ></div>
                           </div>
                         </div>
                         
                         {/* Negative Sentiment */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-red-400">Negative</span>
                             <span className="text-lg font-bold text-red-400">{data.negative}%</span>
                           </div>
                           <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                             <div 
                               className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300 ease-out"
                               style={{ width: `${data.negative}%` }}
                             ></div>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </TabsContent>

                         {/* Trends Tab */}
             <TabsContent value="trends" className="space-y-6">
               <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
                 <CardHeader>
                   <CardTitle className="text-white">Trend Analysis</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-center py-12 text-gray-400">
                     <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                     <h3 className="text-lg font-medium mb-2 text-white">Trend Analysis Coming Soon</h3>
                     <p>Advanced trend detection and pattern recognition features will be available in the next update.</p>
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AIAnalysisPage;
