import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
const client = new DynamoDB({
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: 'local',
  }),
})
const ddbDocClient = DynamoDBDocument.from(client)

export {ddbDocClient}
