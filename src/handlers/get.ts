import { DynamoDB } from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  Callback, Context
} from "aws-lambda";

const dynamoDb = new DynamoDB.DocumentClient()

export const create = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {

  try {

    const { DYNAMODB_TABLE_NAME } = process.env;
    const { pk, sk } = event.pathParameters || {};

    const params: any = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        pk: pk,
        sk: sk,
      },
    };

    // fetch pis-config from the database
    const item = await dynamoDb.get(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(item)
    }

  } catch (error: any) {
    return callback(error);
  }
};