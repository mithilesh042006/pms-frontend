import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI, reportsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [paperworks, setPaperworks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersResponse, statsResponse] = await Promise.all([
          paperworksAPI.getAllPaperworks(),
          reportsAPI.getSummary() // ✅ /api/stats/admin/
        ]);

        let papersData = papersResponse.data;
        if (Array.isArray(papersData)) {
          papersData = papersData;
        } else if (papersData && papersData.results) {
          papersData = papersData.results;
        } else if (papersData && papersData.items) {
          papersData = papersData.items;
        } else {
          papersData = [];
          console.error('Unexpected papers data structure:', papersResponse.data);
        }

        // 🔥 Normalize to include assigned_to and assigned_to_name
        const normalizedPapers = papersData.map((paper) => ({
          ...paper,
          assigned_to: paper.researcher ? paper.researcher.id : null,
          assigned_to_name: paper.researcher ? paper.researcher.username : null,
        }));

        setPaperworks(normalizedPapers);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await reportsAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'paperworks-report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of research paper management system</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Total Papers</CardTitle>
            <CardDescription>All papers in system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{stats?.total_paperwork || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Submitted</CardTitle>
            <CardDescription>Papers awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-500">{stats?.submitted || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Approved</CardTitle>
            <CardDescription>Papers approved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats?.approved || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Changes Requested</CardTitle>
            <CardDescription>Papers needing revision</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-500">{stats?.changes_requested || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Button onClick={() => (window.location.href = '/admin/papers')} className="bg-blue-600 hover:bg-blue-700">
            Assign New Paper
          </Button>
          <Button
            onClick={() => (window.location.href = '/admin/users')}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* Recent Papers */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Papers</h2>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Researcher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paperworks.length > 0 ? (
                paperworks
                  .sort((a, b) => new Date(b.updated_at || b.assigned_at) - new Date(a.updated_at || a.assigned_at))
                  .slice(0, 5)
                  .map((paper) => (
                    <tr key={paper.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paper.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {paper.assigned_to_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            paper.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : paper.status === 'CHANGES_REQUESTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {paper.status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(paper.updated_at || paper.assigned_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          to={`/admin/papers/${paper.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No papers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
