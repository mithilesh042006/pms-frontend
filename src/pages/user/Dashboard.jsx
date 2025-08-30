import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI, researcherStatsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [paperworks, setPaperworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersRes, statsRes] = await Promise.all([
          paperworksAPI.getAllPaperworks(),
          researcherStatsAPI.getSummary()
        ]);

        // normalize papers
        const papersList = Array.isArray(papersRes.data)
          ? papersRes.data
          : (papersRes.data.items ? papersRes.data.items : []);

        // take only last 5 (sorted by updated_at if available)
        const lastFive = [...papersList]
          .sort((a, b) => new Date(b.updated_at || b.assigned_at) - new Date(a.updated_at || a.assigned_at))
          .slice(0, 5);

        setPaperworks(lastFive);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load your dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            <Link to="/papers" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Submit New Paper
            </Link>
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
            <p className="text-3xl font-bold text-blue-600">
              {stats?.total_paperwork !== undefined
                ? stats.total_paperwork
                : (stats?.submitted || 0) + (stats?.approved || 0) + (stats?.changes_requested || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">All your research papers</p>
          </CardContent>
        </Card>

        <Card className="border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-yellow-50 border-b border-yellow-100">
            <CardTitle className="text-lg flex items-center">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-yellow-500">{stats?.submitted || 0}</p>
          </CardContent>
        </Card>

        <Card className="border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-green-50 border-b border-green-100">
            <CardTitle className="text-lg flex items-center">Approved</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-green-600">{stats?.approved || 0}</p>
          </CardContent>
        </Card>

        <Card className="border border-red-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-red-50 border-b border-red-100">
            <CardTitle className="text-lg flex items-center">Changes Requested</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold text-red-600">{stats?.changes_requested || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* My Papers - Last 5 */}
      <Card className="mb-8 border border-gray-200 shadow-md">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-xl">My Research Papers (Last 5)</CardTitle>
              <CardDescription>Recently assigned papers</CardDescription>
            </div>
            <Link to="/papers" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
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
                  </tr>
                </thead>
                <tbody>
                  {paperworks.map((paper) => (
                    <tr key={paper.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4">{paper.title}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {formatDate(paper.updated_at || paper.assigned_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">You don't have any papers yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Status color helper
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

// Date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default UserDashboard;
