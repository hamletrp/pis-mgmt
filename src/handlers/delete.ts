import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import {
  APIGatewayProxyEvent,
  Callback, Context
} from 'aws-lambda';

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const _delete = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {

  try {

    const { DYNAMODB_TABLE_NAME } = process.env;
    const { pk, sk } = event.pathParameters || { pk: 'pk', sk: 'sk' };

    const params = {
      TableName: DYNAMODB_TABLE_NAME!,
      Key: {
        pk: pk!,
        sk: sk!,
      }
    };

    await docClient.send(new DeleteCommand(params));

    return {
      statusCode: 204,
      body: null
    }
  } catch (error: any) {
    console.log('ERROR', error);
    return callback(error);
  }
}