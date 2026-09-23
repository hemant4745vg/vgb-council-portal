"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminStatus = "yes" | "no";
type User = { id:number; name:string|null; email:string; alternate_email:string|null; role:string|null; admin_status:AdminStatus };
type Notice = { type:"success"|"error"; text:string } | null;

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-60";

function normalize(row:any):User { return { id:Number(row.id), name:row.name ?? null, email:String(row.email ?? ""), alternate_email:row.alternate_email ?? null, role:row.role ?? null, admin_status:row.admin_status === "yes" ? "yes" : "no" }; }

export default function DashboardUsersPage() {
  const [checking,setChecking]=useState(true), [isAdmin,setIsAdmin]=useState(false), [currentEmail,setCurrentEmail]=useState("");
  const [users,setUsers]=useState<User[]>([]), [loading,setLoading]=useState(false);
  const [search,setSearch]=useState(""), [filter,setFilter]=useState<"All"|AdminStatus>("All");
  const [editing,setEditing]=useState<number|null>(null), [saving,setSaving]=useState<number|null>(null);
  const [edit,setEdit]=useState({name:"",role:"",alternate_email:"",admin_status:"no" as AdminStatus});
  const [provisionEmail,setProvisionEmail]=useState(""), [provisioning,setProvisioning]=useState(false);
  const [notice,setNotice]=useState<Notice>(null);

  useEffect(()=>{ let mounted=true; (async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!mounted)return;
    if(!user){setChecking(false);return;}
    setCurrentEmail((user.email||"").trim().toLowerCase());
    const {data,error}=await supabase.rpc("get_my_portal_profile");
    if(!mounted)return;
    const profile=Array.isArray(data)?data[0]:data;
    if(error || profile?.admin_status!=="yes") { setIsAdmin(false); setChecking(false); if(error)setNotice({type:"error",text:"We couldn't verify administrator permissions."}); return; }
    setIsAdmin(true); setChecking(false); await fetchUsers();
  })(); return()=>{mounted=false}; },[]);

  async function fetchUsers(){
    setLoading(true);
    const {data,error}=await supabase.from("allowed_users").select("id,name,email,alternate_email,role,admin_status").order("name",{ascending:true});
    if(error){console.error(error);setUsers([]);setNotice({type:"error",text:"Unable to load portal users. Check the administrator RLS policy."});}
    else setUsers((data||[]).map(normalize));
    setLoading(false);
  }

  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return users.filter(u=>{
    const access=filter==="All"||u.admin_status===filter;
    const text=[u.name,u.email,u.alternate_email,u.role,u.admin_status].filter(Boolean).join(" ").toLowerCase();
    return access&&(!q||text.includes(q));
  })},[users,search,filter]);
  const admins=users.filter(u=>u.admin_status==="yes").length;

  function begin(u:User){setNotice(null);setEditing(u.id);setEdit({name:u.name||"",role:u.role||"",alternate_email:u.alternate_email||"",admin_status:u.admin_status});}
  function cancel(){setEditing(null);setSaving(null);}

  async function save(u:User){
    setNotice(null); const name=edit.name.trim(), role=edit.role.trim(), alt=edit.alternate_email.trim().toLowerCase();
    if(!name)return setNotice({type:"error",text:"Name cannot be empty."});
    if(!role)return setNotice({type:"error",text:"Role cannot be empty."});
    if(alt&&!alt.endsWith("@vidyagyan.in"))return setNotice({type:"error",text:"Alternate email must be a @vidyagyan.in address."});
    if(u.email.toLowerCase()===currentEmail&&edit.admin_status==="no")return setNotice({type:"error",text:"You cannot remove administrator access from your own account."});
    if(users.some(x=>x.id!==u.id&&alt&&x.alternate_email?.toLowerCase()===alt))return setNotice({type:"error",text:"That alternate email is already assigned to another portal user."});
    setSaving(u.id);
    const {error}=await supabase.from("allowed_users").update({name,role,alternate_email:alt||null,admin_status:edit.admin_status}).eq("id",u.id);
    if(error){console.error(error);setNotice({type:"error",text:error.code==="23505"?"That alternate email is already assigned to another user.":error.message||"Unable to save this user."});setSaving(null);return;}
    setUsers(xs=>xs.map(x=>x.id===u.id?{...x,name,role,alternate_email:alt||null,admin_status:edit.admin_status}:x));
    setEditing(null);setSaving(null);setNotice({type:"success",text:`${name}'s portal profile was updated successfully.`});
  }

  async function provision(){
    setNotice(null);const email=provisionEmail.trim().toLowerCase();
    if(!email)return setNotice({type:"error",text:"Enter the student's VidyaGyan email address."});
    if(!email.endsWith("@vidyagyan.in"))return setNotice({type:"error",text:"Only @vidyagyan.in email addresses can be provisioned."});
    if(!isAdmin)return setNotice({type:"error",text:"Administrator access is required."});
    setProvisioning(true);
    try{
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.access_token)throw new Error("Your session has expired. Please sign in again.");
      const {data,error}=await supabase.functions.invoke("provision-portal-user",{body:{email}});
      if(error){
        let message=error.message||"The provisioning request failed.";
        try{if(error.context?.json){const body=await error.context.json();message=body?.details||body?.error||body?.message||message;}}catch{}
        throw new Error(message);
      }
      setNotice({type:"success",text:data?.message||(data?.status==="already_provisioned"?"This user already has an Auth account. They should use Forgot password.":"Invitation sent successfully. The student can set their own password.")});
      setProvisionEmail("");
    }catch(e){setNotice({type:"error",text:e instanceof Error?e.message:"Unable to provision this user."});}
    finally{setProvisioning(false);}
  }

  if(checking)return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-16"><div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8"><div className="h-4 w-32 rounded bg-slate-200"/><div className="mt-4 h-9 w-64 rounded bg-slate-200"/></div></div></main>;
  if(!isAdmin)return <main className="min-h-screen bg-slate-50"><section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4"><div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl">🛡️</div><p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-amber-700">Restricted administration area</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Administrator access required</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">User management is available only when <code>admin_status</code> is <code>yes</code>.</p><Link href="/dashboard" className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600">Back to Dashboard</Link></div></section></main>;

  return <main className="min-h-screen bg-slate-50">
    <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600"/>Dashboard · Administration</div><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">User Management</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Manage portal identities, roles, alternate emails and administrative access. Passwords remain private to each user.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Stat n={users.length} label="Portal users"/><Stat n={admins} label="Administrators"/><Stat n={users.length-admins} label="Standard users"/></div></div></div></section>
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {notice&&<div role={notice.type==="error"?"alert":"status"} className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${notice.type==="success"?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-red-200 bg-red-50 text-red-800"}`}>{notice.text}</div>}
      <section className="rounded-3xl border border-emerald-100 bg-white shadow-sm"><div className="border-b border-emerald-50 px-5 py-5 sm:px-7"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-700">Account provisioning</p><h2 className="mt-1 text-xl font-bold text-slate-950">Invite a first-time portal user</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">The person must already exist in <b>allowed_users</b>. An invitation creates their Supabase Auth account. They set their own password, so there is no shared or default password.</p></div><div className="p-5 sm:p-7"><div className="flex flex-col gap-3 sm:flex-row"><input type="email" value={provisionEmail} onChange={e=>{setProvisionEmail(e.target.value);setNotice(null)}} onKeyDown={e=>{if(e.key==="Enter"&&!provisioning){e.preventDefault();provision()}}} placeholder="student@vidyagyan.in" disabled={provisioning} className={`${inputClass} flex-1`}/><button type="button" onClick={provision} disabled={provisioning} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">{provisioning?"Sending invitation…":"Invite user"}</button></div><p className="mt-3 text-[11px] leading-5 text-slate-400">Canonical school email or an alternate school email may be entered.</p></div></section>
      <section className="mt-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portal directory</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Authorised Users</h2></div><button type="button" onClick={fetchUsers} disabled={loading} className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:self-auto">{loading?"Refreshing…":"Refresh"}</button></div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, role or access..." className={inputClass}/><select value={filter} onChange={e=>setFilter(e.target.value as any)} className={inputClass}><option value="All">All access levels</option><option value="yes">Administrators</option><option value="no">Standard users</option></select></div></div>
        {loading?<div className="mt-5 space-y-3">{[1,2,3,4].map(i=><div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"><div className="h-4 w-48 rounded bg-slate-200"/><div className="mt-3 h-3 w-72 rounded bg-slate-100"/></div>)}</div>:filtered.length===0?<div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">👥</div><h3 className="mt-5 font-bold text-slate-900">No users found</h3><p className="mt-2 text-sm text-slate-500">No portal users match the current search or filter.</p></div>:<div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="hidden border-b border-slate-100 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400 lg:grid lg:grid-cols-[1.2fr_1.5fr_1.1fr_.7fr_auto] lg:gap-5"><span>User</span><span>Email</span><span>Role</span><span>Access</span><span>Action</span></div><div className="divide-y divide-slate-100">{filtered.map(u=><UserRow key={u.id} u={u} editing={editing===u.id} saving={saving===u.id} edit={edit} currentEmail={currentEmail} begin={()=>begin(u)} cancel={cancel} save={()=>save(u)} change={(field,value)=>setEdit(x=>({...x,[field]:value}))}/>)}</div></div>}
      </section>
      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-xs leading-5 text-blue-800"><b>Security model:</b> the page verifies <code>get_my_portal_profile()</code> and requires <code>admin_status = &quot;yes&quot;</code> before loading users. Supabase RLS must enforce the same restriction for database reads and updates.</div>
    </section>
  </main>;
}

function Stat({n,label}:{n:number;label:string}){return <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xl font-bold text-slate-950">{n}</p><p className="mt-0.5 text-[11px] text-slate-500">{label}</p></div>}

function UserRow({u,editing,saving,edit,currentEmail,begin,cancel,save,change}:{u:User;editing:boolean;saving:boolean;edit:{name:string;role:string;alternate_email:string;admin_status:AdminStatus};currentEmail:string;begin:()=>void;cancel:()=>void;save:()=>void;change:(field:"name"|"role"|"alternate_email"|"admin_status",value:string)=>void}){
  if(editing)return <div className="bg-blue-50/40 px-5 py-5"><div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_1.1fr_.7fr_auto] lg:items-end"><Field label="Name"><input value={edit.name} onChange={e=>change("name",e.target.value)} disabled={saving} className={inputClass}/></Field><Field label="Alternate email"><input type="email" value={edit.alternate_email} onChange={e=>change("alternate_email",e.target.value)} placeholder="Optional" disabled={saving} className={inputClass}/></Field><Field label="Role"><input value={edit.role} onChange={e=>change("role",e.target.value)} disabled={saving} className={inputClass}/></Field><Field label="Access"><select value={edit.admin_status} onChange={e=>change("admin_status",e.target.value)} disabled={saving||u.email.toLowerCase()===currentEmail} className={inputClass}><option value="no">Standard</option><option value="yes">Administrator</option></select></Field><div className="flex gap-2 lg:justify-end"><button type="button" onClick={cancel} disabled={saving} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="button" onClick={save} disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600">{saving?"Saving…":"Save"}</button></div></div><p className="mt-4 text-xs text-slate-500">Canonical email: <b>{u.email}</b>{u.email.toLowerCase()===currentEmail&&<span className="ml-2 font-semibold text-amber-700">Your account</span>}</p></div>;
  return <div className="px-5 py-5 hover:bg-slate-50/70"><div className="grid gap-5 lg:grid-cols-[1.2fr_1.5fr_1.1fr_.7fr_auto] lg:items-center"><div><div className="flex items-center gap-2"><p className="truncate font-semibold text-slate-900">{u.name||"Unnamed user"}</p>{u.email.toLowerCase()===currentEmail&&<span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">YOU</span>}</div><p className="mt-1 text-[11px] text-slate-400">ID #{u.id}</p></div><div><p className="truncate text-sm font-medium text-slate-700">{u.email}</p>{u.alternate_email&&<p className="mt-1 truncate text-[11px] text-slate-400">Alt: {u.alternate_email}</p>}</div><p className="text-sm text-slate-600">{u.role||"No role"}</p><span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${u.admin_status==="yes"?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{u.admin_status==="yes"?"Administrator":"Standard"}</span><button type="button" onClick={begin} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Edit</button></div></div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">{label}</span>{children}</label>}
