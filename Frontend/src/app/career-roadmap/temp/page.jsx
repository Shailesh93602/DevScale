"use client";
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './page.css';

const roadmapData = {
  title: "Full Stack Development with Next.js, Nest.js, MySQL",
  children: [
    {
        "title": "Basics of Web Development",
        "children": [
            { "title": "HTML Basics" },
            { "title": "CSS Basics" },
            { "title": "JavaScript Basics" },
            { "title": "Understanding HTTP" },
            { "title": "Understanding Client-Server Architecture" },
            { "title": "Version Control with Git" }
        ]
    },
    {
        "title": "Fundamentals of Database",
        "children": [
            { "title": "Basics of Relational Databases" },
            { "title": "SQL Basics" },
            { "title": "MySQL Database" },
            { "title": "Data Modeling and Design" },
            { "title": "Normalization" },
            { "title": "Database Transactions" }
        ]
    },
    {
        "title": "Introduction to Node.js",
        "children": [
            { "title": "Node.js Fundamentals" },
            { "title": "Understanding Asynchronous Programming" },
            { "title": "Working with File System in Node.js" },
            { "title": "Node.js Modules" },
            { "title": "Building a HTTP Server with Node.js" },
            { "title": "Error Handling in Node.js" }
        ]
    },
    {
        "title": "Backend Development with Nest.js",
        "children": [
            { "title": "Introduction to Nest.js" },
            { "title": "Understanding Typescript" },
            { "title": "Nest.js Modules, Controllers, Services" },
            { "title": "Building REST API with Nest.js" },
            { "title": "Data Validation and Serialization" },
            { "title": "Error Handling in Nest.js" }
        ]
    },
    {
        "title": "Frontend Development with Next.js",
        "children": [
            { "title": "Introduction to Next.js" },
            { "title": "React Basics" },
            { "title": "Next.js Routing" },
            { "title": "Server-Side Rendering with Next.js" },
            { "title": "Styling in Next.js" },
            { "title": "Building a Frontend Application with Next.js" }
        ]
    },
    {
        "title": "Integration of Next.js and Nest.js",
        "children": [
            { "title": "Setup and Configuration" },
            { "title": "Implementation of Client-Server Communication" },
            { "title": "Handling Authentication" },
            { "title": "Cross-Origin Resource Sharing (CORS)" },
            { "title": "Deployment Strategies" }
        ]
    },
    {
        "title": "Working with MySQL in Nest.js",
        "children": [
            { "title": "MySQL Database Connection" },
            { "title": "Create, Read, Update, Delete (CRUD) Operations" },
            { "title": "Data Validation" },
            { "title": "Handling Database Errors" }
        ]
    },
    {
        "title": "State Management in Next.js",
        "children": [
            { "title": "Understanding State Management" },
            { "title": "Introduction to Redux" },
            { "title": "Building a Redux Store" },
            { "title": "Redux Middleware" },
            { "title": "Asynchronous Actions in Redux" },
            { "title": "Redux DevTools" }
        ]
    },
    {
        "title": "Testing in Full Stack Development",
        "children": [
            { "title": "Introduction to Testing" },
            { "title": "Unit Testing in Nest.js" },
            { "title": "Unit Testing in Next.js" },
            { "title": "Integration Testing" },
            { "title": "End-to-End Testing" },
            { "title": "Best Practices in Testing" }
        ]
    },
    {
        "title": "Deployment and DevOps",
        "children": [
            { "title": "Basics of Hosting" },
            { "title": "Continuous Integration (CI) and Continuous Deployment (CD)" },
            { "title": "Docker Basics" },
            { "title": "Kubernetes Basics" },
            { "title": "CI/CD with Jenkins" },
            { "title": "Cloud Hosting Providers (AWS, Google Cloud, Azure)" }
        ]
    },
    {
        "title": "Performance Optimization",
        "children": [
            { "title": "Basics of Performance Optimization" },
            { "title": "Webpack and Babel" },
            { "title": "Frontend Performance Optimization" },
            { "title": "Backend Performance Optimization" },
            { "title": "Database Performance Optimization" },
            { "title": "Network Performance Optimization" }
        ]
    },
    {
        "title": "Business and Legal",
        "children": [
            { "title": "Understanding Business Basics" },
            { "title": "Intellectual Property Rights" },
            { "title": "Privacy and Data Protection Laws" },
            { "title": "Accessibility and Compliance" },
            { "title": "Security Laws" },
            { "title": "Ethics in IT" }
        ]
    },
    {
        "title": "Advanced Topics",
        "children": [
            { "title": "Microservices Architecture" },
            { "title": "Real-Time Applications with Websockets" },
            { "title": "GraphQL" },
            { "title": "Progressive Web App (PWA)" },
            { "title": "Serverless Architecture" },
            { "title": "Scalability and Availability" }
        ]
    }
]
};

const Roadmap = () => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const width = 960 - margin.right - margin.left;
    const height = 800 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const treemap = d3.tree().size([height, width]);
    let nodes = d3.hierarchy(roadmapData, d => d.children);
    nodes = treemap(nodes);

    const link = svg.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => {
        return `M${d.y},${d.x}
                C${(d.y + d.parent.y) / 2},${d.x}
                ${(d.y + d.parent.y) / 2},${d.parent.x}
                ${d.parent.y},${d.parent.x}`;
      });

    const node = svg.selectAll('.node')
      .data(nodes.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 10)
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(300).attr('r', 15);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).transition().duration(300).attr('r', 10);
      });

    node.append('text')
      .attr('dy', '.35em')
      .attr('x', d => (d.children ? -13 : 13))
      .attr('text-anchor', d => (d.children ? 'end' : 'start'))
      .text(d => d.data.title);
  }, []);

  return (
    <div id="roadmap-container">
      <h1>Full Stack Development with Next.js, Nest.js, MySQL</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Roadmap;
