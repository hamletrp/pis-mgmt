import { ScanCommand } from '@aws-sdk/lib-dynamodb';

// Mock the send function
const mockSend = jest.fn();

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend,
      })),
    },
    ScanCommand: jest.fn(),
  };
});

import { list } from '../src/handlers/list'; // Adjust path to match your project structure

describe('list lambda handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'test-table' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return 200 with a list of items', async () => {
    const mockItems = [
      { pk: '1', sk: 'config', name: 'Item 1' },
      { pk: '2', sk: 'config', name: 'Item 2' },
    ];

    mockSend.mockResolvedValueOnce({ Items: mockItems });

    const result = await list(
      {} as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockItems);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(ScanCommand).toHaveBeenCalledWith({
      TableName: 'test-table',
    });
  });

  it('should return 500 if scan fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('Scan failed'));

    const result = await list(
      {} as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Failed to fetch items from DynamoDB');
    expect(body.error).toBe('Scan failed');
  });
});
