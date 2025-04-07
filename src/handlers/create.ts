import * as uuid from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  APIGatewayProxyEvent,
  Callback,
  Context
} from 'aws-lambda';
import { PISConfig, PISConfigSK } from '../models/models';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

export const create = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {
  let data: PISConfig;

  try {
    data = JSON.parse(event.body || '{}');
  } catch (parseError) {
    console.error("Failed to parse request body:", parseError);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  try {
    const timestamp = new Date().getTime();
    const { DYNAMODB_TABLE_NAME } = process.env;

    const item = {
      pk: uuid.v1(),
      sk: PISConfigSK,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...data
    } as PISConfig;

    const params = {
      TableName: DYNAMODB_TABLE_NAME!,
      Item: item
    };

    await dynamoDb.send(new PutCommand(params));

    console.log('INFO: successfully stored pis-config data');

    return {
      statusCode: 200,
      body: JSON.stringify(item)
    };
  } catch (error: any) {
    console.error('ERROR', error);
    return callback(error);
  }
};