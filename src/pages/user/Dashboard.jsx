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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Researcher Dashboard</h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Welcome, <span className="font-medium ml-1">{user?.username}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/papers/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Submit New Paper
            </Link>
            <Link to="/papers/history" className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-md flex items-center transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              View History
            </Link>
            <Button variant="outline" onClick={logout} className="border-red-200 text-red-600 hover:bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 12.586V6z" clipRule="evenodd" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Total Papers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">All your research papers</p>
          </CardContent>
        </Card>
        <Card className="border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-yellow-50 border-b border-yellow-100">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting feedback</p>
          </CardContent>
        </Card>
        <Card className="border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-green-50 border-b border-green-100">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-500 mt-1">Successfully completed</p>
          </CardContent>
        </Card>
        <Card className="border border-red-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-red-50 border-b border-red-100">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Changes Requested
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-500 mt-1">Need revisions</p>
          </CardContent>
        </Card>
      </div>

      {/* My Papers */}
      <Card className="mb-8 border border-gray-200 shadow-md">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Research Papers
              </CardTitle>
              <CardDescription>Papers assigned to you</CardDescription>
            </div>
            <Link to="/papers" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paperworks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paperworks.map((paper) => (
                    <tr key={paper.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{paper.title}</div>
                        {paper.deadline && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Due: {formatDate(paper.deadline)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">{formatDate(paper.updated_at || paper.assigned_at)}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link to={`/papers/${paper.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center border-gray-300 hover:bg-gray-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </Button>
                          </Link>
                          {paper.status !== 'APPROVED' && (
                            <Link to={`/papers/${paper.id}/submit`}>
                              <Button size="sm" className="flex items-center bg-blue-600 hover:bg-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Submit
                              </Button>
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
            <div className="text-center py-12 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-4">You don't have any papers assigned yet.</p>
              <Link to="/papers/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Paper
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/papers/create" className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-lg border border-green-200 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-green-800">Submit New Paper</span>
              <span className="text-xs text-green-600 mt-1">Create a new research paper</span>
            </Link>
            <Link to="/profile" className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-lg border border-blue-200 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-blue-800">Update Profile</span>
              <span className="text-xs text-blue-600 mt-1">Manage your account details</span>
            </Link>
            <Link to="/papers/history" className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-lg border border-purple-200 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-purple-800">View History</span>
              <span className="text-xs text-purple-600 mt-1">See all your past submissions</span>
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