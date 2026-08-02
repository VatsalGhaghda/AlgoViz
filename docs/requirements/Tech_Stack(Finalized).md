# Tech Stack

## Finalized — Current Scope

---

# 1. Frontend

## Core Framework

* React.js
* TypeScript

## Styling & UI

* Tailwind CSS
* Framer Motion

## Visualization

* SVG — Primary renderer for most visualizations
* React Flow — Trees and Graphs
* D3.js — Advanced graph layouts when needed

## Code Editor

* Monaco Editor — VS Code-like editor

## Routing

* React Router

## State Management

* Zustand

## Server State Management

* TanStack Query (React Query)

---

# 2. Backend

## Runtime

* Node.js

## Framework

* Express.js

## Language

* TypeScript

## Authentication

* Clerk — When authentication is implemented

## ORM

* Prisma ORM

---

# 3. Execution Engine — Python Only

The execution engine will be developed as a **separate service** from the main backend.

## Runtime

* Python

## Python Parsing

* Python `ast` module — Abstract Syntax Tree

## Execution

* AST Instrumentation
* Execution Trace Generator
* Step-by-step Event Generation

## Sandbox

* Docker Containers

## Responsibilities

The execution engine will be responsible for:

* Parsing Python code
* Generating execution traces
* Variable tracking
* Function call tracking
* Call stack generation
* Execution timeline
* Console output capture
* Memory representation within the current scope
* Returning visualization events to the frontend

---

# 4. Database

## Primary Database

* PostgreSQL

## Cache

* Redis

---

# 5. DevOps

## Containerization

* Docker

## Frontend Deployment

* Vercel

## Backend Deployment

* Render

## Version Control

* Git
* GitHub

## API Communication

* REST API

## Environment Management

* `.env` configuration
