import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Supplier App</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/purchase-orders/new" className="text-blue-600 hover:underline">
              Create New Purchase Order
            </Link>
          </li>
          <li>
            <Link href="/purchase-orders" className="text-blue-600 hover:underline">
              View Purchase Orders
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}