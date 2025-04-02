import { create } from '../src/handlers/create';
import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { PISConfig } from '../src/models/models';

jest.mock('uuid');
jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        put: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => mDocumentClient),
        },
    };
});

describe('create lambda', () => {
    const OLD_ENV = process.env;
    const mockUuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const mDocumentClient = new DynamoDB.DocumentClient() as any;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV, DYNAMODB_TABLE_NAME: 'MockTable' };

        jest.mock('uuid', () => ({
            v1: jest.fn(() => mockUuid),
        }));

        jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1743533608279);
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should store item in DynamoDB and return 200', async () => {

        const item = {
            pk: mockUuid,
            sk: 'config',
            device_type: "raspberryPi",
            device_wait: 5000,
            distance_range_meters: 50,
            door_name: "North Entrance",
            door_no: 1,
            endpoint_protocol: "mqtt",
            geolocation_coordinates: {
                latitude: 18.4807173,
                longitude: -69.929942
            },
            is_sharedwifi: true,
            mqtt_endpoint: "XXXXXXXX-ats.iot.us-east-1.amazonaws.com",
            mqtt_topic: "us/us-east-1/hamletrp@gmail.com/co.PErYw6OJjN/buildingedgardoor1",
            mqtt_topic_format: "country/region/account/location/device_id",
            createdAt: '1743533608279',
            updatedAt: '1743533608279'
        } as PISConfig;

        const event = {
            body: JSON.stringify(item),
        } as APIGatewayProxyEvent;

        const callback = jest.fn();
        const context = {} as Context;

        mDocumentClient.promise.mockResolvedValueOnce({});

        const result = await create(event, context, callback);

        expect(mDocumentClient.put).toHaveBeenCalledWith({
            TableName: 'MockTable',
            Item: expect.objectContaining(item),
        });

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toMatchObject(item);
    });

    it('should handle errors and invoke callback with error', async () => {
        const event = {
            body: 'invalid-json',
        } as APIGatewayProxyEvent;

        const callback = jest.fn();
        const context = {} as Context;

        await create(event, context, callback);

        expect(callback).toHaveBeenCalledWith(expect.any(SyntaxError));
    });
});
