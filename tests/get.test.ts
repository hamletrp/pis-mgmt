import { GetCommand } from '@aws-sdk/lib-dynamodb';

// Create a mock for the `send` method
const mockSend = jest.fn();

// Mock the DynamoDBDocumentClient.from function and GetCommand
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend,
      })),
    },
    GetCommand: jest.fn(), // optional: to verify command args
  };
});

import { get } from '../src/handlers/get';

describe('get lambda handler (non-injected client)', () => {
  const pk = 'test-pk';
  const sk = 'config';
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'test-table' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return 200 and item if found', async () => {
    const mockItem = { pk, sk, name: 'Test Item' };
    mockSend.mockResolvedValueOnce({ Item: mockItem });

    const result = await get(
      { pathParameters: { pk, sk } } as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockItem);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(GetCommand).toHaveBeenCalledWith({
      TableName: 'test-table',
      Key: { pk, sk },
    });
  });

  it('should return 404 if item not found', async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined });

    const result = await get(
      { pathParameters: { pk, sk } } as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ message: 'Item not found' });
  });

  it('should return 500 if DynamoDB throws', async () => {
    mockSend.mockRejectedValueOnce(new Error('DynamoDB is down'));

    const result = await get(
      { pathParameters: { pk, sk } } as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Failed to fetch item from DynamoDB');
    expect(body.error).toBe('DynamoDB is down');
  });
});
