import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getClient();

    // Check if column already exists by querying table info
    const tableInfo = await db.execute("PRAGMA table_info(products)");
    const columns = tableInfo.rows.map((row) => row.name);

    if (columns.includes('product_type')) {
      return NextResponse.json({ message: 'Column product_type already exists' });
    }

    await db.execute(
      "ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'digital'"
    );

    return NextResponse.json({ message: 'Column product_type added successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}
