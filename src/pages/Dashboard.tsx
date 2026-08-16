import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Candidate() {
  const { user, profile } = useAuth();

  const name = profile?.full_name?.trim() || 'Candidate';

  const profileItems = [
    profile?.full_name,
    profile?.phone,
    profile?.address,
    profile?.state,
    profile?.country,
    profile?.headline,
    profile?.bio,
  ];

  const profileFilled = profileItems.filter(
    (value) => value && String(value).trim()
  ).length;

  const profileProgress = Math.round(
    (profileFilled / profileItems.length) * 100
  );

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap">
          <small>CANDIDATE DASHBOARD</small>

          <h1>Welcome, {name}</h1>

          <p>
            Build your profile, discover opportunities and show recruiters
            what you can actually do.
          </p>

          {/* PROFILE COMPLETION */}
          <section className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div>
                <small>PROFILE COMPLETION</small>
                <h3>{profileProgress}% complete</h3>
              </div>

              <Link className="btn" to="/candidate/profile">
                {profileProgress === 100
                  ? 'View profile'
                  : 'Complete profile'}
              </Link>
            </div>

            <div
              style={{
                marginTop: '1rem',
                height: '8px',
                borderRadius: '999px',
                background: 'var(--line)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${profileProgress}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: 'currentColor',
                }}
              />
            </div>

            <p style={{ marginBottom: 0 }}>
              Your video is not required for your profile. You will provide a
              job-specific skill video when you apply.
            </p>
          </section>

          {/* MAIN ACTIONS */}
          <div className="dash">
            <Link to="/candidate/profile">
              <b>01</b>
              <h3>Your profile</h3>
              <p>
                Manage your name, contact information, location, headline,
                about section and skills.
              </p>
            </Link>

            <Link to="/jobs">
              <b>02</b>
              <h3>Search jobs</h3>
              <p>
                Explore opportunities, check job requirements and find roles
                that match your skills.
              </p>
            </Link>

            <Link to="/candidate/applications">
              <b>03</b>
              <h3>My applications</h3>
              <p>
                Track every application and see whether the recruiter has
                reviewed, shortlisted, selected or rejected you.
              </p>
            </Link>
          </div>

          {/* HOW IT WORKS */}
          <section className="card">
            <small>HOW SKILLBOX WORKS</small>

            <h2>Show your skills. Not just your resume.</h2>

            <div className="two">
              <div>
                <b>01 — Find a job</b>
                <p>
                  Search jobs and open the requirements before applying.
                </p>
              </div>

              <div>
                <b>02 — Apply with proof</b>
                <p>
                  Add the Google Drive link to the skill video relevant to
                  that particular job.
                </p>
              </div>

              <div>
                <b>03 — Recruiter reviews</b>
                <p>
                  The recruiter can review your profile, skills and submitted
                  video.
                </p>
              </div>

              <div>
                <b>04 — Track your status</b>
                <p>
                  See the recruiter's application decision from your
                  dashboard.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export function Recruiter() {
  const { profile } = useAuth();

  const name = profile?.full_name?.trim() || 'Recruiter';

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap">
          <small>RECRUITER</small>

          <h1>Welcome, {name}</h1>

          <p>
            Find candidates through skills, profiles and real proof.
          </p>

          <div className="dash">
            <Link to="/recruiter/company">
              <b>01</b>
              <h3>Company profile</h3>
              <p>
                Set up your company information and make your organisation
                ready for candidates.
              </p>
            </Link>

            <Link to="/recruiter/jobs/new">
              <b>02</b>
              <h3>Post a job</h3>
              <p>
                Create a job with requirements, skills, location and work
                mode.
              </p>
            </Link>

            <Link to="/recruiter/applications">
              <b>03</b>
              <h3>Applications</h3>
              <p>
                Review candidates, watch their submitted skill videos and
                take hiring actions.
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}