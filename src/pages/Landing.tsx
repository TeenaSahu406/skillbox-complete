import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const skills = [
  ['Sales', 'Sales, business development and customer-facing roles.'],
  ['HR', 'People, talent and human resources.'],
  ['IT', 'Engineering, software, data and technology.'],
  ['Marketing', 'Brand, growth and digital marketing.'],
  ['Finance', 'Accounting and operations.'],
  ['Design', 'UI/UX and creative roles.'],
];

export default function Landing() {
  const { user, profile } = useAuth();

  const profilePath =
    !user
      ? '/register'
      : profile?.role === 'recruiter'
        ? '/recruiter/company'
        : '/candidate/profile';

  const profileButtonText = !user
    ? 'Create profile'
    : profile?.role === 'recruiter'
      ? 'Company profile'
      : 'Your profile';

  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap heroin">
            <div>
              <small>SKILL-BASED • VISUAL • PROOF-BASED</small>

              <h1>
                Show the skill.
                <br />
                <em>Meet the person.</em>
              </h1>

              <p>
                SkillBox helps recruiters discover candidates through skills,
                experience and job-specific skill videos — not just a resume.
              </p>

              <div className="heroBtns">
                <Link className="btn big" to="/jobs">
                  Find jobs
                </Link>

                <Link className="btn light big" to={profilePath}>
                  {profileButtonText}
                </Link>
              </div>
            </div>

            <div className="mock">
              <div className="mockbar">
                ● ● ● <span>Skill Window</span>
              </div>

              <div className="video">
                ▶
                <small>SKILL VIDEO</small>
              </div>

              <div className="mockbody">
                <small>FEATURED CANDIDATE</small>

                <h3>Show what you can do.</h3>

                <p>
                  Skills · Experience · Job-specific video
                </p>

                <div>
                  <i>Sales</i>
                  <i>CRM</i>
                  <i>Communication</i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILL WINDOWS */}
        <section className="section">
          <div className="wrap">
            <div className="head">
              <div>
                <small>EXPLORE</small>

                <h2>Skill Windows</h2>

                <p>
                  Explore opportunities and talent through the skill that
                  matters.
                </p>
              </div>

              <Link to="/skills">View all →</Link>
            </div>

            <div className="skills">
              {skills.map(([name, description]) => (
                <Link
                  to={`/skills/${name}`}
                  className="skill"
                  key={name}
                >
                  <b>▦</b>

                  <small>SKILL WINDOW</small>

                  <h3>{name}</h3>

                  <p>{description}</p>

                  <footer>Explore →</footer>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section soft" id="how">
          <div className="wrap">
            <div className="center">
              <small>HOW IT WORKS</small>

              <h2>Hiring with more proof</h2>
            </div>

            <div className="steps">
              <article>
                <small>01</small>
                <h3>Build your profile</h3>
                <p>
                  Add your basic information, skills, experience and
                  professional details.
                </p>
              </article>

              <article>
                <small>02</small>
                <h3>Explore jobs</h3>
                <p>
                  Candidates can find jobs based on skills, location and
                  opportunity.
                </p>
              </article>

              <article>
                <small>03</small>
                <h3>Apply with proof</h3>
                <p>
                  Submit a job-specific Google Drive skill video when applying.
                </p>
              </article>

              <article>
                <small>04</small>
                <h3>Review and hire</h3>
                <p>
                  Recruiters review candidates, watch the skill video,
                  shortlist or reject applicants and move forward with hiring.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="wrap">
            <div>
              <small>SKILLBOX</small>

              <h2>
                Build a profile that proves more than a resume.
              </h2>
            </div>

            <Link className="btn light big" to={profilePath}>
              {profileButtonText}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}