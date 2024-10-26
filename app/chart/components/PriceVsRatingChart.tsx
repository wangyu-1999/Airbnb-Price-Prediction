"use client"
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AirbnbData } from '../types';

interface PriceVsRatingChartProps {
    data: AirbnbData[];
}

const PriceVsRatingChart: React.FC<PriceVsRatingChartProps> = ({ data }) => {
    const chartRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!data || !chartRef.current) return;

        const width = 600;
        const height = 400;
        const margin = { top: 40, right: 40, bottom: 60, left: 60 };

        const svg = d3.select(chartRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('style', 'max-width: 100%; height: auto;');

        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => parseFloat(d.price.replace('$', ''))) || 0])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, 5])
            .range([height - margin.bottom, margin.top]);

        svg.selectAll('*').remove();

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5).tickSize(-height + margin.top + margin.bottom))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', '#E5E5EA').attr('stroke-opacity', 0.5))
            .call(g => g.selectAll('.tick text').attr('fill', '#8E8E93').attr('font-size', '12px').attr('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif'));

        // Add Y axis
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1f")).tickSize(-width + margin.left + margin.right))
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', '#E5E5EA').attr('stroke-opacity', 0.5))
            .call(g => g.selectAll('.tick text').attr('fill', '#8E8E93').attr('font-size', '12px').attr('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif'));

        // Add scatter plot points
        svg.append('g')
            .selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', d => x(parseFloat(d.price.replace('$', ''))))
            .attr('cy', d => y(parseFloat(d.review_scores_rating)))
            .attr('r', 4)
            .attr('fill', '#007AFF')
            .attr('opacity', 0.6)
            .on('mouseover', function () { d3.select(this).attr('r', 6).attr('opacity', 1) })
            .on('mouseout', function () { d3.select(this).attr('r', 4).attr('opacity', 0.6) });

        // Add X axis label
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8E8E93')
            .attr('font-size', '14px')
            .attr('font-weight', '500')
            .attr('font-family', 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif')
            .text('Price ($)');

        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8E8E93')
            .attr('font-size', '14px')
            .attr('font-weight', '500')
            .attr('font-family', 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif')
            .text('Rating');

    }, [data]);

    return <svg ref={chartRef} className="w-full max-w-2xl shadow-lg rounded-lg bg-white"></svg>;
};

export default PriceVsRatingChart;
