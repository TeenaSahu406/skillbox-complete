// import {BrowserRouter,Routes,Route} from 'react-router-dom';import Landing from './pages/Landing';import {Login,Register,Forgot,Reset} from './pages/Auth';import Jobs,{JobDetails} from './pages/Jobs';import Skills,{SkillWindow} from './pages/Skills';import {Candidate,Recruiter} from './pages/Dashboard';import CandidateProfile from './pages/CandidateProfile';import {Company,PostJob,RecruiterApplications} from './pages/Recruiter';import ProfilePublic from './pages/ProfilePublic';import Protected from './components/Protected';
// export default function App(){return <BrowserRouter><Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/forgot" element={<Forgot/>}/><Route path="/reset" element={<Reset/>}/><Route path="/jobs" element={<Jobs/>}/><Route path="/jobs/:id" element={<JobDetails/>}/><Route path="/skills" element={<Skills/>}/><Route path="/skills/:name" element={<SkillWindow/>}/><Route path="/candidate/:id" element={<ProfilePublic/>}/><Route element={<Protected role="candidate"/>}><Route path="/candidate" element={<Candidate/>}/><Route path="/candidate/profile" element={<CandidateProfile/>}/></Route><Route element={<Protected role="recruiter"/>}><Route path="/recruiter" element={<Recruiter/>}/><Route path="/recruiter/company" element={<Company/>}/><Route path="/recruiter/jobs/new" element={<PostJob/>}/><Route path="/recruiter/applications" element={<RecruiterApplications/>}/></Route></Routes></BrowserRouter>}
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import Landing from './pages/Landing';

import {
  Login,
  Register,
  Forgot,
  Reset,
} from './pages/Auth';

import Jobs, {
  JobDetails,
} from './pages/Jobs';

import Skills, {
  SkillWindow,
} from './pages/Skills';

import {
  Candidate,
  Recruiter,
} from './pages/Dashboard';

import CandidateProfile from './pages/CandidateProfile';

import CandidateApplications from './pages/CandidateApplications';

import {
  Company,
  PostJob,
  RecruiterApplications,
} from './pages/Recruiter';

import ProfilePublic from './pages/ProfilePublic';

import Protected from './components/Protected';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot"
          element={<Forgot />}
        />

        <Route
          path="/reset"
          element={<Reset />}
        />

        {/* JOBS */}
        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        {/* SKILLS */}
        <Route
          path="/skills"
          element={<Skills />}
        />

        <Route
          path="/skills/:name"
          element={<SkillWindow />}
        />

        {/* PUBLIC CANDIDATE PROFILE */}
        <Route
          path="/candidate/:id"
          element={<ProfilePublic />}
        />

        {/* CANDIDATE */}
        <Route
          element={
            <Protected role="candidate" />
          }
        >
          <Route
            path="/candidate"
            element={<Candidate />}
          />

          <Route
            path="/candidate/profile"
            element={
              <CandidateProfile />
            }
          />

          <Route
            path="/candidate/applications"
            element={
              <CandidateApplications />
            }
          />
        </Route>

        {/* RECRUITER */}
        <Route
          element={
            <Protected role="recruiter" />
          }
        >
          <Route
            path="/recruiter"
            element={<Recruiter />}
          />

          <Route
            path="/recruiter/company"
            element={<Company />}
          />

          <Route
            path="/recruiter/jobs/new"
            element={<PostJob />}
          />

          <Route
            path="/recruiter/applications"
            element={
              <RecruiterApplications />
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}