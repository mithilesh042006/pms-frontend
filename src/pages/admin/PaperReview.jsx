import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PaperReview = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [decision, setDecision] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    fetchPaperDetails();
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const [paperResponse, versionsResponse] = await Promise.all([
        paperworksAPI.getPaperworkById(paperId),
        paperworksAPI.getPaperworkVersions(paperId)
      ]);

      setPaper(paperResponse.data);
      setVersions(versionsResponse.data.results || []);
      
      // Select the latest version by default
      if (versionsResponse.data.results && versionsResponse.data.results.length > 0) {
        const latestVersion = versionsResponse.data.results.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
        setSelectedVersion(latestVersion);
      }
    } catch (error) {
      console.error('Error fetching paper details:', error);
      toast.error('Failed to load paper details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (versionId, fileName) => {
    try {
      const response = await paperworksAPI.downloadFile(versionId);
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'paper.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!decision) {
      toast.error('Please select a decision (Approve or Reject)');
      return;
    }
    
    try {
      setSubmitting(true);
      await adminAPI.reviewPaperwork(paperId, {
        decision,
        feedback,
        version_id: selectedVersion?.id
      });
      
      toast.success(`Paper ${decision.toLowerCase()}d successfully`);
      
      // Update local state
      setPaper({
        ...paper,
        status: decision
      });
      
      // Reset form
      setFeedback('');
      setDecision('');
      
      // Refresh data
      fetchPaperDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'DRAFT': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>Paper not found or you don't have permission to view this paper.</p>
        </div>
        <Link to="/admin/papers" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
          Back to Papers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Paper Review</h1>
        <div className="flex space-x-4">
          <Link to={`/admin/papers/${paperId}/deadline`} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md">
            Update Deadline
          </Link>
          <Link to="/admin/papers" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
            Back to Papers
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Paper Information</h2>
            <dl className="grid grid-cols-1 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{paper.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                <dd className="mt-1 text-sm text-gray-900">{paper.deadline ? formatDate(paper.deadline) : 'No deadline set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Author</dt>
                <dd className="mt-1 text-sm text-gray-900">{paper.author_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{getStatusBadge(paper.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(paper.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(paper.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                <dd className="mt-1 text-sm text-gray-900">{paper.assigned_to_name || 'Not assigned'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Version History</h2>
            {versions.length > 0 ? (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div 
                    key={version.id} 
                    className={`p-4 border rounded-md ${selectedVersion?.id === version.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Version {version.version_number}</span>
                      <span className="text-sm text-gray-500">{formatDate(version.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{version.comment || 'No comment provided'}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(version.id, `${paper.title}_v${version.version_number}.pdf`);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download File
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No versions available</p>
            )}
          </div>
        </div>
      </div>

      {paper.status === 'PENDING' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <h2 className="text-xl font-semibold mb-4">Review Paper</h2>
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <textarea
                id="feedback"
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Provide feedback to the author"
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="approve"
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={decision === 'APPROVED'}
                    onChange={(e) => setDecision(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="approve" className="ml-2 block text-sm text-gray-900">
                    Approve
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="reject"
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={decision === 'REJECTED'}
                    onChange={(e) => setDecision(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="reject" className="ml-2 block text-sm text-gray-900">
                    Reject
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center"
                disabled={submitting || !selectedVersion}
              >
                {submitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {paper.status !== 'PENDING' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <h2 className="text-xl font-semibold mb-4">Review History</h2>
          {paper.review_history && paper.review_history.length > 0 ? (
            <div className="space-y-4">
              {paper.review_history.map((review, index) => (
                <div key={index} className="p-4 border rounded-md border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Review by {review.reviewer_name}</span>
                    <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-500">Decision: </span>
                    {getStatusBadge(review.decision)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Feedback: </span>
                    <p className="text-sm text-gray-700 mt-1">{review.feedback || 'No feedback provided'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No review history available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaperReview;