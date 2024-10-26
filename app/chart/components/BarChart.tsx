'use client'
import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { AirbnbData } from '../types'

interface BarChartProps {
    data: AirbnbData[]
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const chartRef = useRef<SVGSVGElement | null>(null)

    useEffect(() => {
        if (data.length > 0 && chartRef.current) {
            const width = 600
            const height = 400
            const margin = { top: 40, right: 20, bottom: 60, left: 100 }

            const svg = d3.select(chartRef.current)
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('style', 'max-width: 100%; height: auto;')

            const propertyTypeData = d3.rollup(
                data,
                v => v.length,
                d => d.property_type
            )

            const sortedData = Array.from(propertyTypeData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)

            const x = d3.scaleLinear()
                .domain([0, d3.max(sortedData, d => d[1]) as number])
                .range([margin.left, width - margin.right])

            const y = d3.scaleBand()
                .domain(sortedData.map(d => d[0]))
                .range([margin.top, height - margin.bottom])
                .padding(0.2)

            // Update color scheme to match Apple's style
            const color = d3.scaleOrdinal()
                .domain(sortedData.map(d => d[0]))
                .range(['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#5856D6', '#AF52DE', '#5AC8FA', '#FFCC00', '#FF3B30', '#4CD964'])

            svg.selectAll('rect')
                .data(sortedData)
                .join('rect')
                .attr('x', margin.left)
                .attr('y', d => y(d[0]) as number)
                .attr('width', d => Math.max(0, x(d[1]) - margin.left))
                .attr('height', y.bandwidth())
                .attr('fill', d => color(d[0]) as string)
                .attr('rx', 6)
                .attr('ry', 6)
                .attr('opacity', 0.8)
                .on('mouseover', function () { d3.select(this).attr('opacity', 1) })
                .on('mouseout', function () { d3.select(this).attr('opacity', 0.8) })

            // Update X-axis style
            svg.append('g')
                .attr('transform', `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(5).tickSize(-height + margin.top + margin.bottom))
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick line').attr('stroke', '#E5E5EA').attr('stroke-opacity', 0.5))
                .call(g => g.selectAll('.tick text').attr('fill', '#8E8E93').attr('font-size', '12px').attr('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif'))

            // Update Y-axis style
            svg.append('g')
                .attr('transform', `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .call(g => g.select('.domain').remove())
                .call(g => g.selectAll('.tick line').remove())
                .call(g => g.selectAll('.tick text').attr('fill', '#8E8E93').attr('font-size', '12px').attr('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif'))

            // Update axis labels
            const axisLabelStyle = {
                fill: '#8E8E93',
                'font-size': '14px',
                'font-weight': '500',
                'font-family': 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
            }

            // X-axis label
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height - 10)
                .attr('text-anchor', 'middle')
                .attr('fill', axisLabelStyle.fill)
                .attr('font-size', axisLabelStyle['font-size'])
                .attr('font-weight', axisLabelStyle['font-weight'])
                .attr('font-family', axisLabelStyle['font-family'])
                .text('Number of Properties')

            // Y-axis label
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('fill', axisLabelStyle.fill)
                .attr('font-size', axisLabelStyle['font-size'])
                .attr('font-weight', axisLabelStyle['font-weight'])
                .attr('font-family', axisLabelStyle['font-family'])
                .text('Property Type')

            // Update bar labels
            svg.selectAll('.bar-label')
                .data(sortedData)
                .join('text')
                .attr('class', 'bar-label')
                .attr('x', d => Math.min(x(d[1]), width - margin.right - 5))
                .attr('y', d => (y(d[0]) as number) + y.bandwidth() / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', d => x(d[1]) > width - margin.right - 5 ? 'end' : 'start')
                .text(d => d[1])
                .attr('fill', '#333')
                .attr('font-size', '12px')
                .attr('font-weight', '500')
                .attr('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif')
        }
    }, [data])

    return <svg ref={chartRef} className="w-full max-w-2xl shadow-lg rounded-lg bg-white"></svg>
}

export default BarChart
