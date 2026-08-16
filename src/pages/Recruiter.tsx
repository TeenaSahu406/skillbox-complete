import { FormEvent, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type Skill = {
  id: string;
  name: string;
};

export function Company() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    company_name: '',
    description: '',
    website: '',
    industry: '',
    location: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadCompany() {
      const { data, error: loadError } = await supabase
        .from('companies')
        .select('*')
        .eq('recruiter_id', user!.id)
        .maybeSingle();

      if (loadError) {
        setError(loadError.message);
      }

      if (data) {
        setForm({
          company_name: data.company_name || '',
          description: data.description || '',
          website: data.website || '',
          industry: data.industry || '',
          location: data.location || '',
        });
      }

      setLoading(false);
    }

    loadCompany();
  }, [user]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();

    if (!user) {
      setError('Please sign in as a recruiter.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    const { error: saveError } = await supabase
      .from('companies')
      .upsert(
        {
          recruiter_id: user.id,
          company_name: form.company_name.trim(),
          description: form.description.trim() || null,
          website: form.website.trim() || null,
          industry: form.industry.trim() || null,
          location: form.location.trim() || null,
        },
        {
          onConflict: 'recruiter_id',
        }
      );

    if (saveError) {
      setError(saveError.message);
    } else {
      setMessage('Company profile saved successfully.');
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="page">
          <div className="wrap narrow">
            <p>Loading company profile...</p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap narrow">
          <small>RECRUITER</small>

          <h1>Company profile</h1>

          <p>
            Add your company information so candidates know who is hiring.
          </p>

          <form className="card form" onSubmit={save}>
            <label>
              Company name
              <input
                required
                value={form.company_name}
                onChange={(e) =>
                  updateField('company_name', e.target.value)
                }
                placeholder="e.g. SkillBox Technologies"
              />
            </label>

            <div className="two">
              <label>
                Industry
                <input
                  value={form.industry}
                  onChange={(e) =>
                    updateField('industry', e.target.value)
                  }
                  placeholder="e.g. Technology"
                />
              </label>

              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) =>
                    updateField('location', e.target.value)
                  }
                  placeholder="e.g. Delhi, India"
                />
              </label>
            </div>

            <label>
              Website
              <input
                type="url"
                value={form.website}
                onChange={(e) =>
                  updateField('website', e.target.value)
                }
                placeholder="https://example.com"
              />
            </label>

            <label>
              Company description
              <textarea
                rows={7}
                value={form.description}
                onChange={(e) =>
                  updateField('description', e.target.value)
                }
                placeholder="Tell candidates about your company..."
              />
            </label>

            {error && <div className="err">{error}</div>}

            {message && <div className="ok">{message}</div>}

            <button
              className="btn full"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save company'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

export function PostJob() {
  const { user } = useAuth();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    job_mode: 'remote' as 'remote' | 'onsite' | 'hybrid',
    employment_type: 'Full-time',
    salary_min: '',
    salary_max: '',
    salary_period: 'monthly',
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSkills() {
      const { data, error: skillsError } = await supabase
        .from('skills')
        .select('id,name')
        .order('name');

      if (skillsError) {
        setError(skillsError.message);
      }

      setSkills((data || []) as Skill[]);
      setLoadingSkills(false);
    }

    loadSkills();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleSkill(skillId: string) {
    setSelectedSkills((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId]
    );
  }

  async function save(e: FormEvent) {
    e.preventDefault();

    if (!user) {
      setError('Please sign in as a recruiter first.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    const salaryMin =
      form.salary_min.trim() === ''
        ? null
        : Number(form.salary_min);

    const salaryMax =
      form.salary_max.trim() === ''
        ? null
        : Number(form.salary_max);

    if (
      salaryMin !== null &&
      (!Number.isFinite(salaryMin) || salaryMin < 0)
    ) {
      setError('Please enter a valid minimum salary.');
      setSaving(false);
      return;
    }

    if (
      salaryMax !== null &&
      (!Number.isFinite(salaryMax) || salaryMax < 0)
    ) {
      setError('Please enter a valid maximum salary.');
      setSaving(false);
      return;
    }

    if (
      salaryMin !== null &&
      salaryMax !== null &&
      salaryMin > salaryMax
    ) {
      setError(
        'Minimum salary cannot be greater than maximum salary.'
      );
      setSaving(false);
      return;
    }

    if (selectedSkills.length === 0) {
      setError('Please select at least one required skill.');
      setSaving(false);
      return;
    }

    const { data: company, error: companyError } =
      await supabase
        .from('companies')
        .select('id')
        .eq('recruiter_id', user.id)
        .maybeSingle();

    if (companyError) {
      setError(companyError.message);
      setSaving(false);
      return;
    }

    if (!company) {
      setError(
        'Please create your company profile before posting a job.'
      );
      setSaving(false);
      return;
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        company_id: company.id,
        recruiter_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim() || null,
        job_mode: form.job_mode,
        employment_type: form.employment_type,
        salary_min: salaryMin,
        salary_max: salaryMax,
        status: 'open',
      })
      .select('id')
      .single();

    if (jobError || !job) {
      setError(
        jobError?.message || 'Unable to publish the job.'
      );
      setSaving(false);
      return;
    }

    const skillRows = selectedSkills.map((skillId) => ({
      job_id: job.id,
      skill_id: skillId,
    }));

    const { error: skillError } = await supabase
      .from('job_skills')
      .insert(skillRows);

    if (skillError) {
      await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id)
        .eq('recruiter_id', user.id);

      setError(
        `Job was not published because required skills could not be saved: ${skillError.message}`
      );

      setSaving(false);
      return;
    }

    setMessage('Job published successfully.');

    setForm({
      title: '',
      description: '',
      location: '',
      job_mode: 'remote',
      employment_type: 'Full-time',
      salary_min: '',
      salary_max: '',
      salary_period: 'monthly',
    });

    setSelectedSkills([]);
    setSaving(false);
  }

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap narrow">
          <small>RECRUITER</small>

          <h1>Post a job</h1>

          <p>
            Candidates will submit a job-specific skill video link
            when they apply.
          </p>

          <form className="card form" onSubmit={save}>
            <label>
              Job title
              <input
                required
                value={form.title}
                onChange={(e) =>
                  updateField('title', e.target.value)
                }
                placeholder="e.g. Sales Executive"
              />
            </label>

            <label>
              Job description
              <textarea
                required
                rows={10}
                value={form.description}
                onChange={(e) =>
                  updateField('description', e.target.value)
                }
                placeholder="Describe the role, responsibilities and expectations..."
              />
            </label>

            <div>
              <b>Required skills</b>

              <p>
                Select the skills candidates should demonstrate in
                their application video.
              </p>

              {loadingSkills ? (
                <p>Loading skills...</p>
              ) : skills.length === 0 ? (
                <div className="err">
                  No skills available. Please add skills in Supabase.
                </div>
              ) : (
                <div className="skillpills">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      className={
                        selectedSkills.includes(skill.id)
                          ? 'sel'
                          : ''
                      }
                      onClick={() => toggleSkill(skill.id)}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label>
              Job location
              <input
                value={form.location}
                onChange={(e) =>
                  updateField('location', e.target.value)
                }
                placeholder="e.g. Delhi, India"
              />
            </label>

            <label>
              Job mode
              <select
                value={form.job_mode}
                onChange={(e) =>
                  updateField('job_mode', e.target.value)
                }
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>

            <label>
              Employment type
              <select
                value={form.employment_type}
                onChange={(e) =>
                  updateField(
                    'employment_type',
                    e.target.value
                  )
                }
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>

            <div>
              <b>Salary range</b>

              <p>
                Salary is shown in Indian Rupees (₹).
              </p>

              <div className="two">
                <label>
                  Minimum salary
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.salary_min}
                    onChange={(e) =>
                      updateField(
                        'salary_min',
                        e.target.value
                      )
                    }
                    placeholder="₹ 20,000"
                  />
                </label>

                <label>
                  Maximum salary
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.salary_max}
                    onChange={(e) =>
                      updateField(
                        'salary_max',
                        e.target.value
                      )
                    }
                    placeholder="₹ 35,000"
                  />
                </label>
              </div>

              <label>
                Salary period
                <select
                  value={form.salary_period}
                  onChange={(e) =>
                    updateField(
                      'salary_period',
                      e.target.value
                    )
                  }
                >
                  <option value="monthly">Per month</option>
                  <option value="annual">Per year</option>
                </select>
              </label>

              <small>
                Example: ₹20,000 – ₹35,000 per month.
              </small>
            </div>

            {error && <div className="err">{error}</div>}

            {message && <div className="ok">{message}</div>}

            <button
              className="btn full"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Publishing...' : 'Publish job'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

export function RecruiterApplications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadApplications() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: applicationError } =
      await supabase
        .from('applications')
        .select(`
          id,
          candidate_id,
          job_id,
          status,
          video_url,
          cover_letter,
          created_at,
          jobs!inner(
            id,
            title,
            recruiter_id
          )
        `)
        .eq('jobs.recruiter_id', user.id)
        .order('created_at', {
          ascending: false,
        });

    if (applicationError) {
      setError(applicationError.message);
      setApplications([]);
      setLoading(false);
      return;
    }

    const rows = data || [];

    if (!rows.length) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const candidateIds = [
      ...new Set(
        rows
          .map((item: any) => item.candidate_id)
          .filter(Boolean)
      ),
    ];

    const { data: profiles, error: profileError } =
      await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          country_code,
          address,
          state,
          country,
          location,
          headline,
          bio,
          intro_video_url
        `)
        .in('id', candidateIds);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { data: candidateSkills, error: skillsError } =
      await supabase
        .from('candidate_skills')
        .select(`
          candidate_id,
          skill_id,
          skills(
            id,
            name
          )
        `)
        .in('candidate_id', candidateIds);

    if (skillsError) {
      setError(skillsError.message);
      setLoading(false);
      return;
    }

    const profileMap = new Map(
      (profiles || []).map((profile: any) => [
        profile.id,
        profile,
      ])
    );

    const skillMap = new Map<string, any[]>();

    (candidateSkills || []).forEach((row: any) => {
      const existing =
        skillMap.get(row.candidate_id) || [];

      if (row.skills) {
        existing.push(row.skills);
      }

      skillMap.set(row.candidate_id, existing);
    });

    const finalApplications = rows.map(
      (application: any) => ({
        ...application,
        profile:
          profileMap.get(application.candidate_id) || null,
        skills:
          skillMap.get(application.candidate_id) || [],
      })
    );

    setApplications(finalApplications);
    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, [user]);

  async function updateStatus(
    applicationId: string,
    status: string
  ) {
    const { error: updateError } =
      await supabase
        .from('applications')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status,
            }
          : application
      )
    );
  }

  function getVideoUrl(application: any) {
    return (
      application.video_url ||
      application.profile?.intro_video_url ||
      ''
    );
  }

  function formatPhone(profile: any) {
    if (!profile?.phone) {
      return 'Not provided';
    }

    return `${profile.country_code || ''} ${
      profile.phone
    }`.trim();
  }

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap">
          <small>RECRUITER</small>

          <h1>Applications</h1>

          <p>
            Review candidates, check their skills and watch
            their application video before taking action.
          </p>

          {error && <div className="err">{error}</div>}

          {loading ? (
            <div className="empty">
              Loading applications...
            </div>
          ) : !applications.length ? (
            <div className="empty">
              No applications yet.
            </div>
          ) : (
            <div className="list">
              {applications.map(
                (application: any) => {
                  const candidate =
                    application.profile;

                  const videoUrl =
                    getVideoUrl(application);

                  return (
                    <article
                      className="card"
                      key={application.id}
                      style={{
                        marginBottom: '20px',
                      }}
                    >
                      <small>APPLIED FOR</small>

                      <h2>
                        {application.jobs?.title ||
                          'Job'}
                      </h2>

                      <p>
                        Applied on{' '}
                        {application.created_at
                          ? new Date(
                              application.created_at
                            ).toLocaleDateString()
                          : '—'}
                      </p>

                      <hr />

                      <small>CANDIDATE</small>

                      <h2>
                        {candidate?.full_name ||
                          'Candidate'}
                      </h2>

                      {candidate?.headline && (
                        <p>
                          <strong>
                            {candidate.headline}
                          </strong>
                        </p>
                      )}

                      <p>
                        <strong>Email:</strong>{' '}
                        {candidate?.email ||
                          'Not provided'}
                      </p>

                      <p>
                        <strong>Phone:</strong>{' '}
                        {formatPhone(candidate)}
                      </p>

                      <p>
                        <strong>Address:</strong>{' '}
                        {candidate?.address ||
                          'Not provided'}
                      </p>

                      <p>
                        <strong>State:</strong>{' '}
                        {candidate?.state ||
                          'Not provided'}
                      </p>

                      <p>
                        <strong>Country:</strong>{' '}
                        {candidate?.country ||
                          'Not provided'}
                      </p>

                      <p>
                        <strong>Location:</strong>{' '}
                        {candidate?.location ||
                          'Not provided'}
                      </p>

                      {candidate?.bio && (
                        <>
                          <hr />

                          <small>
                            ABOUT CANDIDATE
                          </small>

                          <p className="prose">
                            {candidate.bio}
                          </p>
                        </>
                      )}

                      <hr />

                      <small>SKILLS</small>

                      {application.skills?.length ? (
                        <div className="skillpills">
                          {application.skills.map(
                            (skill: any) => (
                              <span
                                className="sel"
                                key={skill.id}
                              >
                                {skill.name}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p>
                          No skills added to profile.
                        </p>
                      )}

                      <hr />

                      <small>
                        APPLICATION SKILL VIDEO
                      </small>

                      {videoUrl ? (
                        <div
                          style={{
                            marginTop: '10px',
                          }}
                        >
                          <a
                            className="btn"
                            href={videoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open candidate video
                          </a>

                          <p>
                            Watch the candidate's
                            job-specific skill
                            demonstration.
                          </p>
                        </div>
                      ) : (
                        <div className="err">
                          Candidate has not submitted
                          a video link for this
                          application.
                        </div>
                      )}

                      {application.cover_letter && (
                        <>
                          <hr />

                          <small>
                            CANDIDATE NOTE
                          </small>

                          <p className="prose">
                            {application.cover_letter}
                          </p>
                        </>
                      )}

                      <hr />

                      <small>
                        RECRUITER ACTION
                      </small>

                      <div
                        className="two"
                        style={{
                          marginTop: '10px',
                        }}
                      >
                        <label>
                          Application status

                          <select
                            value={
                              application.status ||
                              'applied'
                            }
                            onChange={(e) =>
                              updateStatus(
                                application.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="applied">
                              Applied
                            </option>

                            <option value="reviewed">
                              Reviewed
                            </option>

                            <option value="shortlisted">
                              Shortlisted
                            </option>

                            <option value="interview">
                              Interview
                            </option>

                            <option value="selected">
                              Selected
                            </option>

                            <option value="rejected">
                              Rejected
                            </option>
                          </select>
                        </label>
                      </div>

                      <p>
                        Current status:{' '}
                        <strong>
                          {application.status ||
                            'applied'}
                        </strong>
                      </p>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}