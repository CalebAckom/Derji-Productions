import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <header className="bg-secondary-900 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-display font-bold text-primary-400">
              Derji Productions
            </h1>
            <p className="text-secondary-300">Professional Media Production</p>
          </div>
        </header>
        
        <main className="container mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={
              <div className="text-center">
                <h2 className="text-4xl font-display font-bold text-secondary-900 mb-4">
                  Welcome to Derji Productions
                </h2>
                <p className="text-lg text-secondary-600 mb-8">
                  Professional photography, videography, and sound production services
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <h3 className="text-xl font-semibold text-primary-600 mb-2">Photography</h3>
                    <p className="text-secondary-600">Capturing your precious moments with artistic excellence</p>
                  </div>
                  <div className="card">
                    <h3 className="text-xl font-semibold text-primary-600 mb-2">Videography</h3>
                    <p className="text-secondary-600">Professional video production and post-production services</p>
                  </div>
                  <div className="card">
                    <h3 className="text-xl font-semibold text-primary-600 mb-2">Sound Production</h3>
                    <p className="text-secondary-600">High-quality audio recording and sound engineering</p>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
        <footer className="bg-secondary-100 text-secondary-700 p-4 mt-16">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 Derji Productions. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App