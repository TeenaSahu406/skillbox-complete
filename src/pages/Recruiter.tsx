import { FormEvent, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type Skill = {
  id: string;
  name: string;
};

type RecruiterJob = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  job_mode: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  status: string | null;
  created_at: string | null;
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

    const userId = user.id;

    async function loadCompany() {
      const { data, error: loadError } = await supabase
        .from('companies')
        .select('*')
        .eq('recruiter_id', userId)
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

    if (!user) return;

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

  const [skillInput, setSkillInput] = useState('');

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    job_mode: 'remote',
    employment_type: 'Full-time',
    salary_min: '',
    salary_max: '',
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

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setLoadingJobs(false);
      return;
    }

    loadJobs();
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

  function toggleSkill(skillId: string) {
    setSelectedSkills((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId]
    );
  }

  async function createOrFindSkill(
    name: string
  ): Promise<string | null> {
    const cleanName = name.trim();

    if (!cleanName) return null;

    const existing = skills.find(
      (skill) =>
        skill.name.trim().toLowerCase() ===
        cleanName.toLowerCase()
    );

    if (existing) {
      return existing.id;
    }

    const { data, error: insertError } = await supabase
      .from('skills')
      .insert({
        name: cleanName,
      })
      .select('id,name')
      .single();

    if (insertError) {
      setError(
        `Could not add skill "${cleanName}": ${insertError.message}`
      );
      return null;
    }

    if (!data) {
      setError(
        `Could not create skill "${cleanName}".`
      );
      return null;
    }

    const newSkill = data as Skill;

    setSkills((current) => {
      const exists = current.some(
        (skill) => skill.id === newSkill.id
      );

      if (exists) return current;

      return [...current, newSkill].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });

    return newSkill.id;
  }

  async function addTypedSkills() {
    const names = skillInput
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    if (!names.length) return;

    setError('');

    const ids: string[] = [];

    for (const name of names) {
      const skillId = await createOrFindSkill(name);

      if (!skillId) {
        return;
      }

      ids.push(skillId);
    }

    setSelectedSkills((current) => [
      ...current,
      ...ids.filter((id) => !current.includes(id)),
    ]);

    setSkillInput('');
  }

  async function getFinalSkillIds(): Promise<string[] | null> {
    const ids = new Set(selectedSkills);

    const typedNames = skillInput
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    for (const name of typedNames) {
      const skillId = await createOrFindSkill(name);

      if (!skillId) {
        return null;
      }

      ids.add(skillId);
    }

    return [...ids];
  }

  async function loadJobs() {
    if (!user) return;

    setLoadingJobs(true);

    const { data, error: jobsError } = await supabase
      .from('jobs')
      .select(
        `
          id,
          title,
          description,
          location,
          job_mode,
          employment_type,
          salary_min,
          salary_max,
          status,
          created_at
        `
      )
      .eq('recruiter_id', user.id)
      .order('created_at', {
        ascending: false,
      });

    if (jobsError) {
      setError(jobsError.message);
      setJobs([]);
    } else {
      setJobs((data || []) as RecruiterJob[]);
    }

    setLoadingJobs(false);
  }

  async function deleteJob(job: RecruiterJob) {
    if (!user) return;

    const confirmed = window.confirm(
      `Delete "${job.title}"? This cannot be undone if the job has no applications.`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    const { count, error: countError } =
      await supabase
        .from('applications')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('job_id', job.id);

    if (countError) {
      setError(countError.message);
      return;
    }

    if ((count || 0) > 0) {
      const closeConfirmed = window.confirm(
        `This job has ${count} application${
          count === 1 ? '' : 's'
        }. It should not be permanently deleted because candidate applications must be preserved.\n\nClose this job instead?`
      );

      if (!closeConfirmed) return;

      const { error: closeError } =
        await supabase
          .from('jobs')
          .update({
            status: 'closed',
          })
          .eq('id', job.id)
          .eq('recruiter_id', user.id);

      if (closeError) {
        setError(closeError.message);
        return;
      }

      setMessage(
        'Job closed successfully. Existing applications were preserved.'
      );

      await loadJobs();
      return;
    }

    const { error: skillDeleteError } =
      await supabase
        .from('job_skills')
        .delete()
        .eq('job_id', job.id);

    if (skillDeleteError) {
      setError(skillDeleteError.message);
      return;
    }

    const { error: jobDeleteError } =
      await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id)
        .eq('recruiter_id', user.id);

    if (jobDeleteError) {
      setError(jobDeleteError.message);
      return;
    }

    setMessage('Job deleted successfully.');

    await loadJobs();
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

    const finalSkillIds = await getFinalSkillIds();

    if (!finalSkillIds) {
      setSaving(false);
      return;
    }

    if (finalSkillIds.length === 0) {
      setError(
        'Please select or type at least one required skill.'
      );
      setSaving(false);
      return;
    }

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
      setError(
        'Please enter a valid minimum salary.'
      );
      setSaving(false);
      return;
    }

    if (
      salaryMax !== null &&
      (!Number.isFinite(salaryMax) || salaryMax < 0)
    ) {
      setError(
        'Please enter a valid maximum salary.'
      );
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

    const recruiterId = user.id;

    const {
      data: company,
      error: companyError,
    } = await supabase
      .from('companies')
      .select('id')
      .eq('recruiter_id', recruiterId)
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

    const {
      data: job,
      error: jobError,
    } = await supabase
      .from('jobs')
      .insert({
        company_id: company.id,
        recruiter_id: recruiterId,
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
        jobError?.message ||
          'Unable to publish the job.'
      );
      setSaving(false);
      return;
    }

    const skillRows = finalSkillIds.map(
      (skillId) => ({
        job_id: job.id,
        skill_id: skillId,
      })
    );

    const {
      error: skillError,
    } = await supabase
      .from('job_skills')
      .insert(skillRows);

    if (skillError) {
      await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id)
        .eq('recruiter_id', recruiterId);

      setError(
        `Job was not published because required skills could not be saved: ${skillError.message}`
      );

      setSaving(false);
      return;
    }

    setMessage(
      'Job published successfully.'
    );

    setForm({
      title: '',
      description: '',
      location: '',
      job_mode: 'remote',
      employment_type: 'Full-time',
      salary_min: '',
      salary_max: '',
    });

    setSelectedSkills([]);
    setSkillInput('');

    setSaving(false);

    await loadJobs();
  }

  function formatSalary(
    min: number | null,
    max: number | null
  ) {
    if (min !== null && max !== null) {
      return `₹${min.toLocaleString(
        'en-IN'
      )} – ₹${max.toLocaleString('en-IN')}`;
    }

    if (min !== null) {
      return `From ₹${min.toLocaleString(
        'en-IN'
      )}`;
    }

    if (max !== null) {
      return `Up to ₹${max.toLocaleString(
        'en-IN'
      )}`;
    }

    return 'Salary not specified';
  }

  function getJobModeLabel(
    mode: string | null
  ) {
    if (mode === 'remote') return 'Remote';
    if (mode === 'onsite') return 'On-site';
    if (mode === 'hybrid') return 'Hybrid';
    return 'Not specified';
  }

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap narrow">
          <small>RECRUITER</small>

          <h1>Post a job</h1>

          <p>
            Tell candidates exactly what the role requires.
            Candidates will submit a job-specific skill video
            when they apply.
          </p>

          <form
            className="card form"
            onSubmit={save}
          >
            <label>
              Job title

              <input
                required
                value={form.title}
                onChange={(e) =>
                  updateField(
                    'title',
                    e.target.value
                  )
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
                  updateField(
                    'description',
                    e.target.value
                  )
                }
                placeholder="Describe the role, responsibilities and expectations..."
              />
            </label>

            <div>
              <b>Required skills</b>

              <p className="muted">
                Select existing skills or type your own.
              </p>

              {loadingSkills ? (
                <p>Loading skills...</p>
              ) : (
                <>
                  <div className="skillpills">
                    {skills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        className={
                          selectedSkills.includes(
                            skill.id
                          )
                            ? 'sel'
                            : ''
                        }
                        onClick={() =>
                          toggleSkill(skill.id)
                        }
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) =>
                        setSkillInput(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTypedSkills();
                        }
                      }}
                      placeholder="Type skills: React, Excel, Python"
                      style={{
                        flex: '1 1 240px',
                        minWidth: 0,
                      }}
                    />

                    <button
                      type="button"
                      className="btn"
                      onClick={addTypedSkills}
                      disabled={
                        !skillInput.trim()
                      }
                    >
                      Add skills
                    </button>
                  </div>

                  <small
                    style={{
                      display: 'block',
                      marginTop: '8px',
                    }}
                  >
                    Enter multiple skills separated by commas.
                    Press Enter or click Add skills.
                  </small>
                </>
              )}

              {selectedSkills.length > 0 && (
                <div
                  style={{
                    marginTop: '18px',
                  }}
                >
                  <b>Selected skills</b>

                  <div className="skillpills">
                    {selectedSkills.map(
                      (skillId) => {
                        const skill =
                          skills.find(
                            (item) =>
                              item.id ===
                              skillId
                          );

                        if (!skill) return null;

                        return (
                          <button
                            key={skill.id}
                            type="button"
                            className="sel"
                            onClick={() =>
                              toggleSkill(
                                skill.id
                              )
                            }
                          >
                            {skill.name} ×
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            <label>
              Job location

              <input
                value={form.location}
                onChange={(e) =>
                  updateField(
                    'location',
                    e.target.value
                  )
                }
                placeholder="e.g. Delhi, India"
              />
            </label>

            <label>
              Job mode

              <select
                value={form.job_mode}
                onChange={(e) =>
                  updateField(
                    'job_mode',
                    e.target.value
                  )
                }
              >
                <option value="remote">
                  Remote
                </option>
                <option value="onsite">
                  On-site
                </option>
                <option value="hybrid">
                  Hybrid
                </option>
              </select>
            </label>

            <label>
              Employment type

              <select
                value={
                  form.employment_type
                }
                onChange={(e) =>
                  updateField(
                    'employment_type',
                    e.target.value
                  )
                }
              >
                <option>
                  Full-time
                </option>
                <option>
                  Part-time
                </option>
                <option>
                  Contract
                </option>
                <option>
                  Internship
                </option>
              </select>
            </label>

            <div>
              <b>Salary range</b>

              <p className="muted">
                Salary will be entered in Indian Rupees (₹).
              </p>

              <div className="two">
                <label>
                  Minimum salary

                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={
                      form.salary_min
                    }
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
                    value={
                      form.salary_max
                    }
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

              <small>
                Example: ₹20,000 – ₹35,000
              </small>
            </div>

            {error && (
              <div className="err">
                {error}
              </div>
            )}

            {message && (
              <div className="ok">
                {message}
              </div>
            )}

            <button
              className="btn full"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Publishing...'
                : 'Publish job'}
            </button>
          </form>

          {/* MY JOBS */}
          <section
            style={{
              marginTop: '50px',
            }}
          >
            <small>YOUR JOBS</small>

            <h2>
              Posted jobs
            </h2>

            {loadingJobs ? (
              <div className="empty">
                Loading your jobs...
              </div>
            ) : !jobs.length ? (
              <div className="empty">
                You have not posted any jobs yet.
              </div>
            ) : (
              <div className="list">
                {jobs.map((job) => (
                  <article
                    className="card"
                    key={job.id}
                    style={{
                      marginBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: '15px',
                        alignItems:
                          'flex-start',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          flex: '1 1 300px',
                        }}
                      >
                        <small>
                          {job.status ===
                          'open'
                            ? 'OPEN'
                            : 'CLOSED'}
                        </small>

                        <h3
                          style={{
                            margin:
                              '8px 0',
                          }}
                        >
                          {job.title}
                        </h3>

                        <p>
                          {job.location ||
                            'Remote'}{' '}
                          ·{' '}
                          {getJobModeLabel(
                            job.job_mode
                          )}{' '}
                          ·{' '}
                          {job.employment_type ||
                            'Full-time'}
                        </p>

                        <p>
                          {formatSalary(
                            job.salary_min,
                            job.salary_max
                          )}
                        </p>

                        {job.created_at && (
                          <small>
                            Posted{' '}
                            {new Date(
                              job.created_at
                            ).toLocaleDateString()}
                          </small>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn danger"
                        onClick={() =>
                          deleteJob(job)
                        }
                      >
                        {job.status ===
                        'open'
                          ? 'Delete / Close'
                          : 'Delete job'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export function RecruiterApplications() {
  const { user } = useAuth();

  const [applications, setApplications] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  async function loadApplications() {
    if (!user) {
      setLoading(false);
      return;
    }

    const recruiterId = user.id;

    setLoading(true);
    setError('');

    const {
      data,
      error: applicationError,
    } = await supabase
      .from('applications')
      .select(`
        id,
        candidate_id,
        job_id,
        status,
        video_url,
        created_at,
        jobs!inner(
          id,
          title,
          recruiter_id
        )
      `)
      .eq(
        'jobs.recruiter_id',
        recruiterId
      )
      .order('created_at', {
        ascending: false,
      });

    if (applicationError) {
      setError(
        applicationError.message
      );
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
          .map(
            (item: any) =>
              item.candidate_id
          )
          .filter(Boolean)
      ),
    ];

    const {
      data: profiles,
      error: profileError,
    } = await supabase
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
        bio
      `)
      .in('id', candidateIds);

    if (profileError) {
      setError(
        profileError.message
      );
      setLoading(false);
      return;
    }

    const {
      data: candidateSkills,
      error: skillsError,
    } = await supabase
      .from('candidate_skills')
      .select(`
        candidate_id,
        skill_id,
        skills(
          id,
          name
        )
      `)
      .in(
        'candidate_id',
        candidateIds
      );

    if (skillsError) {
      setError(
        skillsError.message
      );
      setLoading(false);
      return;
    }

    const profileMap = new Map(
      (profiles || []).map(
        (profile: any) => [
          profile.id,
          profile,
        ]
      )
    );

    const skillMap =
      new Map<string, any[]>();

    (candidateSkills || []).forEach(
      (row: any) => {
        const existing =
          skillMap.get(
            row.candidate_id
          ) || [];

        if (row.skills) {
          existing.push(
            row.skills
          );
        }

        skillMap.set(
          row.candidate_id,
          existing
        );
      }
    );

    const finalApplications =
      rows.map(
        (application: any) => ({
          ...application,
          profile:
            profileMap.get(
              application.candidate_id
            ) || null,
          skills:
            skillMap.get(
              application.candidate_id
            ) || [],
        })
      );

    setApplications(
      finalApplications
    );

    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, [user]);

  async function updateStatus(
    applicationId: string,
    status: string
  ) {
    setError('');

    const {
      error: updateError,
    } = await supabase
      .from('applications')
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        applicationId
      );

    if (updateError) {
      setError(
        updateError.message
      );
      return;
    }

    setApplications(
      (current) =>
        current.map(
          (application) =>
            application.id ===
            applicationId
              ? {
                  ...application,
                  status,
                }
              : application
        )
    );
  }

  function formatPhone(
    profile: any
  ) {
    if (!profile?.phone) {
      return 'Not provided';
    }

    return `${profile.country_code || ''} ${
      profile.phone
    }`.trim();
  }

  function statusLabel(
    status: string
  ) {
    switch (status) {
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
        return 'Applied';
    }
  }

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="wrap">
          <small>RECRUITER</small>

          <h1>Applications</h1>

          <p>
            Review candidates, watch their skill proof and take
            hiring actions.
          </p>

          {error && (
            <div className="err">
              {error}
            </div>
          )}

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

                  return (
                    <article
                      className="card"
                      key={
                        application.id
                      }
                      style={{
                        marginBottom:
                          '20px',
                      }}
                    >
                      <small>
                        APPLIED FOR
                      </small>

                      <h2>
                        {application.jobs
                          ?.title ||
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

                      <small>
                        CANDIDATE
                      </small>

                      <h2>
                        {candidate
                          ?.full_name ||
                          'Candidate'}
                      </h2>

                      {candidate?.headline && (
                        <p>
                          <strong>
                            {
                              candidate.headline
                            }
                          </strong>
                        </p>
                      )}

                      <p>
                        <strong>
                          Email:
                        </strong>{' '}
                        {candidate?.email ||
                          'Not provided'}
                      </p>

                      <p>
                        <strong>
                          Phone:
                        </strong>{' '}
                        {formatPhone(
                          candidate
                        )}
                      </p>

                      <p>
                        <strong>
                          Address:
                        </strong>{' '}
                        {candidate?.address ||
                          'Not provided'}
                      </p>

                      <p>
                        <strong>
                          State:
                        </strong>{' '}
                        {candidate?.state ||
                          'Not provided'}
                      </p>

                      <p>
                        <strong>
                          Country:
                        </strong>{' '}
                        {candidate?.country ||
                          'Not provided'}
                      </p>

                      <hr />

                      <small>
                        SKILLS
                      </small>

                      {application.skills
                        ?.length ? (
                        <div className="skillpills">
                          {application.skills.map(
                            (skill: any) => (
                              <span
                                className="sel"
                                key={
                                  skill.id
                                }
                              >
                                {
                                  skill.name
                                }
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

                      {application.video_url ? (
                        <div
                          style={{
                            marginTop:
                              '10px',
                          }}
                        >
                          <a
                            className="btn"
                            href={
                              application.video_url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open candidate video
                          </a>

                          <p>
                            Watch the candidate's
                            job-specific skill
                            demonstration before
                            making a decision.
                          </p>
                        </div>
                      ) : (
                        <div className="err">
                          No skill video was submitted.
                        </div>
                      )}

                      <hr />

                      <small>
                        RECRUITER ACTION
                      </small>

                      <label>
                        Application status

                        <select
                          value={
                            application.status ||
                            'applied'
                          }
                          onChange={(
                            e
                          ) =>
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

                      <p>
                        Current status:{' '}
                        <strong>
                          {statusLabel(
                            application.status ||
                              'applied'
                          )}
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