import { create } from '../src/handlers/get';
import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        get: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => mDocumentClient),
        },
    };
});

describe('get handler (create function)', () => {
    const OLD_ENV = process.env;
    const mDocumentClient = new DynamoDB.DocumentClient() as any;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'MockTable' };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should return item from DynamoDB', async () => {
        const itemPk = '1';
        const itemSk = 'config';
        const mockItem = {
            Item: { pk: itemPk, sk: itemSk, device_type: 'raspberryPi' },

        };

        mDocumentClient.promise.mockResolvedValueOnce(mockItem);

        const event = {
            pathParameters: {
                pk: itemPk,
                sk: itemSk,
            },
        } as unknown as APIGatewayProxyEvent;

        const context = {} as Context;
        const callback = jest.fn();

        const result = await create(event, context, callback);

        expect(mDocumentClient.get).toHaveBeenCalledWith({
            TableName: 'MockTable',
            Key: {
                pk: itemPk,
                sk: itemSk,
            },
        });

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual(JSON.stringify(mockItem));
    });

    it('should handle DynamoDB get error and call callback', async () => {
        const error = new Error('DynamoDB get failed');
        mDocumentClient.promise.mockRejectedValueOnce(error);

        const event = {
            pathParameters: {
                pk: 'error-pk',
                sk: 'error-sk',
            },
        } as unknown as APIGatewayProxyEvent;

        const context = {} as Context;
        const callback = jest.fn();

        await create(event, context, callback);

        expect(callback).toHaveBeenCalledWith(error);
    });
});
