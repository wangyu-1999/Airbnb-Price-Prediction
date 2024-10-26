'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { AirbnbData } from '../types'

interface PieChartProps {
    data: AirbnbData[]
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const chartRef = useRef<SVGSVGElement | null>(null)

    useEffect(() => {
        if (data.length > 0 && chartRef.current) {
            const width = 600
            const height = 400
            const radius = Math.min(width, height) / 2 - 60

            const svg = d3.select(chartRef.current)
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('style', 'max-width: 100%; height: auto;')

            const pieGroup = svg.append('g')
                .attr('transform', `translate(${width / 2 - 60},${height / 2})`)

            const hostResponseTimeData = d3.rollup(
                data,
                v => v.length,
                d => d.host_response_time
            )

            const pie = d3.pie<[string, number]>().value(d => d[1]).sort(null)
            const pieData = pie(Array.from(hostResponseTimeData))

            const arc = d3.arc<d3.PieArcDatum<[string, number]>>()
                .innerRadius(radius * 0.6)
                .outerRadius(radius)
                .cornerRadius(6)

            const color = d3.scaleOrdinal()
                .domain(pieData.map(d => d.data[0]))
                .range(['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#5856D6'])

            const pieSlices = pieGroup.selectAll('path')
                .data(pieData)
                .enter()
                .append('g')

            pieSlices.append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data[0]) as string)
                .attr('stroke', 'white')
                .style('stroke-width', '2px')
                .style('transition', 'all 0.3s')
                .on('mouseover', function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', `scale(1.05)`)
                })
                .on('mouseout', function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', `scale(1)`)
                })

            // Update pie slice labels
            pieSlices.append('text')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('dy', '.35em')
                .style('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('fill', 'white')
                .style('font-weight', '500')
                .style('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif')
                .text(d => d.data[1])

            // Update legend style
            const legend = svg.append('g')
                .attr('transform', `translate(${width - 180}, 20)`)

            const legendItems = legend.selectAll('.legend-item')
                .data(pieData)
                .enter()
                .append('g')
                .attr('class', 'legend-item')
                .attr('transform', (d, i) => `translate(0, ${i * 25})`)

            legendItems.append('rect')
                .attr('width', 12)
                .attr('height', 12)
                .attr('rx', 2)
                .attr('ry', 2)
                .attr('fill', d => color(d.data[0]) as string)

            legendItems.append('text')
                .attr('x', 20)
                .attr('y', 9)
                .text(d => d.data[0])
                .style('font-size', '12px')
                .style('fill', '#8E8E93')
                .style('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif')
        }
    }, [data])

    return <svg ref={chartRef} className="w-full max-w-2xl shadow-lg rounded-lg bg-white"></svg>
}

export default PieChart
