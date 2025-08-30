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
        const paperworkResponse = await paperworksAPI.getPaperworkById(id);
        setPaperwork(paperworkResponse.data);

        const versionsResponse = await paperworksAPI.getVersions(id);
        setVersions(Array.isArray(versionsResponse.data) ? versionsResponse.data : versionsResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching paperwork data:', error);
        toast.error('Failed to load paperwork details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaperworkData();
  }, [id]);

  const handleDownload = async (filePath, filename) => {
    try {
      const apiUrl = `/api/download/${filePath}`;
      const response = await paperworksAPI.downloadFile(apiUrl);
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`Downloading ${filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      CHANGES_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      }`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!paperwork) {
    return (
      <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
        <div className="bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 p-4 rounded">
          Paperwork not found or you don't have permission to view it.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-blue-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{paperwork.title}</h1>
            <div className="mt-2 flex items-center">
              {getStatusBadge(paperwork.status)}
              {paperwork.deadline && (
                <div className="ml-4 text-sm text-gray-600 dark:text-gray-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deadline: <span className="font-medium ml-1">{formatDate(paperwork.deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'versions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Versions <span className="ml-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{versions.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Feedback
            </button>
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400">Paper Information</h2>
                <div className="space-y-4 text-gray-900 dark:text-gray-200">
                  <p><span className="text-gray-500 dark:text-gray-400">Title:</span> {paperwork.title}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Status:</span> {getStatusBadge(paperwork.status)}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Assigned Date:</span> {formatDate(paperwork.created_at)}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Last Updated:</span> {formatDate(paperwork.updated_at)}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Deadline:</span> {paperwork.deadline ? formatDate(paperwork.deadline) : 'No deadline set'}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400">Researcher Information</h2>
                <div className="space-y-4 text-gray-900 dark:text-gray-200">
                  <p><span className="text-gray-500 dark:text-gray-400">Name:</span> {paperwork.researcher_name || 'N/A'}</p>
                  <p><span className="text-gray-500 dark:text-gray-400">Email:</span> {paperwork.researcher_email || 'Not available'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div>
              {versions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                  <p className="text-gray-500 dark:text-gray-400">No versions have been submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((v) => (
                    <div key={v.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Version {v.version_no}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Submitted on {formatDate(v.submitted_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              {!paperwork.feedback || paperwork.feedback.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg">
                  No feedback has been provided yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {paperwork.feedback.map((f, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <p className="text-gray-900 dark:text-white">{f.comments}</p>
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
