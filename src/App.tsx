import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/login_pages/LoginPage'
import { BrowserRouter as Router } from 'react-router-dom'
import ForgotPassword from './pages/login_pages/ForgotPassword'
import ResetPassword from './pages/login_pages/ResetPassword'
import { ToastContainer } from './components/ui/toast/ToastContainer'
import ProjectMain from './pages/projects/ProjectMain'
import RegisterOrganization from './pages/organization/RegisterOrganization'

const App = () => {
  return (
    <>
      <Router >
        <Routes>
          <Route path="/register-organization" element={<RegisterOrganization />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
          <Route path="/projects" element={<ProjectMain />} />


        </Routes>
        <ToastContainer />
      </Router>
    </>
  )
}

export default App