import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/login_pages/LoginPage'
import { BrowserRouter as Router } from 'react-router-dom'
import ForgotPassword from './pages/login_pages/ForgotPassword'
import ResetPassword from './pages/login_pages/ResetPassword'

const App = () => {
  return (
    <>
      <Router >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
        </Routes>
      </Router>
    </>
  )
}

export default App