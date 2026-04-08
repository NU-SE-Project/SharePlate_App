import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const NUM_REQUESTS = Number(process.env.NUM_REQUESTS || 50);
const CONCURRENCY = Number(process.env.CONCURRENCY || 10);
const LOGIN_EMAIL = process.env.LOADTEST_EMAIL;
const LOGIN_PASSWORD = process.env.LOADTEST_PASSWORD;

class PerformanceMetrics {
  constructor(testName) {
    this.testName = testName;
    this.times = [];
    this.statuses = {};
    this.errors = [];
    this.startTime = Date.now();
  }

  recordRequest(durationMs, status) {
    this.times.push(durationMs);
    this.statuses[status] = (this.statuses[status] || 0) + 1;
  }

  recordError(error) {
    this.errors.push(error);
  }

  calculatePercentile(percentile) {
    const sorted = [...this.times].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getThroughput() {
    const totalSeconds = (Date.now() - this.startTime) / 1000;
    return this.times.length / totalSeconds;
  }

  getSuccessRate() {
    const successCount = this.statuses[200] || 0;
    return ((successCount / this.times.length) * 100).toFixed(2);
  }

  print() {
    const totalRequests = this.times.length;
    const totalTime = Date.now() - this.startTime;
    const minTime = Math.min(...this.times);
    const maxTime = Math.max(...this.times);
    const avgTime = this.times.reduce((a, b) => a + b, 0) / totalRequests;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Performance Test: ${this.testName}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Total Duration: ${totalTime}ms`);
    console.log(`Throughput: ${this.getThroughput().toFixed(2)} req/s`);
    console.log(`Min: ${minTime}ms, Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime}ms`);
    console.log(`P50: ${this.calculatePercentile(50)}ms, P95: ${this.calculatePercentile(95)}ms, P99: ${this.calculatePercentile(99)}ms`);
    console.log(`Status Distribution:`, this.statuses);
    console.log(`Success Rate: ${this.getSuccessRate()}%`);
    if (this.errors.length > 0) console.log(`Errors:`, this.errors);
    console.log(`${'='.repeat(60)}\n`);
  }
}

// Execute requests in batches
async function executeConcurrent(requests, concurrency) {
  const results = [];
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }
  return results;
}

// Login once to get token
async function getAuthToken() {
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, { email: LOGIN_EMAIL, password: LOGIN_PASSWORD });
    return res.data.accessToken;
  } catch (err) {
    console.error('Login failed:', err.response?.status, err.response?.data || err.message);
    return null;
  }
}

// Test GET endpoint with token
async function testReadEndpoints(token) {
  const metrics = new PerformanceMetrics('Read Endpoints (GET /api/foodsdonate)');
  const requests = Array.from({ length: NUM_REQUESTS }, () => async () => {
    const start = Date.now();
    try {
      const res = await axios.get(`${BASE_URL}/api/foodsdonate`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000,
      });
      metrics.recordRequest(Date.now() - start, res.status);
    } catch (err) {
      const status = err.response?.status || 'timeout';
      metrics.recordRequest(Date.now() - start, status);
      metrics.recordError(String(status));
    }
  });

  await executeConcurrent(requests, CONCURRENCY);
  metrics.print();
}

// Mixed traffic example (50% read, 50% auth)
async function testMixedTraffic(token) {
  const metrics = new PerformanceMetrics('Mixed Traffic');
  const half = Math.floor(NUM_REQUESTS / 2);

  const readRequests = Array.from({ length: half }, () => async () => {
    const start = Date.now();
    try {
      const res = await axios.get(`${BASE_URL}/api/foodsdonate`, { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 });
      metrics.recordRequest(Date.now() - start, res.status);
    } catch (err) {
      metrics.recordRequest(Date.now() - start, err.response?.status || 'timeout');
    }
  });

  const authRequests = Array.from({ length: NUM_REQUESTS - half }, () => async () => {
    const start = Date.now();
    try {
      const res = await axios.get(`${BASE_URL}/api/protected`, { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 });
      metrics.recordRequest(Date.now() - start, res.status);
    } catch (err) {
      metrics.recordRequest(Date.now() - start, err.response?.status || 'timeout');
    }
  });

  await executeConcurrent([...readRequests, ...authRequests], CONCURRENCY);
  metrics.print();
}

async function main() {
  console.log('Performance Test Suite');
  console.log(`Target: ${BASE_URL}`);

  const token = await getAuthToken();
  if (!token) {
    console.warn('⚠️  Cannot run authenticated tests without a token.');
  }

  await testReadEndpoints(token);
  if (token) await testMixedTraffic(token);

  console.log('✅ Performance tests completed.');
}

main();