// import {FormEvent,useEffect,useState} from 'react';import Navbar from '../components/Navbar';import Footer from '../components/Footer';import {supabase} from '../lib/supabase';import {useAuth} from '../hooks/useAuth';
// export default function CandidateProfile(){const{user,profile}=useAuth();const[f,setF]=useState({full_name:'',phone:'',location:'',headline:'',bio:''}),[skills,setSkills]=useState<any[]>([]),[sel,setSel]=useState<string[]>([]),[msg,setMsg]=useState('');useEffect(()=>{if(!user)return;setF({full_name:profile?.full_name||'',phone:profile?.phone||'',location:profile?.location||'',headline:profile?.headline||'',bio:profile?.bio||''});supabase.from('skills').select('*').order('name').then(({data})=>setSkills(data||[]));supabase.from('candidate_skills').select('skill_id').eq('candidate_id',user.id).then(({data})=>setSel((data||[]).map((x:any)=>x.skill_id)) )},[user,profile]);async function save(e:FormEvent){e.preventDefault();if(!user)return;await supabase.from('profiles').update({full_name:f.full_name,phone:f.phone||null,location:f.location||null,headline:f.headline||null,bio:f.bio||null}).eq('id',user.id);await supabase.from('candidate_skills').delete().eq('candidate_id',user.id);if(sel.length)await supabase.from('candidate_skills').insert(sel.map(skill_id=>({candidate_id:user.id,skill_id})));setMsg('Profile saved successfully.')}return <><Navbar/><main className="page"><div className="wrap narrow"><small>CANDIDATE PROFILE</small><h1>Build your proof</h1><p>Skills + projects + resume + introduction video.</p><form className="card form" onSubmit={save}><div className="two"><label>Name<input required value={f.full_name} onChange={e=>setF({...f,full_name:e.target.value})}/></label><label>Phone<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label></div><div className="two"><label>Location<input value={f.location} onChange={e=>setF({...f,location:e.target.value})}/></label><label>Headline<input value={f.headline} onChange={e=>setF({...f,headline:e.target.value})}/></label></div><label>About<textarea rows={6} value={f.bio} onChange={e=>setF({...f,bio:e.target.value})}/></label><div><b>Skills</b><div className="skillpills">{skills.map(s=><button type="button" className={sel.includes(s.id)?'sel':''} onClick={()=>setSel(a=>a.includes(s.id)?a.filter(x=>x!==s.id):[...a,s.id])} key={s.id}>{s.name}</button>)}</div></div>{msg&&<div className="ok">{msg}</div>}<button className="btn full">Save profile</button></form></div></main><Footer/></>}
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

const initialForm: FormState = {
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
  const { user, profile } = useAuth();

  const [form, setForm] = useState<FormState>(initialForm);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError('');

      const [skillsResult, selectedSkillsResult] = await Promise.all([
        supabase
          .from('skills')
          .select('id,name')
          .order('name'),

        supabase
          .from('candidate_skills')
          .select('skill_id')
          .eq('candidate_id', user!.id),
      ]);

      if (skillsResult.error) {
        setError(skillsResult.error.message);
      }

      if (selectedSkillsResult.error) {
        setError(selectedSkillsResult.error.message);
      }

      setSkills((skillsResult.data || []) as Skill[]);

      setSelectedSkills(
        (selectedSkillsResult.data || []).map(
          (item: { skill_id: string }) => item.skill_id
        )
      );

      setForm({
        full_name: profile?.full_name || '',
        email: user!.email || profile?.email || '',
        country_code: profile?.country_code || '+91',
        phone: profile?.phone || '',
        address: profile?.address || '',
        state: profile?.state || '',
        country: profile?.country || '',
        headline: profile?.headline || '',
        bio: profile?.bio || '',
      });

      setLoading(false);
    }

    loadProfile();
  }, [user, profile]);

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

    if (!user) return;

    setSaving(true);
    setMessage('');
    setError('');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        country_code: form.country_code.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
      })
      .eq('id', user.id);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from('candidate_skills')
      .delete()
      .eq('candidate_id', user.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
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
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setMessage('Profile saved successfully.');
    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="page">
          <div className="wrap narrow">
            <p>Loading your profile...</p>
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
            Add your basic information and skills. Your skill video will be
            provided later when you apply for a specific job.
          </p>

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
                Your account email cannot be changed from your profile.
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
                  placeholder="e.g. Delhi"
                  autoComplete="address-level1"
                />
              </label>

              <label>
                Country
                <input
                  value={form.country}
                  onChange={(e) =>
                    updateField('country', e.target.value)
                  }
                  placeholder="e.g. India"
                  autoComplete="country-name"
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
                Select the skills you want recruiters to see.
              </p>

              <div className="skillpills">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    className={
                      selectedSkills.includes(skill.id) ? 'sel' : ''
                    }
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="ok">
              Your skill video is not required here. You will provide the
              relevant Google Drive video link when applying for a job.
            </div>

            {error && <div className="err">{error}</div>}

            {message && <div className="ok">{message}</div>}

            <button
              className="btn full"
              disabled={saving}
              type="submit"
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