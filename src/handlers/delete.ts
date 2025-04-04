const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

import {
  APIGatewayProxyEvent,
  Callback, Context
} from 'aws-lambda';

export const _delete = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {

  try {

    const { DYNAMODB_TABLE_NAME } = process.env;
    const { pk, sk } = event.pathParameters || {pk: 'pk', sk: 'sk'};

    await dynamoDb
      .delete({
        TableName: DYNAMODB_TABLE_NAME,
        Key: { pk, sk },
      })
      .promise();

    return {
      statusCode: 204,
      body: {}
    }
  } catch (error: any) {
    console.log('ERROR', error);
    return callback(error);
  }
}
