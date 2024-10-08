import { NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function openDb() {
  return open({
    filename: './purchaseOrders.db',
    driver: sqlite3.Database
  });
}

export async function POST(request: Request) {
  let db;
  try {
    const data = await request.json();
    console.log("Received data:", data);

    const { poDate, poNumber, supplierCode, details, taxRate, subtotal, taxAmount, total } = data;

    db = await openDb();
    console.log("Database opened");

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS PurchaseOrders (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        PODate TEXT,
        PONumber TEXT,
        SupplierCode TEXT,
        TaxRate REAL,
        Subtotal REAL,
        TaxAmount REAL,
        Total REAL
      );

      CREATE TABLE IF NOT EXISTS PurchaseOrderDetails (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        POID INTEGER,
        ItemCode TEXT,
        Quantity INTEGER,
        Price REAL,
        FOREIGN KEY (POID) REFERENCES PurchaseOrders(ID)
      );
    `);
    console.log("Tables created if not exist");

    await db.run('BEGIN TRANSACTION');

    // Insert PO header
    const { lastID } = await db.run(`
      INSERT INTO PurchaseOrders (PODate, PONumber, SupplierCode, TaxRate, Subtotal, TaxAmount, Total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [poDate, poNumber, supplierCode, taxRate, subtotal, taxAmount, total]);
    console.log("PO header inserted, ID:", lastID);

    // Insert PO details
    if (details && Array.isArray(details)) {
      for (const detail of details) {
        await db.run(`
          INSERT INTO PurchaseOrderDetails (POID, ItemCode, Quantity, Price)
          VALUES (?, ?, ?, ?)
        `, [lastID, detail.itemCode, detail.qty, detail.price]);
      }
      console.log("PO details inserted");
    } else {
      console.log("No details provided or invalid details format");
    }

    await db.run('COMMIT');
    console.log("Transaction committed");

    return NextResponse.json({ message: 'Purchase order created successfully', id: lastID }, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    if (db) {
      await db.run('ROLLBACK');
    }
    return NextResponse.json({ error: 'Failed to create purchase order', details: error.message }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export async function GET() {
  let db;
  try {
    db = await openDb();
    const purchaseOrders = await db.all('SELECT * FROM PurchaseOrders');
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase orders', details: error.message }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export const dynamic = 'force-dynamic';