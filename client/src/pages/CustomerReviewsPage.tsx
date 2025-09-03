import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Reply,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Package
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  date: string;
  product: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  unhelpful: number;
}

const CustomerReviewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock data for demonstration
  const mockReviews: CustomerReview[] = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      rating: 5,
      review: 'Excellent product quality and fast delivery. Highly recommend!',
      date: '2024-01-15',
      product: 'Premium Widget Pro',
      status: 'approved',
      helpful: 12,
      unhelpful: 1
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      rating: 4,
      review: 'Good product, but shipping took longer than expected.',
      date: '2024-01-14',
      product: 'Standard Widget',
      status: 'pending',
      helpful: 8,
      unhelpful: 2
    },
    {
      id: '3',
      customerName: 'Emily Rodriguez',
      rating: 3,
      review: 'Product works as described, but could be better packaged.',
      date: '2024-01-13',
      product: 'Basic Widget',
      status: 'approved',
      helpful: 5,
      unhelpful: 3
    },
    {
      id: '4',
      customerName: 'David Kim',
      rating: 5,
      review: 'Outstanding service and product quality. Will buy again!',
      date: '2024-01-12',
      product: 'Premium Widget Pro',
      status: 'approved',
      helpful: 15,
      unhelpful: 0
    }
  ];

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



  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected tab (rating-based)
    let matchesTab = true;
    if (selectedTab === 'positive') {
      matchesTab = review.rating >= 4;
    } else if (selectedTab === 'neutral') {
      matchesTab = review.rating === 3;
    } else if (selectedTab === 'negative') {
      matchesTab = review.rating <= 2;
    }
    
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesTab && matchesRating;
  });

  return (
    <Layout currentPage="customer-reviews" breadcrumb={['Customer Feedback', 'Customer Reviews']}>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Customer Reviews</h1>
              <p className="text-gray-300 mt-1">Manage and monitor customer feedback and ratings</p>
            </div>
            <div className="flex gap-3">
                             <Button className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                 <Download className="h-4 w-4" />
                 Export
               </Button>
               <Button className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
                 <MessageSquare className="h-4 w-4" />
                 Respond to All
               </Button>
            </div>
          </div>

                     {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                     <Star className="h-6 w-6 text-blue-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Average Rating</p>
                     <p className="text-2xl font-bold text-white">4.3</p>
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
                     <p className="text-sm font-medium text-gray-300">Total Reviews</p>
                     <p className="text-2xl font-bold text-white">1,247</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                     <MessageSquare className="h-6 w-6 text-yellow-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Pending</p>
                     <p className="text-2xl font-bold text-white">23</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                     <Reply className="h-6 w-6 text-purple-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Response Rate</p>
                     <p className="text-2xl font-bold text-white">94%</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

                     {/* Filters and Search */}
           <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
             <CardContent className="p-6">
               <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex-1">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input
                       placeholder="Search reviews, customers, or products..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                     />
                   </div>
                 </div>
                                                     <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Ratings</SelectItem>
                      <SelectItem value="5" className="text-white hover:bg-gray-700 focus:bg-gray-700">5 Stars</SelectItem>
                      <SelectItem value="4" className="text-white hover:bg-gray-700 focus:bg-gray-700">4 Stars</SelectItem>
                      <SelectItem value="3" className="text-white hover:bg-gray-700 focus:bg-gray-700">3 Stars</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-gray-700 focus:bg-gray-700">2 Stars</SelectItem>
                      <SelectItem value="1" className="text-white hover:bg-gray-700 focus:bg-gray-700">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
             </CardContent>
           </Card>

                     {/* Reviews Tabs */}
           <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
             <CardHeader>
               <CardTitle className="text-white">Customer Reviews</CardTitle>
             </CardHeader>
             <CardContent>
               <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                                                     <TabsList className="flex w-full bg-gray-800 border border-gray-600 rounded-lg p-1">
                     <TabsTrigger 
                       value="all" 
                       className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                     >
                       All Reviews
                     </TabsTrigger>
                     <TabsTrigger 
                       value="positive" 
                       className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                     >
                       4-5 Stars
                     </TabsTrigger>
                     <TabsTrigger 
                       value="neutral" 
                       className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-gray-300 hover:text-gray-700 focus:outline-none focus:ring-0"
                     >
                       3 Stars
                     </TabsTrigger>
                     <TabsTrigger 
                       value="negative" 
                       className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-0"
                     >
                       1-2 Stars
                     </TabsTrigger>
                   </TabsList>
                 
                 <TabsContent value={selectedTab} className="mt-6">
                   <div className="space-y-4">
                     {filteredReviews.map((review) => (
                       <div key={review.id} className="border border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-800/50">
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                               {review.customerName.charAt(0)}
                             </div>
                             <div>
                               <h4 className="font-medium text-white">{review.customerName}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                 {renderStars(review.rating)}
                                 <span className="text-sm text-gray-400 ml-2">{review.rating}/5</span>
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700">
                               <Eye className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                         
                         <div className="mb-4">
                           <p className="text-gray-300 mb-2">{review.review}</p>
                           <div className="flex items-center gap-4 text-sm text-gray-400">
                             <span className="flex items-center gap-1">
                               <Calendar className="h-3 w-3" />
                               {review.date}
                             </span>
                             <span className="flex items-center gap-1">
                               <Package className="h-3 w-3" />
                               {review.product}
                             </span>
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white hover:bg-gray-700">
                               <ThumbsUp className="h-4 w-4" />
                               {review.helpful}
                             </Button>
                             <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white hover:bg-gray-700">
                               <ThumbsDown className="h-4 w-4" />
                               {review.unhelpful}
                             </Button>
                           </div>
                           <Button size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500">
                             <Reply className="h-4 w-4" />
                             Respond
                           </Button>
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

export default CustomerReviewsPage;
