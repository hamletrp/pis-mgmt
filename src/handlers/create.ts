import * as uuid from 'uuid'
import { DynamoDB } from 'aws-sdk'
import { PISConfig, PISConfigSK } from '../models/models'
import {
  APIGatewayProxyEvent,
  Callback, Context
} from "aws-lambda";

const dynamoDb = new DynamoDB.DocumentClient();

export const create = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {

  try {

    const timestamp = new Date().getTime();
    const data = <PISConfig>JSON.parse(event.body || '');
    const {DYNAMODB_TABLE_NAME} = process.env;

    const params: any = {
      TableName: DYNAMODB_TABLE_NAME,
      Item: Object.assign({
        pk: uuid.v1(),
        sk: PISConfigSK,
        createdAt: timestamp,
        updatedAt: timestamp
      }, data)
    }

    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    }
  } catch (error: any) {
    return callback(error);
  }

};
