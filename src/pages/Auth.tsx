// import {FormEvent,useState} from 'react';import {Link,useNavigate} from 'react-router-dom';import Navbar from '../components/Navbar';import {supabase} from '../lib/supabase';
// export function Login(){const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false),nav=useNavigate();async function submit(e:FormEvent){e.preventDefault();setBusy(true);setErr('');const{error}=await supabase.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(error)setErr(error.message);else nav('/')}return <AuthShell title="Sign in to SkillBox" sub="Continue your hiring or job search journey."><form onSubmit={submit} className="form"><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{err&&<div className="err">{err}</div>}<button className="btn full" disabled={busy}>{busy?'Signing in…':'Sign in'}</button><Link to="/forgot">Forgot password?</Link></form><p>Don't have an account? <Link to="/register">Create one</Link></p></AuthShell>}
// export function Register(){const[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[role,setRole]=useState<'candidate'|'recruiter'>('candidate'),[err,setErr]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);async function submit(e:FormEvent){e.preventDefault();setErr('');setMsg('');if(password.length<8)return setErr('Use at least 8 characters.');if(password!==confirm)return setErr('Passwords do not match.');setBusy(true);const{data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim(),role},emailRedirectTo:location.origin+'/auth/callback'}});setBusy(false);if(error)return setErr(error.message);if(data.session)setMsg('Account created.');else setMsg('Account created. Check your real email to verify your account.')}return <AuthShell title="Join SkillBox" sub="Create a secure candidate or recruiter account."><form onSubmit={submit} className="form"><label>Full name<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><div className="two"><label>Password<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></label><label>Confirm<input required type="password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/></label></div><div className="roles"><button type="button" className={role==='candidate'?'active':''} onClick={()=>setRole('candidate')}>Candidate</button><button type="button" className={role==='recruiter'?'active':''} onClick={()=>setRole('recruiter')}>Recruiter</button></div>{err&&<div className="err">{err}</div>}{msg&&<div className="ok">{msg}</div>}<button className="btn full" disabled={busy}>{busy?'Creating…':'Create account'}</button></form><p>Already have an account? <Link to="/login">Sign in</Link></p></AuthShell>}
// export function Forgot(){const[email,setEmail]=useState(''),[msg,setMsg]=useState(''),[err,setErr]=useState('');async function submit(e:FormEvent){e.preventDefault();setErr('');setMsg('');const{error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:location.origin+'/reset'});if(error)setErr(error.message);else setMsg('If the account exists, a secure reset link has been sent. Check inbox and spam.')}return <AuthShell title="Forgot password?" sub="Enter your email and we will send a secure reset link."><form onSubmit={submit} className="form"><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>{err&&<div className="err">{err}</div>}{msg&&<div className="ok">{msg}</div>}<button className="btn full">Send reset link</button></form><p><Link to="/login">← Back to sign in</Link></p></AuthShell>}
// export function Reset(){const[p,setP]=useState(''),[c,setC]=useState(''),[err,setErr]=useState(''),[msg,setMsg]=useState('');async function submit(e:FormEvent){e.preventDefault();if(p.length<8)return setErr('Use at least 8 characters.');if(p!==c)return setErr('Passwords do not match.');const{error}=await supabase.auth.updateUser({password:p});if(error)setErr(error.message);else setMsg('Password updated. You can sign in with the new password.')}return <AuthShell title="Create new password" sub="Choose a new password for your SkillBox account."><form onSubmit={submit} className="form"><label>New password<input type="password" minLength={8} required value={p} onChange={e=>setP(e.target.value)}/></label><label>Confirm password<input type="password" minLength={8} required value={c} onChange={e=>setC(e.target.value)}/></label>{err&&<div className="err">{err}</div>}{msg&&<div className="ok">{msg}</div>}<button className="btn full">Update password</button></form></AuthShell>}
// function AuthShell({title,sub,children}:{title:string;sub:string;children:React.ReactNode}){return <><Navbar/><main className="auth"><div className="authcard"><b className="mark">▦</b><small>SECURE ACCOUNT</small><h1>{title}</h1><p>{sub}</p>{children}</div></main></>}
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();

    setBusy(true);
    setErr('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    nav('/');
  }

  return (
    <AuthShell
      title="Sign in to SkillBox"
      sub="Continue your hiring or job search journey."
    >
      <form onSubmit={submit} className="form">
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {err && <div className="err">{err}</div>}

        <button className="btn full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <Link to="/forgot">Forgot password?</Link>
      </form>

      <p>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setErr('');
    setMsg('');

    if (password.length < 8) {
      setErr('Use at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }

    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    if (data.session) {
      setMsg('Account created successfully.');
    } else {
      setMsg(
        'Account created. Check your real email to verify your account.'
      );
    }
  }

  return (
    <AuthShell
      title="Join SkillBox"
      sub="Create a secure candidate or recruiter account."
    >
      <form onSubmit={submit} className="form">
        <label>
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>

        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <div className="two">
          <label>
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm
            <input
              required
              type="password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="roles">
          <button
            type="button"
            className={role === 'candidate' ? 'active' : ''}
            onClick={() => setRole('candidate')}
          >
            Candidate
          </button>

          <button
            type="button"
            className={role === 'recruiter' ? 'active' : ''}
            onClick={() => setRole('recruiter')}
          >
            Recruiter
          </button>
        </div>

        {err && <div className="err">{err}</div>}
        {msg && <div className="ok">{msg}</div>}

        <button className="btn full" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setErr('');
    setMsg('');
    setBusy(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset`,
      }
    );

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg(
      'If the account exists, a secure reset link has been sent. Check inbox and spam.'
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      sub="Enter your email and we will send a secure reset link."
    >
      <form onSubmit={submit} className="form">
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        {err && <div className="err">{err}</div>}
        {msg && <div className="ok">{msg}</div>}

        <button className="btn full" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p>
        <Link to="/login">← Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

export function Reset() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setErr('');
    setMsg('');

    if (password.length < 8) {
      setErr('Use at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg('Password updated. You can sign in with the new password.');
  }

  return (
    <AuthShell
      title="Create new password"
      sub="Choose a new password for your SkillBox account."
    >
      <form onSubmit={submit} className="form">
        <label>
          New password
          <input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            minLength={8}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        {err && <div className="err">{err}</div>}
        {msg && <div className="ok">{msg}</div>}

        <button className="btn full" disabled={busy}>
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
}

function AuthShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="auth">
        <div className="authcard">
          <b className="mark">▦</b>

          <small>SECURE ACCOUNT</small>

          <h1>{title}</h1>

          <p>{sub}</p>

          {children}
        </div>
      </main>
    </>
  );
}