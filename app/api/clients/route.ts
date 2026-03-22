import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type Client = {
  id: number;
  firm_id: number;
  name: string;
  gstin: string;
  phone: string;
  email: string;
  filings: string[];
};

// ⚠ TEMP: hardcoded tenant (replace later with auth)
const FIRM_ID = 1;

// GET
export async function GET() {
  try {
    const res = await pool.query(
      "SELECT * FROM clients WHERE firm_id = $1 ORDER BY id DESC",
      [FIRM_ID],
    );

    return NextResponse.json(res.rows);
  } catch (err) {
    return NextResponse.json({ error: "DB read failed" }, { status: 500 });
  }
}

// POST
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await pool.query(
      `INSERT INTO clients (firm_id, name, gstin, phone, email, filings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        FIRM_ID,
        body.name,
        body.gstin,
        body.phone || "",
        body.email || "",
        body.filings || [],
      ],
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: "DB write failed" }, { status: 500 });
  }
}
