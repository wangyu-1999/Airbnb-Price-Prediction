'use client'

import React from 'react'
import RootLayout from '@/app/layout'
import Nav from '@/components/Nav'
import DataSampleTable from './components/DataSampleTable'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import PriceVsRatingChart from './components/PriceVsRatingChart'
import CorrelationHeatmap from './components/CorrelationHeatmap'
import { AirbnbData } from './types'
import airbnbData from '@/public/Airbnb_Final_Data.json'

export default function Chart() {
    const data = airbnbData as AirbnbData[]

    return (
        <RootLayout>
            <div className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
                {/* Header section */}
                <header className="w-full flex justify-between items-center mb-8 h-12">
                    <h1 className="text-3xl font-bold text-blue-600">Airbnb Price Prediction</h1>
                </header>
                <Nav />
                <main className="flex-grow p-4 bg-white rounded-lg shadow-lg w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Sample</h2>
                    <DataSampleTable data={data.slice(0, 5)} />
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 mt-8">Host Response Time Distribution</h2>
                    <div className="flex justify-center">
                        <PieChart data={data} />
                    </div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 mt-8">Property Type Distribution</h2>
                    <div className="flex justify-center">
                        <BarChart data={data} />
                    </div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 mt-8">Price vs Rating Scatter Plot</h2>
                    <div className="flex justify-center">
                        <PriceVsRatingChart data={data} />
                    </div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 mt-8">Correlation Heatmap of Review Scores</h2>
                    <div className="flex justify-center">
                        <CorrelationHeatmap data={data} />
                    </div>
                </main>
                <footer className="mt-12 text-center text-gray-500">
                    <p>&copy; 2024 Airbnb Price Prediction. All rights reserved.</p>
                </footer>
            </div>
        </RootLayout>
    )
}
