import React from 'react'

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-8">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 mb-4">Learnify AI — Study Smarter</h1>
        <p className="text-gray-700 text-lg mb-6">Generate flashcards, quizzes, and summaries from your notes and documents instantly. Faster review, better retention.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg shadow hover:bg-emerald-700 transition"
          >
            Get Started — Generate
          </button>
          <a href="#features" className="text-emerald-700 underline">See features</a>
        </div>

        <div id="features" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Quick Flashcards</h3>
            <p className="text-sm text-gray-600">Turn any text into study-ready flashcards for rapid review.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Auto Quiz</h3>
            <p className="text-sm text-gray-600">Generate quizzes with multiple-choice questions to test understanding.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Concise Summaries</h3>
            <p className="text-sm text-gray-600">Produce short summaries to capture key concepts quickly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
