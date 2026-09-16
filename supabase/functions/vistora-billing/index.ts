import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const STRIPE_PRO_PRICE_ID = Deno.env.get("STRIPE_PRO_PRICE_ID")!;
const APP_URL = Deno.env.get("APP_URL")!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const form = (p: Record<string, string>) => { const b = new URLSearchParams(); for (const [k,v] of Object.entries(p)) b.set(k,v); return b; };

async function stripePost(path: string, params: Record<string,string>) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { method: "POST", headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" }, body: form(params) });
  const data = await r.json(); if (!r.ok) throw new Error(data?.error?.message || "Stripe request failed"); return data;
}
async function stripeGet(path: string) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } });
  const data = await r.json(); if (!r.ok) throw new Error(data?.error?.message || "Stripe request failed"); return data;
}
function safeEqual(a: Uint8Array, b: Uint8Array) { if (a.length !== b.length) return false; let d=0; for(let i=0;i<a.length;i++) d|=a[i]^b[i]; return d===0; }
function hex(s:string){ const out=new Uint8Array(s.length/2); for(let i=0;i<out.length;i++) out[i]=parseInt(s.slice(i*2,i*2+2),16); return out; }
async function verify(raw:string, header:string) {
  const parts = Object.fromEntries(header.split(",").map(x=>x.split("=",2))); const t=parts.t, v1=parts.v1; if(!t||!v1) return false;
  if(Math.abs(Date.now()/1000-Number(t))>300) return false;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const digest=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(`${t}.${raw}`)));
  return safeEqual(digest,hex(v1));
}
async function user(req:Request){ const h=req.headers.get("authorization")||""; const token=h.startsWith("Bearer ")?h.slice(7):""; if(!token) throw new Error("Authentication required"); const {data,error}=await admin.auth.getUser(token); if(error||!data.user) throw new Error("Invalid authentication token"); return data.user; }
async function customer(u:any){ const x=await admin.from("vistora_stripe_customers").select("stripe_customer_id").eq("user_id",u.id).maybeSingle(); if(x.data?.stripe_customer_id) return x.data.stripe_customer_id; const c=await stripePost("customers",{"email":u.email||"","metadata[vistora_user_id]":u.id}); await admin.from("vistora_stripe_customers").upsert({user_id:u.id,stripe_customer_id:c.id,updated_at:new Date().toISOString()}); return c.id; }
async function sync(sub:any){ const lookup=await admin.from("vistora_stripe_customers").select("user_id").eq("stripe_customer_id",sub.customer).maybeSingle(); const uid=sub.metadata?.vistora_user_id||lookup.data?.user_id; if(!uid) return; const item=sub.items?.data?.[0]; await admin.from("vistora_subscriptions").upsert({user_id:uid,stripe_customer_id:sub.customer,stripe_subscription_id:sub.id,stripe_price_id:item?.price?.id||null,status:sub.status,current_period_start:sub.current_period_start?new Date(sub.current_period_start*1000).toISOString():null,current_period_end:sub.current_period_end?new Date(sub.current_period_end*1000).toISOString():null,cancel_at_period_end:Boolean(sub.cancel_at_period_end),canceled_at:sub.canceled_at?new Date(sub.canceled_at*1000).toISOString():null,trial_end:sub.trial_end?new Date(sub.trial_end*1000).toISOString():null,metadata:sub.metadata||{},updated_at:new Date().toISOString()},{onConflict:"user_id"}); }

Deno.serve(async req=>{
  try {
    if(req.method!=="POST") return json({error:"Method not allowed"},405);
    const sig=req.headers.get("stripe-signature");
    if(sig){ const raw=await req.text(); if(!STRIPE_WEBHOOK_SECRET||!(await verify(raw,sig))) return json({error:"Invalid signature"},400); const e=JSON.parse(raw); const dupe=await admin.from("vistora_stripe_webhook_events").select("id").eq("id",e.id).maybeSingle(); if(dupe.data) return json({received:true,duplicate:true}); await admin.from("vistora_stripe_webhook_events").insert({id:e.id,event_type:e.type}); if(["customer.subscription.created","customer.subscription.updated","customer.subscription.deleted"].includes(e.type)) await sync(e.data.object); if(e.type==="checkout.session.completed"&&e.data.object.subscription) await sync(await stripeGet(`subscriptions/${e.data.object.subscription}`)); return json({received:true}); }
    const u=await user(req); const b=await req.json();
    if(b.action==="checkout"){ const c=await customer(u); const s=await stripePost("checkout/sessions",{mode:"subscription",customer:c,"line_items[0][price]":STRIPE_PRO_PRICE_ID,"line_items[0][quantity]":"1",success_url:`${APP_URL}/?billing=success`,cancel_url:`${APP_URL}/?billing=cancelled`,"subscription_data[metadata][vistora_user_id]":u.id,"metadata[vistora_user_id]":u.id,allow_promotion_codes:"true"}); return json({url:s.url}); }
    if(b.action==="portal"){ const c=await customer(u); const s=await stripePost("billing_portal/sessions",{customer:c,return_url:APP_URL}); return json({url:s.url}); }
    if(b.action==="status"){ const {data}=await admin.from("vistora_subscriptions").select("status,current_period_end,cancel_at_period_end,stripe_price_id").eq("user_id",u.id).maybeSingle(); return json({active:Boolean(data&&["active","trialing"].includes(data.status)),subscription:data||null}); }
    return json({error:"Unknown action"},400);
  } catch(e){ console.error("vistora-billing",e); return json({error:e instanceof Error?e.message:"Billing request failed"},500); }
});
