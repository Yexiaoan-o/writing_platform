
import Navbar from './components/Navbar'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Documents from './pages/Documents'
import DocumentsDetail from './pages/DocumentsDetail'
import MarkdownEditor from './pages/MarkdownEditor'
import Home from './pages/Home'

function App() {

  return (
    <Router>
      <Navbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentsDetail />} />
          <Route path="/documents/:id/edit" element={<MarkdownEditor />} />
          <Route path="/editor" element={<MarkdownEditor />} />
        </Routes>
      </Navbar>
    </Router>
  )
}

export default App
