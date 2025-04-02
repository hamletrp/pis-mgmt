import { list } from '../src/handlers/list';
import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        scan: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => mDocumentClient),
        },
    };
});

describe('list lambda', () => {
    const OLD_ENV = process.env;
    const mDocumentClient = new DynamoDB.DocumentClient() as any;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'MockTable' };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should return scanned items from DynamoDB', async () => {
        const mockItems = [
            { pk: '1', sk: 'config', device_type: 'raspberryPi' },
            { pk: '2', sk: 'config', device_type: 'raspberryPi' },
        ];

        mDocumentClient.promise.mockResolvedValueOnce({ Items: mockItems });

        const event = {} as APIGatewayProxyEvent;
        const context = {} as Context;
        const callback = jest.fn();

        const result = await list(event, context, callback);

        expect(mDocumentClient.scan).toHaveBeenCalledWith({
            TableName: 'MockTable',
        });

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockItems);
    });

    it('should handle scan error and invoke callback', async () => {
        const error = new Error('DynamoDB scan failed');
        mDocumentClient.promise.mockRejectedValueOnce(error);

        const event = {} as APIGatewayProxyEvent;
        const context = {} as Context;
        const callback = jest.fn();

        await list(event, context, callback);

        expect(callback).toHaveBeenCalledWith(error);
    });
});
