import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Job } from '../types/db';

type Skill = {
  id: string;
  name: string;
};

type ApplicationStatus =
  | 'applied'
  | 'reviewed'
  | 'shortlisted'
  | 'interview'
  | 'selected'
  | 'rejected';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    let query = supabase
      .from('jobs')
      .select('*,companies(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .range(0, 19);

    if (q.trim()) {
      query = query.or(
        `title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`
      );
    }

    if (loc.trim()) {
      query = query.ilike(
        'location',
        `%${loc.trim()}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
    } else {
      setJobs((data as Job[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap">
          <small>OPPORTUNITIES</small>

          <h1>Find Jobs</h1>

          <p>
            Discover opportunities where your skills and real
            proof matter.
          </p>

          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
          >
            <input
              placeholder="Search jobs or skills"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <input
              placeholder="Location"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
            />

            <button className="btn" type="submit">
              Search
            </button>
          </form>

          <div className="list">
            {loading && (
              <div className="empty">
                Loading jobs...
              </div>
            )}

            {!loading &&
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                />
              ))}

            {!loading && !jobs.length && (
              <div className="empty">
                No open jobs found. Try another search.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function JobCard({ job }: { job: Job }) {
  const company =
    job.companies?.company_name || 'Company';

  const salary =
    job.salary_min !== null &&
    job.salary_min !== undefined &&
    job.salary_max !== null &&
    job.salary_max !== undefined
      ? `₹${job.salary_min.toLocaleString(
          'en-IN'
        )} – ₹${job.salary_max.toLocaleString(
          'en-IN'
        )}`
      : null;

  return (
    <article className="job">
      <b className="avatar">
        {company[0].toUpperCase()}
      </b>

      <div>
        <h3>{job.title}</h3>

        <p>
          {company} · {job.location || 'Remote'}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span>
            {job.employment_type || 'Full-time'}
          </span>

          {job.job_mode && (
            <span>
              {job.job_mode === 'onsite'
                ? 'On-site'
                : job.job_mode === 'remote'
                  ? 'Remote'
                  : 'Hybrid'}
            </span>
          )}

          {salary && <span>{salary}</span>}
        </div>
      </div>

      <Link
        className="btn ghost"
        to={`/jobs/${job.id}`}
      >
        View job
      </Link>
    </article>
  );
}

export function JobDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] =
    useState(false);

  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function loadJob() {
    if (!id) return;

    const { data, error } = await supabase
      .from('jobs')
      .select('*,companies(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load job:', error);
    }

    if (data) {
      setJob(data as Job);
    }

    setLoading(false);
  }

  async function loadSkills() {
    if (!id) return;

    const { data, error } = await supabase
      .from('job_skills')
      .select('skill_id,skills(id,name)')
      .eq('job_id', id);

    if (error) {
      console.error('Failed to load job skills:', error);
      return;
    }

    const result = (data || [])
      .map((row: any) => row.skills)
      .filter(Boolean);

    setSkills(result as Skill[]);
  }

  async function checkApplication() {
    if (!id || !user) {
      setAlreadyApplied(false);
      setApplicationStatus(null);
      return;
    }

    const { data, error } = await supabase
      .from('applications')
      .select('id,status')
      .eq('job_id', id)
      .eq('candidate_id', user.id)
      .maybeSingle();

    if (error) {
      console.error(
        'Failed to check application:',
        error
      );

      setAlreadyApplied(false);
      setApplicationStatus(null);
      return;
    }

    if (data) {
      setAlreadyApplied(true);

      setApplicationStatus(
        (data.status || 'applied') as ApplicationStatus
      );
    } else {
      setAlreadyApplied(false);
      setApplicationStatus(null);
    }
  }

  useEffect(() => {
    loadJob();
    loadSkills();
  }, [id]);

  useEffect(() => {
    checkApplication();
  }, [id, user]);

  /*
   * Refresh application status every 10 seconds while
   * candidate is viewing this job.
   *
   * This means if recruiter changes:
   * Applied -> Reviewed
   * or Reviewed -> Shortlisted
   * etc., the candidate page will pick it up automatically.
   */
  useEffect(() => {
    if (!id || !user || profile?.role !== 'candidate') {
      return;
    }

    const interval = window.setInterval(() => {
      checkApplication();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [id, user, profile?.role]);

  async function apply(e: FormEvent) {
    e.preventDefault();

    setErr('');
    setMsg('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (profile?.role !== 'candidate') {
      setErr(
        'Only candidate accounts can apply for jobs.'
      );
      return;
    }

    if (alreadyApplied) {
      setErr(
        'You have already applied for this job.'
      );
      return;
    }

    const cleanVideoUrl = videoUrl.trim();

    if (!cleanVideoUrl) {
      setErr(
        'Skill video link is mandatory.'
      );
      return;
    }

    if (
      !cleanVideoUrl.startsWith('https://') &&
      !cleanVideoUrl.startsWith('http://')
    ) {
      setErr(
        'Please enter a valid video link starting with https://'
      );
      return;
    }

    setApplying(true);

    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id: id,
        candidate_id: user.id,
        video_url: cleanVideoUrl,
        status: 'applied',
      })
      .select('id,status')
      .single();

    setApplying(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setAlreadyApplied(true);

    setApplicationStatus(
      (data?.status || 'applied') as ApplicationStatus
    );

    setMsg(
      'Application submitted successfully. The recruiter can now review your profile and skill video.'
    );

    setVideoUrl('');
  }

  function getStatusLabel(
    status: ApplicationStatus | null
  ) {
    switch (status) {
      case 'applied':
        return 'Applied';

      case 'reviewed':
        return 'Reviewed';

      case 'shortlisted':
        return 'Shortlisted';

      case 'interview':
        return 'Interview';

      case 'selected':
        return 'Selected';

      case 'rejected':
        return 'Rejected';

      default:
        return 'Application submitted';
    }
  }

  function getStatusMessage(
    status: ApplicationStatus | null
  ) {
    switch (status) {
      case 'applied':
        return 'Your application has been submitted and is waiting for recruiter review.';

      case 'reviewed':
        return 'The recruiter has reviewed your application.';

      case 'shortlisted':
        return 'Good news! The recruiter has shortlisted your application.';

      case 'interview':
        return 'Your application has moved to the interview stage.';

      case 'selected':
        return 'Congratulations! Your application has been selected.';

      case 'rejected':
        return 'The recruiter has decided not to move forward with this application.';

      default:
        return 'Your application has been submitted.';
    }
  }

  function getStatusStyle(
    status: ApplicationStatus | null
  ): React.CSSProperties {
    if (status === 'selected') {
      return {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#166534',
      };
    }

    if (status === 'rejected') {
      return {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
      };
    }

    if (status === 'shortlisted') {
      return {
        background: '#eff6ff',
        border: '1px solid #93c5fd',
        color: '#1d4ed8',
      };
    }

    if (status === 'interview') {
      return {
        background: '#f5f3ff',
        border: '1px solid #ddd6fe',
        color: '#6d28d9',
      };
    }

    return {
      background: '#f8fafc',
      border: '1px solid #cbd5e1',
      color: '#334155',
    };
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="page">
          <div className="wrap">
            <div className="empty">
              Loading job...
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />

        <main className="page">
          <div className="wrap">
            <div className="empty">
              Job not found.
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const company =
    job.companies?.company_name || 'Company';

  const salary =
    job.salary_min !== null &&
    job.salary_min !== undefined &&
    job.salary_max !== null &&
    job.salary_max !== undefined
      ? `₹${job.salary_min.toLocaleString(
          'en-IN'
        )} – ₹${job.salary_max.toLocaleString(
          'en-IN'
        )}`
      : 'Salary not specified';

  const jobMode =
    job.job_mode === 'onsite'
      ? 'On-site'
      : job.job_mode === 'remote'
        ? 'Remote'
        : job.job_mode === 'hybrid'
          ? 'Hybrid'
          : 'Not specified';

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap">
          <Link to="/jobs">
            ← Back to jobs
          </Link>

          <div className="detail">
            <article>
              <b className="avatar big">
                {company[0].toUpperCase()}
              </b>

              <small>JOB OPPORTUNITY</small>

              <h1>{job.title}</h1>

              <p>
                {company} ·{' '}
                {job.location || 'Remote'}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  margin: '1rem 0',
                }}
              >
                <span>{jobMode}</span>

                <span>
                  {job.employment_type ||
                    'Full-time'}
                </span>

                <span>{salary}</span>
              </div>

              <h2>About the role</h2>

              <div className="prose">
                {job.description}
              </div>

              <h2>Required skills</h2>

              {skills.length ? (
                <div className="skillpills">
                  {skills.map((skill) => (
                    <span
                      className="sel"
                      key={skill.id}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p>
                  No specific skills listed.
                </p>
              )}
            </article>

            <aside>
              <h3>Application</h3>

              {!user ? (
                <>
                  <p>
                    Sign in as a candidate to apply
                    for this opportunity.
                  </p>

                  <Link
                    className="btn full"
                    to="/login"
                  >
                    Sign in to apply
                  </Link>
                </>
              ) : profile?.role !== 'candidate' ? (
                <div className="err">
                  Recruiter accounts cannot apply
                  for jobs.
                </div>
              ) : alreadyApplied ? (
                <>
                  <div
                    style={{
                      ...getStatusStyle(
                        applicationStatus
                      ),
                      borderRadius: '10px',
                      padding: '16px',
                    }}
                  >
                    <small
                      style={{
                        display: 'block',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        marginBottom: '6px',
                      }}
                    >
                      APPLICATION STATUS
                    </small>

                    <strong
                      style={{
                        display: 'block',
                        fontSize: '20px',
                        marginBottom: '7px',
                      }}
                    >
                      {getStatusLabel(
                        applicationStatus
                      )}
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {getStatusMessage(
                        applicationStatus
                      )}
                    </p>
                  </div>

                  {msg && (
                    <div
                      className="ok"
                      style={{ marginTop: '12px' }}
                    >
                      {msg}
                    </div>
                  )}
                </>
              ) : (
                <form
                  className="form"
                  onSubmit={apply}
                >
                  <div className="card">
                    <h4>
                      Skill video — mandatory
                    </h4>

                    <p>
                      Add a Google Drive link to a
                      video where you demonstrate
                      the skills relevant to this
                      job.
                    </p>

                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={videoUrl}
                      onChange={(e) =>
                        setVideoUrl(
                          e.target.value
                        )
                      }
                    />

                    <small>
                      Make sure your Google Drive
                      sharing permission is set so
                      the recruiter can view the
                      video.
                    </small>
                  </div>

                  {err && (
                    <div className="err">
                      {err}
                    </div>
                  )}

                  {msg && (
                    <div className="ok">
                      {msg}
                    </div>
                  )}

                  <button
                    className="btn full"
                    type="submit"
                    disabled={applying}
                  >
                    {applying
                      ? 'Submitting...'
                      : 'Apply with skill video'}
                  </button>
                </form>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}