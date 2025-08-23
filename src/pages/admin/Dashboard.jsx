import { useState, useEffect } from 'react';
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
        const [paperworksResponse, statsResponse] = await Promise.all([
          paperworksAPI.getAllPaperworks(),
          reportsAPI.getSummary()
        ]);
        setPaperworks(paperworksResponse.data.items || []);
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
      // Create a download link
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {user?.username}</span>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Submitted</CardTitle>
            <CardDescription>Papers awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.SUBMITTED || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved</CardTitle>
            <CardDescription>Papers approved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.APPROVED || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Changes Requested</CardTitle>
            <CardDescription>Papers needing revision</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.CHANGES_REQUESTED || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => window.location.href = '/admin/assign'}>Assign New Paper</Button>
        <Button onClick={() => window.location.href = '/admin/users'}>Manage Users</Button>
        <Button variant="outline" onClick={handleExportCSV}>Export Report</Button>
      </div>

      {/* Recent Papers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Papers</CardTitle>
          <CardDescription>Latest research papers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {paperworks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Status</th>
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
                      <td className="py-3 px-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.location.href = `/admin/paperworks/${paper.id}`}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">No papers found</p>
          )}
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

export default AdminDashboard;