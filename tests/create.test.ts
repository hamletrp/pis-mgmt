import { create } from '../src/handlers/create';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Mocks
jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    PutCommand: jest.fn(),
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({
        send: jest.fn()
      }),
    },
  };
});

jest.mock('uuid', () => ({
  v1: jest.fn().mockReturnValue('mock-uuid'),
}));

describe('create lambda handler', () => {
  const mockSend = jest.fn();
  const OLD_ENV = process.env;
  const mockUuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'MockTable' };

    jest.mock('uuid', () => ({
        v1: jest.fn(() => mockUuid),
    }));

    // Overwrite send function with mock
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue({
      send: mockSend,
    });

    jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1743533608279);

  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return 400 if body is invalid JSON', async () => {
    const result = await create(
      { body: 'invalid-json' } as any,
      {} as any,
      jest.fn()
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Invalid JSON in request body' });
  });

  it('should store data in DynamoDB and return 200', async () => {
    mockSend.mockResolvedValue({});

    const eventBody = {
      door_name: 'Main Entrance',
      device_type: 'raspberrypi'
    };

    const result = await create(
      {
        body: JSON.stringify(eventBody)
      } as any,
      {} as any,
      jest.fn()
    );

    expect(PutCommand).toHaveBeenCalled();

    expect(result.statusCode).toBe(200);
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.pk).toBe('mock-uuid');
    expect(parsedBody.door_name).toBe('Main Entrance');
    expect(parsedBody.device_type).toBe('raspberrypi');
    expect(parsedBody.sk).toBeDefined();
    expect(parsedBody.createdAt).toBeDefined();
    expect(parsedBody.updatedAt).toBeDefined();
  });

});
