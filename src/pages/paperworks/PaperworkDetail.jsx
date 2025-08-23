import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PaperworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paperwork, setPaperwork] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchPaperworkData = async () => {
      try {
        setLoading(true);
        // Fetch paperwork details
        const paperworkResponse = await paperworksAPI.getPaperworkById(id);
        setPaperwork(paperworkResponse.data);

        // Fetch versions
        const versionsResponse = await paperworksAPI.getVersions(id);
        setVersions(versionsResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching paperwork data:', error);
        toast.error('Failed to load paperwork details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaperworkData();
  }, [id]);

  const handleDownload = async (url, filename) => {
    try {
      const response = await paperworksAPI.downloadFile(url);
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'CHANGES_REQUESTED': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!paperwork) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          Paperwork not found or you don't have permission to view it.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{paperwork.title}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Back
          </button>
          {user && (user.id === paperwork.researcher_id || user.role === 'ADMIN') && (
            <button
              onClick={() => navigate(`/papers/${id}/submit`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Submit New Version
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'versions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Versions ({versions.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'feedback' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Feedback
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Paper Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Title:</span>
                      <p>{paperwork.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Status:</span>
                      <div className="mt-1">{getStatusBadge(paperwork.status)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Assigned Date:</span>
                      <p>{formatDate(paperwork.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Last Updated:</span>
                      <p>{formatDate(paperwork.updated_at)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4">Researcher Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Name:</span>
                      <p>{paperwork.researcher_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Email:</span>
                      <p>{paperwork.researcher_email || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <div className="bg-gray-50 p-4 rounded">
                  <p>{paperwork.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Version History</h2>
              
              {versions.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
                  No versions have been submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {versions.map((version) => (
                        <tr key={version.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">v{version.version_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(version.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(version.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDownload(version.file_url, `${paperwork.title}_v${version.version_number}.pdf`)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Download
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{version.comments || 'No comments'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Reviewer Feedback</h2>
              
              {!paperwork.feedback || paperwork.feedback.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
                  No feedback has been provided yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {paperwork.feedback.map((feedback, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{feedback.reviewer_name || 'Reviewer'}</span>
                          <span className="text-gray-500 text-sm ml-2">{formatDate(feedback.created_at)}</span>
                        </div>
                        {getStatusBadge(feedback.status)}
                      </div>
                      <p className="text-gray-700">{feedback.comments}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperworkDetail;