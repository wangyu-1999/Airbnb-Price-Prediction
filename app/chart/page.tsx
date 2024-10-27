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
import Footer from '@/components/Footer'

export default function Chart() {
    const data = airbnbData as AirbnbData[]

    return (
        <RootLayout>
            <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
                <Nav />
                {/* Header section */}
                <header className="w-full flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900">Airbnb Price Prediction</h1>
                </header>
                <div className="w-full max-w-4xl">
                    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Sample</h2>
                        <DataSampleTable data={data.slice(0, 5)} />
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Host Response Time Distribution</h2>
                        <div className="flex justify-center">
                            <PieChart data={data} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Property Type Distribution</h2>
                        <div className="flex justify-center">
                            <BarChart data={data} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Price vs Rating Scatter Plot</h2>
                        <div className="flex justify-center">
                            <PriceVsRatingChart data={data} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Correlation Heatmap of Review Scores</h2>
                        <div className="flex justify-center">
                            <CorrelationHeatmap data={data} />
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </RootLayout>
    )
}
