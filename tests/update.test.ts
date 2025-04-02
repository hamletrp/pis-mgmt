import { update } from '../src/handlers/update';
import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import AWS from 'aws-sdk';

const itemPk = '1';
const itemSk = 'config'; 

jest.mock('aws-sdk', () => {
  const mDocumentClient = {
    update: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient),
    },
  };
});

describe('update lambda handler', () => {
  const OLD_ENV = process.env;
  const mDocumentClient = new AWS.DynamoDB.DocumentClient() as any;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'MockTable' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should update an item in DynamoDB and return 200 with updated attributes', async () => {
    const updatedAttributes = {
        device_type: "raspberryPi",
        device_wait: 5000,
    };

    mDocumentClient.promise.mockResolvedValueOnce({
      Attributes: updatedAttributes,
    });

    const event = {
      pathParameters: {
        pk: itemPk,
        sk: itemSk,
      },
      body: JSON.stringify(updatedAttributes),
    } as unknown as APIGatewayProxyEvent;

    const context = {} as Context;
    const callback = jest.fn();

    const result = await update(event, context, callback);

    expect(mDocumentClient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'MockTable',
        Key: { pk: itemPk, sk: itemSk },
        UpdateExpression: expect.stringContaining('SET'),
        ReturnValues: 'UPDATED_NEW',
      })
    );

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(updatedAttributes);
  });

  it('should call callback on error', async () => {
    const error = new Error('Update failed');
    mDocumentClient.promise.mockRejectedValueOnce(error);

    const event = {
      pathParameters: {
        pk: 'failme',
        sk: 'failme',
      },
      body: JSON.stringify({
        device_type: 'device_typeeeeee',
      }),
    } as unknown as APIGatewayProxyEvent;

    const context = {} as Context;
    const callback = jest.fn();

    await update(event, context, callback);

    expect(callback).toHaveBeenCalledWith(error);
  });
});
