# Monster Comparison System Documentation

## Overview
The comparison system uses RGB color values to find monsters with similar attributes based on their orb colors.

## How It Works

### Color Mapping
- Each monster has a unique hex color code
- Colors represent overall monster strength/type
- RGB values are used for similarity calculations

### Comparison Algorithm
```javascript
difference = |R1-R2| + |G1-G2| + |B1-B2|
```

### Features
- Finds top 15 similar monsters
- Comparison based on RGB color distance
- Supports all monsters in database

## Usage Example
```javascript
findClosestMonsters("Blue-Eyes", monsters);
// Returns array of 15 most similar monsters
```

## Implementation Details
- Hex to RGB conversion
- Difference calculation
- Sorting by similarity
- Top N selection (default 15)

## Visual Display
- Color-coded results
- Sortable similarity scores
- Interactive comparison view

## Step-by-Step Process

### 1. Data Preparation
1. Monster data is loaded from the MongoDB database
2. Each monster's attributes are normalized to a 0-255 scale
3. Attributes are mapped to RGB color components:
   - R (Red): Attack and HP values
   - G (Green): Defense and Speed values
   - B (Blue): Special abilities and Luck

### 2. Color Conversion Process
1. Normalize monster stats:
   ```javascript
   const normalizedATK = (monster.ATK / maxATK) * 255;
   const normalizedDEF = (monster.DEF / maxDEF) * 255;
   ```
