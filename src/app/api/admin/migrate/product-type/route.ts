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

    let columnAdded = false;
    if (!columns.includes('product_type')) {
      await db.execute(
        "ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'digital'"
      );
      columnAdded = true;
    }

    // Populate product_type for existing products based on category/name/tags
    // Services (category = 'services')
    await db.execute(
      "UPDATE products SET product_type = 'service' WHERE category = 'services' AND (product_type IS NULL OR product_type = 'digital')"
    );

    // Cloud hosting / subscriptions (look for cloud hosting products by name/tags)
    await db.execute(
      "UPDATE products SET product_type = 'subscription' WHERE (name LIKE '%Cloud%' OR name LIKE '%Hosting%' OR tags LIKE '%cloud%' OR tags LIKE '%hosting%') AND (product_type IS NULL OR product_type = 'digital')"
    );

    // Everything else stays as 'digital' (the default)

    return NextResponse.json({
      message: columnAdded
        ? 'Column product_type added and existing products populated'
        : 'Column product_type already exists, existing products re-populated',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}
