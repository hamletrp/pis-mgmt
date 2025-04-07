import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  Callback,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const update = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body!); // parse request body

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
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: {
        pk: pk!,
        sk: sk!,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    // Perform update operation in DynamoDB
    const result = await docClient.send(new UpdateCommand(params));

    console.log("INFO: successfully updated pis-config data");

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error: any) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to update item in DynamoDB",
        error: error instanceof Error ? error.message : error,
      }),
    };
  }
};