# ReadySetGo

A Discord bot that automatically assigns users to team-specific channels based on their email registration in Airtable.

## Overview

ReadySetGo streamlines team organization in Discord by:
1. Collecting user email addresses through a Discord modal
2. Querying Airtable to find the user's team assignment
3. Automatically creating or adding users to their team's Discord channels

This eliminates manual channel management and ensures users are quickly connected with their teams.

## Features

- **Email-Based Registration**: Users register via a `/register` command that prompts for their email
- **Airtable Integration**: Maps emails to team assignments stored in your Airtable base
- **Automatic Channel Management**: Creates team channels if needed and assigns users appropriately
- **Slash Commands**: Modern Discord slash command interface

## Prerequisites

Before you begin, ensure you have:

- **Node.js**
- **npm** 

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ReadySetGo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   CLIENTID=your_discord_application_id
   AIRTABLE_TOKEN=your_airtable_personal_access_token
