const { DynamoDB } = require('aws-sdk');

import {
  APIGatewayProxyEvent,
  Callback, Context
} from "aws-lambda";

const dynamoDb = new DynamoDB.DocumentClient();

export const list = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {

  try {

    const params: any = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    // fetch all pis-configs from the database
    // For production workloads you should design your tables and indexes so that your applications can use Query instead of Scan.
    const { Items } = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(Items)
    }

  } catch (error: any) {
    console.log('ERROR', error);
    return callback(error);
  }

}
