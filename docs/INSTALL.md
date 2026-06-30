# Installation Guide

CasaOS AGY is designed to be easily installed on any CasaOS instance.

## Prerequisites
- A running instance of CasaOS.
- An active internet connection to pull the Docker image.

## Step-by-Step Installation

### Importing the App to CasaOS
1. Open your CasaOS web UI.
2. Click on the **App Store** icon on the home screen.
3. In the top right corner of the App Store, click on the **Custom Install** button.
4. In the upper right of the Custom Install modal, look for the **Import** icon (a file icon with an arrow).
5. Paste the following raw Docker Compose URL:
   ```text
   https://raw.githubusercontent.com/glickbot/my-casaos-agy/main/docker-compose.yml
   ```
6. Click **Submit**. CasaOS will automatically populate all the fields (Title, Icon, Port Map, Volumes) using the `x-casaos` metadata built into the file.
7. Review the settings. By default, it uses port `3000`. If port 3000 is occupied on your system, change the Web UI Port and host port to something else.
8. Click **Install**.

### Post-Installation
Once the app is running:
1. Click on the app icon on the CasaOS home screen to open the web terminal.
2. Click on **Settings** in the bottom left corner.
3. Enter your **Google Gemini API Key** and preferred **Model Name** (e.g., `gemini-2.5-pro`).
4. Save the settings. The Antigravity CLI is now ready to serve as your AI coding assistant!

## Volumes and Data Persistence
The app creates two vital persistent storage mappings on your CasaOS host:
- `/DATA/AppData/casaos-agy/workspaces`: Stores any repositories you clone or create inside the app.
- `/DATA/AppData/casaos-agy/gemini`: Stores the AGY configuration, local SQLite memory database, and settings.

To completely reset the app, you can delete these directories on your host machine.
