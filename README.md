# Fortress Protocol — Cyber Defense Game

A small full-stack cyber defense simulation game with a Node.js/Express backend and a React + Vite frontend. The project uses Firebase (Firestore) for persistence and includes server-side admin access via a Firebase service account.

## Features

- Express backend with scheduled jobs (`node-cron`) and Firebase Admin integration
- React + Vite frontend with Firebase client SDK
- Simple team/attack routes for game mechanics

## Repo structure

- [server](server): Backend code (Express, Firebase Admin)
- [client](client): Frontend (React + Vite)
- [config](server/config): Example server config and service-account JSON (do not commit secrets)

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- A Firebase project with Firestore enabled
