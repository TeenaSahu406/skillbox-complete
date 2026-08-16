import { FormEvent, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type Skill = {
    id: string;
    name: string;
};

type FormState = {
    full_name: string;
    email: string;
    country_code: string;
    phone: string;
    address: string;
    state: string;
    country: string;
    headline: string;
    bio: string;
};

const emptyForm: FormState = {
    full_name: '',
    email: '',
    country_code: '+91',
    phone: '',
    address: '',
    state: '',
    country: '',
    headline: '',
    bio: '',
};

export default function CandidateProfile() {
    const { user } = useAuth();

    const [form, setForm] = useState<FormState>(emptyForm);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            setError('You are not signed in as a candidate.');
            return;
        }

        const userId = user.id;
        const userEmail = user.email;

        let cancelled = false;


        async function loadPage() {
            setLoading(true);
            setError('');
            setMessage('');

            try {
                // Load candidate profile
                const profileResult = await supabase
                    .from('profiles')
                    .select(
                        'id,full_name,email,phone,country_code,address,state,country,headline,bio,role'
                    )
                    .eq('id', userId)
                    .maybeSingle();

                if (profileResult.error) {
                    throw new Error(
                        `Profile could not be loaded: ${profileResult.error.message}`
                    );
                }

                // Load all available skills
                const skillsResult = await supabase
                    .from('skills')
                    .select('id,name')
                    .order('name');

                if (skillsResult.error) {
                    throw new Error(
                        `Skills could not be loaded: ${skillsResult.error.message}`
                    );
                }

                // Load candidate's selected skills
                const selectedResult = await supabase
                    .from('candidate_skills')
                    .select('skill_id')
                    .eq('candidate_id', userId);

                if (selectedResult.error) {
                    throw new Error(
                        `Your selected skills could not be loaded: ${selectedResult.error.message}`
                    );
                }

                if (cancelled) return;

                const profile = profileResult.data;

                setForm({
                    full_name: profile?.full_name || '',
                    email: userEmail || profile?.email || '',
                    country_code: profile?.country_code || '+91',
                    phone: profile?.phone || '',
                    address: profile?.address || '',
                    state: profile?.state || '',
                    country: profile?.country || '',
                    headline: profile?.headline || '',
                    bio: profile?.bio || '',
                });

                setSkills((skillsResult.data || []) as Skill[]);

                setSelectedSkills(
                    (selectedResult.data || []).map(
                        (item: { skill_id: string }) => item.skill_id
                    )
                );
            } catch (err) {
                if (cancelled) return;

                const message =
                    err instanceof Error
                        ? err.message
                        : 'Unable to load your profile.';

                setError(message);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    function updateField(field: keyof FormState, value: string) {
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

    async function saveProfile(e: FormEvent) {
        e.preventDefault();

        if (!user?.id) {
            setError('You are not signed in.');
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');

        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: form.full_name.trim(),
                    country_code: form.country_code.trim() || '+91',
                    phone: form.phone.trim() || null,
                    address: form.address.trim() || null,
                    state: form.state.trim() || null,
                    country: form.country.trim() || null,
                    headline: form.headline.trim() || null,
                    bio: form.bio.trim() || null,
                })
                .eq('id', user.id);

            if (profileError) {
                throw new Error(
                    `Profile save failed: ${profileError.message}`
                );
            }

            const { error: deleteError } = await supabase
                .from('candidate_skills')
                .delete()
                .eq('candidate_id', user.id);

            if (deleteError) {
                throw new Error(
                    `Skills update failed: ${deleteError.message}`
                );
            }

            if (selectedSkills.length > 0) {
                const rows = selectedSkills.map((skillId) => ({
                    candidate_id: user.id,
                    skill_id: skillId,
                }));

                const { error: insertError } = await supabase
                    .from('candidate_skills')
                    .insert(rows);

                if (insertError) {
                    throw new Error(
                        `Skills save failed: ${insertError.message}`
                    );
                }
            }

            setMessage('Profile saved successfully.');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to save your profile.'
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="page">
                    <div className="wrap narrow">
                        <small>CANDIDATE PROFILE</small>
                        <h1>Loading profile...</h1>
                        <p>Please wait while we load your information.</p>
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
                    <small>CANDIDATE PROFILE</small>

                    <h1>Build your profile</h1>

                    <p>
                        Add your basic information and skills. Your skill video will
                        be provided only when you apply for a specific job.
                    </p>

                    {error && (
                        <div className="err" style={{ marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    <form className="card form" onSubmit={saveProfile}>
                        <label>
                            Email
                            <input
                                type="email"
                                value={form.email}
                                readOnly
                                disabled
                            />
                            <small>
                                Your account email cannot be changed here.
                            </small>
                        </label>

                        <label>
                            Full name
                            <input
                                required
                                value={form.full_name}
                                onChange={(e) =>
                                    updateField('full_name', e.target.value)
                                }
                                autoComplete="name"
                                placeholder="Enter your full name"
                            />
                        </label>

                        <div className="two">
                            <label>
                                Country code
                                <select
                                    value={form.country_code}
                                    onChange={(e) =>
                                        updateField('country_code', e.target.value)
                                    }
                                >
                                    <option value="+91">🇮🇳 +91 India</option>
                                    <option value="+1">🇺🇸 +1 USA / Canada</option>
                                    <option value="+44">🇬🇧 +44 United Kingdom</option>
                                    <option value="+61">🇦🇺 +61 Australia</option>
                                    <option value="+971">🇦🇪 +971 UAE</option>
                                    <option value="+65">🇸🇬 +65 Singapore</option>
                                    <option value="+49">🇩🇪 +49 Germany</option>
                                    <option value="+33">🇫🇷 +33 France</option>
                                    <option value="+81">🇯🇵 +81 Japan</option>
                                    <option value="+82">🇰🇷 +82 South Korea</option>
                                </select>
                            </label>

                            <label>
                                Phone number
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) =>
                                        updateField('phone', e.target.value)
                                    }
                                    autoComplete="tel"
                                    placeholder="9876543210"
                                />
                            </label>
                        </div>

                        <label>
                            Address
                            <textarea
                                rows={3}
                                value={form.address}
                                onChange={(e) =>
                                    updateField('address', e.target.value)
                                }
                                autoComplete="street-address"
                                placeholder="House no., street, area..."
                            />
                        </label>

                        <div className="two">
                            <label>
                                State
                                <input
                                    value={form.state}
                                    onChange={(e) =>
                                        updateField('state', e.target.value)
                                    }
                                    autoComplete="address-level1"
                                    placeholder="e.g. Delhi"
                                />
                            </label>

                            <label>
                                Country
                                <input
                                    value={form.country}
                                    onChange={(e) =>
                                        updateField('country', e.target.value)
                                    }
                                    autoComplete="country-name"
                                    placeholder="e.g. India"
                                />
                            </label>
                        </div>

                        <label>
                            Professional headline
                            <input
                                value={form.headline}
                                onChange={(e) =>
                                    updateField('headline', e.target.value)
                                }
                                placeholder="e.g. Sales Executive | B2B Sales"
                            />
                        </label>

                        <label>
                            About you
                            <textarea
                                rows={6}
                                value={form.bio}
                                onChange={(e) =>
                                    updateField('bio', e.target.value)
                                }
                                placeholder="Tell recruiters about yourself, your experience and strengths..."
                            />
                        </label>

                        <div>
                            <b>Your skills</b>

                            <p className="muted">
                                Select the skills recruiters should see on your profile.
                            </p>

                            {skills.length > 0 ? (
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
                            ) : (
                                <p>No skills available yet.</p>
                            )}
                        </div>

                        <div className="ok">
                            <strong>Skill video:</strong> Not required for your
                            profile. When you apply for a job, you will provide a
                            Google Drive video link specifically for that job.
                        </div>

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
                            {saving ? 'Saving profile...' : 'Save profile'}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </>
    );
}