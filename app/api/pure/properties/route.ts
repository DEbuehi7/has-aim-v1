export const dynamic = “force-dynamic”;
import { NextResponse } from “next/server”;
import { createClient } from “@supabase/supabase-js”;

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
try {
const { data: properties, error: pe } = await supabase
.from(“aim_properties”)
.select(”*”)
.order(“id”, { ascending: true });
if (pe) throw pe;

```
const { data: units, error: ue } = await supabase
  .from("aim_units")
  .select("*")
  .order("property_id", { ascending: true });
if (ue) throw ue;

const { data: compliance, error: ce } = await supabase
  .from("aim_compliance")
  .select("*")
  .order("due_date", { ascending: true });
if (ce) throw ce;

const { data: capital, error: ke } = await supabase
  .from("aim_capital")
  .select("*")
  .order("id", { ascending: true });
if (ke) throw ke;

const { data: treasury, error: te } = await supabase
  .from("aim_treasury_ledger")
  .select("*")
  .order("id", { ascending: true });
if (te) throw te;

return NextResponse.json({ properties, units, compliance, capital, treasury });
```

} catch (e) {
return NextResponse.json({ error: “Failed to fetch property data”, detail: String(e) }, { status: 500 });
}
}