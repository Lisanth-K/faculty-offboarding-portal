import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<h1 className="text-3xl font-bold p-10 text-brand-600">Faculty Offboarding Portal Setup Complete 🚀</h1>} />
      </Routes>
    </div>
  )
}

export default App