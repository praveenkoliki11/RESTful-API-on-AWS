require('iconv-lite').encodingExists('foo')
require('../node_modules/mysql2/node_modules/iconv-lite/lib').encodingExists('foo');

const iconv = require('iconv-lite');
const encodings = require('iconv-lite/encodings');
iconv.encodings = encodings;

const request = require("supertest");
const app = require("../index");

describe("Test the root path", () => {
  test("It should response the GET method", async () => {
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
  });
});