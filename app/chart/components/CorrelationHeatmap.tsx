"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { AirbnbData } from '../types';

interface CorrelationHeatmapProps {
    data: AirbnbData[];
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data }) => {
    const chartRef = useRef<SVGSVGElement | null>(null);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);

    useEffect(() => {
        if (!data || !chartRef.current) return;

        const scoreFields = [
            'review_scores_rating',
            'review_scores_accuracy',
            'review_scores_cleanliness',
            'review_scores_checkin',
            'review_scores_communication',
            'review_scores_location',
            'review_scores_value'
        ];

        const correlationMatrix = calculateCorrelationMatrix(data, scoreFields);
        drawHeatmap(correlationMatrix, scoreFields);

    }, [data]);

    const calculateCorrelationMatrix = (data: AirbnbData[], fields: string[]) => {
        const matrix: number[][] = [];

        for (let i = 0; i < fields.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < fields.length; j++) {
                if (i === j) {
                    matrix[i][j] = 1;
                } else if (j < i) {
                    matrix[i][j] = matrix[j][i];
                } else {
                    const field1 = fields[i];
                    const field2 = fields[j];
                    const correlation = calculateCorrelation(data, field1, field2);
                    matrix[i][j] = correlation;
                }
            }
        }

        return matrix;
    };

    const calculateCorrelation = (data: AirbnbData[], field1: string, field2: string) => {
        const values1 = data.map(d => parseFloat(d[field1 as keyof AirbnbData] as string)).filter(v => !isNaN(v));
        const values2 = data.map(d => parseFloat(d[field2 as keyof AirbnbData] as string)).filter(v => !isNaN(v));

        const n = Math.min(values1.length, values2.length);
        const mean1 = values1.reduce((sum, val) => sum + val, 0) / n;
        const mean2 = values2.reduce((sum, val) => sum + val, 0) / n;

        let num = 0;
        let den1 = 0;
        let den2 = 0;

        for (let i = 0; i < n; i++) {
            const diff1 = values1[i] - mean1;
            const diff2 = values2[i] - mean2;
            num += diff1 * diff2;
            den1 += diff1 * diff1;
            den2 += diff2 * diff2;
        }

        return num / Math.sqrt(den1 * den2);
    };

    const drawHeatmap = (matrix: number[][], labels: string[]) => {
        const width = 600;
        const height = 600;
        const margin = { top: 130, right: 60, bottom: 60, left: 160 };

        const svg = d3.select(chartRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('style', 'max-width: 100%; height: auto;');

        svg.selectAll('*').remove();

        const colorScale = d3.scaleSequential(d3.interpolate("#FF2D55", "#007AFF"))
            .domain([-1, 1]);

        const cellSize = (width - margin.left - margin.right) / labels.length;
        const cells = svg.selectAll('rect')
            .data(matrix.flat())
            .enter().append('rect')
            .attr('x', (d, i) => margin.left + (i % labels.length) * cellSize)
            .attr('y', (d, i) => margin.top + Math.floor(i / labels.length) * cellSize)
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', d => colorScale(d))
            .attr('stroke', 'white')
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('opacity', 0.8)
            .on('mouseover', function (event, d) {
                d3.select(this).attr('opacity', 1);
                const i = Math.floor((event.target as SVGRectElement).y.baseVal.value / cellSize);
                const j = Math.floor((event.target as SVGRectElement).x.baseVal.value / cellSize);
                setSelectedCell(`${labels[i]} vs ${labels[j]}: ${d.toFixed(2)}`);
            })
            .on('mouseout', function () {
                d3.select(this).attr('opacity', 0.8);
                setSelectedCell(null);
            });

        const labelStyle = {
            'font-size': '12px',
            'font-family': 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            'fill': '#8E8E93'
        };

        const xLabels = svg.selectAll('.x-label')
            .data(labels)
            .enter().append('text')
            .attr('class', 'x-label')
            .attr('x', (d, i) => margin.left + (i + 0.5) * cellSize)
            .attr('y', margin.top - 20)  // Changed from margin.top - 10 to margin.top - 20
            .attr('text-anchor', 'middle')
            .style('font-size', labelStyle['font-size'])
            .style('font-family', labelStyle['font-family'])
            .style('fill', labelStyle.fill)
            .text(d => d.replace('review_scores_', ''))
            .attr('transform', (d, i) => `rotate(-45, ${margin.left + (i + 0.5) * cellSize}, ${margin.top - 20})`);  // Changed y-coordinate here as well

        const yLabels = svg.selectAll('.y-label')
            .data(labels)
            .enter().append('text')
            .attr('class', 'y-label')
            .attr('x', margin.left - 10)
            .attr('y', (d, i) => margin.top + (i + 0.5) * cellSize)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .style('font-size', labelStyle['font-size'])
            .style('font-family', labelStyle['font-family'])
            .style('fill', labelStyle.fill)
            .text(d => d.replace('review_scores_', ''));

        const legendWidth = 200;
        const legendHeight = 20;
        const legendMargin = { top: 20, right: 20 };

        const legendScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".2f"));

        const legend = svg.append("g")
            .attr("transform", `translate(${width - legendWidth - legendMargin.right}, ${legendMargin.top})`);

        const legendGradient = legend.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        const ticks = [-1, -0.5, 0, 0.5, 1];
        legendGradient.selectAll("stop")
            .data(ticks.map((t, i) => ({ offset: `${100 * i / (ticks.length - 1)}%`, color: colorScale(t) })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)")
            .attr('rx', 6)
            .attr('ry', 6);

        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis)
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', '#E5E5EA').attr('stroke-opacity', 0.5))
            .call(g => g.selectAll('.tick text').style('fill', '#8E8E93').style('font-size', '12px').style('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif'));

        legend.append("text")
            .attr("x", legendWidth / 2)
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .style('font-size', '12px')
            .style('font-family', 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif')
            .style('fill', '#8E8E93')
            .text("Correlation");
    };

    return (
        <div className="relative">
            <svg ref={chartRef} className="w-full max-w-2xl shadow-lg rounded-lg bg-white"></svg>
            {selectedCell && (
                <div className="absolute top-2 right-2 bg-white p-2 rounded shadow text-sm font-semibold" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {selectedCell}
                </div>
            )}
        </div>
    );
};

export default CorrelationHeatmap;
