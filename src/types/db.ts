// export type Role='candidate'|'recruiter'|'admin';
// export type AppStatus='applied'|'reviewed'|'shortlisted'|'interview'|'selected'|'rejected';
// export interface Profile{id:string;full_name:string;email:string;role:Role;phone:string|null;location:string|null;headline:string|null;bio:string|null;profile_photo_path:string|null;resume_path:string|null;intro_video_path:string|null;created_at:string;updated_at:string}
// export interface Company{id:string;recruiter_id:string;company_name:string;logo_path:string|null;description:string|null;website:string|null;industry:string|null;location:string|null}
// export interface Job{id:string;company_id:string;recruiter_id:string;title:string;description:string;department:string|null;location:string|null;employment_type:string|null;experience_min:number|null;experience_max:number|null;salary_min:number|null;salary_max:number|null;status:string;created_at:string;updated_at:string;companies?:Company}
export type Role = 'candidate' | 'recruiter' | 'admin';

export type AppStatus =
    | 'applied'
    | 'reviewed'
    | 'shortlisted'
    | 'interview'
    | 'selected'
    | 'rejected';

export type JobMode = 'remote' | 'onsite' | 'hybrid';

export interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: Role;

    phone: string | null;
    country_code: string | null;
    address: string | null;
    state: string | null;
    country: string | null;

    location: string | null;
    headline: string | null;
    bio: string | null;

    profile_photo_path: string | null;
    resume_path: string | null;
    intro_video_path: string | null;

    created_at: string;
    updated_at: string;
}

export interface Company {
    id: string;
    recruiter_id: string;
    company_name: string;
    logo_path: string | null;
    description: string | null;
    website: string | null;
    industry: string | null;
    location: string | null;
}

export interface Skill {
    id: string;
    name: string;
}

export interface Job {
    id: string;
    company_id: string;
    recruiter_id: string;

    title: string;
    description: string;

    department: string | null;
    location: string | null;

    job_mode: JobMode | null;

    employment_type: string | null;

    experience_min: number | null;
    experience_max: number | null;

    salary_min: number | null;
    salary_max: number | null;

    status: string;

    created_at: string;
    updated_at: string;

    companies?: Company;
    skills?: Skill[];
}

export interface Application {
    id: string;
    job_id: string;
    candidate_id: string;

    resume_path: string | null;
    cover_letter: string | null;
    video_url: string | null;

    status: AppStatus;

    created_at: string;
    updated_at: string;

    jobs?: Job;
    candidate?: Profile;
}