export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to PulseAI Feedback
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Transform your feedback process with AI-powered insights and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Smart Analysis</h3>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered sentiment analysis and feedback categorization.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Insights</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get instant feedback analytics and performance metrics.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Easy Integration</h3>
          <p className="mt-2 text-sm text-gray-600">
            Seamlessly integrate with your existing workflow and tools.
          </p>
        </div>
      </div>

      <div className="text-center">
        <button className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          Get Started
        </button>
      </div>
    </div>
  );
}
