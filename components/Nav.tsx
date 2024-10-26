import Link from 'next/link';

export default function Nav() {
    return (
        <nav className="w-full bg-blue-600 p-4 mb-8 rounded-lg shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/" className="text-white hover:text-blue-200 hover:underline">
                            Prediction
                        </Link>
                    </li>
                    <li>
                        <Link href="/chart" className="text-white hover:text-blue-200 hover:underline">
                            Chart
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}