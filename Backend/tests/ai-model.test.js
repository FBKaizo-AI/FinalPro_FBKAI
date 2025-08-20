const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../ai-model');
const Monster = require('../monster-model');


let mongoServer;


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});


afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


beforeEach(async () => {
  // Sample test data
  await Monster.create({
    "Monster Name": "Blue-Eyes White Dragon",
    "Class": "Dragon",
    "HP": 2500,
    "ATK": 3000,
    "DEF": 2500,
    "AP": 100,
    "GT": 50,
    "Luck": 80,
    "Speed": 75
  });
});


afterEach(async () => {
  await Monster.deleteMany({});
});


describe('AI Model API Tests', () => {
  // Test 1: Monster search functionality
  test('Should find a monster by exact name', async () => {
    const response = await request(app)
      .post('/api/ai-output')
      .send({ question: "What are Blue-Eyes White Dragon's stats?" });
   
    expect(response.status).toBe(200);
    expect(response.body.answer).toContain('Blue-Eyes White Dragon');
  });


  // Test 2: Rate limiting
  test('Should enforce rate limiting', async () => {
    for (let i = 0; i < 25; i++) {
      const response = await request(app)
        .post('/api/ai-output')
        .send({ question: "Test question" });
     
      if (i >= 20) {
        expect(response.status).toBe(429);
      }
    }
  });


  // Test 3: Error handling for non-existent monster
  test('Should handle non-existent monster gracefully', async () => {
    const response = await request(app)
      .post('/api/ai-output')
      .send({ question: "What are Nonexistent Monster's stats?" });
   
    expect(response.status).toBe(404);
    expect(response.body.answer).toBe("No matching monster found in the database.");
  });


  // Test 4: Fuzzy search functionality
  test('Should find monster with partial name match', async () => {
    const response = await request(app)
      .post('/api/ai-output')
      .send({ question: "What are Blue-Eyes stats?" });
   
    expect(response.status).toBe(200);
    expect(response.body.answer).toContain('Dragon');
  });


  // Test 5: Special query handling
  test('Should handle highest attack query', async () => {
    const response = await request(app)
      .post('/api/ai-output')
      .send({ question: "Which monster has the highest attack?" });
   
    expect(response.status).toBe(200);
    expect(response.body.answer).toBeTruthy();
  });


  // Test 6: Malicious input handling
  test('Should safely handle special characters', async () => {
    const response = await request(app)
      .post('/api/ai-output')
      .send({ question: "What about monster <script>alert('xss')</script>?" });
   
    expect(response.status).toBe(404);
    expect(response.body.answer).toBe("No matching monster found in the database.");
  });
});
