import request from 'supertest';
import { app } from '../src/app';

// Mock the openai module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: '\\begin{system}\n\\floor[id=gnd]{y=-8}\n\\end{system}',
                },
              },
            ],
          }),
        },
      },
    };
  });
});

describe('POST /api/generate', () => {
  it('should return 400 if prompt is missing', async () => {
    const res = await request(app).post('/api/generate').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Prompt is required');
  });

  it('should return generated code for a valid prompt', async () => {
    const res = await request(app).post('/api/generate').send({ prompt: 'Create a floor' });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe('\\begin{system}\n\\floor[id=gnd]{y=-8}\n\\end{system}');
  });
});
