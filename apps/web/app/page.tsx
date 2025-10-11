export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PulseAI
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400">
            AI-Powered Feedback Platform
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
            Collect, analyze, and act on customer feedback with the power of AI.
            Built with Next.js, Supabase, and OpenAI.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Tenant</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage multiple organizations with isolated data and custom configurations
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatic sentiment analysis, categorization, and insights powered by OpenAI
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Embed our widget anywhere with a single line of code
              </p>
            </div>
          </div>

          <div className="mt-12 space-x-4">
            <a
              href="/dashboard"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </a>
            <a
              href="/docs"
              className="inline-block px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}


