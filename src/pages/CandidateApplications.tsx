import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type Application = {
    id: string;
    job_id: string;
    candidate_id: string;
    status: string;
    video_url: string | null;
    created_at: string;
    jobs?: {
        id: string;
        title: string;
        location: string | null;
        job_mode: string | null;
        employment_type: string | null;
        companies?: {
            company_name: string;
        } | null;
    } | null;
};

function statusLabel(status: string) {
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
            return status;
    }
}

export default function CandidateApplications() {
    const { user } = useAuth();

    const [applications, setApplications] =
        useState<Application[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadApplications() {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const { data, error: loadError } = await supabase
            .from('applications')
            .select(`
        id,
        job_id,
        candidate_id,
        status,
        video_url,
        created_at,
        jobs(
          id,
          title,
          location,
          job_mode,
          employment_type,
          companies(
            company_name
          )
        )
      `)
            .eq('candidate_id', user.id)
            .order('created_at', {
                ascending: false,
            });

        if (loadError) {
            setError(loadError.message);
            setApplications([]);
            setLoading(false);
            return;
        }

        const normalizedApplications: Application[] =
            (data || []).map((row: any) => ({
                ...row,
                jobs: Array.isArray(row.jobs)
                    ? row.jobs[0] || null
                    : row.jobs || null,
            }));

        setApplications(normalizedApplications);

        setLoading(false);
    }

    useEffect(() => {
        loadApplications();
    }, [user]);

    return (
        <>
            <Navbar />

            <main className="page">
                <div className="wrap">
                    <small>CANDIDATE</small>

                    <h1>My Applications</h1>

                    <p>
                        Track the jobs you have applied for and
                        see the recruiter's latest decision.
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
                            <h3>No applications yet.</h3>

                            <p>
                                Find a job and apply with your skill
                                video.
                            </p>

                            <Link
                                className="btn"
                                to="/jobs"
                            >
                                Find jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="list">
                            {applications.map(
                                (application) => {
                                    const job =
                                        application.jobs;

                                    const company =
                                        job?.companies
                                            ?.company_name ||
                                        'Company';

                                    const status =
                                        application.status ||
                                        'applied';

                                    const jobMode =
                                        job?.job_mode ===
                                            'onsite'
                                            ? 'On-site'
                                            : job?.job_mode ===
                                                'remote'
                                                ? 'Remote'
                                                : job?.job_mode ===
                                                    'hybrid'
                                                    ? 'Hybrid'
                                                    : null;

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
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    gap: '20px',
                                                    alignItems:
                                                        'flex-start',
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <div>
                                                    <small>
                                                        APPLICATION
                                                    </small>

                                                    <h2>
                                                        {job?.title ||
                                                            'Job'}
                                                    </h2>

                                                    <p>
                                                        <strong>
                                                            {company}
                                                        </strong>
                                                    </p>

                                                    <p>
                                                        {job?.location ||
                                                            'Remote'}

                                                        {jobMode
                                                            ? ` · ${jobMode}`
                                                            : ''}

                                                        {job?.employment_type
                                                            ? ` · ${job.employment_type}`
                                                            : ''}
                                                    </p>
                                                </div>

                                                <div>
                                                    <strong>
                                                        Status
                                                    </strong>

                                                    <div
                                                        style={{
                                                            marginTop:
                                                                '8px',
                                                        }}
                                                    >
                                                        <span
                                                            className={
                                                                status ===
                                                                    'selected'
                                                                    ? 'sel'
                                                                    : status ===
                                                                        'rejected'
                                                                        ? 'err'
                                                                        : ''
                                                            }
                                                            style={{
                                                                display:
                                                                    'inline-block',
                                                                padding:
                                                                    '8px 12px',
                                                                borderRadius:
                                                                    '8px',
                                                            }}
                                                        >
                                                            {statusLabel(
                                                                status
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <hr />

                                            <div>
                                                <small>
                                                    APPLIED ON
                                                </small>

                                                <p>
                                                    {new Date(
                                                        application.created_at
                                                    ).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        }
                                                    )}
                                                </p>
                                            </div>

                                            <hr />

                                            <div>
                                                <small>
                                                    APPLICATION VIDEO
                                                </small>

                                                {application.video_url ? (
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                '10px',
                                                        }}
                                                    >
                                                        <a
                                                            className="btn ghost"
                                                            href={
                                                                application.video_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Open my skill video
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <p>
                                                        No video link
                                                        submitted.
                                                    </p>
                                                )}
                                            </div>

                                            <hr />

                                            <div
                                                style={{
                                                    display:
                                                        'flex',
                                                    gap: '10px',
                                                    flexWrap:
                                                        'wrap',
                                                }}
                                            >
                                                {job?.id && (
                                                    <Link
                                                        className="btn ghost"
                                                        to={`/jobs/${job.id}`}
                                                    >
                                                        View job
                                                    </Link>
                                                )}

                                                <button
                                                    className="btn ghost"
                                                    type="button"
                                                    onClick={
                                                        loadApplications
                                                    }
                                                >
                                                    Refresh status
                                                </button>
                                            </div>
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