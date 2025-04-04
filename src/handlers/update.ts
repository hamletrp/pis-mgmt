import * as AWS from 'aws-sdk'

const dynamoDb = new AWS.DynamoDB.DocumentClient();
import {
  APIGatewayProxyEvent, APIGatewayProxyResult,
  Callback, Context
} from 'aws-lambda';

export const update = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {

  try {
    const data = <any>event.body;

    // Build update expression dynamically
    let updateExpression = "SET ";
    let expressionAttributeValues: any = {};
    let expressionAttributeNames: any = {};

    Object.keys(data).forEach((key, index) => {
      const attributeKey = `#attr${index}`;
      const valueKey = `:val${index}`;
      updateExpression += `${attributeKey} = ${valueKey}, `;
      expressionAttributeValues[valueKey] = data[key];
      expressionAttributeNames[attributeKey] = key;
    });

    updateExpression = updateExpression.slice(0, -2); // Remove trailing comma

    const { pk, sk } = event.pathParameters || {};

    const params: any = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: pk,
        sk: sk,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    // update the pis-config in the database
    const resultAttributes = await dynamoDb.update(params)
      .promise()
      .then((val) => val.Attributes);

    console.log('INFO: successfully stored pis-config data');

    return {
      statusCode: 200,
      body: JSON.stringify(resultAttributes)
    }

  } catch (error: any) {
    console.log('ERROR', error);
    return callback(error);
  }

}
