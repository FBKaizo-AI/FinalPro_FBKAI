# AI Model Documentation

## Overview
The FBKaizo AI uses Google's Gemini 2.5 Flash model to provide intelligent responses about monster stats and abilities.

## Key Components

### 1. Natural Language Processing
- Uses fuzzy search (Fuse.js) for monster name matching
- Handles partial matches and misspellings
- Supports natural language queries

### 2. Security Features
- Rate limiting: 20 requests per 15 minutes per IP
- Input sanitization for special characters
- Error handling for malicious inputs

### 3. Response Generation
```text
Input → Monster Search → Context Building → AI Processing → Formatted Response
```

## API Endpoints

### POST /api/ai-output
- **Purpose**: Main endpoint for AI queries
- **Input**: `{ "question": "string" }`
- **Output**: Formatted markdown response with monster details
- **Error Handling**: 404 for no matches, 429 for rate limits

## Example Usage
```javascript
// Query example
POST /api/ai-output
{
    "question": "What are Blue-Eyes White Dragon's stats?"
}

// Response format
{
    "answer": "## Blue-Eyes White Dragon\n- **Class**: Dragon\n..."
}
```
