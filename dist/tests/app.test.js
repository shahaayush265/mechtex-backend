"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
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
    it('should return 400 if prompt is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.app).post('/api/generate').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Prompt is required');
    }));
    it('should return generated code for a valid prompt', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.app).post('/api/generate').send({ prompt: 'Create a floor' });
        expect(res.status).toBe(200);
        expect(res.body.code).toBe('\\begin{system}\n\\floor[id=gnd]{y=-8}\n\\end{system}');
    }));
});
