import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

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
    DeleteCommand: jest.fn(),
  };
});

import { _delete } from '../src/handlers/delete'; // adjust the path accordingly

describe('_delete lambda handler', () => {
  const pk = 'test-pk';
  const sk = 'test-sk';
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'test-table' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return 204 on successful delete', async () => {
    mockSend.mockResolvedValueOnce({});

    const result = await _delete(
      {
        pathParameters: { pk, sk },
      } as any,
      {} as any,
      jest.fn()
    );

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(DeleteCommand).toHaveBeenCalledWith({
      TableName: 'test-table',
      Key: { pk, sk },
    });
    expect(result.statusCode).toBe(204);
    expect(result.body).toBe(null);
  });

  it('should call callback with error on failure', async () => {
    const mockCallback = jest.fn();
    const error = new Error('Delete failed');
    mockSend.mockRejectedValueOnce(error);

    await _delete(
      {
        pathParameters: { pk, sk },
      } as any,
      {} as any,
      mockCallback
    );

    expect(mockCallback).toHaveBeenCalledWith(error);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
