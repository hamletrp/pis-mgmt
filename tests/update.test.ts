import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

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
    UpdateCommand: jest.fn(),
  };
});

import { update } from '../src/handlers/update'; // adjust path if needed

describe('update lambda handler', () => {
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

  it('should return 200 with updated attributes on success', async () => {
    const requestBody = { door_name: 'New Door', distance: 100 };
    const updatedAttributes = { door_name: 'New Door', distance: 100 };

    mockSend.mockResolvedValueOnce({ Attributes: updatedAttributes });

    const result = await update(
      {
        body: JSON.stringify(requestBody),
        pathParameters: { pk, sk },
      } as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(updatedAttributes);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(UpdateCommand).toHaveBeenCalledWith(expect.objectContaining({
      TableName: 'test-table',
      Key: { pk, sk },
      UpdateExpression: expect.stringMatching(/^SET/),
      ExpressionAttributeNames: expect.any(Object),
      ExpressionAttributeValues: expect.any(Object),
    }));
  });

  it('should return 500 on invalid JSON', async () => {
    const result = await update(
      {
        body: 'invalid',
        pathParameters: { pk, sk },
      } as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Failed to update item in DynamoDB');
    expect(body.error).toMatch(/Unexpected token/);
  });

  it('should return 500 on DynamoDB failure', async () => {
    mockSend.mockRejectedValueOnce(new Error('DynamoDB failed'));

    const result = await update(
      {
        body: JSON.stringify({ test: 'fail' }),
        pathParameters: { pk, sk },
      } as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Failed to update item in DynamoDB');
    expect(body.error).toBe('DynamoDB failed');
  });
});
