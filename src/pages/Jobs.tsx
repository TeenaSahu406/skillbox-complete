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

    const { data } = await query;

    setJobs((data as Job[]) || []);
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

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function loadJob() {
    if (!id) return;

    const { data } = await supabase
      .from('jobs')
      .select('*,companies(*)')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      setJob(data as Job);
    }

    setLoading(false);
  }

  async function loadSkills() {
    if (!id) return;

    const { data } = await supabase
      .from('job_skills')
      .select('skill_id,skills(id,name)')
      .eq('job_id', id);

    const result = (data || [])
      .map((row: any) => row.skills)
      .filter(Boolean);

    setSkills(result as Skill[]);
  }

  async function checkApplication() {
    if (!id || !user) {
      setAlreadyApplied(false);
      return;
    }

    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', id)
      .eq('candidate_id', user.id)
      .maybeSingle();

    setAlreadyApplied(Boolean(data));
  }

  useEffect(() => {
    loadJob();
    loadSkills();
  }, [id]);

  useEffect(() => {
    checkApplication();
  }, [id, user]);

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

    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: id,
        candidate_id: user.id,
        video_url: cleanVideoUrl,
        status: 'applied',
      });

    setApplying(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setAlreadyApplied(true);

    setMsg(
      'Application submitted successfully. The recruiter can now review your profile and skill video.'
    );

    setVideoUrl('');
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
              <h3>Apply for this role</h3>

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
                <div className="ok">
                  You have already applied for
                  this job.
                </div>
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