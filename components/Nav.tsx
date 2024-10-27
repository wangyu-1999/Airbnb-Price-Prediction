import Link from 'next/link';

export default function Nav() {
    return (
        <nav className="w-full bg-white bg-opacity-70 backdrop-blur-md p-4 mb-4 rounded-2xl shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
                <ul className="flex space-x-6">
                    <li>
                        <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                            Prediction
                        </Link>
                    </li>
                    <li>
                        <Link href="/chart" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                            Charts
                        </Link>
                    </li>
                    <li>
                        <Link href="/locations" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm">
                            Locations
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
