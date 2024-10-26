import React from 'react';
import { AirbnbData } from '../types';

interface DataSampleTableProps {
    data: AirbnbData[];
}

export default function DataSampleTable({ data }: DataSampleTableProps) {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <div className="min-w-max">
                <table className="w-full">
                    <thead className="bg-blue-100">
                        <tr>
                            {data.length > 0 && Object.keys(data[0]).map((key) => (
                                <th key={key} className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {Object.values(row).map((value, cellIndex) => (
                                    <td key={cellIndex} className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
