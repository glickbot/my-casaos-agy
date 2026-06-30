# Product Requirements

This document outlines the product requirements and intent of CasaOS AGY, serving as a guideline for future feature additions or architectural shifts.

## The Problem
Running an autonomous CLI agent (like AGY) on a headless NAS (CasaOS) can be tricky. Users typically have to SSH into the machine, run `tmux`, and leave it running. This is intimidating for average CasaOS users. Furthermore, having a single global agent context on a NAS that hosts dozens of distinct projects creates a highly confused AI memory.

## The Solution
CasaOS AGY provides a native CasaOS App Store experience that wraps the AGY CLI in a sleek Web UI with pseudo-terminal capabilities. It logically partitions the AI's workspace based on the project you select.

## Core Features & Requirements

1. **One-Click CasaOS Installation**
   - The app must use `x-casaos` schema in `docker-compose.yml`.
   - The app must not require the user to configure variables manually; everything should default gracefully.
   
2. **Web Terminal Interface**
   - Must provide a real-time, zero-latency pseudo-terminal using WebSockets (`node-pty` + `xterm.js`).
   - Must perfectly handle colors, resizing, and control characters (Ctrl+C, etc).

3. **Workspace Isolation**
   - Users must be able to clone git repositories via the UI.
   - When switching to a cloned workspace, the Web UI should spawn a new `agy` process with its working directory set strictly to that folder.
   
4. **Auto-Execution**
   - If a workspace contains an `instructions.md` file, the Web UI/Backend should automatically prompt the AI to read and execute it upon launching the session.

5. **Self-Managed Settings**
   - Must provide a modal to input Model names and API keys, saving directly to `~/.gemini/antigravity-cli/settings.json` within the persistent volume, removing the need for users to edit hidden JSON files over SSH.

## Target Audience
Home lab enthusiasts, developers, and self-hosters utilizing CasaOS to manage their personal cloud who wish to leverage an AI Coding Assistant remotely.
