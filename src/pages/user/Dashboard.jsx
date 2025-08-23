import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [paperworks, setPaperworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchPaperworks = async () => {
      try {
        const response = await paperworksAPI.getAllPaperworks();
        setPaperworks(response.data.items || []);
        
        // Calculate stats
        const papers = response.data.items || [];
        setStats({
          total: papers.length,
          pending: papers.filter(p => p.status === 'SUBMITTED').length,
          approved: papers.filter(p => p.status === 'APPROVED').length,
          rejected: papers.filter(p => p.status === 'CHANGES_REQUESTED').length
        });
      } catch (error) {
        console.error('Error fetching paperworks:', error);
        toast.error('Failed to load your papers');
      } finally {
        setLoading(false);
      }
    };

    fetchPaperworks();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Researcher Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.username}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/papers/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Submit New Paper
          </Link>
          <Link to="/papers/history" className="text-blue-600 hover:text-blue-800">View History</Link>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Changes Requested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* My Papers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Research Papers</CardTitle>
          <CardDescription>Papers assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {paperworks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Last Updated</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paperworks.map((paper) => (
                    <tr key={paper.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{paper.title}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(paper.status)}`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(paper.updated_at || paper.assigned_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link to={`/papers/${paper.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          {paper.status !== 'APPROVED' && (
                            <Link to={`/papers/${paper.id}/submit`}>
                              <Button size="sm">Submit</Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any papers assigned yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/papers/create" className="bg-green-50 hover:bg-green-100 p-4 rounded-md flex items-center justify-center">
              <span className="font-medium">Submit New Paper</span>
            </Link>
            <Link to="/profile" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-md flex items-center justify-center">
              <span className="font-medium">Update Profile</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-blue-100 text-blue-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'CHANGES_REQUESTED':
      return 'bg-yellow-100 text-yellow-800';
    case 'ASSIGNED':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default UserDashboard;