import { _delete } from '../src/handlers/delete';
import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import AWS from 'aws-sdk';


const itemPk = '1';
const itemSk = 'config'; 

jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        delete: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => mDocumentClient),
        },
    };
});

describe('_delete lambda handler', () => {
    const OLD_ENV = process.env;
    const mDocumentClient = new AWS.DynamoDB.DocumentClient() as any;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'MockTable' };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should delete item from DynamoDB and return 204', async () => {
        mDocumentClient.promise.mockResolvedValueOnce({});

        const event = {
            pathParameters: {
                pk: itemPk,
                sk: itemSk,
            },
        } as unknown as APIGatewayProxyEvent;

        const context = {} as Context;
        const callback = jest.fn();

        const result = await _delete(event, context, callback);

        expect(mDocumentClient.delete).toHaveBeenCalledWith({
            TableName: 'MockTable',
            Key: {
                pk: itemPk,
                sk: itemSk,
            },
        });

        expect(result.statusCode).toBe(204);
        expect(result.body).toEqual({});
    });

    it('should call callback on delete error', async () => {
        const error = new Error('Delete failed');
        mDocumentClient.promise.mockRejectedValueOnce(error);

        const event = {
            pathParameters: {
                pk: 'fail',
                sk: 'fail',
            },
        } as unknown as APIGatewayProxyEvent;

        const context = {} as Context;
        const callback = jest.fn();

        await _delete(event, context, callback);

        expect(callback).toHaveBeenCalledWith(error);
    });
});
