import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand, DescribeLogStreamsCommand } from "@aws-sdk/client-cloudwatch-logs";

const cwClient = new CloudWatchLogsClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const logGroupName = process.env.AWS_CLOUDWATCH_LOG_GROUP || "/aws/nextnews/backend";
let sequenceToken = null;

const ensureLogStreamExists = async (streamName) => {
    try {
        // Try to describe the stream to see if it exists
        const describeParams = {
            logGroupName: logGroupName,
            logStreamNamePrefix: streamName
        };
        
        const describeCommand = new DescribeLogStreamsCommand(describeParams);
        const describeData = await cwClient.send(describeCommand);

        const stream = describeData.logStreams?.find(s => s.logStreamName === streamName);
        if (stream) {
            sequenceToken = stream.uploadSequenceToken;
        } else {
            // Stream doesn't exist, create it
            const createParams = {
                logGroupName: logGroupName,
                logStreamName: streamName
            };
            const createCommand = new CreateLogStreamCommand(createParams);
            await cwClient.send(createCommand);
            sequenceToken = null;
        }
    } catch (error) {
        console.error("Error ensuring log stream exists:", error);
    }
};

const logToCloudWatch = async (streamName, message) => {
    try {
        // For local development or missing config, just console.log
        if (!process.env.AWS_ACCESS_KEY_ID) {
            console.log(`[CloudWatch Mock - ${streamName}]`, message);
            return;
        }

        await ensureLogStreamExists(streamName);

        const logEvent = {
            message: JSON.stringify(message),
            timestamp: new Date().getTime()
        };

        const params = {
            logEvents: [logEvent],
            logGroupName: logGroupName,
            logStreamName: streamName,
            ...(sequenceToken && { sequenceToken: sequenceToken })
        };

        const command = new PutLogEventsCommand(params);
        const data = await cwClient.send(command);
        
        sequenceToken = data.nextSequenceToken;
    } catch (error) {
        console.error("Error logging to CloudWatch:", error);
    }
};

export { logToCloudWatch };
