import { useParams } from 'react-router-dom';

export default function Interview() {
  const { interviewId } = useParams<{ interviewId: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Interview Page
          </h1>
          <p className="text-gray-600 mb-4">
            Interview ID: {interviewId}
          </p>
          <p className="text-gray-600">
            Full interview conductor will be implemented in the next task.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            This placeholder confirms that the interview was successfully started
            and the routing is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
