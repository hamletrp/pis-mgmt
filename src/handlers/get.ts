import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  Callback,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const get = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
): Promise<APIGatewayProxyResult> => {
  try {
    const { DYNAMODB_TABLE_NAME } = process.env;
    const { pk, sk } = event.pathParameters || {};

    const params = {
      TableName: DYNAMODB_TABLE_NAME!,
      Key: {
        pk: pk!,
        sk: sk!,
      },
    };

    // fetch pis-config from the database
    const data = await docClient.send(new GetCommand(params));

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch item from DynamoDB",
        error: error instanceof Error ? error.message : error,
      }),
    };
  }
};